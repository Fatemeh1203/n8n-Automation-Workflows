<div dir="rtl">

# 🛠️ راهنمای راه‌اندازی — سیستم مدیریت طلافروشی (سطح ۳)

## گام ۱ — پایگاه داده (Data Table)

<div dir="ltr">

| Table | Columns |
|---|---|
| `gs_inventory` | `code, title, category, weight#, karat#, weight750#, buyRate18#, makingCost#, buyCost#, buyDay, supplier, status, soldTx, note, stoneCost#, cert, consign, supplierCode, metal, branch, photoUrl, stones` |
| `gs_transactions` | `code, type, day, dateFa, itemCode, title, weight750#, rate18#, amount#, costBasis#, operatingProfit#, holdingGain#, realProfit#, customerCode, customerName, note, payMethod, vat#, invoice, grams#, category, voided, qty#, feeAmt#, profitAmt#, branch, user` |
| `gs_customers` | `code, name, phone, email, telegramChatId, birthday, anniversary, notes, kind, nationalId, economicCode, postalCode, address` |
| `gs_orders` | `code, dateFa, customerCode, customerName, phone, kind, description, weight#, karat#, estimate#, deposit#, dueDate, status, note` |
| `gs_settings` | `key, value` |
| `gs_installments` | `code, invoice, customerCode, customerName, phone, n#, count#, dueDate, amount#, paid#, status, paidDate` |
| `gs_users` 🆕 | `code, name, role, salt, hash, active, branch` |
| `gs_audit` 🆕 | `code, at, dateFa, time, user, action, summary` |
| `gs_cheques` 🆕 | `code, dir, partyCode, partyName, bank, number, sayad, amount#, dueDate, status, txCode, dateFa, settledDate, spentTo, note, branch` |
| `gs_closings` 🆕 | `code, dateFa, time, user, branch, expected#, counted#, diff#, goldSystem#, goldCounted#, goldDiff#, detail, note` |
| `invoices` | فاکتورهای سایت (سطح ۲) — فقط خوانده می‌شود |

</div>

ستون‌های دارای `#` از نوع **number** و بقیه **string** هستند. ستون‌های `id/createdAt/updatedAt` خودکارند.

## گام ۲ — گوگل‌شیت
یک Spreadsheet با این تب‌ها (ردیف اول = عنوان ستون‌ها، دقیقاً مثل خروجی اکسل):
`موجودی` · `تراکنش‌ها` · `مشتریان و همکاران` · `سفارش‌ها` · `اقساط` · `چک‌ها` · `بستن صندوق` · `فاکتورهای سایت`
در نودهای «Sheet: …» شناسه‌ی همین فایل را بگذار. ستون مشترک برای به‌روزرسانی: `کد`.

## گام ۳ — Import و کردنشیال‌ها
- فایل ورک‌فلو را Import کن.
- **Google Sheets** ← نودهای «Sheet: …»
- **Gmail** ← نودهای ایمیل فاکتور و تبریک
- **Telegram** ← یادآوری مناسبت‌ها، گزارش روزانه و پشتیبان شبانه
- نودهای پیامک (کاوه‌نگار) کردنشیال نمی‌خواهند؛ کلید را در خود پنل وارد می‌کنی.
- منبع قیمت رایگان است و کردنشیال نمی‌خواهد.
- Settings ← Timezone = `Asia/Tehran`

## گام ۴ — فعال‌سازی، ورود و کاربران
1. Save → Publish.
2. لینک پنل `https://<آدرس-n8n>/webhook/gold-admin` را باز کن. نام کاربری: `admin`، رمز: **رمز اولیه** (در نود Check Key) — یا اگر قبلاً رمز گذاشته‌ای، همان رمز خودت. با اولین ورود، کاربر «مدیر» ساخته می‌شود.
3. تب **⚙️ تنظیمات** ← «تغییر رمز ورود»: رمز دلخواه خودت را بگذار.
4. در همان تب: نام فروشگاه، تلفن، آدرس، ایمیل مالک، Chat ID تلگرام، درصدهای پیش‌فرض، اطلاعات مالیاتی، شعبه‌ها.
5. تب **🛡️ کاربران و پشتیبان** ← کاربر تازه: نام کاربری انگلیسی، نقش و رمز.

