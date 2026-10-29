---
description: The self-improvement loop — how this agent records lessons and promotes them into rules.
paths:
  - "memory/**"
---

# Self-improvement loop

This agent gets better over time: when a flaw surfaces, it durably records the lesson so the mistake is not repeated.

Three tiers, separated by ownership and load policy: (1) always-loaded, human-owned — `CLAUDE.md` + `.claude/rules/*.md`, curated and human-gated; (2) auto-accumulated, agent-owned — `memory/lessons.md` (the index and home of every lesson) plus on-demand `memory/<topic>.md` overflow files, in-repo and portable; (3) the promotion gate — `/retro` promotes recurrent, verified lessons from tier 2 into a tier-1 rule, applying only on human approval.

## Triggers (record a lesson when)

1. A test/build/validate command fails — captured automatically by `.claude/hooks/capture-lesson.sh` on **PostToolUseFailure** (wired in `.claude/settings.json`). The hook appends a `pending-review` stub to `memory/lessons.md`; rewrite it into a proper lesson.
2. The user explicitly corrects you — a human verified it; record it.
3. An end-of-task retrospective — run `/retro`.

## Write discipline (anti-bloat)

- First occurrence → add a one-line lesson to `memory/lessons.md` under its `## <topic>` heading. Format:

```
# Lessons (index)

## <topic>
- NEVER/ALWAYS <rule>. Why: <one line>. Fix: `<command or code>`. (seen: N, last: YYYY-MM-DD)
```

- Move overflow detail (long repro, tables) to `memory/<topic>.md`, linked from the entry line.
- Before writing, scan for a duplicate or contradicting lesson and EDIT or REMOVE it instead of appending. Every fact lives in exactly one canonical location.
- Second occurrence of the same lesson → propose promotion into a rule via `/retro`. Never edit always-loaded files without approval.
- Never record obvious facts or single-instance, file-specific trivia.
