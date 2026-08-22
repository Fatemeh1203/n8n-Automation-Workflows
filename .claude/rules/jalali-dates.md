---
description: Jalali (Shamsi) date display and UTC storage convention for every flow.
paths:
  - "workflows/**"
---

# Jalali dates

- Store every timestamp in PostgreSQL as UTC (`TIMESTAMPTZ`, `now()`) — never store a converted value.
- Convert to Jalali only at the point a message is rendered to a user (ticket confirmations, SLA
  alerts, weekly report, absence notices). Never show a Gregorian date to a user.

## Reference implementation (n8n Code node, JavaScript, no dependencies)

n8n's sandboxed Code node cannot `npm install`, so use a dependency-free Gregorian→Jalali routine.
Paste this as a "تبدیل تاریخ به شمسی" Code node wherever a date is formatted for output:

```javascript
function toJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = gy <= 1600 ? 0 : 979;
  gy -= gy <= 1600 ? 621 : 1600;
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  jy += Math.floor((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return { jy, jm, jd };
}

function formatJalali(utcIsoString) {
  const d = new Date(utcIsoString);
  const { jy, jm, jd } = toJalali(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  const pad = (n) => String(n).padStart(2, '0');
  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

return items.map(item => ({
  json: { ...item.json, jalali_date: formatJalali(item.json.created_at) }
}));
```

Use `formatJalali` on `created_at`, `closed_at`, and any date shown in the weekly report or an
SLA/absence message. Time-of-day (for the Thursday 18:00 report, the 4h/24h SLA checks) uses the
server clock directly — only calendar *dates* need Jalali conversion, not hour math.
