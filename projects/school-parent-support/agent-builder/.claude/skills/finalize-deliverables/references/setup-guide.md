# Setup guide template

Fill this in with the school's actual values and write it to `docs/SETUP.md`.

## 1. Environment variables (n8n)

Set these as n8n environment variables (or n8n credentials for the Postgres/HTTP nodes) — never
hardcode them inside a workflow JSON:

| Variable | What it is |
|---|---|
| `TELEGRAM_BOT_TOKEN` | From @BotFather, see step 2 below. |
| `PG_HOST`, `PG_PORT`, `PG_DATABASE`, `PG_USER`, `PG_PASSWORD` | The school's internal PostgreSQL instance. |
| `OFFICE_CHAT_ID` | Telegram chat_id that receives Flow 1 leads. |
| `PRINCIPAL_CHAT_ID` | Receives Flow 2's 24h SLA escalation and the weekly report. |

## 2. Creating the Telegram bot

1. Open a chat with **@BotFather** on Telegram.
2. `/newbot` → give it a name and a unique username ending in `bot`.
3. BotFather returns a token — this is `TELEGRAM_BOT_TOKEN`. Store it only in n8n's environment/
   credentials, never in a committed file.
4. `/setprivacy` → **Disable** (so the bot can read all messages in a chat, not just commands) if
   staff will interact with it in a group; leave default (enabled) for 1:1 parent chats.
5. No webhook setup needed — this system polls via `getUpdates`, so skip BotFather's webhook steps
   entirely and skip any domain/SSL setup.

## 3. Database setup

1. Create the database, then run `sql/schema.sql` against it (`psql -f sql/schema.sql`).
2. Seed `students`: one row per student with a `unique_code` — generate these as short random
   alphanumeric codes distinct per student (e.g. 6 characters), and hand them out to parents
   through the school's existing channel (not through this bot, to avoid leaking a code to the
   wrong chat_id).
3. Seed `staff`: name + chat_id + category, one row per staff member handling tickets.
4. Seed `bot_offset`: one row per polling bot (`INSERT INTO bot_offset (bot_name, last_update_id)
   VALUES ('flow1', 0), ('flow2', 0)`, or just `'flow1'` if Flow 1 and Flow 2 share one poller —
   without this row the first `getUpdates` call has no `offset` to read. `verification_attempts`,
   `sla_alerts`, and `error_log` need no seed rows — they start empty.
5. Seed `faq`: the four public menu answers (شهریه / ثبت‌نام / درباره‌ی مدرسه / آدرس و ساعت کاری),
   with normalized `keywords` (see `.claude/rules/persian-normalization.md` — store keywords
   already normalized so the runtime match is normalized-to-normalized).

## 4. Importing workflows

1. In n8n: Workflows → Import from File → pick each `workflows/flow-*.json` in order
   (`flow-0-error-handler.json` first if present, then flows 1–3).
2. Open each imported workflow's Settings → set **Error Workflow** to `flow-0-error-handler`.
3. Set each Postgres node's credential to the school's DB connection; set each HTTP Request node's
   URL to use `{{$env.TELEGRAM_BOT_TOKEN}}`, not a literal token.
4. Activate each workflow.

## 5. Smoke test

Before broad rollout, run the golden path of each flow manually — see `docs/TEST-CHECKLIST.md`.
