# 🏦 Gold Shop Management System — Level 3 | سیستم مدیریت طلافروشی — سطح ۳

> **Goldsmith track · Level 3 (Advanced)** — builds on **[Level 1: Live Price Bot](../level1-live-gold-price-bot)** and **[Level 2: Invoice Assistant](../level2-invoice-and-fee-assistant)**.
> **مسیر طلافروش · سطح ۳ (پیشرفته)** — ادامه‌ی **[سطح ۱: ربات قیمت لحظه‌ای](../level1-live-gold-price-bot)** و **[سطح ۲: دستیار فاکتور](../level2-invoice-and-fee-assistant)**.

`#n8n` `#gold_shop` `#inventory_management` `#real_profit` `#erp` `#admin_panel` `#google_sheets` `#excel` `#melted_gold` `#gold_coins` `#installments` `#barcode` `#cheques` `#gold_savings` `#customer_portal` `#backup` `#roles` `#moadian` `#silver` `#سیستم_مدیریت_طلافروشی` `#مدیریت_موجودی` `#سود_واقعی` `#حساب_همکار` `#آبشده` `#مظنه` `#سکه` `#فروش_اقساطی` `#چک` `#پس‌انداز_طلایی` `#کارگاه` `#امانی` `#سامانه_مودیان` `#نقره` `#طلافروش` `#حسابداری_طلا` `#اتوماسیون` `#iran` `#multi_tenant` `#چند_مغازه` `#level3`

> 🔗 **Shop website | سایت فروشگاه:** **https://n8n.aifardainstitute.ir/webhook/gold-shop** → button **«🔐 پنل مدیریت فروشگاه»**
> 🔗 **Admin panel | پنل مدیریت:** **https://n8n.aifardainstitute.ir/webhook/gold-admin** (username + password · نام کاربری و رمز؛ هر کاربر نقش خودش را دارد)
> 🔗 **Customer portal | پرتال مشتری:** `…/webhook/gold-customer?c=…&t=…` (personal read-only link · لینک اختصاصی فقط‌خواندنی)
>
> 🔒 **The workflow file is private.** This page shows the schematic, screenshots and docs only.
> 🔒 **فایل ورک‌فلو خصوصی است.** این صفحه فقط شماتیک، تصاویر و مستندات را نشان می‌دهد.

---

## 🗺️ Schematic | شماتیک

```mermaid
flowchart LR
  W["🌐 Shop website / سایت<br/>(Level 1 + 2)"] -->|"🔐 button"| P["🖥️ Admin panel / پنل مدیریت"]
  P -->|"user + password → token / ورود با نقش"| API["⚙️ Admin API<br/>roles · audit log · lockout"]
  API --> M["🟡 Live gold price / نرخ روز طلا"]
  API --> L["🧮 Business logic / منطق کسب‌وکار<br/>buy · sell · return · ledger · real profit"]
  L --> DB[("🗄️ Database / پایگاه داده<br/>inventory · transactions · customers · orders<br/>cheques · users · audit · closings · settings")]
  L --> GS["📗 Google Sheet (live)<br/>same columns as Excel export"]
  L --> G["📧 Invoice email / ایمیل فاکتور"]
  P --> X["⬇️ Excel export (instant) / خروجی اکسل لحظه‌ای"]
  T1["⏰ Daily 09:00"] --> O["🎉 Occasions / مناسبت‌ها"] --> E["📧 Greeting email / ایمیل تبریک"]
  O --> TG1["📱 Owner reminder / یادآوری به مالک"]
  T2["⏰ Daily 21:00"] --> R["📊 Daily report / گزارش روزانه"] --> TG2["📱 Owner Telegram / تلگرام مالک"]
  T3["⏰ Nightly 23:45"] --> B["💾 Backup JSON / پشتیبان"] --> TG2
  B --> E
  DB --> CP["🔗 Customer portal / پرتال مشتری"]
  DB --> OB["👑 Owner bot (Level 1) / ربات مدیر"]
  L -.-> SMS["✉️ SMS (ready, off) / پیامک (آماده، خاموش)"]
```

