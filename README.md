# Automation Studio — استودیو اتوماسیون

**🔗 Live demo / دموی زنده: https://fatemeh1203.github.io/n8n-Automation-Workflows/**

By **Fatemeh Shams** — از **فاطمه شمس**
[LinkedIn](https://www.linkedin.com/in/fatemeh-shams/) · [fatemeh.shams19@gmail.com](mailto:fatemeh.shams19@gmail.com) · [GitHub](https://github.com/Fatemeh1203)

Interactive, bilingual (FA/EN) showcase of n8n automation workflows.
Every project ships with a browser-side simulator: change the inputs, press run,
and watch each node produce real JSON output step by step.

ویترین دوزبانه و تعاملی گردش‌کارهای n8n. هر پروژه یک شبیه‌ساز دارد: ورودی را
تغییر می‌دهید، دکمه‌ی اجرا را می‌زنید و خروجی هر نود مرحله‌به‌مرحله نمایش داده می‌شود.

## Projects / پروژه‌ها

| # | Project | n8n workflow |
|---|---------|--------------|
| 1 | Gold Invoice & Making-Fee Assistant | دستیار محاسبه‌ی فاکتور و اجرت |
| 2 | Live Gold, Coin & Currency Bot | ربات قیمت لحظه‌ای طلا، سکه و دلار |
| 3 | AI Receipt Scanner | اتوماسیون فاکتور خرید و فروش با هوش مصنوعی |
| 4 | Daily Report & Task Assistant | دستیار گزارش روزانه و وظایف |
| 5 | Gmail Triage Agent | Gmail Agent |

## How the demos work / دموها چطور کار می‌کنند

The site is fully static — no server, no backend, no API keys. The logic of each
workflow (Code nodes, IF/Switch branches, formulas) is reimplemented in
JavaScript, so pressing "run" produces genuine output rather than a canned
recording. Nodes whose condition is not met are greyed out, exactly as they would
be skipped in n8n.

سایت کاملاً استاتیک است — بدون سرور و بدون کلید API. منطق هر گردش‌کار (نودهای
Code، شرط‌های IF و Switch و فرمول‌ها) در جاوااسکریپت بازسازی شده، بنابراین خروجی
واقعاً محاسبه می‌شود و ضبط‌شده نیست. نودهایی که شرطشان برقرار نباشد کم‌رنگ
می‌شوند — دقیقاً مثل رفتار n8n.

## Features / امکانات

- Light and dark theme, remembered between visits — تم روشن و تاریک با ذخیره‌ی انتخاب کاربر
- An animated 3D galaxy on the home page — spiral arms, a glowing core, a starfield and a ringed planet — کهکشان سه‌بعدی متحرک در صفحه‌ی اصلی
- Every project page gets props from its own subject: a jeweller's counter (rings, coins, ingot, balance scale), a trading desk (candlesticks, banknotes), a scanning bench (receipts, scan beam, AI chip), a planner desk (calendar, clock, checklist), a mail room (envelopes, labels, inbox) — بک‌گراند سه‌بعدی متناسب با موضوع هر پروژه
- Pointer parallax: background layers move at different depths as the mouse moves (device tilt on mobile) — حرکت لایه‌های بک‌گراند با موس و شیب گوشی
- Persian / English switch with automatic text direction — تعویض فارسی و انگلیسی با جهت خودکار
- Contact page with LinkedIn, email and GitHub — صفحه‌ی ارتباط با لینکدین، ایمیل و گیت‌هاب

## Structure

```
index.html
assets/img/logo.svg        brand mark (inline SVG, no raster assets)
assets/css/main.css        design tokens, layout, canvas & invoice styling
assets/js/i18n.js          fa/en dictionary + language & theme state + number formatting
assets/js/backgrounds.js   per-page 3D scene generator
assets/js/projects.js      project catalogue; each node carries its own run()
assets/js/simulator.js     canvas rendering + step-by-step execution engine
assets/js/app.js           hash router, views, language toggle
```

## Local preview

Open `index.html` directly in a browser, or:

```bash
python3 -m http.server 8000
```

## Deployment — GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → pick this branch, folder `/ (root)`.
No domain purchase needed; the site is served from `*.github.io`, which is
reachable from Iran without a VPN.

استقرار: از بخش Settings → Pages این برنچ را انتخاب کنید. نیازی به خرید دامنه
نیست و آدرس `github.io` در ایران بدون فیلترشکن باز می‌شود.

## Adding a project

Append one object to `window.PROJECTS` in `assets/js/projects.js`:

```js
{
  id: "my-flow",
  icon: "🔧",
  workflow: "نام گردش‌کار در n8n",
  title: { fa: "...", en: "..." },
  tagline: { fa: "...", en: "..." },
  desc: { fa: "...", en: "..." },
  tags: ["Webhook", "Code"],
  inputs: [{ key: "x", type: "number", value: 10, label: { fa: "...", en: "..." } }],
  nodes: [{ name: "Webhook", type: "webhook", icon: "🌐",
            note: { fa: "...", en: "..." },
            when: (c) => true,          // optional — controls skipping
            run: (c) => ({ ok: true }) }],
  result: (c) => "<div class='invoice'>…</div>",  // optional summary card
}
```

No build step, no dependencies.
