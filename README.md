# n8n Parent-Support Architect

Designs and builds an n8n automation system for a school's parent-support ticketing desk and
public intro chatbot — n8n + PostgreSQL + Telegram Bot API polling only, no AI, all Persian.

## Usage

Open this folder with Claude Code, then, in order:

- `/design-system` — proposes the DB schema + the node plan for all 3 flows; stops for your
  approval; then writes `sql/schema.sql` and `docs/system-plan.md`.
- `/build-flow` — builds ONE flow's importable n8n workflow JSON into `workflows/`, audits it,
  and stops. Run it again for each remaining flow.
- `/finalize-deliverables` — writes `docs/SETUP.md` and `docs/TEST-CHECKLIST.md` once the flows
  you need exist.
- `/retro` — review lessons and promote recurrent ones into rules (human-approved).

## Setup

- Claude Code. `jq` and Python 3 for the hooks and eval script.
- No secrets needed by this agent itself — see `.env.example`. The n8n system it builds needs its
  own (`TELEGRAM_BOT_TOKEN`, Postgres credentials); `/finalize-deliverables` documents those in
  `docs/SETUP.md` for the school's own deployment, they never live in this repo.

## Self-improvement

Lessons accumulate in `memory/lessons.md` (failed test/validate commands are captured
automatically by a hook); `/retro` promotes recurrent ones into rules.

## Extending

See `EXTENDING.md` — the condensed standard this agent was built to.
