<div dir="rtl">

# اتوماسیون‌های n8n برای کسب‌وکارهای ایرانی

مجموعه‌ی پروژه‌های اتوماسیون و ایجنت هوش مصنوعی که با **n8n** و **Claude** ساخته‌ام، برای شرایط واقعی بازار ایران: ربات تلگرام، گوگل‌شیت، درگاه زرین‌پال و منابع داده‌ای که از داخل ایران در دسترس‌اند.

ساخته‌ی **فاطمه شمس** · [LinkedIn](https://www.linkedin.com/in/fatemeh-shams/) · [GitHub](https://github.com/Fatemeh1203) · fatemeh.shams19@gmail.com

## پروژه‌ها

| پروژه | چه می‌کند | پوشه |
|---|---|---|
| طلافروشی، سطح ۱ | ربات تلگرام قیمت لحظه‌ای طلا، سکه و دلار، با هشدار قیمت که هر ۱۰ دقیقه چک می‌شود | [level1-live-gold-price-bot](projects/goldsmith/level1-live-gold-price-bot) |
| طلافروشی، سطح ۲ | فرم وب صدور فاکتور: وزن، عیار و اجرت را می‌گیرد، با نرخ زنده حساب می‌کند، فاکتور می‌دهد و در گوگل‌شیت بایگانی می‌کند | [level2-invoice-and-fee-assistant](projects/goldsmith/level2-invoice-and-fee-assistant) |
| طلافروشی، سطح ۳ | سیستم مدیریت طلافروشی: موجودی، خرید و فروش، مشتریان، چک، پس‌انداز طلایی، کارگاه، چند کاربر و پشتیبان‌گیری | [level3-gold-shop-management](projects/goldsmith/level3-gold-shop-management) |
| طلافروشی، امکانات تکمیلی | شمش، اسکن بارکد، انبارگردانی، پیش‌فاکتور با قیمت قفل، رزرو، تابلوی قیمت، سریال سکه و پرداخت اقساط با زرین‌پال | [level3-extensions](projects/goldsmith/level3-extensions) |
| اسکن فاکتور با هوش مصنوعی | عکس یا فایل فاکتور را در تلگرام می‌فرستید؛ مدل بینایی داده‌ها را استخراج می‌کند و در تب خرید یا فروش گوگل‌شیت ثبت می‌کند، با محاسبه‌ی ارزش‌افزوده | [invoice-ocr](projects/invoice-ocr) |
| دستیار گزارش روزانه و وظایف | صبح کارهای باز را یادآوری می‌کند، عصر گزارش روزانه را می‌گیرد، در گوگل‌شیت آرشیو می‌کند و اول هر ماه گزارش عملکرد می‌دهد | [daily-report-assistant](projects/daily-report-assistant) |
| سامانه‌ی پاسخگویی اولیای مدرسه | چت‌بات تلگرامی مدرسه، احراز هویت اولیا، تیکت، اطلاعیه به پایه و کلاس، ثبت غیبت و گزارش هفتگی مدیر؛ بدون هوش مصنوعی و با PostgreSQL | [school-parent-support](projects/school-parent-support) |
| ایجنت طراح سامانه‌ی مدرسه | ایجنت Claude Code که سامانه‌ی بالا را مرحله‌به‌مرحله طراحی می‌کند، ورک‌فلوها را می‌سازد و بررسی می‌کند | [agent-builder](projects/school-parent-support/agent-builder) |

هر پوشه README خودش را دارد، با راهنمای نصب و راه‌اندازی.

## ویترین تعاملی

در [استودیو اتوماسیون](https://fatemeh1203.github.io/n8n-Automation-Workflows/) هر پروژه یک شبیه‌ساز در مرورگر دارد: ورودی را تغییر می‌دهید، اجرا می‌کنید و خروجی هر نود را مرحله‌به‌مرحله می‌بینید.

## دموی زنده‌ی طلافروشی

- سایت طلافروشی (قیمت لحظه‌ای، صدور فاکتور و ورود به پنل): https://n8n.aifardainstitute.ir/webhook/gold-shop
- فرم صدور فاکتور: https://n8n.aifardainstitute.ir/form/gold-invoice
- پنل مدیریت (با نام کاربری و رمز): https://n8n.aifardainstitute.ir/webhook/gold-admin

در پروژه‌های سطح بالاتر، بخشی از فایل‌های ورک‌فلو خصوصی نگه داشته می‌شود و این‌جا فقط مستندات و شماتیک آمده است.

## ساختار مخزن

- `projects/` همه‌ی پروژه‌ها، هر کدام در پوشه‌ی خودش.
- `index.html` و `docs/` صفحه‌ی «ثبت روزانه»‌ی آموزشگاه فردا هستند و به پروژه‌های بالا ربطی ندارند.
- سایت ویترین از شاخه‌ی `claude/Automation-Studio-website-22t2zg` روی GitHub Pages منتشر می‌شود؛ آن شاخه را پاک نکنید.

</div>

---

# n8n automations for Iranian businesses

Automation and AI-agent projects I've built with **n8n** and **Claude** for how the Iranian market actually works: Telegram bots, Google Sheets, the ZarinPal payment gateway, and data sources that are reachable from inside Iran.

By **Fatemeh Shams** · [LinkedIn](https://www.linkedin.com/in/fatemeh-shams/) · [GitHub](https://github.com/Fatemeh1203) · fatemeh.shams19@gmail.com

## Projects

| Project | What it does | Folder |
|---|---|---|
| Gold shop, level 1 | Telegram bot for live gold, coin and dollar prices, with price alerts checked every 10 minutes | [level1-live-gold-price-bot](projects/goldsmith/level1-live-gold-price-bot) |
| Gold shop, level 2 | Web invoice form: takes weight, karat and making fee, calculates from the live rate, issues the invoice and archives it in Google Sheets | [level2-invoice-and-fee-assistant](projects/goldsmith/level2-invoice-and-fee-assistant) |
| Gold shop, level 3 | Gold shop management system: inventory, buying and selling, customers, cheques, gold savings, workshop, multiple users and backups | [level3-gold-shop-management](projects/goldsmith/level3-gold-shop-management) |
| Gold shop, extensions | Bullion, barcode scanning, stocktaking, price-locked pro-forma invoices, reservations, a shop price board, coin serials and ZarinPal instalment payments | [level3-extensions](projects/goldsmith/level3-extensions) |
| AI invoice scanning | Send an invoice photo or file on Telegram; a vision model extracts the data and logs it to the purchase or sales tab in Google Sheets, with VAT calculated | [invoice-ocr](projects/invoice-ocr) |
| Daily report & task assistant | Sends open tasks in the morning, asks for a daily report in the evening, archives it in Google Sheets and sends a performance report on the 1st of each month | [daily-report-assistant](projects/daily-report-assistant) |
| School parent-support system | School Telegram chatbot, parent verification, tickets, announcements by grade and class, daily absences and a weekly report for the principal; no AI, runs on PostgreSQL | [school-parent-support](projects/school-parent-support) |
| School system agent builder | A Claude Code agent that designs the system above step by step, builds its workflows and audits them | [agent-builder](projects/school-parent-support/agent-builder) |

Each folder has its own README with setup instructions.

## Interactive showcase

In [Automation Studio](https://fatemeh1203.github.io/n8n-Automation-Workflows/) every project has an in-browser simulator: change the inputs, press run, and watch each node's output step by step.

## Gold shop live demo

- Gold shop site (live prices, invoicing and admin login): https://n8n.aifardainstitute.ir/webhook/gold-shop
- Invoice form: https://n8n.aifardainstitute.ir/form/gold-invoice
- Admin panel (username and password required): https://n8n.aifardainstitute.ir/webhook/gold-admin

For the higher-level projects, some workflow files are kept private; only the documentation and schematics are published here.

## Repository layout

- `projects/` holds every project in its own folder.
- `index.html` and `docs/` are the Amozeshgah Farda daily-log page and are unrelated to the projects above.
- The showcase site is published to GitHub Pages from the `claude/Automation-Studio-website-22t2zg` branch, so don't delete that branch.
