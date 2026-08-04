<div dir="rtl">

# 🛠️ راهنمای راه‌اندازی گام‌به‌گام

## گام ۱ — ساخت Data Table
1. در n8n به بخش **Data Tables** برو و جدولی به نام **`invoices`** بساز.
2. این ستون‌ها را اضافه کن:

<div dir="ltr">

| Column | Type |
|---|---|
| `invoiceNo` | String |
| `day` | String |
| `dateFa` | String |
| `customer` | String |
| `item` | String |
| `weight` | Number |
| `karat` | Number |
| `rate18` | Number |
| `goldValue` | Number |
| `makingFee` | Number |
| `profit` | Number |
| `total` | Number |

</div>

> ستون‌های `id`, `createdAt`, `updatedAt` سیستمی‌اند و خودکار ساخته می‌شوند — نسازشان.

## گام ۲ — Import ورک‌فلو
1. فایل `workflow.json` این پوشه را در n8n **Import** کن.
2. مطمئن شو نودهای `Archive Invoice`, `Get Today Invoices` روی Data Table **`invoices`** تنظیم‌اند.

## گام ۳ — فرم صدور فاکتور (بدون تلگرام)
1. روی نود **Invoice Form** کلیک کن → آدرس **Production URL** را کپی کن.
2. همین لینک را برای مغازه (یا خریدارِ نمونه‌کار) بفرست؛ با بازکردنش فرم را می‌بیند، مقادیر را وارد می‌کند و فاکتور را همان‌جا می‌گیرد.
3. فاکتور بعد از ثبت به‌صورت یک صفحه‌ی قابل‌چاپ نمایش داده می‌شود.

## گام ۴ — گزارش روزانه (اختیاری، با تلگرام)
1. اگر گزارش روزانه می‌خواهی: کردنشیال **Telegram API** به‌نام `Telegram Bot` بساز (یا همان کردنشیال موجود را استفاده کن).
2. آی‌دی عددی چت خودت را از [@userinfobot](https://t.me/userinfobot) بگیر.
3. نود **Send Daily Report** را باز کن و مقدار `chatId` (که فعلاً `000000000` است) را با آی‌دی خودت جایگزین کن.
4. زمان پیش‌فرض گزارش ساعت **۲۱** است؛ در نود **Daily 21:00** قابل تغییر است.

> اگر گزارش تلگرامی نمی‌خواهی، همین نود را غیرفعال کن؛ فاکتورها همچنان در Data Table `invoices` آرشیو می‌شوند.

## گام ۵ — فعال‌سازی و تست
1. ورک‌فلو را **Save** و **Activate** کن.
2. Production URL فرم را باز کن، یک فاکتور نمونه بزن و خروجی را ببین.
3. رکورد را در Data Table `invoices` چک کن.

## فرمول محاسبه
<div dir="ltr">

```
goldValue = weight × rate18 × (karat / 750)
makingFee = goldValue × feePct%
subtotal  = goldValue + makingFee
profit    = subtotal × profitPct%
total     = subtotal + profit
```

</div>

## عیب‌یابی سریع

<div dir="ltr">

| مشکل | راه‌حل |
|---|---|
| فاکتور نمایش داده نمی‌شود | ورک‌فلو Activate نشده یا Production URL استفاده نشده (نه Test URL) |
| رکورد ذخیره نمی‌شود | نام/ستون‌های Data Table با `invoices` نمی‌خواند |
| گزارش روزانه نمی‌آید | `chatId` تنظیم نشده یا کردنشیال تلگرام وصل نیست |
| مبلغ اشتباه | نرخ `rate18` باید نرخ هر گرم طلای ۱۸ عیار به تومان باشد |

</div>

</div>
