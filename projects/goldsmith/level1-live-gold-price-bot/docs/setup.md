<div dir="rtl">

# 🛠️ راهنمای راه‌اندازی گام‌به‌گام

این راهنما فرض می‌کند n8n را روی سیستم/سرور خودتان نصب کرده‌اید.

---

## گام ۰ — نصب n8n (اگر نصب نیست)

ساده‌ترین راه با Docker:

<div dir="ltr">

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

</div>

سپس در مرورگر به `http://localhost:5678` بروید و حساب کاربری بسازید.

> برای پایداری از داخل ایران، n8n را **محلی/سرور ایرانی** اجرا کنید (نه n8n Cloud). فقط دو تماس بیرونی داریم: API تلگرام و API قیمت.

---

## گام ۱ — ساخت ربات تلگرام

1. در تلگرام به [@BotFather](https://t.me/BotFather) پیام دهید.
2. دستور `/newbot` را بزنید، نام و یوزرنیم ربات را انتخاب کنید.
3. **توکن** ربات را کپی کنید (چیزی شبیه `123456:ABC-DEF...`).

---

## گام ۲ — ساخت کردنشیال تلگرام در n8n

1. در n8n به **Credentials → New** بروید.
2. نوع **Telegram API** را انتخاب کنید.
3. توکن را در فیلد `Access Token` بگذارید.
4. نام کردنشیال را دقیقاً **`Telegram Bot`** بگذارید (تا با ورک‌فلو بخواند).
5. Save.

---

## گام ۳ — گرفتن توکن API قیمت (nerkh.io)

1. در [nerkh.io](https://nerkh.io) ثبت‌نام کنید و یک **توکن API** بگیرید (رایگان).
2. در n8n یک کردنشیال جدید از نوع **Query Auth** بسازید:
   - **Name** (نام پارامتر): `x-api-key`
   - **Value**: توکن شما
3. نام کردنشیال را **`Nerkh API Key`** بگذارید.
4. Save.

> اندپوینت‌های پیش‌فرض ورک‌فلو (قیمت‌ها به **تومان**):
> - طلا و سکه: `https://api.nerkh.io/v1/prices/json/gold`
> - ارز: `https://api.nerkh.io/v1/prices/json/currency`
>
> نکته: nerkh هدر `Authorization: Bearer <token>` را هم می‌پذیرد؛ اگر ترجیح می‌دهید، به‌جای Query Auth از کردنشیال **Bearer Auth** استفاده کنید.

---

## گام ۴ — ساخت Data Table برای هشدارها

1. در n8n به بخش **Data Tables** بروید و یک جدول جدید به نام **`price_alerts`** بسازید.
2. این ستون‌ها را اضافه کنید (نام و نوع دقیق):

<div dir="ltr">

| Column | Type |
|---|---|
| `chatId` | String |
| `asset` | String |
| `assetLabel` | String |
| `target` | Number |
| `direction` | String |

</div>

> ستون‌های `id`, `createdAt` و `updatedAt` به‌صورت خودکار و سیستمی توسط n8n ساخته می‌شوند؛ نباید دستی اضافه‌شان کنید (نام `createdAt` رزرو شده است). ورک‌فلو برای حذف هشدارِ اجراشده از همین `id` سیستمی استفاده می‌کند.

---

## گام ۵ — Import کردن ورک‌فلو

1. فایل `workflow.json` این پوشه را باز کنید و محتوایش را کپی کنید (یا مستقیم فایل را انتخاب کنید).
2. در n8n: **Workflows → Import from File / Import from URL** و فایل را وارد کنید.
3. روی هر نودی که علامت هشدار کردنشیال دارد کلیک کنید و کردنشیال درست را انتخاب کنید:
   - نودهای `Telegram Trigger`, `Send Prices to User`, `Confirm Alert`, `Send Help`, `Send Price Alert` → کردنشیال **Telegram Bot**
   - نودهای `Get Gold Prices`, `Get Currency Prices`, `Get Gold Prices (Alerts)`, `Get Currency Prices (Alerts)` → کردنشیال **Nerkh API Key**
4. در نودهای `Save Alert`, `Get Active Alerts`, `Remove Fired Alert` مطمئن شوید Data Table روی **`price_alerts`** تنظیم است.

---

## گام ۶ — فعال‌سازی و تست

1. ورک‌فلو را **Save** و سپس **Activate** کنید (کلید بالا-راست).
2. در تلگرام به ربات پیام `قیمت` بدهید → باید لیست قیمت‌ها بیاید.
3. برای تست هشدار: `هشدار دلار 1` بفرستید. چون قیمت دلار قطعاً بیشتر از ۱ است، حداکثر تا ۱۰ دقیقه‌ی بعد باید پیام هشدار بگیرید.

---

## عیب‌یابی سریع

<div dir="ltr">

| مشکل | علت محتمل / راه‌حل |
|---|---|
| ربات جواب نمی‌دهد | ورک‌فلو Activate نشده، یا توکن تلگرام اشتباه است |
| قیمت‌ها «—» نشان داده می‌شوند | نماد دارایی با API نمی‌خواند؛ خروجی نود `Get Gold Prices` را ببینید و نمادها (`GOLD18K`, `SEKE_EMAMI`, …) را در نودهای کد تنظیم کنید |
| هشدار ثبت می‌شود ولی خبر نمی‌آید | نام/ستون‌های Data Table اشتباه است، یا Trigger زمان‌بندی غیرفعال است |
| خطای احراز هویت API | نام پارامتر کردنشیال باید `x-api-key` باشد و مقدارش توکن معتبر nerkh |

</div>

</div>
