# Flow 3 — School to parent

Node-by-node build spec. Output file: `workflows/flow-3-school-to-parent.json`. Three independent
triggers in one workflow: announcements, absences, weekly report.

## Chain A — announcements (panel-triggered)

| # | Node name (Persian) | Type | Notes |
|---|---|---|---|
| 1 | `تریگر فرم اطلاعیه` | `n8n-nodes-base.formTrigger` | n8n's built-in Form Trigger is the simplest "panel" that needs no extra hosting/domain — confirm with the user this satisfies "از پنل"; if they want a real admin panel, that's out of this flow's scope and needs its own project. Fields: پایه یا کلاس هدف، متن اطلاعیه. |
| 2 | `یافتن اولیای هدف` | `n8n-nodes-base.postgres` | `SELECT p.chat_id FROM parents p JOIN students s ON s.id = p.student_id WHERE p.verified_at IS NOT NULL AND (s.grade = $1 OR s.class = $1)`. |
| 3 | `ارسال اطلاعیه` | `n8n-nodes-base.httpRequest` | Loop (n8n's built-in item looping) `sendMessage` per chat_id — respect Telegram rate limits (add a short `n8n-nodes-base.wait` between batches if the parent list is large). |

## Chain B — absences (daily entry)

| # | Node name (Persian) | Type | Notes |
|---|---|---|---|
| 1 | `تریگر فرم غیبت` | `n8n-nodes-base.formTrigger` | Fields: کد دانش‌آموز یا نام + کلاس، تاریخ (پیش‌فرض امروز). |
| 2 | `یافتن ولی` | `n8n-nodes-base.postgres` | `SELECT p.chat_id FROM parents p JOIN students s ON ... WHERE s.id = $1 AND p.verified_at IS NOT NULL`. If no verified parent yet, log to `unanswered`-style gap table instead of silently dropping. |
| 3 | `ارسال پیام غیبت` | `n8n-nodes-base.httpRequest` | Same-day Persian message naming the student and date (Jalali, see `.claude/rules/jalali-dates.md`). |

## Chain C — weekly report

| # | Node name (Persian) | Type | Notes |
|---|---|---|---|
| 1 | `تریگر هفتگی` | `n8n-nodes-base.scheduleTrigger` | Cron `0 18 * * 4` (Thursday 18:00, server-local). |
| 2 | `تعداد تیکت به تفکیک دسته` | `n8n-nodes-base.postgres` | `SELECT category, count(*) FROM tickets WHERE created_at > now() - interval '7 days' GROUP BY category`. |
| 3 | `میانگین زمان اولین پاسخ` | `n8n-nodes-base.postgres` | `SELECT assignee_id, avg(first_reply_at - created_at) FROM tickets WHERE first_reply_at IS NOT NULL AND created_at > now() - interval '7 days' GROUP BY assignee_id`. |
| 4 | `تیکت‌های باز` | `n8n-nodes-base.postgres` | `SELECT count(*) FROM tickets WHERE status != 'بسته'`. |
| 5 | `پرتکرارترین موضوع` | `n8n-nodes-base.postgres` | Reuse node 2's grouped counts, take the max. |
| 6 | `قالب‌بندی گزارش` | `n8n-nodes-base.code` | Merge nodes 2–5's output into one Persian message; format the report date with `.claude/rules/jalali-dates.md`. |
| 7 | `ارسال گزارش به مدیر` | `n8n-nodes-base.httpRequest` | `sendMessage` to the principal's chat_id. |

## Workflow settings

`settings.errorWorkflow` → the shared error handler.

## Assumptions to confirm, not guess

- Absence and announcement panels are built here as n8n Form Triggers (no external hosting, no
  domain, consistent with the "no domain/SSL" constraint). If the school expects a real staff-facing
  web admin UI, say so explicitly — that is a larger, separate build, not part of this flow.
