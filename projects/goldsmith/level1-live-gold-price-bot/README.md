# 🥇 Gold, Coin & Dollar Live Price Bot — Level 1 | ربات قیمت لحظه‌ای طلا، سکه و دلار — سطح ۱

> **Goldsmith track · Level 1.** Next step → **[Level 2: Invoice & Making-Fee Assistant](../level2-invoice-and-fee-assistant)** → **[Level 3: Gold Shop Management](../level3-gold-shop-management)**.
> 🌐 **Live demo | دموی زنده:** [https://n8n.aifardainstitute.ir/webhook/gold-shop](https://n8n.aifardainstitute.ir/webhook/gold-shop) — live prices on the web, no Telegram needed / قیمت لحظه‌ای روی وب، بدون نیاز به تلگرام
>
> **مسیر طلافروش · سطح ۱.** قدم بعد → **[سطح ۲: دستیار محاسبه‌ی فاکتور و اجرت](../level2-invoice-and-fee-assistant)**.

> An n8n Telegram bot that fetches **live gold, coin, and currency prices** from a **free, no-token** Iranian market feed (Iran Market Data / TGJU) and supports **price alerts** — plus a scheduled checker that notifies users when a target price is hit.
>
> رباتی با n8n که قیمت لحظه‌ای **طلا، سکه و ارز** را از یک منبع **رایگان و بدون توکن** (Iran Market Data / TGJU) می‌گیرد و قابلیت **هشدار قیمت** دارد؛ به‌همراه بررسی زمان‌بندی‌شده که وقتی قیمت به هدف رسید به کاربر خبر می‌دهد.

`#n8n` `#telegram_bot` `#gold_price` `#dollar_price` `#coin_price` `#قیمت_طلا` `#قیمت_دلار` `#قیمت_سکه` `#ربات_تلگرام` `#automation` `#اتوماسیون` `#free_api` `#iran` `#no_code` `#workflow`

---

## 🇬🇧 English

### What it does
- **Telegram query bot** — user sends `قیمت` → replies with live gold, coin, and currency prices (in Toman).
- **Price alerts** — user sends `هشدار سکه 190000000` → an alert is stored.
- **Scheduled checker (every 10 min)** — fetches prices, checks all stored alerts, notifies the user when the target is reached, then removes the fired alert.
- **👑 Owner commands (when linked to Level 3)** — only the owner's Chat ID gets answers to `گزارش`, `موجودی`, `صندوق`, `بدهکاران`, `حساب <name>`, `اقساط`, `چک`; everyone else still gets prices.

### Why a shop pays for it
A goldsmith answers "what's the price?" dozens of times a day. This bot answers instantly, keeps the shop's Telegram channel active, and brings customers back with price alerts.

### Tech
n8n · Telegram · free price feed (Iran Market Data, no API key) · n8n Data Table (no external database).

### Workflow map

```
Telegram Trigger ─▶ Route Command ┬─(price)─▶ Get Market Prices ─▶ Build Price Message ─▶ Send Prices
                                  ├─(alert)─▶ Parse Alert Command ─▶ Save Alert ─▶ Confirm Alert
                                  └─(help)──▶ Send Help

Every 10 Minutes ─▶ Get Market Prices (Alerts) ─▶ Get Active Alerts ─▶ Check Triggered Alerts ─▶ Send Price Alert ─▶ Remove Fired Alert
```

### Setup (short)
1. Run n8n locally / on your own server.
2. Create a Telegram bot with [@BotFather](https://t.me/BotFather) → credential `Telegram Bot`.
3. Price source needs **no token** — nothing to set up.
4. Create a Data Table `price_alerts` with columns: `chatId`, `asset`, `assetLabel`, `target`, `direction`.
5. Import [`workflow.json`](workflow.json), attach credentials, **Activate**.

Full guide: [`docs/setup.md`](docs/setup.md) · Sales guide: [`docs/sales.md`](docs/sales.md)

### Price source (free, no API key)
```
GET https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/latest-toman.json
```
[Iran Market Data](https://github.com/iran-market/iran-market.github.io) (MIT, data from TGJU) — values in **Toman**, refreshed **every 30 min**.
Symbols used: `GOLD_18K_IRR`, `GOLD_24K_IRR`, `COIN_EMAMI_IRR`, `COIN_BAHAR_IRR`, `COIN_HALF_IRR`, `COIN_QUARTER_IRR`, `USD_IRR_FREE`, `EUR_IRR_FREE`, `GBP_IRR_FREE` — read from `data.categories.*[].price`.

---

## 🇮🇷 فارسی

### چه‌کار می‌کند؟
- **ربات پاسخ‌گو در تلگرام** — کاربر `قیمت` می‌فرستد → قیمت لحظه‌ای طلا، سکه و ارز (به تومان) پاسخ داده می‌شود.
- **هشدار قیمت** — کاربر `هشدار سکه 190000000` می‌فرستد → یک هشدار ذخیره می‌شود.
- **بررسی خودکار (هر ۱۰ دقیقه)** — قیمت‌ها گرفته می‌شوند، همه‌ی هشدارها بررسی می‌شوند، هرکدام که به هدف رسید پیام می‌رود و هشدار حذف می‌شود.
- **👑 دستورهای مدیر (وقتی به سطح ۳ وصل باشد)** — فقط Chat ID مالک جواب می‌گیرد: `گزارش`، `موجودی`، `صندوق`، `بدهکاران`، `حساب <نام>`، `اقساط`، `چک`؛ بقیه‌ی کاربران همان قیمت را می‌بینند.

### چرا مغازه‌دار پول می‌دهد؟
طلافروش روزی ده‌ها بار جواب «قیمت چنده؟» را می‌دهد. این ربات فوری جواب می‌دهد، کانال تلگرام مغازه را فعال نگه می‌دارد و با هشدار قیمت مشتری را برمی‌گرداند.

### ابزارها
n8n · تلگرام · منبع قیمت رایگان (Iran Market Data، بدون توکن) · Data Table داخلی n8n (بدون پایگاه‌داده‌ی بیرونی).

### راه‌اندازی (خلاصه)
۱. n8n را روی سیستم/سرور خودت اجرا کن.
۲. با [@BotFather](https://t.me/BotFather) ربات تلگرام بساز → کردنشیال `Telegram Bot`.
۳. منبع قیمت **توکن نمی‌خواهد** — کاری لازم نیست.
۴. یک Data Table به نام `price_alerts` با ستون‌های `chatId`, `asset`, `assetLabel`, `target`, `direction` بساز.
۵. فایل [`workflow.json`](workflow.json) را Import کن، کردنشیال‌ها را وصل و **Activate** کن.

راهنمای کامل: [`docs/setup.md`](docs/setup.md) · راهنمای فروش: [`docs/sales.md`](docs/sales.md)

### واحد پول
قیمت‌ها به **تومان** هستند، هر **۳۰ دقیقه** به‌روز می‌شوند و از مسیر `data.categories.*[].price` خوانده می‌شوند.

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

`#n8n_iran` `#طلافروش` `#اتوماسیون_پولساز` `#claude` `#telegram` `#fintech` `#currency_api` `#gold_api`

</div>
