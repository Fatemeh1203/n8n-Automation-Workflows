# Manual test checklist template

Write one section per flow that actually exists in `workflows/`. Every case names an action and
an expected Persian-facing result.

## Flow 1 — Public

- [ ] `/start` → inline menu with 5 buttons appears.
- [ ] Tap «شهریه» → correct FAQ answer from `faq` table.
- [ ] Tap each of the other 3 FAQ buttons → correct answers.
- [ ] Tap «سؤال دیگر» → bot asks for a phone number.
- [ ] Send a phone number (Persian digits, e.g. ۰۹۱۲...) → normalized correctly, row appears in
      `leads`, office chat_id receives the alert immediately.
- [ ] Send unrelated free text with no menu interaction → row appears in `unanswered`, user gets
      the generic "متوجه نشدم" reply, no stack trace.
- [ ] Send the same Telegram message twice in a row (simulate a retry) → only one `leads` row.

## Flow 2 — Parents

- [ ] New chat_id sends any text → bot asks for the unique code.
- [ ] Enter a wrong code → error reply, attempt counted.
- [ ] Enter a wrong code 3 times → locked-out message; a 4th attempt within the hour is still
      rejected with the lockout message (not a 4th "wrong code" reply).
- [ ] Wait out (or manually clear) the lockout, enter the correct code → `parents.verified_at`
      set, category menu appears.
- [ ] Submit a ticket in each of the 5 categories → row in `tickets`, correct `assignee` per
      `staff.category`, ticket number sent back to the parent.
- [ ] Re-deliver the same update (simulate `getUpdates` retry) → no duplicate `tickets` row.
- [ ] A category with no staff assigned → falls back to the office chat_id, doesn't silently drop.
- [ ] Leave a ticket unanswered 4+ hours → assignee gets exactly one reminder (not one per hour).
- [ ] Leave a ticket unanswered 24+ hours → principal gets exactly one escalation.
- [ ] Close a ticket → 2-button survey sent; tapping either button writes `tickets.rating`.
- [ ] Query a chat_id with `verified_at IS NULL` for any student data path → nothing returned.

## Flow 3 — School to parent

- [ ] Submit an announcement targeted at a grade → every verified parent of that grade receives it;
      parents outside the grade do not.
- [ ] Submit an announcement targeted at a specific class → only that class's verified parents
      receive it.
- [ ] Submit an absence entry → same-day message reaches the correct parent, with the Jalali date
      formatted correctly.
- [ ] Absence entry for a student with no verified parent yet → logged as a gap, not silently lost.
- [ ] Trigger (or wait for) the Thursday 18:00 report → principal receives ticket counts by
      category, average first-reply time per unit, open-ticket count, and the most frequent topic,
      all with a correctly formatted Jalali report date.

## Cross-cutting error cases (any flow)

- [ ] Force a node failure (e.g. temporarily break a Postgres credential) → the error workflow logs
      it and the user (if a chat_id is known) receives only the generic Persian message, never a
      stack trace.
- [ ] Restart the workflow (simulate an n8n restart) → the offset table resumes polling from the
      last processed `update_id`, no duplicate processing of already-handled messages.
