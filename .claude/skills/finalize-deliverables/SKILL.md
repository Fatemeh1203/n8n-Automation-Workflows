---
name: finalize-deliverables
description: Writes the setup guide (environment variables, Telegram bot creation, seed data, testing steps) and the manual test checklist (including error cases) for the built n8n parent-support system. Use once flows are built and ready to hand off, or when asked for "راهنمای راه‌اندازی", "چک‌لیست تست", a setup guide, or a test checklist.
---

# finalize-deliverables

Writes the last two deliverables from the brief: the setup guide and the manual test checklist.
Run after at least one flow exists in `workflows/`.

## Steps

1. Check `workflows/*.json` exists; if empty, tell the user to run `/build-flow` first.
2. Read `docs/system-plan.md` for the school-specific parameters (chat_ids, categories, grades).
3. Write `docs/SETUP.md` from `references/setup-guide.md` — fill in the actual values gathered in
   `/design-system` wherever the template has a placeholder; leave the bot-token step generic
   (never invent or ask for the real token here — that's entered directly into the school's `.env`
   on their own server, not through this agent). Write it in **Persian** — this file is handed
   directly to the school's own IT/office staff to follow, unlike this agent's own English rules
   and skills.
4. Write `docs/TEST-CHECKLIST.md` from `references/test-checklist.md`, scoped to the flows that
   actually exist in `workflows/` (skip a flow's section if it hasn't been built yet, and say so).
   Write it in **Persian**, same reasoning as SETUP.md — it's a checklist the school's own staff
   will run through by hand.
5. Report both files' paths to the user.
