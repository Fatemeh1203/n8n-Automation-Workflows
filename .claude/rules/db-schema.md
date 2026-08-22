---
description: Canonical PostgreSQL schema for the parent-support system — single source of truth for table/column names.
paths:
  - "sql/**"
  - "workflows/**"
---

# Database schema

Seven domain tables from the brief, plus four operational tables the flows need at runtime (see
"Operational tables" below). Every flow and every generated SQL file must match these names and
types exactly — never invent a column or table beyond the ones documented here.

Table order matters: a table with a foreign key must be declared **after** the table it references.
`sql/schema.sql` must preserve this order (students, staff → parents, tickets → faq, leads,
unanswered) — do not reorder back to the brief's original listing order, which puts `tickets`
before `staff` and breaks `psql -f sql/schema.sql`.

```sql
CREATE TABLE students (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  grade         TEXT NOT NULL,          -- e.g. 'پایه هفتم'
  class         TEXT NOT NULL,          -- e.g. '۷الف'
  parent_phone  TEXT NOT NULL,
  unique_code   TEXT NOT NULL UNIQUE    -- code a parent enters to verify
);

CREATE TABLE staff (
  id        SERIAL PRIMARY KEY,
  name      TEXT NOT NULL,
  chat_id   BIGINT NOT NULL UNIQUE,
  category  TEXT NOT NULL              -- matches tickets.category; a staff member handles one category
);

CREATE TABLE parents (
  id            SERIAL PRIMARY KEY,
  student_id    INTEGER NOT NULL REFERENCES students(id),
  chat_id       BIGINT NOT NULL UNIQUE, -- Telegram chat id; one verified parent per chat
  verified_at   TIMESTAMPTZ             -- NULL until code verification succeeds
);

CREATE TABLE tickets (
  id              SERIAL PRIMARY KEY,
  student_id      INTEGER NOT NULL REFERENCES students(id),
  category        TEXT NOT NULL,        -- 'مالی' | 'آموزشی' | 'انضباطی' | 'مرخصی' | 'سایر'
  body            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'باز',   -- 'باز' | 'پاسخ‌داده‌شده' | 'بسته'
  assignee_id     INTEGER REFERENCES staff(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_reply_at  TIMESTAMPTZ,
  closed_at       TIMESTAMPTZ,
  rating          SMALLINT,             -- 1 (unsatisfied) | 2 (satisfied), NULL until surveyed
  update_id       BIGINT UNIQUE         -- Telegram update id that created this ticket; idempotency key
);

CREATE TABLE faq (
  id         SERIAL PRIMARY KEY,
  keywords   TEXT NOT NULL,             -- normalized, comma-separated match terms
  answer     TEXT NOT NULL,
  menu_path  TEXT NOT NULL              -- e.g. 'شهریه' | 'ثبت‌نام' | 'درباره‌ی مدرسه' | 'آدرس و ساعت کاری'
);

CREATE TABLE leads (
  id          SERIAL PRIMARY KEY,
  phone       TEXT NOT NULL,
  question    TEXT NOT NULL,
  source      TEXT NOT NULL DEFAULT 'ربات معرفی',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE unanswered (
  id          SERIAL PRIMARY KEY,
  chat_id     BIGINT NOT NULL,
  text        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Operational tables

Not in the brief's table list, but required for the brief's own requirements ("هر تیکت idempotent
باشد", polling with an offset, the 3-strikes lockout, "one alert per SLA breach") to actually be
implementable. `/design-system` must present these for approval alongside the 7 domain tables —
never build a flow that silently invents its own ad-hoc state table instead.

```sql
CREATE TABLE bot_offset (
  bot_name        TEXT PRIMARY KEY,     -- 'flow1' / 'flow2' if pollers are separate, else one shared row
  last_update_id  BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE verification_attempts (
  chat_id          BIGINT PRIMARY KEY,
  attempt_count    SMALLINT NOT NULL DEFAULT 0,
  last_attempt_at  TIMESTAMPTZ
);

CREATE TABLE sla_alerts (
  id         SERIAL PRIMARY KEY,
  ticket_id  INTEGER NOT NULL REFERENCES tickets(id),
  kind       TEXT NOT NULL,             -- '4h' | '24h'
  sent_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, kind)              -- one alert per ticket per threshold, ever
);

CREATE TABLE error_log (
  id           SERIAL PRIMARY KEY,
  workflow     TEXT NOT NULL,
  node_name    TEXT NOT NULL,
  message      TEXT NOT NULL,
  chat_id      BIGINT,                  -- NULL when the error wasn't tied to a specific user
  occurred_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Notes for anything that touches this schema

- `tickets.update_id` and the four operational tables above are additions beyond the brief's
  literal table list — flag them explicitly to the user in `/design-system` as assumptions, don't
  silently add anything further beyond what's documented on this page.
- `parents.verified_at IS NULL` gates every query that returns student/parent data (CLAUDE.md invariant).
- Index at minimum: `parents(chat_id)`, `tickets(student_id)`, `tickets(status)`, `tickets(assignee_id)`,
  `staff(category)`, `students(unique_code)`, `sla_alerts(ticket_id)` — `/design-system` writes
  these into `sql/schema.sql`.
