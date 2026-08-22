# School-specific parameters to gather

Ask only for what the user hasn't already given. Default the ticket categories and FAQ menu paths
to the brief's list (state that default explicitly); everything else has no safe default — ask.

- **Office / management chat_id(s)** — where Flow 1's "سؤال دیگر" lead alert and Flow 2's 24h
  manager SLA escalation and the Thursday weekly report go. Required, no default.
- **Staff roster** — name + Telegram chat_id + category (مالی / آموزشی / انضباطی / مرخصی / سایر)
  for each staff member who receives tickets. Required, no default. If a category has no staff
  yet, note it as an open gap in the plan rather than guessing an assignee.
- **Grade and class list** — the exact set of values `students.grade` / `students.class` will use
  (e.g. پایه‌های هفتم تا دوازدهم, classes الف/ب/ج), needed for the announcement-by-grade-or-class
  flow and for seed data in `/finalize-deliverables`.
- **FAQ content** — keyword sets + answers + menu_path for: شهریه، ثبت‌نام، درباره‌ی مدرسه، آدرس و
  ساعت کاری (the brief's 4 fixed menu items). Ask for the actual answer text; never invent tuition
  amounts, addresses, or hours.
- **Ticket categories** — default: مالی / آموزشی / انضباطی / مرخصی / سایر (from the brief). Confirm
  or ask for a replacement list; if replaced, note that `staff.category` and the Flow 2 menu must
  match exactly.
- **SLA thresholds** — default: 4h reminder to assignee, 24h escalation to the principal (from the
  brief). Confirm or ask for different hours.
- **Bot identity** — the school's Telegram bot username/token is gathered later in
  `/finalize-deliverables` (it's a deployment secret, not a planning input).
