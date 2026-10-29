# Flow 1 — Public (no auth)

Node-by-node build spec. Output file: `workflows/flow-1-public.json`.

## Nodes

| # | Node name (Persian) | Type | Notes |
|---|---|---|---|
| 1 | `تریگر زمان‌بندی` | `n8n-nodes-base.scheduleTrigger` | Interval 5–10s. |
| 2 | `دریافت پیام‌های تلگرام` | `n8n-nodes-base.httpRequest` | `GET https://api.telegram.org/bot{{$env.TELEGRAM_BOT_TOKEN}}/getUpdates?offset={{$json.next_offset}}`. Offset comes from `bot_offset.last_update_id + 1` (read it first, e.g. `خواندن آفست` Postgres node querying `bot_offset WHERE bot_name = 'flow1'`, before this one). |
| 3 | `نرمال‌سازی متن` | `n8n-nodes-base.code` | Paste the snippet from `.claude/rules/persian-normalization.md`. |
| 4 | `مسیر پیام` | `n8n-nodes-base.switch` | Rules, in order: (a) text matches an inline-keyboard callback_data for one of the 4 FAQ menu items → route "منو"; (b) a phone number pattern (normalized digits, 10–11 digits) while a "منتظر شماره" flag is set on the chat → route "شماره"; (c) text is `/start` or unmatched → route "پیش‌فرض". |
| 5 | `خواندن FAQ` | `n8n-nodes-base.postgres` | `SELECT answer FROM faq WHERE menu_path = $1` (parametrized, never string-concatenated). |
| 6 | `ارسال پاسخ FAQ` | `n8n-nodes-base.httpRequest` | `POST .../sendMessage` with `reply_markup` inline keyboard: دکمه‌های «شهریه»، «ثبت‌نام»، «درباره‌ی مدرسه»، «آدرس و ساعت کاری»، «سؤال دیگر». |
| 7 | `درخواست شماره تلفن` | `n8n-nodes-base.httpRequest` | On "سؤال دیگر": send a Persian prompt asking for a phone number; set the "منتظر شماره" flag (a small Postgres state table keyed on chat_id, or n8n workflow static data). |
| 8 | `ثبت لید` | `n8n-nodes-base.postgres` | `INSERT INTO leads (phone, question, source) VALUES (...)` — `question` is the message text that preceded the phone number (carry it via the state table from node 7). |
| 9 | `اطلاع به دفتر` | `n8n-nodes-base.httpRequest` | `sendMessage` to the office `chat_id` from `docs/system-plan.md`, with the phone + question. |
| 10 | `ثبت پیام بی‌پاسخ` | `n8n-nodes-base.postgres` | On the "پیش‌فرض" branch when nothing matched: `INSERT INTO unanswered (chat_id, text)`, then send a generic Persian "متوجه نشدم، لطفاً از منو انتخاب کنید" reply. |
| 11 | `به‌روزرسانی آفست` | `n8n-nodes-base.postgres` | `UPDATE bot_offset SET last_update_id = $1 WHERE bot_name = 'flow1'`, `$1` = `MAX(update_id) + 1` seen this run — required for idempotent polling, see `.claude/rules/workflow-reliability.md`. Runs at the end of every branch. |

## Workflow settings

Set `settings.errorWorkflow` to the shared error-handling workflow's id/name (see
`.claude/rules/workflow-reliability.md`) — build that as a small separate importable JSON,
`workflows/flow-0-error-handler.json`, the first time any flow references it (only build it once,
Flow 1 is the natural first build to introduce it).

## Assumptions to confirm with the user, not guess

- Exact inline-keyboard `callback_data` values for the 4 FAQ buttons (default: the menu_path text
  itself, ASCII-safe slugged if Telegram callback_data constraints require it — state whichever
  you pick).
- Whether Flow 1 and Flow 2 share one bot (same `getUpdates` polling and offset table, routed by
  content) or use separate bots/commands — `docs/system-plan.md` should already record this
  decision from `/design-system`; if it doesn't, ask before building.