| 📊 Dashboard / داشبورد | 🧾 Multi-item invoice / فاکتور چندقلمی |
|---|---|
| ![dashboard](docs/screenshots/dashboard.png) | ![invoice](docs/screenshots/invoice.png) |
| 👥 **Customer & supplier accounts / حساب مشتری و همکار** | 💵 **Cash box & expenses / صندوق و هزینه** |
| ![accounts](docs/screenshots/accounts.png) | ![cash](docs/screenshots/cash.png) |
| 📦 **Inventory by weight & karat / موجودی به تفکیک عیار** | 📈 **Financial report / گزارش مالی** |
| ![inventory](docs/screenshots/inventory.png) | ![report](docs/screenshots/report.png) |
| 🧈 **Melted gold (by mazaneh) & melting / آبشده و ذوب** | 🪙 **Coins: stock, avg cost, bubble / سکه** |
| ![ab](docs/screenshots/ab.png) | ![coin](docs/screenshots/coin.png) |
| 🏷️ **Barcode labels / اتیکت بارکددار** | 🧾 **Cheques / چک‌ها** |
| ![labels](docs/screenshots/labels.png) | ![cheques](docs/screenshots/cheques.png) |
| 💰 **Gold savings / پس‌انداز طلایی** | 🔨 **Workshop & consignment / کارگاه و امانی** |
| ![savings](docs/screenshots/savings.png) | ![workshop](docs/screenshots/workshop.png) |
| 🧮 **Price calculator / ماشین‌حساب** | 📒 **P&L, journal & tax export / دفاتر و مالیات** |
| ![calc](docs/screenshots/calc.png) | ![books](docs/screenshots/books.png) |
| 🛡️ **Users, audit log & backup / کاربران و پشتیبان** | |
| ![security](docs/screenshots/security.png) | |

<sub>Screenshots use sample test data. / تصاویر با داده‌ی آزمایشی گرفته شده‌اند.</sub>

---

## 🇬🇧 English

### What it does
- **Inventory by weight & karat** — every piece stored with weight, karat (750/740/705/900/995/585), 18K-equivalent grams, *mesghal*, purchase rate and making cost; grouped per karat; search & category filters.
- **Purchases** — from suppliers (cash, credit, or **gold-for-gold settlement** that records the debt in grams), batch entry of identical pieces, and **buy-back of used gold** from customers with melt-loss deduction.
- **Multi-item invoices** — fee % + profit % or a fixed agreed price, discount, VAT on fee & profit only, **trade-in of old gold**, payment method (cash / POS / card-to-card / cheque / mixed), partial payment → automatic customer credit; printable invoice + email to the customer.
- **Returns & corrections** — sales returns (refund is reduced by any open customer debt), voiding mistaken entries.
- **Customer & supplier ledger** — money balance and **gold balance in grams** for every party; receive / pay in cash or in gold.
- **Melted gold (آبشده)** — buy/sell by **mazaneh** (live or manual) per mesghal of 705 with a per-mesghal commission, lab assay and certificate number; **melt used gold into a bar** with the melt loss recorded in grams and the cost carried over.
- **Coins** — Emami, Bahar Azadi, half, quarter, gram coins: stock by count, moving-average cost, live price and bubble, real profit per sale, voidable trades.
- **Installment sales** — split any credit balance into N installments (Jalali due dates); due/overdue list on the dashboard and a 09:00 Telegram reminder; one-click installment receipt.
- **Stones & per-gram making fee** — stone/gem cost per piece (added to cost and sale price); making fee as % or toman per gram.
- **Barcode labels & scanner** — printable CODE128 tags (shop, title, weight, karat); a USB scanner types the code into the sale form and the piece drops into the cart.
- **Live price board** — 18K, 740, 24K, used gold, mazaneh, melted-cash/wholesale, every coin with its bubble, silver 925, ounce, USD, EUR.
- **Custom orders & repairs** — deposit, due date, status workflow.
- **Cash box & expenses** — daily/monthly in-out per payment method; rent, wages, bills …
- **Real profit, including price swings** — each sale is split into:
  - **Operating profit** = sale price − gold value at sale-day rate − making cost paid
  - **Holding gain/loss** = gold weight × (sale-day rate − purchase-day rate)
  - **Real profit** = operating profit + holding gain = sale price − full cost basis (also in grams of gold)
  - **Net profit** = real profit − expenses (VAT is never counted as profit)
