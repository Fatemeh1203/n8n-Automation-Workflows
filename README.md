<img width="1254" height="1254" alt="ChatGPT Image Aug 5, 2026, 02_02_32 PM" src="https://github.com/user-attachments/assets/7b756063-0603-4ba6-a470-90dc4da074bc" />
<div dir="rtl">

# n8n-special-Arezou

مجموعه‌ای از پروژه‌های اتوماسیون **n8n** — بخشی از کاتالوگ «پروژه‌ی اتوماسیون پول‌ساز با n8n و کلود، مخصوص شرایط ایران».

پروژه‌ها بر اساس **بازار هدف** و **سطح (Level)** دسته‌بندی شده‌اند. هر سطح ادامه‌ی سطح قبل است.

## مسیر طلافروش (Goldsmith)

<div dir="ltr">

| Level | Project | توضیح |
|---|---|---|
| ۱ | [Live Gold/Coin/Dollar Price Bot](projects/goldsmith/level1-live-gold-price-bot) | ربات قیمت لحظه‌ای طلا، سکه و دلار + هشدار قیمت |
| ۲ | [Invoice & Making-Fee Assistant](projects/goldsmith/level2-invoice-and-fee-assistant) | دستیار صدور فاکتور و محاسبه‌ی اجرت (فرم وب) |
| ۳ | [Gold Shop Management System](projects/goldsmith/level3-gold-shop-management) | سیستم مدیریت طلافروشی: موجودی، خرید و فروش، مشتریان، سود واقعی و گزارش مالی |

</div>

### 🔗 لینک‌های زنده (دموی آنلاین)

<div dir="ltr">

| | Link | توضیح |
|---|---|---|
| 🌐 | [https://n8n.aifardainstitute.ir/webhook/gold-shop](https://n8n.aifardainstitute.ir/webhook/gold-shop) | سایت طلافروشی: **قیمت لحظه‌ای** (سطح ۱) + **صدور فاکتور** (سطح ۲) + دکمه‌ی **پنل مدیریت** (سطح ۳) در یک صفحه |
| 🧾 | [https://n8n.aifardainstitute.ir/form/gold-invoice](https://n8n.aifardainstitute.ir/form/gold-invoice) | فرم صدور فاکتور (سطح ۲) |
| 🖥️ | [https://n8n.aifardainstitute.ir/webhook/gold-admin](https://n8n.aifardainstitute.ir/webhook/gold-admin) | پنل مدیریت طلافروشی (سطح ۳) — با رمز ورود 🔐 (رمز را مدیر خودش می‌گذارد و عوض می‌کند)؛ آبشده، سکه، فروش اقساطی، اتیکت بارکددار، خروجی اکسل لحظه‌ای |
| 📗 | گوگل‌شیت زنده (خصوصی) | همه‌ی ثبت‌های سطح ۲ و ۳ با همان ستون‌های خروجی اکسل |
| 🤖 | ربات تلگرام قیمت (سطح ۱) | پیام `قیمت` به ربات → قیمت طلا، سکه و ارز |

</div>

> 🔒 در پروژه‌های سطح بالاتر، فقط **شماتیک و مستندات** عمومی است؛ فایل ورک‌فلو (`workflow.json`) خصوصی نگه داشته می‌شود.

</div>
