---
name: build-flow
description: Builds one importable n8n workflow JSON file for the school parent-support system — Flow 1 (public FAQ chatbot), Flow 2 (authenticated parent ticketing + SLA), or Flow 3 (school-to-parent announcements/absences/weekly report) — from the plan /design-system already approved. Use when asked to build, implement, or continue any flow: "بساز جریان اول/دوم/سوم", "جریان دوم رو پیاده کن", "flow 1/2/3 رو بساز". Invoke this immediately for such a request, even before checking whether a plan exists — the skill itself verifies prerequisites (docs/system-plan.md) and reports exactly what's missing; do not answer a build request from memory/reasoning instead of running the skill. Builds exactly ONE flow per invocation and stops — never chains into the next flow unasked.
---

# build-flow

Turns one approved flow from `docs/system-plan.md` into an importable n8n workflow JSON.

## Steps

1. **Require the plan.** If `docs/system-plan.md` doesn't exist, tell the user to run
   `/design-system` first and stop — never invent a plan here.
2. **Which flow?** If not stated, ask (1 = public, 2 = parents, 3 = school-to-parent). Build only
   that one.
3. **Load the matching reference** — exactly one:
   - `references/flow-1-public.md`
   - `references/flow-2-parents.md`
   - `references/flow-3-school-to-parent.md`
   Each gives the node-by-node build spec. Cross-cutting patterns are pulled in from there, not
   duplicated: `.claude/rules/persian-normalization.md`, `.claude/rules/jalali-dates.md`,
   `.claude/rules/db-schema.md`, `.claude/rules/workflow-reliability.md`.
4. **Write the workflow JSON** to `workflows/flow-<n>-<slug>.json` (`flow-1-public.json`,
   `flow-2-parents.json`, `flow-3-school-to-parent.json`) — standard n8n export shape:
   `{"name": "...", "nodes": [...], "connections": {...}, "settings": {"errorWorkflow": "..."}}`.
   Every node `name` and every user-facing string inside it is Persian; every node has a stable
   `id`. Never use `n8n-nodes-base.telegramTrigger` (webhook) — polling only, per CLAUDE.md.
5. **Audit before declaring done.** Dispatch the `flow-auditor` subagent on the file you just
   wrote — and, the first time this run creates `workflows/flow-0-error-handler.json` (see Flow
   1's reference), audit that file too, in a separate dispatch. If either report is a failure,
   fix the file and re-run its audit — don't hand back a failing flow.
6. **Stop.** Report what was built and what the audit found (pass, or fixed-and-passed). Do not
   start the next flow — the user invokes `/build-flow` again when ready.
