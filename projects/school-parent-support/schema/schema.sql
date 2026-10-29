-- ===================================================================
-- سامانه پاسخگویی اولیا + چت‌بات معرفی مدرسه
-- طرحواره پایگاه داده (PostgreSQL) — روی سرور داخلی مدرسه اجرا می‌شود.
-- بدون هوش مصنوعی؛ منطق کاملاً شرطی/جدولی/زمان‌بندی‌شده در n8n.
-- ===================================================================

-- جدول‌های اصلی طبق مشخصات کارفرما
-- -------------------------------------------------------------------

CREATE TABLE students (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    grade         TEXT NOT NULL,              -- پایه، مثال: «هفتم»
    class         TEXT NOT NULL,               -- کلاس، مثال: «الف»
    parent_phone  TEXT NOT NULL,
    unique_code   TEXT NOT NULL UNIQUE          -- کد یکتای احراز هویت ولی
);

CREATE TABLE parents (
    id           SERIAL PRIMARY KEY,
    student_id   INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    chat_id      BIGINT NOT NULL,               -- chat_id تلگرام ولی
    verified_at  TIMESTAMPTZ,                   -- NULL یعنی هنوز تأیید نشده؛ همه‌ی داده‌ها باید این را بررسی کنند
    UNIQUE (student_id, chat_id)                 -- برای idempotent بودن upsert احراز هویت
);

CREATE TABLE staff (
    id        SERIAL PRIMARY KEY,
    name      TEXT NOT NULL,
    chat_id   BIGINT NOT NULL UNIQUE,
    category  TEXT NOT NULL                     -- دسته مسئولیت: آموزشی/مالی/اداری/فنی/دفتر/مدیر
);

CREATE TABLE tickets (
    id              SERIAL PRIMARY KEY,
    student_id      INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    category        TEXT NOT NULL,
    body            TEXT NOT NULL,
    status          TEXT NOT NULL DEFAULT 'open',   -- open | answered | closed
    assignee_id     INTEGER REFERENCES staff(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),  -- UTC
    first_reply_at  TIMESTAMPTZ,
    closed_at       TIMESTAMPTZ,
    rating          SMALLINT,
    dedup_key       TEXT NOT NULL UNIQUE               -- chat_id:message_id تلگرام؛ ضامن idempotent بودن تیکت
);

CREATE TABLE faq (
    id         SERIAL PRIMARY KEY,
    keywords   TEXT NOT NULL,      -- برای تطبیق آزاد با ILIKE روی متن نرمال‌شده
    answer     TEXT NOT NULL,
    menu_path  TEXT NOT NULL UNIQUE  -- کلید دکمه‌ی منو، مثال: tuition / enrollment / about / hours
);

CREATE TABLE leads (
    id          SERIAL PRIMARY KEY,
    phone       TEXT NOT NULL,
    question    TEXT,
    source      TEXT NOT NULL DEFAULT 'telegram',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE unanswered (
    id          SERIAL PRIMARY KEY,
    chat_id     BIGINT NOT NULL,
    text        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول‌های زیرساختی افزوده (خارج از فهرست کارفرما، برای idempotency، مکالمه چندمرحله‌ای و لاگ خطا)
-- -------------------------------------------------------------------

-- ثبت روزانه غیبت؛ idempotent با UNIQUE(student_id, absence_date)
CREATE TABLE absences (
    id             SERIAL PRIMARY KEY,
    student_id     INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    absence_date   DATE NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, absence_date)
);

-- وضعیت مکالمه‌ی چندمرحله‌ایِ هر chat_id در ربات (بدون AI، صرفاً ماشین حالت ساده)
CREATE TABLE sessions (
    chat_id     BIGINT PRIMARY KEY,
    state       TEXT NOT NULL DEFAULT 'idle',
    temp_data   JSONB NOT NULL DEFAULT '{}',
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- لاگ خطای هر نود از هر گردش‌کار (طبق الزام فنی: «خطای هر نود لاگ شود»)
CREATE TABLE logs (
    id             SERIAL PRIMARY KEY,
    workflow_name  TEXT NOT NULL,
    node_name      TEXT,
    message        TEXT NOT NULL,
    occurred_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ایندکس‌های پیشنهادی برای عملکرد بهتر گزارش هفتگی و جستجوهای پرتکرار
-- -------------------------------------------------------------------
CREATE INDEX idx_tickets_created_at   ON tickets (created_at);
CREATE INDEX idx_tickets_status       ON tickets (status);
CREATE INDEX idx_tickets_category     ON tickets (category);
CREATE INDEX idx_parents_chat_id      ON parents (chat_id);
CREATE INDEX idx_staff_chat_id        ON staff (chat_id);
CREATE INDEX idx_students_unique_code ON students (unique_code);

-- نمونه داده‌های کارکنان (staff.category الزامی برای مسیریابی تیکت و گزارش هفتگی)
-- دسته «دفتر» برای اطلاع فوری «سؤال دیگر» و دسته «مدیر» برای گزارش هفتگی/هشدار خطا لازم است.
-- INSERT INTO staff (name, chat_id, category) VALUES
--   ('مدیر مدرسه',      111111111, 'مدیر'),
--   ('دفتر مدرسه',       222222222, 'دفتر'),
--   ('معاون آموزشی',     333333333, 'آموزشی'),
--   ('امور مالی',        444444444, 'مالی'),
--   ('امور اداری',       555555555, 'اداری'),
--   ('پشتیبانی فنی',     666666666, 'فنی');