- **Occasion messages** — birthdays & anniversaries (Jalali): greeting emails at 09:00 + Telegram reminder for the owner.
- **Live Google Sheet + instant Excel export** — every write is mirrored to a Google Sheet; the Excel button downloads the same tabs and the same Persian column headers (RTL), plus a summary sheet.
- **Owner-set password** — the owner sets and changes the panel password in *Settings*; only a salted SHA-256 hash is stored.

### New in v4
- **Users & roles** — owner / accountant / seller (sellers never see costs or profit); signed 12-hour login tokens; 5 wrong passwords → 15-minute lock; full **audit log** of who did what.
- **Backup** — nightly 23:45 JSON backup to the owner's Telegram (and email); manual download and restore in the panel; secrets are never included.
- **Cheques** — received / issued cheques with due dates, status (pending · cleared · bounced · endorsed), 7-day due list on the dashboard.
- **Ounce & mazaneh calculator** — gold price from ounce × dollar, mazaneh ↔ gram, piece price with fee, profit, VAT and stones.
- **Day close, journal & P&L** — counted cash vs. system, gold difference; double-entry style journal; monthly profit-and-loss statement.
- **Consignment & workshop** — consignment pieces (paid to the supplier only after sale); gold issued to / received from makers with wage and loss, gold balance per workshop.
- **Gold savings & customer portal** — customers save grams of gold and redeem later; each customer gets a private read-only link showing balance, savings, installments and recent purchases.
- **SMS (placeholder)** — Kavenegar-ready messages for invoices, installments and occasions; **off** until an API key is entered in *Settings → SMS*.
- **Owner Telegram bot** — `گزارش`, `موجودی`, `صندوق`, `بدهکاران`, `حساب <name>`, `اقساط`, `چک` from the Level 1 bot, owner-only.
- **Tax (Moadian) Excel export** — monthly sales in the gold/jewelry layout with buyer national ID / economic code.
- **Jewelry certificate**, **silver (925) items**, **charts & slow-moving stock**, **thermal 80 mm printing & label sizes**, **digital scale via Web Serial**, **branches** (per-branch stock and reports).

### New in v5
- **Cleaner panel (UI/UX)** — the 17 tabs are now a grouped **side menu** (Sales · Stock · Money & accounts · Reports · System), a slim sticky top bar with icon buttons, quick-action buttons on the dashboard, a short price board ("show all rates" on demand), and on phones a slide-in menu plus a bottom tab bar.
- **Website invoice → real sale** — invoices issued on the public website appear in *Sales → Website invoices*; **Convert to sale** pre-fills the customer and amount and suggests stock items of the same weight/karat; or **Set aside** (with undo). Each website invoice can be converted only once.
- **Multi-shop ready** — one shared *core* workflow holds the business logic; every shop has its own panel, website, Telegram bot and its own data tables, so shops never see each other's data. UI updates reach every shop at once.
- **Per-shop Telegram bot** — the shop owner pastes a @BotFather token in *Settings*; the bot is connected automatically with a secret webhook header (the token is never sent back to the browser or stored in backups).

![v5 dashboard](docs/screenshots/v5-dashboard.png)

### Why a shop pays
Inventory control and *real* profit are exactly what goldsmiths never know precisely — gold-price swings hide whether the shop earned from selling or just from the market moving. This system separates the two and keeps every customer's and supplier's money **and gold** balance straight.

