<div dir="rtl">

# 🛠️ راهنمای راه‌اندازی — سیستم مدیریت طلافروشی (سطح ۳)

## گام ۱ — پایگاه داده (Data Table)

<div dir="ltr">

| Table | Columns |
|---|---|
| `gs_inventory` | `code, title, category, weight#, karat#, weight750#, buyRate18#, makingCost#, buyCost#, buyDay, supplier, status, soldTx, note` |
| `gs_transactions` | `code, type, day, dateFa, itemCode, title, weight750#, rate18#, amount#, costBasis#, operatingProfit#, holdingGain#, realProfit#, customerCode, customerName, note, payMethod, vat#, invoice, grams#, category, voided` |
| `gs_customers` | `code, name, phone, email, telegramChatId, birthday, anniversary, notes, kind` |
| `gs_orders` | `code, dateFa, customerCode, customerName, phone, kind, description, weight#, karat#, estimate#, deposit#, dueDate, status, note` |
| `gs_settings` | `key, value` |
| `invoices` | فاکتورهای سایت (سطح ۲) — فقط خوانده می‌شود |

</div>

ستون‌های دارای `#` از نوع **number** و بقیه **string** هستند. ستون‌های `id/createdAt/updatedAt` خودکارند.

## گام ۲ — گوگل‌شیت
یک Spreadsheet با این تب‌ها (ردیف اول = عنوان ستون‌ها، دقیقاً مثل خروجی اکسل):
`موجودی` · `تراکنش‌ها` · `مشتریان و همکاران` · `سفارش‌ها` · `فاکتورهای سایت`
در نودهای «Sheet: …» شناسه‌ی همین فایل را بگذار. ستون مشترک برای به‌روزرسانی: `کد`.

## گام ۳ — Import و کردنشیال‌ها
- فایل ورک‌فلو را Import کن.
- **Google Sheets** ← نودهای «Sheet: …»
- **Gmail** ← نودهای ایمیل فاکتور و تبریک
- **Telegram** ← یادآوری مناسبت‌ها و گزارش روزانه
- منبع قیمت رایگان است و کردنشیال نمی‌خواهد.
- Settings ← Timezone = `Asia/Tehran`

## گام ۴ — فعال‌سازی و رمز
1. Save → Publish.
2. لینک پنل `https://<آدرس-n8n>/webhook/gold-admin` را باز کن و با **رمز اولیه** (در نود Check Key) وارد شو.
3. تب **⚙️ تنظیمات** ← «تغییر رمز ورود»: رمز دلخواه خودت را بگذار. از این لحظه رمز اولیه کار نمی‌کند.
4. در همان تب: نام فروشگاه، تلفن، آدرس، ایمیل مالک، Chat ID تلگرام، درصدهای پیش‌فرض اجرت/سود/مالیات/افت.

### رمز را فراموش کردم
در n8n ← Data Tables ← `gs_settings` ← ردیف‌های `admin_hash` و `admin_salt` را پاک کن. رمز اولیه دوباره فعال می‌شود؛ وارد شو و رمز تازه بگذار.

## گام ۵ — لینک در سایت
در سایت فروشگاه (سطح ۱+۲) دکمه‌ی **«🔐 پنل مدیریت فروشگاه»** به همین لینک وصل است.

## منطق سود واقعی

<div dir="ltr">

```
w750            = weight × karat / 750                      (18K-equivalent grams)
buyCost         = w750 × buyRate18 + makingCost
goldNow         = w750 × rate18(sale day)
operatingProfit = salePrice − goldNow − makingCost
holdingGain     = goldNow − w750 × buyRate18
realProfit      = salePrice − buyCost = operatingProfit + holdingGain
VAT             = vatPct × max(0, salePrice − goldNow)      (not profit)
netProfit       = Σ realProfit − Σ expenses
```

</div>

## منطق حساب طرف‌ها (مثبت = او به ما بدهکار است)

<div dir="ltr">

| type | money | grams |
|---|---|---|
| sell | + (amount + vat) | |
| return | − (amount + vat) | |
| buyback | − amount | |
| buy (cash/credit) | − amount | |
| buy (gold settlement) | − making | − w750 |
| receive / deposit | − amount | − grams |
| pay | + amount | + grams |

</div>

## عیب‌یابی

<div dir="ltr">

| مشکل | راه‌حل |
|---|---|
| «رمز اشتباه است» | رمز را در تنظیمات عوض کرده‌ای؟ اگر فراموش شده، بخش «رمز را فراموش کردم» |
| نرخ روز صفر است | دسترسی سرور به `raw.githubusercontent.com`؛ موقتاً نرخ را «دستی» وارد کن |
| ردیف در گوگل‌شیت نیامد | کردنشیال Google Sheets و نام تب‌ها |
| ایمیل فاکتور/تبریک نرفت | کردنشیال Gmail یا ایمیل مشتری |
| گزارش شبانه نیامد | کردنشیال تلگرام، Chat ID مالک در تنظیمات، و Start زدن ربات توسط مالک |

</div>

</div>
