# Extending this agent

This agent was built to a portable standard. This file is an **intentional condensed snapshot** of
that standard, so you can extend the agent correctly **on its own** — no other tooling required.
(The canonical, fuller version lives in the `agent-creator` project's `.claude/rules/`.)

## Core principles

- **Recursive decomposition + conditional loading.** Keep `CLAUDE.md` a thin index. Push detail
  into on-demand files (rules, skill `references/`, scripts). The agent should read only the small
  chunk it needs, when it needs it. File count doesn't matter; tokens/context do. Every fact lives
  in exactly one place; no orphan files.
- **Minimize, quality first.** Short, precise English (see "Language" below). When something
  grows, split it into an on-demand file — never truncate quality, never bloat the always-loaded
  layer. No arbitrary length caps; only the platform's frontmatter limits are hard.
- **Eval-driven, not template-driven.** Add/change a capability via draft → test → evaluate →
  improve. Add a case to `eval/cases.json` and run the harness until it passes.

## File-type rules

- **CLAUDE.md** — purpose + invariants + pointers only. No embedded procedures.
- **Skill** (`.claude/skills/<name>/SKILL.md`) — the directory name is the command (kebab-case);
  `name` is a display label. The trigger is `description` (+ optional `when_to_use`): combined
  ≤1536 chars, third person, *what it does AND when to use it*; may include user-language trigger
  phrases. `allowed-tools` GRANTS no-prompt permission — it does NOT restrict; use
  `disallowed-tools` to restrict. Body is a router; detail → `references/`; executables →
  `scripts/` (run via Bash, resolve with `${CLAUDE_SKILL_DIR}`, never read into context).
- **Rule** (`.claude/rules/<name>.md`) — `description` + optional `paths:` globs. With `paths:` it
  loads only when a matching file is read; without, every session (use sparingly). One concern
  per rule.
- **Subagent** (`.claude/agents/<name>.md`) — isolated context, returns a summary.
  `model: <haiku|sonnet|opus|fable|inherit|full-model-id>`; omit → `inherit`. Pick by eval: start
  `haiku` (retrieval/mechanical) or `sonnet` (build/reason), escalate `haiku → sonnet → opus` only
  on eval failure; `fable` only for frontier-hard tasks. Overridable via
  `CLAUDE_CODE_SUBAGENT_MODEL`.
- **Tool/script** — language per task; read input via args/stdin; print structured (JSON) stdout;
  exit codes; minimal deps.
- **Hook** — for must-happen behavior (prose guidance is followed only ~60–70%). PostToolUse fires
  only on success — use PostToolUseFailure for failure capture. Wire hooks in
  `.claude/settings.json` — the only project location Claude Code reads.

## Language

Converse in the user's language; write all files in English — **except** the actual n8n workflow
JSON this agent produces, where node names and every user-facing string must be Persian by design
(that's the product, not the agent's own documentation). Guidance/reference docs stay English even
when they quote the exact Persian strings a workflow must contain.

## Secrets

This agent itself needs none (it only authors files). The n8n system it builds needs its own
(`TELEGRAM_BOT_TOKEN`, Postgres credentials) — those live in n8n's environment on the school's
server, documented in `docs/SETUP.md`, never in this repo. If a future capability makes this agent
call an API directly, follow `.env`/`.env.example`/`.gitignore` per the secrets rule below.

## Self-improvement loop

When a test/build fails, the user corrects you, or a retro finds friction: record a one-line
lesson in `memory/lessons.md` under its `## <topic>` heading (start NEVER/ALWAYS, lead with why,
one point per entry; overflow detail → `memory/<topic>.md`, linked from the entry). EDIT or REMOVE
duplicates. On the second occurrence, run `/retro` to promote it into a rule — with human
approval, not silently.

## Architecture map (present vs omitted)

| Part | Status | If omitted: how to add it later |
|---|---|---|
| `.claude/rules/` | present — `db-schema.md`, `persian-normalization.md`, `jalali-dates.md`, `workflow-reliability.md`, `self-improvement.md` | — |
| `.claude/skills/` | present — `design-system`, `build-flow`, `finalize-deliverables`, `retro` | Add `.claude/skills/<name>/SKILL.md` (router body + `references/` + `scripts/`); write a triggering `description`. |
| `scripts/` inside skills | intentionally omitted — every deliverable is authored text (SQL/JSON/Markdown), no computation needed a script couldn't beat by just writing the content directly | If a future need is genuinely computed (e.g. generating N random `unique_code`s), add a script under the owning skill's `scripts/`, run via Bash, never read into context. |
| `.claude/agents/` (subagents) | present — `flow-auditor` (model: haiku) | Add `.claude/agents/<name>.md` for a verbose/isolated/parallel/cheaper task; pick `model:` by eval. |
| `.claude/hooks/` + `.claude/settings.json` | present — `check-hard-constraints.sh` (PostToolUse, blocks forbidden node types) + `capture-lesson.sh` (PostToolUseFailure) | — |
| `eval/` | present — `cases.json` + `run_eval.py` | Add a case per new skill/subagent trigger; run `python3 eval/run_eval.py .` |
| `memory/` + self-improvement | present | — |
| Secrets (`.env`/`.env.example`) | intentionally omitted (this agent calls no external API itself) | If the agent later gains a capability needing a key, add `.env`/`.env.example`/`.gitignore` per Secrets above, ask the user for the value, write to `.env`. |
| `input/` / `output/` folders | intentionally omitted — this agent's deliverables (`sql/`, `workflows/`, `docs/`) live directly in the project it's run from, there's no separate raw-input staging step | Add `input/`/`output/` only if a future workflow needs to batch-process external files rather than author new ones. |
