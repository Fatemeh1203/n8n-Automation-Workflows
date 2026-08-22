# Flow 2 — Parents (authenticated)

Node-by-node build spec. Output file: `workflows/flow-2-parents.json`. This flow needs **two**
independent triggers inside the same workflow: the message-handling chain and the hourly SLA
chain — build both, they share nodes only via the database, not via n8n connections.

## Chain A — message handling

| # | Node name (Persian) | Type | Notes |
|---|---|---|---|
| 1 | `تریگر زمان‌بندی` | `n8n-nodes-base.scheduleTrigger` | Same polling pattern as Flow 1. |
| 2 | `دریافت پیام‌های تلگرام` | `n8n-nodes-base.httpRequest` | `getUpdates`, own `bot_offset` row keyed `bot_name = 'flow2'` (or the shared `'flow1'` row if the plan says one bot serves both flows). |
| 3 | `نرمال‌سازی متن` | `n8n-nodes-base.code` | From `.claude/rules/persian-normalization.md`. |
| 4 | `جستجوی ولی` | `n8n-nodes-base.postgres` | `SELECT * FROM parents WHERE chat_id = $1`. |
| 5 | `بررسی احراز هویت` | `n8n-nodes-base.if` | Condition: row exists AND `verified_at IS NOT NULL`. |
| 6 (false branch) | `درخواست کد یکتا` | `n8n-nodes-base.httpRequest` | Ask for the unique code — but only if no lockout is active (see node 7). |
| 7 | `بررسی قفل` | `n8n-nodes-base.postgres` + `n8n-nodes-base.if` | Query `verification_attempts` (`db-schema.md`, Operational tables) by `chat_id`. If `attempt_count >= 3 AND now() - last_attempt_at < interval '1 hour'` → send "به دلیل ۳ بار ورود نادرست، تا یک ساعت دیگر امکان تلاش مجدد نیست." and stop. |
| 8 | `تطبیق کد` | `n8n-nodes-base.postgres` | `SELECT id FROM students WHERE unique_code = $1` (code normalized first). |
| 9a (match) | `ثبت احراز هویت` | `n8n-nodes-base.postgres` | `INSERT INTO parents (student_id, chat_id, verified_at) VALUES (..., now()) ON CONFLICT (chat_id) DO UPDATE SET student_id = EXCLUDED.student_id, verified_at = now()`; reset (delete or zero) the matching `verification_attempts` row. |
| 9b (no match) | `افزایش شمارنده خطا` | `n8n-nodes-base.postgres` | `INSERT INTO verification_attempts (chat_id, attempt_count, last_attempt_at) VALUES ($1, 1, now()) ON CONFLICT (chat_id) DO UPDATE SET attempt_count = verification_attempts.attempt_count + 1, last_attempt_at = now()`; reply with the remaining-attempts count. |
| 10 (true branch of node 5) | `منوی دسته‌بندی` | `n8n-nodes-base.httpRequest` | Send the button menu: مالی / آموزشی / انضباطی / مرخصی / سایر. |
| 11 | `ثبت تیکت` | `n8n-nodes-base.postgres` | `INSERT INTO tickets (student_id, category, body, update_id) VALUES (...) ON CONFLICT (update_id) DO NOTHING RETURNING id` — idempotent (see `.claude/rules/workflow-reliability.md`). If the RETURNING set is empty (conflict hit), skip steps 12–13 — the ticket already exists. |
| 12 | `یافتن مسئول دسته` | `n8n-nodes-base.postgres` | `SELECT chat_id FROM staff WHERE category = $1`. If none found, send the ticket to the office chat_id as a fallback and note the gap (per `/design-system`'s roster check). |
| 13 | `اطلاع به مسئول` + `ارسال شماره تیکت به ولی` | `n8n-nodes-base.httpRequest` (×2) | Persian confirmation to the parent includes the ticket id. |
| 14 | `بستن تیکت` (separate branch, staff-initiated) | `n8n-nodes-base.postgres` | `UPDATE tickets SET status='بسته', closed_at=now() WHERE id = $1`. |
| 15 | `ارسال نظرسنجی` | `n8n-nodes-base.httpRequest` | 2-button Persian survey ("راضی" / "ناراضی") sent to the parent right after closing. |
| 16 | `ثبت امتیاز` | `n8n-nodes-base.postgres` | `UPDATE tickets SET rating = $1 WHERE id = $2`, on the survey callback. |
| 17 | `به‌روزرسانی آفست` | `n8n-nodes-base.postgres` | Same pattern as Flow 1, against `bot_offset`. |

## Chain B — hourly SLA sweep

| # | Node name (Persian) | Type | Notes |
|---|---|---|---|
| 1 | `تریگر ساعتی` | `n8n-nodes-base.scheduleTrigger` | Cron: every hour, e.g. `0 * * * *`. |
| 2 | `تیکت‌های بدون پاسخ ۴ ساعت` | `n8n-nodes-base.postgres` | `SELECT * FROM tickets WHERE first_reply_at IS NULL AND status != 'بسته' AND created_at < now() - interval '4 hours'`. |
| 3 | `یادآوری به مسئول` | `n8n-nodes-base.postgres` + `n8n-nodes-base.httpRequest` | Before sending: `INSERT INTO sla_alerts (ticket_id, kind) VALUES ($1, '4h')` — on unique-conflict, skip the send (already alerted). On success, per-row send to `assignee`/category staff. |
| 4 | `تیکت‌های بدون پاسخ ۲۴ ساعت` | `n8n-nodes-base.postgres` | Same query at 24h threshold. |
| 5 | `هشدار به مدیر` | `n8n-nodes-base.postgres` + `n8n-nodes-base.httpRequest` | Same `sla_alerts` insert-then-send pattern with `kind = '24h'`, to the principal's chat_id (from `docs/system-plan.md`). |

## Workflow settings

`settings.errorWorkflow` → the shared error handler (see Flow 1's note on `flow-0-error-handler.json`).

## Assumptions to confirm, not guess

- How a staff reply is captured as `first_reply_at` (a staff member replying inside the same
  Telegram chat_id as the parent isn't possible over one bot — likely staff work from a *separate*
  bot/chat or a reply keyboard button "پاسخ داده شد" that a human clicks after replying out-of-band).
  This is a real gap in the brief — flag it in `/design-system` and get the school's answer before
  building Chain A's staff-notification nodes in detail.
