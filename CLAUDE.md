# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This agent designs and builds an n8n automation system for a school's parent-support ticketing
desk and public intro chatbot, running on Telegram, PostgreSQL, and n8n only — no AI/model calls.
It plans first, builds one flow at a time, and stops for approval between stages.

## Invariants

- No AI, no model calls anywhere in the built system — conditional logic, lookup tables, and Schedule Trigger timing only.
- No external service besides the Telegram Bot API. All data stays in the school's own PostgreSQL.
- Telegram updates are polled: Schedule Trigger → HTTP Request to `getUpdates`. Never a webhook/Telegram-Trigger node — no domain, no SSL.
- Storage is n8n + PostgreSQL only — never Google Sheets or any other datastore.
- Every user-facing string and every node name is Persian.
- Persian text is normalized (Arabic ye/kaf → Persian, ZWNJ, Persian digits → Latin) before any keyword/code match — see `.claude/rules/persian-normalization.md`.
- Dates shown to users are Jalali; everything stored in Postgres is UTC — see `.claude/rules/jalali-dates.md`.
- Every write is idempotent — replaying the same Telegram update must never create a duplicate record — see `.claude/rules/workflow-reliability.md`.
- No student/parent data is returned unless `parents.verified_at` is set.
- Every node logs its own error; the user only ever sees a generic Persian message, never a stack trace.
- Work proceeds in checkpoints: `/design-system` plans and stops for approval; `/build-flow` builds ONE flow and stops; state every assumption explicitly; ask rather than guess on ambiguity.

## Capabilities (skills)

- `/design-system` — proposes the PostgreSQL schema + the node plan for all 3 flows, waits for approval, then writes `sql/schema.sql` and `docs/system-plan.md`.
- `/build-flow` — builds one importable n8n workflow JSON (flow 1 public / 2 parents / 3 school-to-parent) from the approved plan; audits it; stops.
- `/finalize-deliverables` — writes `docs/SETUP.md` and `docs/TEST-CHECKLIST.md` once the flows are built.
- `/retro` — review lessons and promote recurrent ones into rules (human-approved).

## Subagents

- `flow-auditor` — reviews a freshly-built workflow JSON against the hard constraints and reliability rules before a flow is marked done (model: haiku).

## On-demand standards (rules)

- `.claude/rules/db-schema.md` — canonical table/column reference, single source of truth for schema and SQL.
- `.claude/rules/persian-normalization.md` — normalization snippet + rule, applied before any text/code match.
- `.claude/rules/jalali-dates.md` — Jalali display / UTC storage conversion snippet.
- `.claude/rules/workflow-reliability.md` — idempotency and error-handling patterns every flow must use.
- `.claude/rules/self-improvement.md` — the self-improvement loop.

## Self-improvement loop

Current lessons (always available): @memory/lessons.md

When a test/build fails, the user corrects you, or an end-of-task retro finds friction: record a one-line lesson in `memory/lessons.md` under its `## <topic>` heading — start with NEVER/ALWAYS, lead with why, one point per entry; move overflow detail to `memory/<topic>.md` and link it from the entry. EDIT or REMOVE duplicates; every fact lives in exactly one place. On the second occurrence of the same lesson, run `/retro` to propose promoting it into a rule — never edit always-loaded files without approval. Full spec: `.claude/rules/self-improvement.md`.
