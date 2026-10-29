# ☀️ Daily Report & Task Assistant — دستیار گزارش روزانه و وظایف

**n8n + Telegram + Google Sheets**

> صبح یادآوری می‌کند · عصر گزارش می‌گیرد · همه‌چیز را آرشیو می‌کند · اول ماه گزارش عملکرد می‌دهد
>
> Reminds you in the morning · collects your report in the evening · archives everything · hands you a performance report on the 1st

<div dir="rtl">

## 🇮🇷 فارسی

### مشکلی که حل می‌کند

کارهای تکراری روزانه وقت می‌خورند و هیچ ارزشی تولید نمی‌کنند. بدتر از آن: **موقع ارزیابی عملکرد هیچ مستندی نداری.** یادت نمی‌آید سه ماه پیش چه کردی، و دقیقاً همان چیزی که یادت نمی‌آید، همان چیزی است که حقوق و ارتقایت به آن بستگی دارد.

این ورک‌فلو بدون اینکه عادت جدیدی به تو تحمیل کند، هر روز یک خط مستندات از کارت می‌سازد.

### چه می‌کند

| زمان | اتفاق |
|---|---|
| **۸:۳۰ صبح** (شنبه–چهارشنبه) | لیست کارهای باز را می‌فرستد: 🔴 عقب‌افتاده، 🎯 امروز، 🗓 بعداً — مرتب‌شده بر اساس اولویت |
| **۱۷:۳۰ عصر** (شنبه–چهارشنبه) | گزارش روزانه را می‌خواهد (با Force-Reply) و یادآوری می‌کند امروز چه بستی |
| **همان لحظه** | جواب تو را تجزیه می‌کند (ساعت، حال، تگ) و در گوگل‌شیت آرشیو می‌کند |
| **اول هر ماه، ساعت ۹** | گزارش تجمیعی: پوشش، تعداد کار، ساعت کارکرد، طولانی‌ترین زنجیره، حوزه‌های کاری، دستاوردهای شاخص |

### دستورها

| دستور | کار |
|---|---|
| `/task عنوان` | افزودن کار — میان‌بر: `+ عنوان` |
| | افزونه‌ها: `!بالا` اولویت · `@2026-08-20` سررسید · `#تگ` |
| `/list` | کارهای باز، شماره‌دار |
| `/done 3` | بستن کار شمارهٔ ۳ — یا `/done بخشی از عنوان` |
| `/report متن` | ثبت دستی گزارش امروز |
| `/off` | ثبت مرخصی امروز |
| `/help` | راهنما |

هر پیام معمولی (بدون `/`) به‌عنوان گزارش امروز ذخیره می‌شود.

نکتهٔ مهم: شماره‌های `/list` و `/done` **دقیقاً یکی‌اند** و با ترتیب پیام صبح هم می‌خوانند — پس «۳» همیشه همان «۳» است.

### راه‌اندازی در ۵ دقیقه

۱. **گوگل‌شیت** — یک سند بساز با دو شیت به نام‌های `Tasks` و `Reports`.
   سرستون‌ها را از `templates/Tasks.csv` و `templates/Reports.csv` در ردیف اول کپی کن (عیناً).

۲. **ورک‌فلو** — `workflows/daily-report-assistant.json` را در n8n وارد کن
   (`Workflows → ⋯ → Import from File`).

