---
name: design-system
description: Proposes the PostgreSQL schema and the n8n node plan for a school parent-support ticketing system plus its public intro chatbot, then waits for approval before writing any files. Use when starting a new school deployment, when asked to plan/design the system, list the tables, or list the nodes for each flow — e.g. "طرح جدول‌ها رو بده", "فهرست نودهای هر جریان چیه", "برام سیستم پاسخگویی طراحی کن", "design the parent-support system". Always run this before /build-flow.
---

# design-system

Plan-then-approve gate for the whole build. Produces the schema + node plan, gets human sign-off,
then writes the durable planning artifacts `/build-flow` and `/finalize-deliverables` depend on.

## Steps

1. **Gather school-specific parameters** the flows need but the brief leaves open. Ask only for
   what's missing — see `references/interview-checklist.md`. State any default you assume
   explicitly (e.g. "من فرض می‌کنم دسته‌بندی تیکت‌ها همان پنج مورد پیش‌فرض است، مگر خلاف آن بگویید").

2. **Present the plan, don't build yet.**
   - Table list: read `.claude/rules/db-schema.md` and present the 7 domain tables plus the 4
     operational tables (`bot_offset`, `verification_attempts`, `sla_alerts`, `error_log`) and the
     `tickets.update_id` addition, as prose, not raw SQL — this is a review step, not a deliverable.
     Name the operational tables as assumptions the brief didn't spell out, not silent additions.
   - Node list: read `references/node-plan.md` and present the node sequence for all 3 flows.
   - End the message asking for explicit approval. **Do not write any file in this same turn.**

3. **On approval only:**
   - Write `sql/schema.sql` — all 11 `CREATE TABLE` statements from `db-schema.md` verbatim, in
     the file's declared order (FK dependencies first), plus the indexes listed in that rule's
     Notes section.
   - Write `docs/system-plan.md` — the approved node plan (from step 2) plus the school-specific
     parameters gathered in step 1, so `/build-flow` and `/finalize-deliverables` can read it
     without re-asking.

4. Tell the user the plan is saved and that `/build-flow` builds one flow at a time next.

If the user changes their mind after approval, re-run this skill — it overwrites both files after
a fresh approval, it never patches them silently.