| نقش | چه می‌بیند |
|---|---|
| مدیر | همه چیز + کاربران، تنظیمات، بازیابی پشتیبان |
| حسابدار | همه‌ی ثبت‌ها و گزارش‌ها؛ بدون کاربران و تنظیمات |
| فروشنده | فروش، خرید، مشتری، اتیکت؛ بهای تمام‌شده و سود را **نمی‌بیند** |

- ورود ۱۲ ساعت معتبر است. ۵ بار رمز اشتباه ← آن کاربر ۱۵ دقیقه قفل می‌شود.
- همه‌ی کارها در «گزارش فعالیت کاربران» ثبت می‌شود.

### رمز را فراموش کردم
- اگر کاربر «مدیر» دیگری داری: او در تب «کاربران» رمز تو را عوض می‌کند.
- اگر نه، در n8n ← Data Tables:
  1. **همه‌ی** ردیف‌های `gs_users` را پاک کن.
  2. در `gs_settings` ردیف‌های `admin_hash` و `admin_salt` را پاک کن.
  3. با `admin` و رمز اولیه (نود Check Key) وارد شو، فوراً رمز تازه بگذار و کاربرهای دیگر را دوباره بساز.

## گام ۴٫۵ — امکانات تازه
### 💾 پشتیبان
- هر شب ساعت **۲۳:۴۵** یک فایل JSON کامل به تلگرام مالک (و اگر «ایمیل مالک» پر باشد، به ایمیل) می‌رود.
- در تب «کاربران و پشتیبان»: «دانلود پشتیبان» و «بازیابی از فایل».
- رمزها، کلیدها و کلید پیامک هرگز در پشتیبان نیستند.