۳. **کردنشیال‌ها** — در نودهای Google Sheets سند را از لیست انتخاب کن،
   و در نودهای Telegram کردنشیال ربات را وصل کن.
   ربات را با [@BotFather](https://t.me/BotFather) بساز.

۴. **آی‌دی چت** — `<<TELEGRAM_CHAT_ID>>` را در **سه نود Code** جایگزین کن:
   `🧠 Build Morning Message` · `🧠 Build Evening Prompt` · `📊 Build Monthly Summary`
   آی‌دی خودت را از [@get_id_bot](https://t.me/get_id_bot) بگیر.

۵. **اختیاری ولی توصیه‌شده** — در نود `🔀 Normalize Input` مقدار `allowedUserIds` را پر کن
   تا فقط خودت بتوانی به ربات دستور بدهی.

۶. ورک‌فلو را **Activate** کن. تمام.

### تنظیمات

همهٔ تنظیمات در بالای نودهای Code، داخل بلوک `CFG` هستند:

```js
const CFG = {
  chatId:     '<<TELEGRAM_CHAT_ID>>',
  lang:       'fa',          // 'fa' یا 'en' — کل رابط دوزبانه است
  tz:         'Asia/Tehran',
  maxTasks:   15,
  showJalali: true,          // نمایش تاریخ شمسی
};
```

روزهای کاری (پیش‌فرض شنبه تا چهارشنبه) در تریگرهای Schedule و در `CFG.workdays` نود ماهانه تنظیم می‌شوند.

### 🔀 تعویض تلگرام با چیز دیگر

**بله، کاملاً می‌شود.** ورک‌فلو از قصد طوری ساخته شده که فقط **یک نود** به کانال ورودی وابسته باشد.

برای مهاجرت فقط دو چیز عوض می‌شود:

۱. نود تریگر (`💬 Telegram Trigger`)
۲. بلوک `SOURCE` داخل نود `🔀 Normalize Input` — نمونه‌های آماده همان‌جا کامنت شده‌اند

بقیهٔ ورک‌فلو دست‌نخورده می‌ماند، چون فقط این قرارداد را می‌بیند:

```js
{ source, userId, userName, chatId, text, messageId, receivedAt }
```

| جایگزین | نود n8n | مناسب برای |
|---|---|---|
| **فرم وب** | `Form Trigger` | دمو و تست بدون هیچ ستاپی |
| **بله / ایتا** | `Webhook` + `HTTP Request` | سازمان‌های داخلی |
| **واتساپ** | `WhatsApp Trigger` | کار با کلاینت خارجی |
| **ایمیل** | `Email Trigger (IMAP)` | محیط شرکتی، بدون نصب اپ |
| **اسلک / دیسکورد** | `Slack Trigger` | تیم‌های فنی |
| **گوگل‌شیت** | `Google Sheets Trigger` | ساده‌ترین حالت، بدون ربات |

خروجی (اعلان‌ها) هم به همین شکل: نودهای Telegram را با Slack/Email/Webhook عوض کن — متن همهٔ پیام‌ها آمادهٔ HTML است.

### ساختار داده

**شیت `Tasks`**

`id` · `date` · `task` · `priority` · `status` · `tags` · `due` · `owner` · `created_at` · `done_at`

`priority`: `high` \| `med` \| `low` — `status`: `todo` \| `doing` \| `blocked` \| `done`

**شیت `Reports`**

`date` · `weekday` · `report` · `items_count` · `done_count` · `hours` · `tags` · `mood` · `source` · `owner` · `chat_id` · `created_at`

چون داده در گوگل‌شیت است، هر وقت خواستی می‌توانی خودت Pivot و نمودار بسازی، یا کل آرشیو را به‌عنوان PDF ضمیمهٔ پروندهٔ ارزیابی کنی.

### مقاوم در برابر خطا

- شیت خالی ورک‌فلو را نمی‌شکند — پیام دوستانه می‌فرستد
- نودهای Google Sheets و Telegram روی خطا **۳ بار** با فاصله تلاش می‌کنند
- گزارش خیلی کوتاه ذخیره نمی‌شود؛ از کاربر توضیح بیشتر می‌خواهد
- `/done` با شمارهٔ نامعتبر یا عنوان مبهم، پیام راهنما می‌دهد و چیزی را خراب نمی‌کند
- فهرست سفید کاربران، ربات را از دسترس غریبه‌ها خارج می‌کند

</div>

---

## 🇬🇧 English

### The problem

Repetitive daily admin eats your time and produces nothing. Worse: **at review time you have no evidence.** You can't remember what you shipped three months ago — and that is exactly what your raise depends on.

This workflow builds a line of documentation every day without forcing a new habit on you.

### What it does

| When | What happens |
|---|---|
| **08:30** (Sat–Wed) | Sends your open tasks: 🔴 overdue, 🎯 today, 🗓 later — sorted by priority |
| **17:30** (Sat–Wed) | Asks for your daily report (Force-Reply) and pre-lists what you closed today |
| **Instantly** | Parses your reply (hours, mood, tags) and archives it to Google Sheets |
| **1st of month, 09:00** | Aggregated roll-up: coverage, tasks done, hours, longest streak, focus areas, highlights |

### Commands

| Command | Action |
|---|---|
| `/task title` | Add a task — shortcut: `+ title` |
| | modifiers: `!high` priority · `@2026-08-20` due · `#tag` |
| `/list` | Numbered open tasks |
| `/done 3` | Close task #3 — or `/done part of the title` |
| `/report text` | Log today's report manually |
| `/off` | Mark today as a day off |
| `/help` | Show help |

Any plain message (no `/`) is stored as today's report.

Note: `/list` and `/done` numbering are **identical** and match the morning message ordering — "3" is always the same "3".

### 5-minute setup

1. **Google Sheets** — create one spreadsheet with two tabs named `Tasks` and `Reports`.
   Copy the headers verbatim from `templates/Tasks.csv` and `templates/Reports.csv` into row 1.

2. **Workflow** — import `workflows/daily-report-assistant.json` into n8n
   (`Workflows → ⋯ → Import from File`).

3. **Credentials** — pick your spreadsheet from the list in every Google Sheets node,
   and attach your bot credential in the Telegram nodes.
   Create the bot with [@BotFather](https://t.me/BotFather).

4. **Chat ID** — replace `<<TELEGRAM_CHAT_ID>>` in **three Code nodes**:
   `🧠 Build Morning Message` · `🧠 Build Evening Prompt` · `📊 Build Monthly Summary`
   Get your ID from [@get_id_bot](https://t.me/get_id_bot).

5. **Optional but recommended** — set `allowedUserIds` in the `🔀 Normalize Input` node
   so only you can command the bot.

6. **Activate.** Done.

### Configuration

Every setting lives in a `CFG` block at the top of the Code nodes:

```js
const CFG = {
  chatId:     '<<TELEGRAM_CHAT_ID>>',
  lang:       'fa',          // 'fa' or 'en' — the whole UI is bilingual
  tz:         'Asia/Tehran',
  maxTasks:   15,
  showJalali: true,          // show the Persian (Jalali) date
};
```

Workdays (Sat–Wed by default) are set in the Schedule triggers and in `CFG.workdays` of the monthly node.

### 🔀 Swapping Telegram for something else

**Yes, fully supported.** The workflow is deliberately built so that exactly **one node** depends on the input channel.

To migrate, change only two things:

1. The trigger node (`💬 Telegram Trigger`)
2. The `SOURCE` block inside `🔀 Normalize Input` — ready-made variants are commented in place

Everything downstream is untouched, because it only ever sees this contract:

```js
{ source, userId, userName, chatId, text, messageId, receivedAt }
```

| Alternative | n8n node | Good for |
|---|---|---|
| **Web form** | `Form Trigger` | Demos and trials with zero setup |
| **Bale / Eitaa** | `Webhook` + `HTTP Request` | Organisations where Telegram is blocked |
| **WhatsApp** | `WhatsApp Trigger` | Freelancers with international clients |
| **Email** | `Email Trigger (IMAP)` | Corporate environments, no app install |
| **Slack / Discord** | `Slack Trigger` | Technical teams |
| **Google Sheets** | `Google Sheets Trigger` | Simplest option, no bot at all |

The same applies to output: swap the Telegram nodes for Slack/Email/Webhook — every message body is HTML-ready.

### Data model

**`Tasks` sheet**

`id` · `date` · `task` · `priority` · `status` · `tags` · `due` · `owner` · `created_at` · `done_at`

`priority`: `high` \| `med` \| `low` — `status`: `todo` \| `doing` \| `blocked` \| `done`

**`Reports` sheet**

`date` · `weekday` · `report` · `items_count` · `done_count` · `hours` · `tags` · `mood` · `source` · `owner` · `chat_id` · `created_at`

Because the data sits in Google Sheets, you can pivot and chart it yourself at any time, or export the whole archive as a PDF to attach to your review file.

### Built to not break

- An empty sheet doesn't crash the run — it sends a friendly message instead
- Google Sheets and Telegram nodes **retry 3 times** with backoff on failure
- Reports that are too short are rejected rather than archived as noise
- `/done` with an invalid number or an ambiguous title replies with guidance and changes nothing
- The user allowlist keeps strangers out of your bot

---

## 📦 Repository layout

```
workflows/daily-report-assistant.json   # ورک‌فلو آمادهٔ import / importable workflow (40 nodes)
templates/Tasks.csv                     # سرستون‌های شیت وظایف / Tasks sheet headers
templates/Reports.csv                   # سرستون‌های شیت آرشیو / Reports sheet headers
```

## 📋 Requirements

- n8n (self-hosted or cloud) — `1.x`
- A Telegram bot, or any alternative channel from the table above
- A Google account with Sheets access

## 📄 License

MIT — see [LICENSE](LICENSE). Use it, modify it, sell it.

---

<div dir="rtl">

**اگر به‌دردت خورد یک ⭐️ بده.** پیشنهاد و ایراد را در Issues بنویس.

</div>

**If this saved you time, leave a ⭐️.** Issues and suggestions welcome.

---

#n8n #automation #اتوماسیون #telegram #تلگرام #TelegramBot #رباتتلگرام #GoogleSheets #گوگلشیت #productivity #بهرهوری #workflow #ورکفلو #NoCode #نوکد #LowCode #DailyReport #گزارشروزانه #TaskManagement #مدیریتوظایف #PerformanceReview #ارزیابیعملکرد #Freelancer #فریلنسر #RemoteWork #دورکاری #TimeTracking #n8nTemplate #n8nWorkflow #OpenSource #متنباز #Persian #فارسی #Jalali #تقویمشمسی #SelfHosted #BusinessAutomation #اتوماسیونکسبوکار