### Tech
n8n (webhooks + schedules) · n8n Data Tables (database) · signed tokens & roles · Web Serial (scale) · single-page admin panel served by n8n · Google Sheets · SheetJS (Excel) · free live price feed · Gmail · Telegram.

---

## 🇮🇷 فارسی

### چه‌کار می‌کند؟
- **موجودی به تفکیک وزن و عیار** — هر قطعه با وزن، عیار (۷۵۰/۷۴۰/۷۰۵/۹۰۰/۹۹۵/۵۸۵)، معادل ۱۸ عیار، مثقال، نرخ خرید و اجرت پرداختی؛ جمع به تفکیک عیار؛ جستجو و فیلتر دسته.
- **خرید** — از همکار/تولیدی (نقد، نسیه، یا **طلایی = بدهی به گرم**)، ثبت چند قلم یکسان با هم، و **خرید طلای کهنه** از مشتری با کسر افت.
- **فاکتور فروش چندقلمی** — درصد اجرت و سود یا مبلغ توافقی، تخفیف، مالیات ارزش افزوده (فقط روی اجرت و سود)، **تعویض طلای کهنه**، روش پرداخت (نقد/کارتخوان/کارت‌به‌کارت/چک/ترکیبی)، پرداخت ناقص ← نسیه‌ی خودکار؛ چاپ فاکتور و ایمیل به مشتری.
- **برگشت از فروش و ابطال** — مبلغ استرداد با بدهی مشتری تهاتر می‌شود؛ ابطال ثبت‌های اشتباه.
- **حساب مشتری و همکار** — مانده‌ی ریالی و **مانده‌ی طلایی (گرم)**؛ دریافت/پرداخت نقدی یا طلایی.
- **🧈 آبشده** — خرید و فروش با **مظنه** (روز یا دستی) به‌ازای مثقال ۷۰۵ با کارمزد هر مثقال، عیار آزمایشگاه و شماره‌ی ری‌گیری؛ **ذوب طلای کهنه و تبدیل به آبشده** با ثبت افت (گرم) و انتقال بهای تمام‌شده.
- **🪙 سکه** — امامی، بهار آزادی، نیم، ربع، گرمی: موجودی تعدادی، میانگین بهای خرید، قیمت روز و حباب، سود واقعی هر فروش، امکان ابطال.
- **📅 فروش اقساطی** — تقسیط مانده‌ی نسیه به چند قسط با سررسید شمسی؛ فهرست سررسیده/معوق در داشبورد و یادآوری تلگرامی ساعت ۹؛ دریافت قسط با یک کلیک.
- **💎 سنگ و اجرت گرمی** — قیمت سنگ/نگین هر قطعه (در بها و قیمت فروش)؛ اجرت درصدی یا تومان برای هر گرم.
- **🏷️ اتیکت بارکددار و بارکدخوان** — چاپ اتیکت با نام مغازه، عنوان، وزن و عیار؛ با بارکدخوان، کالا مستقیم وارد فاکتور می‌شود.
- **📋 تابلوی نرخ** — ۱۸ عیار، ۷۴۰، ۲۴ عیار، دست‌دوم، مظنه، آبشده نقدی/بنکداری، همه‌ی سکه‌ها با حباب، نقره ۹۲۵، انس، دلار، یورو.
- **سفارش ساخت و تعمیر** — بیعانه، تاریخ تحویل، وضعیت.
- **صندوق و هزینه‌ها** — ورودی/خروجی روزانه و ماهانه به تفکیک روش پرداخت؛ اجاره، حقوق، قبوض و …
- **سود واقعی با احتساب نوسان قیمت**:
  - **سود فروش** = مبلغ فروش − ارزش طلای کالا به نرخ روز فروش − اجرت پرداختی
  - **سود/زیان نوسان** = وزن طلا × (نرخ روز فروش − نرخ روز خرید)
  - **سود واقعی** = سود فروش + نوسان = مبلغ فروش − بهای تمام‌شده (به گرم طلا هم)
  - **سود خالص** = سود واقعی − هزینه‌ها (مالیات ارزش افزوده جزو سود نیست)
