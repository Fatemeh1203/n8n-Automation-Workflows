---
description: Idempotency and error-handling patterns every workflow JSON must implement.
paths:
  - "workflows/**"
---

# Workflow reliability

## Idempotency

Telegram's `getUpdates` can redeliver an update (retry after a timeout, a workflow re-run). Every
node that writes a row driven by an incoming Telegram update must be idempotent:

- Carry the Telegram `update_id` through to the write. `tickets.update_id UNIQUE` is the dedupe key
  (see `db-schema.md`) — use a Postgres `INSERT ... ON CONFLICT (update_id) DO NOTHING` (or an
  "IF" node that queries for the `update_id` first) before creating a ticket.
- The `getUpdates` HTTP Request node itself must pass `offset = last_update_id + 1` so processed
  updates are not re-fetched — persist `last_update_id` in the `bot_offset` table (see
  `db-schema.md`'s Operational tables), not in n8n's static data, so a workflow re-import doesn't
  reset it.
- Verification attempts (Flow 2 step 1) use the `verification_attempts` table (`db-schema.md`) —
  an UPSERT keyed on `chat_id`, not an INSERT, so retries don't inflate the attempt count.
- SLA reminders (Flow 2's hourly sweep) use the `sla_alerts` table's `UNIQUE (ticket_id, kind)` —
  insert a row before sending each reminder/escalation; a conflict means it was already sent, skip
  the send.
- Survey ratings are idempotent by construction (an UPDATE keyed on `tickets.id`, not an INSERT) —
  no extra dedupe key needed.

## Error handling

Two layers — don't rely on the global Error Workflow alone to reach the user: n8n's Error Trigger
payload carries workflow/node/error/execution metadata but not arbitrary custom data like a
chat_id from the failed run, so it cannot reliably message the affected user itself.

1. **Global logging** — every workflow has an attached **Error Workflow**
   (`flow-0-error-handler.json`, n8n workflow settings → Error Workflow) built on an
   `n8n-nodes-base.errorTrigger` node. Its only job: write the error (workflow name, failing node
   name, error message, timestamp) via a Postgres node into `error_log` (`db-schema.md`). No
   Telegram send here — no reliable chat_id to send to.
2. **In-flow handling** — any node that talks to Telegram or Postgres and can throw (HTTP
   Request, Postgres, Code) sets `continueOnFail: true`, immediately followed by an
   `n8n-nodes-base.if` node checking `{{$json.error}}` (n8n populates this on a continued failure).
   The true (error) branch does one of two things, depending on what the failing node was for:
   - **Direct reply to the requesting user** (the node's whole job is answering them — an FAQ
     answer, a code-verification result, a ticket confirmation): send the one fixed generic
     Persian message, e.g. "متأسفانه مشکلی پیش آمد؛ لطفاً کمی بعد دوباره تلاش کنید." — to the
     chat_id already in that flow's own data. Never let a raw error/stack trace reach that message.
   - **Internal/backend notification** (the node tells staff, the office, or the principal — the
     original requester, if any, already got their own confirmation from an earlier node): insert
     into `error_log` instead of messaging anyone. Don't send a confusing "something went wrong"
     message to a user who wasn't the target of the failed send.
3. Both layers apply independently; a node's local error branch doesn't replace the global
   Error Workflow being set in `settings.errorWorkflow` — set both.
