<div dir="rtl">

# 🛠️ راهنمای راه‌اندازی

## گام ۱ — Data Table
جدول **`invoices`** با ستون‌ها:
`invoiceNo, day, dateFa, customer, phone, email, item, weight, karat, rate18, goldValue, makingFee, profit, total`
(همه string به‌جز weight, karat, rate18, goldValue, makingFee, profit, total که number هستند). ستون‌های `id/createdAt/updatedAt` خودکارند.

## گام ۲ — Import
فایل `workflow.json` را Import کن.

## گام ۳ — کردنشیال‌ها
- **Get Live Gold Rate** (نرخ آنلاین): کردنشیال Query Auth با نام پارامتر `x-api-key` و توکن nerkh. اختیاری — اگر وصل نشود، حالت «دستی» کار می‌کند.
- **Append to Sheet**: کردنشیال Google Sheets را وصل کن. سند از قبل ساخته شده:
  `https://docs.google.com/spreadsheets/d/19fTJM9-sIyVrv1MivnnpWRv_yNEIXd75dKmJEgvhtwg/edit`
  (اگر با اکانت گوگل دیگری وصل می‌شوی، سند خودت را در نود انتخاب کن؛ ردیف سرستون همان لیست ستون‌ها باشد.)
- **Email Invoice**: کردنشیال Gmail را وصل کن.
- **Send Daily Report**: کردنشیال Telegram + مقدار `chatId` عددی خودت.

## گام ۴ — تنظیم فروشگاه/لوگو
نود **Compute & Render Invoice** → شیء `SHOP` بالای کد: `name, phone, address, logoUrl, ownerEmail, color`.
`ownerEmail` را حتماً درست بگذار (نسخه‌ی BCC فاکتور و آرشیو به این ایمیل می‌رود).

## گام ۵ — فعال‌سازی و لینک فرم
Save و Activate. لینک عمومی فرم:
`https://<آدرس-n8n-شما>/form/gold-invoice`
همین لینک را برای تست به مشتری/خریدار بده.

## فرمول
<div dir="ltr">

```
goldValue = weight × rate18 × (karat / 750)
makingFee = goldValue × feePct%
profit    = (goldValue + makingFee) × profitPct%
total     = goldValue + makingFee + profit
```

</div>

## عیب‌یابی
<div dir="ltr">

| مشکل | راه‌حل |
|---|---|
| فاکتور نمایش داده نمی‌شود | Activate نشده یا Test URL به‌جای Production URL |
| نرخ آنلاین صفر شد | کردنشیال nerkh وصل نیست یا حالت «دستی» را انتخاب کن و rate18 را پر کن |
| ردیف در شیت اضافه نشد | کردنشیال Google Sheets وصل نیست یا سند/شیت درست انتخاب نشده |
| ایمیل نرفت | کردنشیال Gmail وصل نیست یا ایمیل مشتری خالی است (به ownerEmail می‌رود) |
| گزارش روزانه نیامد | `chatId` تنظیم نشده |

</div>

</div>
