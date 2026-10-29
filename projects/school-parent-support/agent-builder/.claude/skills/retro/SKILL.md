---
name: retro
description: Review recent lessons and promote recurrent, verified ones into rules (human-approved). Use at the end of a task, when memory/lessons.md has grown, or when the user says "retro" / "reflect" / "promote lessons".
---

# retro

The promotion gate of the self-improvement loop (`.claude/rules/self-improvement.md`). It curates `memory/lessons.md` and promotes durable lessons into always-loaded rules — only with human approval.

## Flow

1. **Read** `memory/lessons.md` (and any `memory/<topic>.md`). Also clear the `pending-review` stubs the capture-lesson hook may have added: turn each into a proper NEVER/ALWAYS lesson or discard it.

2. **Curate.**
   - Merge duplicates into one canonical entry; bump its `seen:` count.
   - EDIT or REMOVE contradicting/stale lessons.
   - Drop obvious or single-instance, file-specific trivia.

3. **Select for promotion.** A lesson qualifies when it is **recurrent** (seen ≥ 2) and **generalizable** (a class of mistakes, not one line) and **verifiable** (states a concrete check). One-offs stay in `lessons.md`.

4. **Propose.** For each qualifying lesson, draft the rule change: which `.claude/rules/*.md` (new or existing), with `paths:` if file-type-specific. Show the user a **diff**.

5. **Apply only on approval.** Edit the rule(s), then remove the promoted lesson from `lessons.md` (it now lives in its canonical rule). Never edit CLAUDE.md/rules without explicit approval.

6. **Report** what was merged, removed, promoted, and kept.

## Notes

- Keep `lessons.md` a lean index; archive stale entries to `memory/archive.md` if it grows.
