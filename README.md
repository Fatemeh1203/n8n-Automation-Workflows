![n8n](https://img.shields.io/badge/n8n-EA4B71?logo=n8n&logoColor=white)
![telegram-bot](https://img.shields.io/badge/telegram--bot-26A5E4?logo=telegram&logoColor=white)
![ocr](https://img.shields.io/badge/ocr-4CAF50)
![invoice](https://img.shields.io/badge/invoice-795548)
![automation](https://img.shields.io/badge/automation-607D8B)
![persian](https://img.shields.io/badge/persian-239F40)
![ollama](https://img.shields.io/badge/ollama-000000?logo=ollama&logoColor=white)
![accounting](https://img.shields.io/badge/accounting-9C27B0)

**Tags / برچسب‌ها:** `n8n` · `telegram-bot` · `ocr` · `invoice` · `automation` · `persian` · `ollama` · `accounting`

---

<div dir="rtl">

# اتوماسیون اسکن فاکتور خرید و فروش با هوش مصنوعی

> 🇮🇷 فارسی | [🇬🇧 English below](#-ai-powered-invoice-scanning-automation)

ورک‌فلوی n8n برای دریافت عکس فاکتور از تلگرام، استخراج داده با هوش مصنوعی (OCR + ساختاردهی JSON)، و ثبت خودکار در گوگل شیت با خروجی حسابداری و محاسبه‌ی مالیات ارزش‌افزوده.

## جریان کار

```
تلگرام (عکس + کپشن خرید/فروش)
   → بررسی عکس بودن
   → آماده‌سازی درخواست AI (تبدیل عکس به base64)
   → استخراج داده با هوش مصنوعی (Groq / qwen3.6-27b، سازگار با OpenAI)
   → پارس و نگاشت به ستون‌های حسابداری (نرمال‌سازی ارقام فارسی)
   → تفکیک خرید/فروش
   → ثبت در گوگل شیت (تب خرید یا فروش)
   → ارسال پیام تأیید در تلگرام
```

## فایل‌ها

| فایل | توضیح |
|---|---|
| `workflow/invoice-automation-workflow.json` | ورک‌فلوی آماده‌ی ایمپورت در n8n (قالب بدون کردنشیال و شناسه‌ی فایل — برای هر مشتری جداگانه تنظیم می‌شود) |
| `docs/SETUP-GUIDE.md` | راهنمای کامل و گام‌به‌گام راه‌اندازی برای هر مشتری (مارک‌داون) |
| `docs/SETUP-GUIDE.docx` | همان راهنما در قالب Word |

## راه‌اندازی سریع

1. فایل `workflow/invoice-automation-workflow.json` را در n8n ایمپورت کن (منوی … → Import from File).
2. طبق `docs/SETUP-GUIDE.md` کردنشیال‌های تلگرام، گوگل شیت و کلید Groq را وصل کن.
3. ورک‌فلو را Activate کن و با ارسال یک عکس فاکتور (کپشن «خرید» یا «فروش») تست کن.

## سرویس هوش مصنوعی

از یک سرویس خارجی رایگان سازگار با OpenAI (**Groq**) استفاده می‌شود. چون درخواست از سرور n8n ارسال می‌شود، محدودیت منطقه‌ای ایران اعمال نمی‌شود. مدل پیش‌فرض `qwen/qwen3.6-27b` (بینایی/OCR) است و در نود «آماده‌سازی درخواست هوش مصنوعی» قابل تغییر است.

## مرحله‌ی بعدی (سامانه‌ی مؤدیان)

ارسال مستقیم فاکتورهای فروش به سامانه‌ی مؤدیان سازمان امور مالیاتی، به‌عنوان ماژول توسعه‌ی آینده در `docs/SETUP-GUIDE.md` توضیح داده شده است.

</div>

---

# 🇬🇧 AI-Powered Invoice Scanning Automation

> [🇮🇷 فارسی بالا](#اتوماسیون-اسکن-فاکتور-خرید-و-فروش-با-هوش-مصنوعی) | 🇬🇧 English

An n8n workflow that receives an invoice photo from Telegram, extracts the data with AI (OCR + JSON structuring), and automatically records it into Google Sheets with accounting-ready columns and VAT calculation.

## Flow

```
Telegram (photo + "buy"/"sell" caption)
   → Check that a photo was sent
   → Prepare AI request (convert image to base64)
   → Extract data with AI (Groq / qwen3.6-27b, OpenAI-compatible)
   → Parse & map to accounting columns (normalizes Persian digits)
   → Split purchase / sale
   → Append to Google Sheets (purchase or sale tab)
   → Send a confirmation message in Telegram
```

## Files

| File | Description |
|---|---|
| `workflow/invoice-automation-workflow.json` | Import-ready n8n workflow (a clean template with no credentials or file ID — configured per customer) |
| `docs/SETUP-GUIDE.md` | Complete step-by-step setup guide for each customer (Markdown, in Persian) |
| `docs/SETUP-GUIDE.docx` | The same guide as a Word document |

## Quick start

1. Import `workflow/invoice-automation-workflow.json` into n8n (… menu → Import from File).
2. Following `docs/SETUP-GUIDE.md`, connect the Telegram, Google Sheets, and Groq credentials.
3. Activate the workflow and test by sending an invoice photo (caption "خرید" for purchase or "فروش" for sale).

## AI service

A free, foreign, OpenAI-compatible service (**Groq**) is used. Because the request is sent from n8n's servers, Iran's regional restrictions do not apply. The default model is `qwen/qwen3.6-27b` (vision/OCR) and can be changed in the "Prepare AI request" node.

## Next stage (Moadian tax system)

Direct submission of sales invoices to Iran's tax authority (Moadian) is described as a future module in `docs/SETUP-GUIDE.md`.

## Notes

- The setup guide is written in Persian since it targets Iranian accountants and businesses; this README is bilingual.
- Provide each customer with their own copy of the workflow, Telegram bot, Google Sheet, and Groq key.