### ✉️ پیامک (فعلاً خاموش)
جای آن آماده است. هر وقت خواستی:
1. در [کاوه‌نگار](https://kavenegar.com) ثبت‌نام کن و **API Key** و **شماره‌ی فرستنده** بگیر.
2. پنل ← **⚙️ تنظیمات ← پیامک**: کلید API و شماره‌ی فرستنده را بنویس و تیک **«پیامک فعال باشد»** را بزن ← «ذخیره تنظیمات».
3. از این به بعد پیامک فاکتور، یادآوری قسط، برگشت چک و تبریک تولد خودکار می‌رود. با برداشتن تیک، دوباره خاموش می‌شود.

### 🔗 پرتال مشتری
- تب «مشتریان و حساب‌ها» ← دکمه‌ی **🔗 پرتال** کنار هر مشتری ← لینک را کپی کن و برایش بفرست.
- مشتری فقط می‌بیند: مانده، پس‌انداز طلایی، اقساط، خریدهای اخیر و قیمت روز. چیزی را نمی‌تواند تغییر دهد.
- «باطل‌کردن همه‌ی لینک‌های پرتال» همه‌ی لینک‌های قبلی را از کار می‌اندازد.

### 👑 ربات مدیر (همان ربات سطح ۱)
فقط Chat ID مالک (تنظیمات) جواب می‌گیرد:

| دستور | جواب |
|---|---|
| `گزارش` | فروش، سود واقعی، هزینه و سود خالص امروز |
| `موجودی` | طلای ملکی به تفکیک عیار، امانی، نقره، سکه |
| `صندوق` | گردش وجه امروز به تفکیک روش پرداخت |
| `بدهکاران` | ۱۵ بدهکار بزرگ |
| `حساب علی` | مانده‌ی ریالی و طلایی یک مشتری/همکار |
| `اقساط` | اقساط معوق و ۷ روز آینده |
| `چک` | چک‌های ۷ روز آینده |
| `مدیر` | راهنما |

### 🧾 خروجی مالیاتی
تب «دفاتر و مالیات» ← ماه را انتخاب کن ← «دریافت فایل اکسل مالیاتی». اتصال مستقیم به سامانه‌ی مودیان به گواهی امضای فروشگاه نیاز دارد؛ فعلاً فایل را در کارپوشه بارگذاری کن.

### ⚖️ ترازو و 🖨️ چاپ حرارتی
- ترازوی دیجیتال با کابل USB/سریال: در فرم خرید دکمه‌ی **⚖️** (فقط Chrome یا Edge روی کامپیوتر).
- چاپ ۸۰ میلی‌متری فاکتور و اندازه‌ی اتیکت (۵۰×۳۰، ۴۰×۲۵، …) در «تنظیمات».

## گام ۴٫۸ — راه‌اندازی برای چند مغازه (نسخه‌ی ۵)
- **هسته‌ی مشترک**: یک ورک‌فلوی زیرمجموعه (Execute Sub-workflow) که فقط منطق کسب‌وکار را دارد و به هیچ جدولی دست نمی‌زند. پنل هر مغازه جدول‌های خودش را می‌خواند، همه را یک‌جا (`Pack`) به هسته می‌دهد و «نوشتنی‌ها» را در جدول‌های خودش ذخیره می‌کند.
- **جدول‌ها**: برای هر مغازه یک دسته جدول با پیشوند جدا (مثلاً `shopN_gs_*` و `shopN_invoices`) بسازید؛ ستون‌ها همان جدول‌های گام ۱ است.
- **برای هر مغازه سه ورک‌فلو**: پنل (`gold-admin-shopN` و API و پرتال)، سایت (`gold-shop-shopN`) و ربات (`tg-shopN`). صفحه و برنامه‌ی پنل از پنل اصلی خوانده می‌شود و فقط آدرس API عوض می‌شود؛ پس هر بهبود ظاهر، خودکار به همه‌ی مغازه‌ها می‌رسد.
- **رمز اول هر مغازه**: هش و نمک رمز را پیش از تحویل در جدول تنظیمات همان مغازه بگذارید و رمز را جدا (نه در فایل راهنما) به مغازه‌دار بدهید؛ با اولین ورود کاربر مدیر ساخته می‌شود و مغازه‌دار رمز را عوض می‌کند.
- **ربات تلگرام**: توکن در «تنظیمات ← ربات تلگرام فروشگاه» وارد می‌شود؛ سیستم خودش `setWebhook` را با کلید مخفی صدا می‌زند و پیام‌های بدون این کلید رد می‌شوند.
- **ایمیل**: ارسال ایمیل با همان حساب Gmail نصب n8n است؛ برای ارسال از ایمیل خود مغازه، کردنشیال جدا لازم است.

## فاکتور سایت ← فروش واقعی
فاکتور سایت فقط بایگانی است تا وقتی در «فروش ← فاکتورهای سایت» **تبدیل به فروش** شود. پیوند فاکتور سایت و فروش در تنظیمات با کلید `site_<شماره فاکتور>` نگه داشته می‌شود. «کنار گذاشتن» مقدار `skip` می‌گذارد و قابل برگرداندن است.

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

## آبشده و سکه

<div dir="ltr">

```
mesghal  = weight × assay / 705 / 4.608          (mazaneh is the price of one mesghal of 705)
buy      = mesghal × (mazaneh − commission)
sell     = mesghal × (mazaneh + commission)
rate18   = mazaneh / 4.3318                       (18K gram rate equivalent)
coins    : moving-average cost per coin type; realProfit = price×qty − avg×qty
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
| wsOut (gold to workshop) | | + grams |
| wsIn (piece from workshop) | − wage | − grams |
| wsLoss (workshop loss) | | − grams |
| goldSave (savings) | | − grams |
| goldRedeem | − amount (if to credit) | + grams |

</div>

## عیب‌یابی

<div dir="ltr">

| مشکل | راه‌حل |
|---|---|
| «نام کاربری یا رمز اشتباه است» | نام کاربری مدیر `admin` است. اگر رمز فراموش شده، بخش «رمز را فراموش کردم» |
| «حساب موقتاً قفل است» | ۱۵ دقیقه صبر کن، یا مدیر در `gs_settings` ردیف `lock_<user>` را پاک کند |
| پیامک نرفت | تیک «پیامک فعال باشد» و کلید API در «تنظیمات ← پیامک»؛ اعتبار حساب کاوه‌نگار |
| پشتیبان شبانه نیامد | Chat ID مالک و کردنشیال تلگرام |
| ترازو وصل نمی‌شود | فقط Chrome/Edge روی کامپیوتر؛ اجازه‌ی پورت سریال |
| نرخ روز صفر است | دسترسی سرور به `raw.githubusercontent.com`؛ موقتاً نرخ را «دستی» وارد کن |
| ردیف در گوگل‌شیت نیامد | کردنشیال Google Sheets و نام تب‌ها |
| ایمیل فاکتور/تبریک نرفت | کردنشیال Gmail یا ایمیل مشتری |
| گزارش شبانه نیامد | کردنشیال تلگرام، Chat ID مالک در تنظیمات، و Start زدن ربات توسط مالک |

</div>

</div>
