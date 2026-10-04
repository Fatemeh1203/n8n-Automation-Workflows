<div dir="rtl">

# 🛠️ راهنمای راه‌اندازی — سیستم مدیریت طلافروشی (سطح ۳)

## گام ۱ — پایگاه داده (سه Data Table)

<div dir="ltr">

| Table | Columns |
|---|---|
| `gs_inventory` | `code, title, category, weight#, karat#, weight750#, buyRate18#, makingCost#, buyCost#, buyDay, supplier, status, soldTx, note` |
| `gs_transactions` | `code, type, day, dateFa, itemCode, title, weight750#, rate18#, amount#, costBasis#, operatingProfit#, holdingGain#, realProfit#, customerCode, customerName, note` |
| `gs_customers` | `code, name, phone, email, telegramChatId, birthday, anniversary, notes` |

</div>

ستون‌های دارای `#` از نوع **number** و بقیه **string** هستند. ستون‌های `id/createdAt/updatedAt` خودکارند.

## گام ۲ — Import و کردنشیال‌ها
- فایل ورک‌فلو را Import کن.
- **Gmail** ← نود «Send Greeting Email»
- **Telegram** ← نودهای «Notify Owner Occasions» و «Send Daily Report» (و `chatId` مالک)
- منبع قیمت رایگان است و کردنشیال نمی‌خواهد.

## گام ۳ — رمز پنل
نود **Check Key** ← مقدار `ADMIN_KEY` را به رمز دلخواه تغییر بده.

## گام ۴ — نام فروشگاه
نود **Find Occasions** ← مقدار `SHOP_NAME` (در ایمیل تبریک نمایش داده می‌شود).

## گام ۵ — فعال‌سازی
Save → Publish/Active. لینک پنل: `https://<آدرس-n8n>/webhook/gold-admin`

## منطق سود واقعی

<div dir="ltr">

```
w750            = weight × karat / 750                      (18K-equivalent grams)
buyCost         = w750 × buyRate18 + makingCost
goldNow         = w750 × rate18(sale day)
operatingProfit = salePrice − goldNow − makingCost
holdingGain     = goldNow − w750 × buyRate18
realProfit      = salePrice − buyCost = operatingProfit + holdingGain
```

</div>

## عیب‌یابی

<div dir="ltr">

| مشکل | راه‌حل |
|---|---|
| «رمز اشتباه است» | مقدار `ADMIN_KEY` در نود Check Key |
| نرخ روز صفر است | دسترسی سرور به `raw.githubusercontent.com`؛ موقتاً نرخ را «دستی» وارد کن |
| ایمیل تبریک نرفت | کردنشیال Gmail یا ایمیل مشتری |
| گزارش شبانه نیامد | کردنشیال تلگرام، `chatId`، و Start زدن ربات توسط مالک |

</div>

</div>
