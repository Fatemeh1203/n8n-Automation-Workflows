# Node plan per flow

Present this list (adapted to the gathered parameters) for approval. `/build-flow` turns each
line into an actual n8n node when the corresponding flow is built.

## Flow 1 — Public (no auth)

1. Schedule Trigger (polling interval, e.g. every 5s–10s)
2. HTTP Request → Telegram `getUpdates` (offset from the persisted offset table)
3. Code → نرمال‌سازی متن (`persian-normalization.md`)
4. Switch → مسیر پیام: دکمه‌ی منو / پاسخ متنی / شماره تلفن در انتظار
5. Postgres → خواندن `faq` بر اساس `menu_path` یا `keywords`
6. Telegram → ارسال پاسخ (inline keyboard: شهریه / ثبت‌نام / درباره‌ی مدرسه / آدرس و ساعت کاری / سؤال دیگر)
7. (branch: «سؤال دیگر») Telegram → درخواست شماره تلفن
8. (branch: شماره دریافت شد) Postgres → INSERT `leads`
9. Telegram → پیام فوری به chat_id دفتر
10. (branch: هیچ‌کدام تطبیق نخورد) Postgres → INSERT `unanswered` + پاسخ عمومی به کاربر
11. Postgres → UPDATE جدول offset با آخرین update_id
12. Error Workflow attached (see `workflow-reliability.md`)

## Flow 2 — Parents (authenticated)

1. Schedule Trigger + HTTP Request `getUpdates` (shared offset table with Flow 1, or a separate
   bot/command namespace — decide and record in `docs/system-plan.md`)
2. Code → نرمال‌سازی متن
3. Postgres → جستجوی `parents` بر اساس `chat_id`
4. IF `verified_at IS NULL` →
   a. Telegram → درخواست کد یکتا
   b. Postgres → تطبیق با `students.unique_code`
   c. IF تطبیق موفق → Postgres UPDATE `parents.verified_at = now()`؛ else → شمارش خطا (n8n static
      data or a small Postgres attempts table) → پس از ۳ بار: قفل ۱ ساعته (چک زمان آخرین تلاش)
5. IF verified → Telegram → منوی دکمه‌ای: مالی / آموزشی / انضباطی / مرخصی / سایر
6. Postgres → INSERT `tickets` (idempotent on `update_id`, see `workflow-reliability.md`)
7. Postgres → SELECT `staff` WHERE category matches → Telegram → ارسال به assignee
8. Telegram → ارسال شماره‌ی تیکت به ولی
9. (separate trigger) Schedule Trigger — هر ساعت — SLA check:
   a. Postgres → تیکت‌های باز بدون `first_reply_at` با `created_at` > 4h → Telegram یادآوری به assignee
   b. همان با > 24h → Telegram هشدار به مدیر
10. (branch: بستن تیکت) Postgres UPDATE `status='بسته'، closed_at=now()` → Telegram نظرسنجی ۲ دکمه‌ای → Postgres UPDATE `rating`
11. Error Workflow attached

## Flow 3 — School to parent

1. (panel-triggered, e.g. a form/manual Postgres insert or n8n form trigger — confirm the panel
   mechanism with the user; the brief says "از پنل" but doesn't specify the panel's tech) →
   Postgres → SELECT `parents` WHERE student's grade/class matches → Telegram → ارسال اطلاعیه
2. Absences: (daily manual/form entry) → Postgres → SELECT parent by student_id → Telegram → پیام
   غیبت همان روز
3. Schedule Trigger — پنج‌شنبه ۱۸:۰۰ — گزارش هفتگی:
   a. Postgres → تعداد تیکت به تفکیک `category`
   b. Postgres → میانگین `first_reply_at - created_at` به تفکیک assignee/واحد
   c. Postgres → تیکت‌های باز (`status != 'بسته'`)
   d. Postgres → پرتکرارترین `category`
   e. Code → قالب‌بندی گزارش با تاریخ شمسی (`jalali-dates.md`)
   f. Telegram → ارسال گزارش به مدیر
4. Error Workflow attached
