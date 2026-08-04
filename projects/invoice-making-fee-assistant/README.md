# 🧾 Gold Invoice & Making-Fee Assistant | دستیار محاسبه‌ی فاکتور و اجرت

> An n8n **web-form** assistant for goldsmiths: enter weight, karat, making-fee % and profit % (gold rate fetched **online** or entered manually) → it computes and issues a **professional invoice**, archives it to a Data Table **and a Google Sheet**, **emails the invoice** (with an HTML file attached) to the customer, and sends a daily sales report.
>
> دستیار **فرم‌وب** برای طلافروش: وزن، عیار، درصد اجرت و سود را وارد کن (نرخ طلا **آنلاین** یا دستی) → **فاکتور حرفه‌ای** محاسبه و صادر می‌شود، در Data Table **و یک Google Sheet** آرشیو می‌شود، **فاکتور ایمیل می‌شود** (فایل HTML پیوست) و گزارش فروش روزانه ارسال می‌شود.

`#n8n` `#invoice` `#gold` `#goldsmith` `#فاکتور_طلا` `#اجرت` `#محاسبه_طلا` `#طلافروش` `#automation` `#اتوماسیون` `#webform` `#فرم_آنلاین` `#google_sheets` `#gmail` `#iran` `#workflow`

---

## 🇬🇧 English

### What it does
- **Web form** (public URL, no Telegram) — customer/shop enters the details.
- **Online gold rate** — a form dropdown chooses **online** (fetched live from nerkh.io) or **manual** rate.
- **Compute** — `goldValue = weight × rate × (karat/750)`, then making-fee, profit, total.
- **Professional invoice** — a styled, printable invoice with a **logo/shop-name header** (editable in the code node).
- **Archive** — every invoice → n8n **Data Table** + **Google Sheet** (list).
- **Email** — the invoice is emailed to the customer (and BCC to the owner) with the HTML file **attached** — that's also where the file is stored.
- **Daily report (21:00)** — sums today's invoices → owner's Telegram.

### Make it accessible for buyers to test (#1)
The **Invoice Form** node has a fixed path `gold-invoice`. After Activate, its **Production URL** is:
`https://<your-n8n-host>/form/gold-invoice`
Share that link — anyone can open it, fill it, and get a real invoice. That link is your live demo.

### Credentials
| Feature | Credential | Note |
|---|---|---|
| Online rate | Nerkh API Key (Query Auth, `x-api-key`) | optional; manual works without it |
| Google Sheet | Google Sheets OAuth | |
| Email | Gmail OAuth | |
| Daily report | Telegram | set your numeric `chatId` |

> External steps (Sheet, Email) run with **continue-on-error**, so the invoice is always computed and shown even before those credentials are connected.

### Edit shop / logo (#6)
Open the **Compute & Render Invoice** code node → edit the `SHOP` object at the top (`name`, `phone`, `address`, `logoUrl`, `ownerEmail`, `color`).

### Data Table `invoices` / Google Sheet columns
`invoiceNo, day, dateFa, customer, phone, email, item, weight, karat, rate18, goldValue, makingFee, profit, total`

Full guide: [`docs/setup.md`](docs/setup.md) · Sales guide: [`docs/sales.md`](docs/sales.md)

---

## 🇮🇷 فارسی

### چه‌کار می‌کند؟
- **فرم وب** (لینک عمومی، بدون تلگرام).
- **نرخ طلای آنلاین** — یک گزینه در فرم: **آنلاین** (زنده از nerkh.io) یا **دستی**.
- **محاسبه** — `ارزش طلا = وزن × نرخ × (عیار÷۷۵۰)` + اجرت + سود = مبلغ نهایی.
- **فاکتور حرفه‌ای** — فاکتور زیبا و قابل‌چاپ با **هدر لوگو/نام فروشگاه** (در نود کد قابل‌ویرایش).
- **آرشیو** — هر فاکتور → **Data Table** + **Google Sheet**.
- **ایمیل** — فاکتور با فایل HTML **پیوست** به مشتری (و BCC به مالک) ایمیل می‌شود؛ فایل هم همان‌جا ذخیره می‌ماند.
- **گزارش روزانه (۲۱)** → تلگرام مالک.

### در دسترس‌گذاشتن فرم برای تست خریدار (مورد ۱)
نود **Invoice Form** مسیر ثابت `gold-invoice` دارد. بعد از Activate، **Production URL** فرم این است:
`https://<آدرس-n8n-شما>/form/gold-invoice`
این لینک را بده؛ هر کسی می‌تواند بازش کند، پرش کند و فاکتور واقعی بگیرد. همین لینک، دموی زنده‌ات است.

### کردنشیال‌ها
| قابلیت | کردنشیال | توضیح |
|---|---|---|
| نرخ آنلاین | Nerkh API Key (Query Auth، `x-api-key`) | اختیاری؛ حالت دستی بدون آن کار می‌کند |
| گوگل‌شیت | Google Sheets OAuth | |
| ایمیل | Gmail OAuth | |
| گزارش روزانه | Telegram | `chatId` عددی خودت را بگذار |

> مراحل بیرونی (شیت و ایمیل) با **ادامه‌درصورت‌خطا** تنظیم شده‌اند؛ پس فاکتور همیشه محاسبه و نمایش داده می‌شود حتی قبل از وصل‌کردن این کردنشیال‌ها.

### ویرایش فروشگاه / لوگو (مورد ۶)
نود **Compute & Render Invoice** را باز کن → شیء `SHOP` بالای کد را ویرایش کن (`name`, `phone`, `address`, `logoUrl`, `ownerEmail`, `color`).

راهنمای کامل: [`docs/setup.md`](docs/setup.md) · راهنمای فروش: [`docs/sales.md`](docs/sales.md)

---

## 📂 Files | فایل‌ها

| File | توضیح |
|---|---|
| `workflow.json` | ورک‌فلو آماده‌ی Import / ready-to-import |
| `workflow.sdk.ts` | ورک‌فلو به‌صورت کد / workflow as code |
| `docs/setup.md` | راهنمای راه‌اندازی / setup guide |
| `docs/sales.md` | راهنمای فروش / sales guide |

---

<div align="center">

Part of **36 money-making n8n + Claude automation projects for Iran** · بخشی از **۳۶ پروژه‌ی اتوماسیون پول‌ساز با n8n و کلود**

`#n8n_iran` `#طلافروش` `#فاکتور` `#invoice_automation` `#fintech` `#claude`

</div>