- **پیام در مناسبت‌ها** — تولد و سالگرد ازدواج (شمسی): ایمیل تبریک ساعت ۹ صبح + یادآوری تلگرامی به مالک.
- **گوگل‌شیت زنده + خروجی اکسل لحظه‌ای** — هر ثبت هم‌زمان در گوگل‌شیت نوشته می‌شود؛ دکمه‌ی «خروجی اکسل» همان تب‌ها و **همان ستون‌های فارسی** (راست‌به‌چپ) را به‌علاوه‌ی برگه‌ی خلاصه‌ی گزارش دانلود می‌کند.
- **رمز به انتخاب مدیر** — مدیر رمز پنل را در «تنظیمات» می‌گذارد و هر وقت بخواهد عوض می‌کند؛ فقط هش رمز (SHA-256 با نمک) ذخیره می‌شود.

### تازه‌های نسخه‌ی ۴
- **🛡️ کاربران و نقش‌ها** — مدیر / حسابدار / فروشنده (فروشنده بها و سود را نمی‌بیند)؛ ورود با توکن ۱۲ ساعته؛ ۵ بار رمز اشتباه = ۱۵ دقیقه قفل؛ **گزارش فعالیت** همه‌ی کاربران.
- **💾 پشتیبان‌گیری** — هر شب ۲۳:۴۵ نسخه‌ی کامل به تلگرام (و ایمیل) مالک؛ دانلود و بازیابی دستی در پنل؛ رمزها هرگز در پشتیبان نیستند.
- **🧾 چک‌ها** — چک دریافتی و پرداختی با سررسید و وضعیت (در انتظار · وصول · برگشتی · خرج شده)؛ چک‌های ۷ روز آینده در داشبورد.
- **🧮 ماشین‌حساب انس و مظنه** — نرخ طلا از انس × دلار، تبدیل مظنه به گرم، قیمت قطعه با اجرت، سود، مالیات و سنگ.
- **📒 بستن صندوق، دفتر روزنامه و سود و زیان** — شمارش صندوق و مقایسه با سیستم، مغایرت طلا؛ دفتر روزنامه؛ صورت سود و زیان ماهانه.
- **🔨 امانی و کارگاه** — کالای امانی (پول بنکدار بعد از فروش)؛ تحویل طلا به سازنده و دریافت کالا با اجرت و افت؛ مانده‌ی طلایی هر کارگاه.
- **💰 پس‌انداز طلایی و پرتال مشتری** — مشتری گرم‌گرم طلا پس‌انداز می‌کند و بعداً خرید می‌کند؛ هر مشتری یک لینک اختصاصی فقط‌خواندنی دارد (مانده، پس‌انداز، اقساط، خریدها).
- **✉️ پیامک (جای خالی)** — پیام فاکتور، قسط و مناسبت آماده است (کاوه‌نگار)؛ تا وقتی کلید API در «تنظیمات ← پیامک» وارد نشود **خاموش** است.
- **👑 ربات مدیر در تلگرام** — `گزارش`، `موجودی`، `صندوق`، `بدهکاران`، `حساب <نام>`، `اقساط`، `چک` از همان ربات سطح ۱، فقط برای مالک.
- **🧾 خروجی مالیاتی (سامانه‌ی مودیان)** — اکسل فروش ماهانه با الگوی طلا و جواهر و کد ملی/اقتصادی خریدار.
- **گواهی جواهر**، **نقره (۹۲۵)**، **نمودار و کالای کم‌گردش**، **چاپ حرارتی ۸۰ میلی‌متری و اندازه‌ی اتیکت**، **خواندن ترازوی دیجیتال (Web Serial)**، **چند شعبه** (موجودی و گزارش هر شعبه).

