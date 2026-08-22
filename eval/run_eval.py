#!/usr/bin/env python3
"""Run an agent's eval cases headlessly and print a scorecard.

Executes each case in eval/cases.json as a headless `claude -p` run inside the
agent folder, detects skill/subagent invocations from the stream-json output
(best-effort — reported as "unobserved" when undetectable, never silently
passed), and checks output substrings. Stdlib only. Requires Claude Code.

create-agent copies this file into every generated agent at eval/run_eval.py
so the agent carries its own regression suite (co-location beats DRY).

Usage:
  run_eval.py <agent-dir> [--cases PATH] [--max-turns N]
              [--permission-mode MODE] [--claude-bin claude] [--timeout SECONDS]

Output: scorecard JSON to stdout, also written to <agent-dir>/eval/last-run.json.
Exit 0 if no case failed, 1 if any failed, 2 on setup errors.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys

DETECTABLE_TOOLS = ("Skill", "Task", "Agent")


def collect_events(stdout_text):
    """Parse NDJSON stream output → (tool_uses, final result text)."""
    tool_uses, texts, result_text = [], [], None
    for line in stdout_text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            event = json.loads(line)
        except ValueError:
            continue  # skip unparsable lines
        if not isinstance(event, dict):
            continue
        etype = event.get("type")
        if etype == "result" and isinstance(event.get("result"), str):
            result_text = event["result"]
        if etype == "tool_use" and event.get("name"):
            tool_uses.append({"name": event["name"], "input": event.get("input") or {}})
        msg = event.get("message")
        if etype == "assistant" and isinstance(msg, dict):
            for block in msg.get("content") or []:
                if not isinstance(block, dict):
                    continue
                if block.get("type") == "tool_use" and block.get("name"):
                    tool_uses.append({"name": block["name"], "input": block.get("input") or {}})
                elif block.get("type") == "text" and block.get("text"):
                    texts.append(block["text"])
    if result_text is None:
        result_text = "\n".join(texts)
    return tool_uses, result_text


def skill_fired(tool_uses, expected):
    for tu in tool_uses:
        if tu["name"] != "Skill":
            continue
        inp = tu["input"] if isinstance(tu["input"], dict) else {}
        if inp.get("skill") == expected:
            return True
        cmd = inp.get("command")
        if isinstance(cmd, str) and expected in cmd:
            return True
    return False


def subagent_fired(tool_uses, expected):
    for tu in tool_uses:
        if tu["name"] not in ("Task", "Agent"):
            continue
        inp = tu["input"] if isinstance(tu["input"], dict) else {}
        if inp.get("subagent_type") == expected:
            return True
    return False


def run_case(case, args, agent_dir):
    """Return (status, evidence, detection_limited)."""
    expect = case.get("expect") or {}
    prompt = case.get("prompt")
    if not prompt:
        return "error", {"message": "case has no prompt"}, False
    if not expect:
        return "error", {"message": "case has no expectations (expect is empty)"}, False

    cmd = [args.claude_bin, "-p", prompt, "--output-format", "stream-json",
           "--verbose", "--max-turns", str(case.get("max_turns", args.max_turns)),
           "--permission-mode", args.permission_mode]
    try:
        proc = subprocess.run(cmd, cwd=agent_dir, capture_output=True,
                              text=True, timeout=args.timeout)
    except subprocess.TimeoutExpired:
        return "error", {"message": f"timed out after {args.timeout}s"}, False
    except OSError as e:
        return "error", {"message": f"failed to launch {args.claude_bin}: {e}"}, False

    tool_uses, result_text = collect_events(proc.stdout)
    if proc.returncode != 0 and not tool_uses and not result_text:
        return "error", {"message": f"claude exited {proc.returncode}",
                         "stderr_excerpt": proc.stderr[:400]}, False

    # Skill/Task invocations are not first-class in stream-json; detection is
    # best-effort. If NO detectable tool_use events appear anywhere in the
    # stream, an expectation on them is "unobserved" — not pass, not fail.
    observable = any(tu["name"] in DETECTABLE_TOOLS for tu in tool_uses)
    checks, detection_limited = {}, False
    if "skill" in expect:
        if observable:
            checks["skill"] = "pass" if skill_fired(tool_uses, expect["skill"]) else "fail"
        else:
            checks["skill"], detection_limited = "unobserved", True
    if "subagent" in expect:
        if observable:
            checks["subagent"] = "pass" if subagent_fired(tool_uses, expect["subagent"]) else "fail"
        else:
            checks["subagent"], detection_limited = "unobserved", True

    lower = result_text.lower()
    for sub in expect.get("output_contains") or []:
        checks[f"output_contains:{sub}"] = "pass" if sub.lower() in lower else "fail"
    for sub in expect.get("output_not_contains") or []:
        checks[f"output_not_contains:{sub}"] = "pass" if sub.lower() not in lower else "fail"

    outcomes = set(checks.values())
    status = "fail" if "fail" in outcomes else ("unobserved" if "unobserved" in outcomes else "pass")
    evidence = {
        "checks": checks,
        "tools_seen": sorted({tu["name"] for tu in tool_uses}),
        "result_excerpt": result_text[:400],
    }
    return status, evidence, detection_limited


def main():
    ap = argparse.ArgumentParser(description="Run an agent's eval cases headlessly.")
    ap.add_argument("agent_dir", help="path to the agent folder")
    ap.add_argument("--cases", help="cases file (default: <agent-dir>/eval/cases.json)")
    ap.add_argument("--max-turns", type=int, default=6)
    ap.add_argument("--permission-mode", default="bypassPermissions",
                    help="eval runs inside the agent's own folder")
    ap.add_argument("--claude-bin", default="claude")
    ap.add_argument("--timeout", type=int, default=300, help="seconds per case")
    args = ap.parse_args()

    agent_dir = os.path.abspath(args.agent_dir)
    if not os.path.isdir(agent_dir):
        print(f"error: agent dir not found: {agent_dir}", file=sys.stderr)
        sys.exit(2)
    cases_path = args.cases or os.path.join(agent_dir, "eval", "cases.json")
    if not os.path.isfile(cases_path):
        print(f"error: cases file not found: {cases_path} — write eval/cases.json first "
              "(see create-agent's templates/eval-cases.json.template)", file=sys.stderr)
        sys.exit(2)
    try:
        cases = json.load(open(cases_path, encoding="utf-8")).get("cases")
        assert isinstance(cases, list) and cases
    except (ValueError, AssertionError, AttributeError):
        print(f"error: {cases_path} is not valid JSON with a non-empty \"cases\" list",
              file=sys.stderr)
        sys.exit(2)
    if shutil.which(args.claude_bin) is None:
        print(f"error: '{args.claude_bin}' not found — install Claude Code "
              "(https://claude.com/claude-code) or pass --claude-bin", file=sys.stderr)
        sys.exit(2)

    results = []
    for i, case in enumerate(cases):
        cid = case.get("id") or f"case-{i + 1}"
        print(f"[{i + 1}/{len(cases)}] {cid} ...", file=sys.stderr)
        status, evidence, detection_limited = run_case(case, args, agent_dir)
        entry = {"id": cid, "status": status, "evidence": evidence}
        if detection_limited:
            entry["detection_limited"] = True
        results.append(entry)

    scorecard = {
        "total": len(results),
        "passed": sum(1 for r in results if r["status"] == "pass"),
        "failed": sum(1 for r in results if r["status"] == "fail"),
        "unobserved": sum(1 for r in results if r["status"] == "unobserved"),
        "cases": results,
    }
    out = json.dumps(scorecard, indent=2)
    print(out)
    eval_dir = os.path.join(agent_dir, "eval")
    os.makedirs(eval_dir, exist_ok=True)
    with open(os.path.join(eval_dir, "last-run.json"), "w", encoding="utf-8") as f:
        f.write(out + "\n")
    sys.exit(0 if scorecard["failed"] == 0 else 1)


if __name__ == "__main__":
    main()
