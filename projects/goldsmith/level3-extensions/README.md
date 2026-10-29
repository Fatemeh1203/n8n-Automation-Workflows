# امکانات تکمیلی پروژه‌ی طلافروشی (n8n — سطح سه)

کد امکانات تازه‌ی ورک‌فلو «سطح سه (پروژه طلافروش)» روی n8n-server:
شمش، اسکن بارکد با دوربین، انبارگردانی، پیش‌فاکتور با قیمت قفل، رزرو، هشدار قیمت برای مشتری،
تابلوی قیمت مغازه، احراز هویت (کد ملی) بالای سقف، سریال سکه و شمش، پرداخت آنلاین اقساط با زرین‌پال.

> این پوشه فقط نسخه‌ی پروژه‌ی اصلی n8n است و به اپ (PWA) ربطی ندارد.
> در این نسخه رمز پیش‌فرض و شناسه‌ی شیت با `CHANGE_ME_ADMIN_KEY` و `YOUR_SHEET_ID` جایگزین شده‌اند.
> برای چسباندن در n8n از نسخه‌ی مخزن خصوصی `gold-shop-app` استفاده کنید.

## ساختار
- `main-project/vendor/` — نسخه‌ی دقیق کدهای فعلیِ روی سرور (نقطه‌ی برگشت)
- `main-project/src/` — کد نودهای تازه (تابلو، هشدار قیمت، پرداخت زرین‌پال)
- `backend/ext_patch.py` و `backend/src/ext/` — منطق مشترک امکانات تکمیلی که به «Business Logic» اضافه می‌شود
- `backend/src/shared/` — توابع مشترک (قیمت بازار، تابلو، هشدار، پرداخت)
- `web/ext.js` — تب‌های تازه‌ی پنل مدیریت و اسکنر دوربین
- `main-project/build/` — خروجی نهایی برای چسباندن در نودها

## ساخت و تست
```
python3 main-project/build_main.py
python3 main-project/build_nodes.py
node main-project/test/sim-main.js
node main-project/test/sim-nodes.js
NODE_PATH=<playwright-core> CHROME=<chromium> node main-project/test/e2e-main.js
```

## وضعیت روی سرور
وبهوک‌های تازه: `gold-board`، `gold-pay`، `gold-pay-cb`، `gold-admin-ext` و زمان‌بندی «Price Alerts 30m».
همه در پیش‌نویس (draft) هستند. تا وقتی نسخه‌ی تازه منتشر نشود، نسخه‌ی فعال روی سرور (`93d09a38`) تغییری نمی‌کند.