### تازه‌های نسخه‌ی ۵
- **🎨 پنل خلوت و مرتب (UI/UX)** — ۱۷ تب حالا در یک **منوی کناری گروه‌بندی‌شده** است (خرید و فروش · کالا · پول و حساب‌ها · گزارش · سیستم)؛ نوار بالای ساده با دکمه‌های آیکونی؛ دکمه‌های سریع روی داشبورد؛ تابلوی نرخ کوتاه (با «همه‌ی نرخ‌ها»)؛ روی گوشی منوی کشویی و نوار دکمه‌های پایین صفحه.
- **🌐 فاکتور سایت ← فروش واقعی** — فاکتورهای صادرشده در سایت در «فروش ← فاکتورهای سایت» می‌آیند؛ با **«تبدیل به فروش»** مشتری و مبلغ خودکار پر می‌شود و کالای هم‌وزن از موجودی پیشنهاد می‌شود؛ یا **«کنار گذاشتن»** (با امکان برگرداندن). هر فاکتور سایت فقط یک بار تبدیل می‌شود.
- **🏪 آماده برای چند مغازه** — منطق کسب‌وکار در یک «هسته‌ی مشترک» است؛ هر مغازه پنل، سایت، ربات تلگرام و جدول‌های اطلاعات **جداگانه** دارد و اطلاعات مغازه‌ها هرگز قاطی نمی‌شود. هر بهبود ظاهر پنل هم‌زمان به همه‌ی مغازه‌ها می‌رسد.
- **🤖 ربات تلگرام هر مغازه** — مغازه‌دار توکن ربات را از @BotFather در «تنظیمات» می‌چسباند و ربات خودکار وصل می‌شود (با کلید مخفی؛ توکن به مرورگر برنمی‌گردد و در پشتیبان نیست).

<div dir="ltr">

| | |
|---|---|
| ![mobile](docs/screenshots/v5-mobile.png) | ![menu](docs/screenshots/v5-mobile-menu.png) |

</div>

![site invoices](docs/screenshots/site-invoices.png)

### «مشتری قبلی / مشتری جدید / مشتری گذری» یعنی چه؟
- **مشتری قبلی**: از فهرست انتخاب کنید؛ فروش به حساب او ثبت می‌شود (نسیه، سابقه، مناسبت‌ها).
- **مشتری جدید**: نام و تلفن را همان‌جا بنویسید؛ هم مشتری ساخته می‌شود و هم فروش ثبت می‌شود.
- **مشتری گذری (بی‌نام)**: کسی که نمی‌خواهید ثبتش کنید؛ فقط وقتی مجاز است که کامل پرداخت کند.

### چرا مغازه‌دار پول می‌دهد؟
کنترل موجودی و **سود واقعی** دقیقاً همان چیزی است که طلافروش‌ها هیچ‌وقت دقیق نمی‌دانند؛ نوسان قیمت طلا پنهان می‌کند که سود از «فروش» آمده یا فقط از «گران شدن طلا». این سیستم این دو را جدا می‌کند و حساب ریالی **و طلایی** هر مشتری و همکار را دقیق نگه می‌دارد.

### ابزارها
n8n (وب‌هوک + زمان‌بند) · Data Table داخلی n8n (پایگاه داده) · پنل مدیریتی تک‌صفحه‌ای · گوگل‌شیت · SheetJS (اکسل) · منبع قیمت رایگان · Gmail · تلگرام.

---

## 📂 Files | فایل‌ها

| File | توضیح |
|---|---|
| `README.md` | همین صفحه / this page |
| `docs/setup.md` | راهنمای راه‌اندازی / setup guide |
| `docs/sales.md` | راهنمای فروش / sales guide |
| `docs/screenshots/` | تصاویر پنل / panel screenshots |
| `workflow.json` 🔒 | خصوصی — در ریپو نیست / private — not in the repo |

---

<div align="center">

Goldsmith track · **Level 1 → Level 2 → Level 3** · مسیر طلافروش

`#n8n_iran` `#طلافروش` `#سیستم_مدیریت` `#gold_erp` `#fintech` `#claude`

</div>
