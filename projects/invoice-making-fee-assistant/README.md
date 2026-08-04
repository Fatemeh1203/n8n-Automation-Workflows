# 🧾 Gold Invoice & Making-Fee Assistant | دستیار محاسبه‌ی فاکتور و اجرت

> An n8n **web-form** assistant for goldsmiths: enter weight, karat, daily gold rate, making-fee % and profit % → it computes and issues an accurate invoice, archives every invoice, and sends a daily sales report.
>
> دستیار **فرم‌وب** برای طلافروش: وزن، عیار، نرخ روز طلا، درصد اجرت و درصد سود را وارد کن → فاکتور دقیق محاسبه و صادر می‌شود، هر فاکتور آرشیو می‌شود و گزارش فروش روزانه ارسال می‌شود.

`#n8n` `#invoice` `#gold` `#goldsmith` `#فاکتور_طلا` `#اجرت` `#محاسبه_طلا` `#طلافروش` `#automation` `#اتوماسیون` `#no_code` `#webform` `#فرم_آنلاین` `#iran` `#workflow`

---

## 🇬🇧 English

### What it does
- **Web form** (no Telegram needed) — the shop enters weight, karat, 18k gold rate, making-fee %, profit %.
- **Compute** — `goldValue = weight × rate × (karat/750)`, then making-fee, then profit, then total.
- **Archive** — every invoice is stored in an n8n Data Table.
- **Invoice output** — a clean printable invoice is shown to the customer right after submit.
- **Daily report (21:00)** — sums today's invoices and sends a report to the owner's Telegram.

### Why a shop pays for it
Manual calculation errors in gold mean direct money loss. This removes them and issues a consistent invoice every time.

### Input method — form, not Telegram
This assistant uses an **n8n Form Trigger**, which gives a **public URL**. That URL is also a live demo a buyer can open, test, and then decide to buy — no GitHub needed.

### Workflow map
```
Invoice Form ─▶ Compute Invoice ─▶ Archive Invoice ─▶ Show Invoice (printable)
Daily 21:00  ─▶ Get Today Invoices ─▶ Aggregate Report ─▶ Send Daily Report (Telegram)
```

### Setup (short)
1. Run n8n locally / on your own server.
2. Create a Data Table `invoices` (columns below).
3. (Report only) create a `Telegram Bot` credential and set your numeric chat id in **Send Daily Report**.
4. Import [`workflow.json`](workflow.json), open the form's Production URL, **Activate**.

Full guide: [`docs/setup.md`](docs/setup.md) · Sales guide: [`docs/sales.md`](docs/sales.md)

### Data Table `invoices`
`invoiceNo`, `day`, `dateFa`, `customer`, `item`, `weight`, `karat`, `rate18`, `goldValue`, `makingFee`, `profit`, `total`
> `id`, `createdAt`, `updatedAt` are added automatically by n8n — don't create them.

---

## 🇮🇷 فارسی

### چه‌کار می‌کند؟
- **فرم وب** (بدون نیاز به تلگرام) — مغازه وزن، عیار، نرخ طلای ۱۸، درصد اجرت و درصد سود را وارد می‌کند.
- **محاسبه** — `ارزش طلا = وزن × نرخ × (عیار÷۷۵۰)`، سپس اجرت، سپس سود، سپس مبلغ نهایی.
- **آرشیو** — هر فاکتور در Data Table ذخیره می‌شود.
- **خروجی فاکتور** — بلافاصله بعد از ثبت، یک فاکتور تمیز و قابل‌چاپ به مشتری نشان داده می‌شود.
- **گزارش روزانه (ساعت ۲۱)** — فاکتورهای امروز جمع‌بندی و به تلگرام مالک ارسال می‌شود.

### چرا مغازه‌دار پول می‌دهد؟
خطای محاسبه‌ی دستی در طلا مستقیماً یعنی ضرر مالی. این ابزار آن خطا را حذف می‌کند و هر بار فاکتور یک‌دست صادر می‌کند.

### ورودی — فرم، نه تلگرام
این دستیار با **Form Trigger** کار می‌کند و یک **لینک عمومی** می‌دهد. همان لینک، دموی زنده‌ای است که خریدار می‌تواند بازش کند، تست کند و بعد بخرد — بدون نیاز به گیت‌هاب.

### راه‌اندازی (خلاصه)
۱. n8n را روی سیستم/سرور خودت اجرا کن.
۲. یک Data Table به نام `invoices` بساز (ستون‌ها پایین).
۳. (فقط برای گزارش) کردنشیال `Telegram Bot` بساز و در نود **Send Daily Report** آی‌دی عددی تلگرام خودت را بگذار.
۴. فایل [`workflow.json`](workflow.json) را Import کن، Production URL فرم را باز کن و **Activate** بزن.

راهنمای کامل: [`docs/setup.md`](docs/setup.md) · راهنمای فروش: [`docs/sales.md`](docs/sales.md)

### ستون‌های Data Table `invoices`
`invoiceNo`, `day`, `dateFa`, `customer`, `item`, `weight`, `karat`, `rate18`, `goldValue`, `makingFee`, `profit`, `total`
> `id`, `createdAt`, `updatedAt` به‌صورت خودکار توسط n8n اضافه می‌شوند — نسازیدشان.

---

## 📂 Files | فایل‌ها

| File | توضیح |
|---|---|
| `workflow.json` | ورک‌فلو آماده‌ی Import در n8n / ready-to-import workflow |
| `workflow.sdk.ts` | همان ورک‌فلو به‌صورت کد / workflow as code (n8n SDK) |
| `docs/setup.md` | راهنمای راه‌اندازی / setup guide |
| `docs/sales.md` | راهنمای فروش / sales guide |

---

<div align="center">

Part of **36 money-making n8n + Claude automation projects for Iran** · بخشی از **۳۶ پروژه‌ی اتوماسیون پول‌ساز با n8n و کلود، مخصوص شرایط ایران**

`#n8n_iran` `#طلافروش` `#فاکتور` `#invoice_automation` `#fintech` `#claude`

</div>
