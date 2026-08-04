# 🥇 Gold, Coin & Dollar Live Price Bot — Level 1 | ربات قیمت لحظه‌ای طلا، سکه و دلار — سطح ۱

> **Goldsmith track · Level 1.** Next step → **[Level 2: Invoice & Making-Fee Assistant](../level2-invoice-and-fee-assistant)**.
> **مسیر طلافروش · سطح ۱.** قدم بعد → **[سطح ۲: دستیار محاسبه‌ی فاکتور و اجرت](../level2-invoice-and-fee-assistant)**.

> An n8n Telegram bot that fetches **live gold, coin, and currency prices** from an Iranian API (nerkh.io) and supports **price alerts** — plus a scheduled checker that notifies users when a target price is hit.
>
> رباتی با n8n که قیمت لحظه‌ای **طلا، سکه و ارز** را از API ایرانی (nerkh.io) می‌گیرد و قابلیت **هشدار قیمت** دارد؛ به‌همراه بررسی زمان‌بندی‌شده که وقتی قیمت به هدف رسید به کاربر خبر می‌دهد.

`#n8n` `#telegram_bot` `#gold_price` `#dollar_price` `#coin_price` `#قیمت_طلا` `#قیمت_دلار` `#قیمت_سکه` `#ربات_تلگرام` `#automation` `#اتوماسیون` `#nerkh` `#iran` `#no_code` `#workflow`

---

## 🇬🇧 English

### What it does
- **Telegram query bot** — user sends `قیمت` → replies with live gold, coin, and currency prices (in Toman).
- **Price alerts** — user sends `هشدار سکه 190000000` → an alert is stored.
- **Scheduled checker (every 10 min)** — fetches prices, checks all stored alerts, notifies the user when the target is reached, then removes the fired alert.

### Why a shop pays for it
A goldsmith answers "what's the price?" dozens of times a day. This bot answers instantly, keeps the shop's Telegram channel active, and brings customers back with price alerts.

### Tech
n8n · Telegram · nerkh.io price API · n8n Data Table (no external database).

### Workflow map

```
Telegram Trigger ─▶ Route Command ┬─(price)─▶ Get Gold Prices ─▶ Get Currency Prices ─▶ Build Price Message ─▶ Send Prices
                                  ├─(alert)─▶ Parse Alert Command ─▶ Save Alert ─▶ Confirm Alert
                                  └─(help)──▶ Send Help

Every 10 Minutes ─▶ Get Gold Prices (Alerts) ─▶ Get Currency Prices (Alerts) ─▶ Get Active Alerts ─▶ Check Triggered Alerts ─▶ Send Price Alert ─▶ Remove Fired Alert
```

### Setup (short)
1. Run n8n locally / on your own server.
2. Create a Telegram bot with [@BotFather](https://t.me/BotFather) → credential `Telegram Bot`.
3. Get a free token from [nerkh.io](https://nerkh.io) → **Query Auth** credential, param `x-api-key`, name `Nerkh API Key`.
4. Create a Data Table `price_alerts` with columns: `chatId`, `asset`, `assetLabel`, `target`, `direction`.
5. Import [`workflow.json`](workflow.json), attach credentials, **Activate**.

Full guide: [`docs/setup.md`](docs/setup.md) · Sales guide: [`docs/sales.md`](docs/sales.md)

### API structure (nerkh.io)
```
GET https://api.nerkh.io/v1/prices/json/gold       → gold & coins (GOLD18K, GOLD24K, SEKE_EMAMI, SEKE_NIM, SEKE_ROB, SEKE_BAHAR, …)
GET https://api.nerkh.io/v1/prices/json/currency   → currencies (USD, EUR, GBP, AED, TRY, …)
```
Each price is read from `data.prices.<SYMBOL>.current` (values are in **Toman**).

---

## 🇮🇷 فارسی

### چه‌کار می‌کند؟
- **ربات پاسخ‌گو در تلگرام** — کاربر `قیمت` می‌فرستد → قیمت لحظه‌ای طلا، سکه و ارز (به تومان) پاسخ داده می‌شود.
- **هشدار قیمت** — کاربر `هشدار سکه 190000000` می‌فرستد → یک هشدار ذخیره می‌شود.
- **بررسی خودکار (هر ۱۰ دقیقه)** — قیمت‌ها گرفته می‌شوند، همه‌ی هشدارها بررسی می‌شوند، هرکدام که به هدف رسید پیام می‌رود و هشدار حذف می‌شود.

### چرا مغازه‌دار پول می‌دهد؟
طلافروش روزی ده‌ها بار جواب «قیمت چنده؟» را می‌دهد. این ربات فوری جواب می‌دهد، کانال تلگرام مغازه را فعال نگه می‌دارد و با هشدار قیمت مشتری را برمی‌گرداند.

### ابزارها
n8n · تلگرام · API قیمت nerkh.io · Data Table داخلی n8n (بدون پایگاه‌داده‌ی بیرونی).

### راه‌اندازی (خلاصه)
۱. n8n را روی سیستم/سرور خودت اجرا کن.
۲. با [@BotFather](https://t.me/BotFather) ربات تلگرام بساز → کردنشیال `Telegram Bot`.
۳. از [nerkh.io](https://nerkh.io) توکن رایگان بگیر → کردنشیال **Query Auth**، پارامتر `x-api-key`، نام `Nerkh API Key`.
۴. یک Data Table به نام `price_alerts` با ستون‌های `chatId`, `asset`, `assetLabel`, `target`, `direction` بساز.
۵. فایل [`workflow.json`](workflow.json) را Import کن، کردنشیال‌ها را وصل و **Activate** کن.

راهنمای کامل: [`docs/setup.md`](docs/setup.md) · راهنمای فروش: [`docs/sales.md`](docs/sales.md)

### واحد پول
قیمت‌ها به **تومان** هستند و از مسیر `data.prices.<نماد>.current` خوانده می‌شوند.

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
