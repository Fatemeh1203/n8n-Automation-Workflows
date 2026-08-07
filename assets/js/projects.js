/* ============================================================
   Project catalogue
   Each entry mirrors a real workflow built in n8n. The `run`
   function of every node reimplements what that node actually
   does, so the browser demo produces genuine output.
   ============================================================ */

const R = Math.round;
const digits = (s) => String(s == null ? "" : s).replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
const num = (x) => {
  const n = Number(digits(String(x == null ? "" : x)).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const jitter = (base, pct) => R((base * (1 + (Math.random() * 2 - 1) * pct)) / 1000) * 1000;
const stamp = () => "INV-" + String(Date.now()).slice(-8);

/* Simulated market snapshot used by the gold demos (Toman). */
const MARKET = {
  GOLD18K: 7480000,
  GOLD24K: 9970000,
  SEKE_EMAMI: 892000000,
  SEKE_BAHAR: 845000000,
  SEKE_NIM: 462000000,
  SEKE_ROB: 268000000,
  USD: 186500,
  EUR: 201300,
  GBP: 236800,
};

window.PROJECTS = [
  /* ==========================================================
     1 — Gold invoice & making-fee assistant  (featured)
     ========================================================== */
  {
    id: "gold-invoice",
    icon: "🥇",
    featured: true,
    workflow: "دستیار محاسبه‌ی فاکتور و اجرت",
    title: { fa: "دستیار محاسبه‌ی اجرت و فاکتور طلا", en: "Gold Invoice & Making-Fee Assistant" },
    tagline: { fa: "فرم وب ← نرخ لحظه‌ای ← فاکتور رسمی", en: "Web form → live rate → formal invoice" },
    desc: {
      fa: "فروشنده وزن، عیار، درصد اجرت و سود را در یک فرم وب وارد می‌کند. اگر حالت «آنلاین» انتخاب شود نرخ لحظه‌ای طلای ۱۸ عیار از API گرفته می‌شود، وگرنه نرخ دستی به کار می‌رود. سپس فاکتور محاسبه و به شکل HTML رندر می‌شود، در Data Table و Google Sheets آرشیو می‌گردد، برای مشتری ایمیل می‌شود و روی صفحه نمایش می‌آید. هر شب ساعت ۲۱ هم گزارش تجمیعی فروش روز به تلگرام و ایمیل مالک ارسال می‌شود.",
      en: "The seller enters weight, karat, making-fee percentage and profit margin in a web form. In “online” mode the live 18K gold rate is fetched from an API, otherwise the manual rate is used. The invoice is then computed, rendered as HTML, archived in a Data Table and Google Sheets, emailed to the customer and displayed on screen. Every night at 21:00 an aggregated daily sales report is sent to the owner's Telegram and inbox.",
    },
    tags: ["Form Trigger", "HTTP Request", "Code", "Data Table", "Google Sheets", "Gmail"],
    inputs: [
      { key: "item", type: "text", value: { fa: "انگشتر", en: "Ring" }, label: { fa: "شرح کالا", en: "Item" } },
      { key: "customer", type: "text", value: { fa: "خانم رضایی", en: "Ms. Rezaei" }, label: { fa: "نام مشتری", en: "Customer" } },
      { key: "weight", type: "number", value: 4.25, step: 0.01, label: { fa: "وزن", en: "Weight" }, unit: { fa: "گرم", en: "g" } },
      {
        key: "karat", type: "select", value: "750",
        label: { fa: "عیار", en: "Karat" },
        options: [
          { value: "750", label: { fa: "۱۸ عیار (۷۵۰)", en: "18K (750)" } },
          { value: "875", label: { fa: "۲۱ عیار (۸۷۵)", en: "21K (875)" } },
          { value: "916", label: { fa: "۲۲ عیار (۹۱۶)", en: "22K (916)" } },
        ],
      },
      {
        key: "rateMode", type: "select", value: "online",
        label: { fa: "نرخ طلا", en: "Gold rate" },
        options: [
          { value: "online", label: { fa: "آنلاین (خودکار)", en: "Online (automatic)" } },
          { value: "manual", label: { fa: "دستی", en: "Manual" } },
        ],
      },
      { key: "rate18", type: "number", value: 7450000, step: 10000, label: { fa: "نرخ هر گرم ۱۸ عیار — حالت دستی", en: "18K rate per gram — manual mode" }, unit: { fa: "تومان", en: "Toman" } },
      { key: "feePct", type: "number", value: 7, step: 0.5, label: { fa: "درصد اجرت", en: "Making fee" }, unit: { fa: "٪", en: "%" } },
      { key: "profitPct", type: "number", value: 7, step: 0.5, label: { fa: "درصد سود", en: "Profit margin" }, unit: { fa: "٪", en: "%" } },
    ],
    nodes: [
      {
        name: "Invoice Form", type: "formTrigger", icon: "📝",
        note: { fa: "فرم عمومی صدور فاکتور", en: "Public invoice form" },
        run: (c) => ({ item: c.item, customer: c.customer, weight: num(c.weight), karat: num(c.karat), rateMode: c.rateMode, feePct: num(c.feePct), profitPct: num(c.profitPct) }),
      },
      {
        name: "Use Online Rate?", type: "if", icon: "🔀",
        note: { fa: "انتخاب مسیر نرخ آنلاین یا دستی", en: "Branch: online vs manual rate" },
        run: (c) => ({ condition: "rateMode contains 'online'", result: c.rateMode === "online", branch: c.rateMode === "online" ? "true" : "false" }),
      },
      {
        name: "Get Live Gold Rate", type: "httpRequest", icon: "🌐",
        note: { fa: "GET api.nerkh.io — نرخ لحظه‌ای", en: "GET api.nerkh.io — live rate" },
        when: (c) => c.rateMode === "online",
        run: (c) => {
          c.liveRate = jitter(MARKET.GOLD18K, 0.008);
          return { status: 200, data: { prices: { GOLD18K: { current: c.liveRate, unit: "TOMAN/g" } } } };
        },
      },
      {
        name: "Apply Online Rate", type: "set", icon: "🎯",
        note: { fa: "جایگزینی نرخ در جریان داده", en: "Write the rate into the data flow" },
        when: (c) => c.rateMode === "online",
        run: (c) => ({ rate18: c.liveRate }),
      },
      {
        name: "Compute & Render Invoice", type: "code", icon: "🧮",
        note: { fa: "محاسبه‌ی ارزش طلا، اجرت، سود و مبلغ نهایی", en: "Gold value, making fee, profit and total" },
        run: (c) => {
          const weight = num(c.weight);
          const karat = num(c.karat) || 750;
          const rate18 = c.rateMode === "online" ? c.liveRate : num(c.rate18);
          const feePct = num(c.feePct);
          const profitPct = num(c.profitPct);

          const goldValue = R(weight * rate18 * (karat / 750));
          const makingFee = R((goldValue * feePct) / 100);
          const subtotal = goldValue + makingFee;
          const profit = R((subtotal * profitPct) / 100);
          const total = subtotal + profit;

          c.invoice = { invoiceNo: stamp(), item: c.item, customer: c.customer, weight, karat, rate18, feePct, profitPct, goldValue, makingFee, profit, total };
          return c.invoice;
        },
      },
      {
        name: "Archive Invoice", type: "dataTable", icon: "🗄️",
        note: { fa: "درج ردیف در جدول invoices", en: "Insert a row into the invoices table" },
        run: (c) => ({ table: "invoices", operation: "insert", inserted: true, invoiceNo: c.invoice.invoiceNo }),
      },
      {
        name: "Append to Sheet", type: "googleSheets", icon: "📊",
        note: { fa: "افزودن به «آرشیو فاکتورهای طلا»", en: "Append to “Gold invoice archive”" },
        run: (c) => ({ spreadsheet: "آرشیو فاکتورهای طلا (invoices)", operation: "append", updatedRange: "A" + (12 + R(Math.random() * 40)), total: c.invoice.total }),
      },
      {
        name: "Email Invoice", type: "gmail", icon: "✉️",
        note: { fa: "ارسال فاکتور HTML به مشتری", en: "Send the HTML invoice to the customer" },
        run: (c) => ({ to: "customer@example.com", subject: "فاکتور خرید شما — " + c.invoice.invoiceNo, attachment: c.invoice.invoiceNo + ".html", sent: true }),
      },
      {
        name: "Show Invoice", type: "form", icon: "🧾",
        note: { fa: "نمایش فاکتور در صفحه‌ی پایانی فرم", en: "Render the invoice on the form's end page" },
        run: () => ({ respondWith: "showText", rendered: true }),
      },
    ],
    result: (c) => {
      const i = c.invoice;
      const cur = window.t("currency");
      const L = window.Lang.current === "fa";
      const row = (label, value, cls) =>
        `<div class="invoice-row ${cls || ""}"><span>${label}</span><span>${window.fmt(value)} ${cur}</span></div>`;
      return `
        <div class="invoice">
          <div class="invoice-head">
            <h4>${L ? "فاکتور فروش" : "Sales invoice"} — ${i.item}</h4>
            <span>${i.invoiceNo}</span>
          </div>
          <div class="invoice-rows">
            <div class="invoice-row"><span>${L ? "مشتری" : "Customer"}</span><span>${i.customer}</span></div>
            <div class="invoice-row"><span>${L ? "وزن / عیار" : "Weight / karat"}</span><span>${window.fmt(i.weight, 2)} ${L ? "گرم" : "g"} · ${i.karat}</span></div>
            <div class="invoice-row"><span>${L ? "نرخ هر گرم ۱۸ عیار" : "18K rate per gram"}</span><span>${window.fmt(i.rate18)} ${cur}</span></div>
            ${row(L ? "ارزش طلا" : "Gold value", i.goldValue)}
            ${row((L ? "اجرت ساخت" : "Making fee") + ` (${window.fmt(i.feePct, 1)}٪)`, i.makingFee)}
            ${row((L ? "سود فروشنده" : "Seller profit") + ` (${window.fmt(i.profitPct, 1)}٪)`, i.profit)}
            ${row(L ? "مبلغ نهایی" : "Total payable", i.total, "total")}
          </div>
        </div>`;
    },
  },

  /* ==========================================================
     2 — Live gold / coin / currency price bot
     ========================================================== */
  {
    id: "price-bot",
    icon: "📈",
    workflow: "ربات قیمت لحظه‌ای طلا، سکه و دلار",
    title: { fa: "ربات قیمت لحظه‌ای طلا، سکه و دلار", en: "Live Gold, Coin & Currency Bot" },
    tagline: { fa: "پاسخ فوری + هشدار قیمت خودکار", en: "Instant replies + automatic price alerts" },
    desc: {
      fa: "کاربر در تلگرام پیام می‌دهد و یک نود Switch دستور را تشخیص می‌دهد: «قیمت» جدول لحظه‌ای طلا، سکه و ارز را برمی‌گرداند و «هشدار …» یک هشدار قیمت در Data Table ثبت می‌کند. مستقل از این مسیر، هر ۱۰ دقیقه یک زمان‌بند قیمت‌ها را می‌گیرد، هشدارهای فعال را بررسی می‌کند و به‌محض رسیدن قیمت به عدد هدف، پیام هشدار می‌فرستد و آن هشدار را حذف می‌کند.",
      en: "A user messages the Telegram bot and a Switch node routes the command: “قیمت” returns a live table of gold, coin and currency prices, while “هشدار …” stores a price alert in a Data Table. Separately, a scheduler polls prices every 10 minutes, evaluates active alerts and — the moment a target is hit — sends the alert and deletes it.",
    },
    tags: ["Telegram Trigger", "Switch", "HTTP Request", "Code", "Data Table"],
    inputs: [
      {
        key: "command", type: "text",
        value: { fa: "قیمت", en: "قیمت" },
        label: { fa: "پیام کاربر در تلگرام", en: "User's Telegram message" },
        hint: { fa: "نمونه‌ها: «قیمت» · «هشدار دلار ۲۰۰۰۰۰» · «سلام»", en: "Try: «قیمت» · «هشدار دلار 200000» · anything else" },
      },
    ],
    nodes: [
      {
        name: "Telegram Trigger", type: "telegramTrigger", icon: "💬",
        note: { fa: "دریافت پیام کاربر", en: "Receive the user's message" },
        run: (c) => {
          const text = String(window.tx(c.command) || "");
          c.text = text;
          c.route = /قیمت|price|نرخ/i.test(text) ? "قیمت" : /هشدار|alert/i.test(text) ? "هشدار" : "راهنما";
          return { message: { chat: { id: 128455901 }, text } };
        },
      },
      {
        name: "Route Command", type: "switch", icon: "🔀",
        note: { fa: "سه خروجی: قیمت / هشدار / راهنما", en: "Three outputs: price / alert / help" },
        run: (c) => ({ matchedOutput: c.route, outputs: ["قیمت", "هشدار", "راهنما"] }),
      },
      {
        name: "Get Gold Prices", type: "httpRequest", icon: "🥇",
        note: { fa: "نرخ طلا و سکه", en: "Gold and coin rates" },
        when: (c) => c.route === "قیمت",
        run: (c) => {
          c.gold = { GOLD18K: jitter(MARKET.GOLD18K, 0.006), GOLD24K: jitter(MARKET.GOLD24K, 0.006), SEKE_EMAMI: jitter(MARKET.SEKE_EMAMI, 0.006), SEKE_NIM: jitter(MARKET.SEKE_NIM, 0.006) };
          return { status: 200, data: { prices: c.gold } };
        },
      },
      {
        name: "Get Currency Prices", type: "httpRequest", icon: "💵",
        note: { fa: "نرخ دلار، یورو و پوند", en: "USD, EUR and GBP rates" },
        when: (c) => c.route === "قیمت",
        run: (c) => {
          c.cur = { USD: jitter(MARKET.USD, 0.004), EUR: jitter(MARKET.EUR, 0.004), GBP: jitter(MARKET.GBP, 0.004) };
          return { status: 200, data: { prices: c.cur } };
        },
      },
      {
        name: "Build Price Message", type: "code", icon: "🧾",
        note: { fa: "ساخت متن جدول قیمت‌ها", en: "Compose the price table message" },
        when: (c) => c.route === "قیمت",
        run: (c) => {
          const f = (n) => Number(n).toLocaleString("fa-IR");
          c.reply =
            "📊 قیمت لحظه‌ای بازار (تومان)\n\n" +
            `🟡 طلای ۱۸ عیار (گرم): ${f(c.gold.GOLD18K)}\n` +
            `🟡 طلای ۲۴ عیار (گرم): ${f(c.gold.GOLD24K)}\n` +
            `🪙 سکه امامی: ${f(c.gold.SEKE_EMAMI)}\n` +
            `🪙 نیم سکه: ${f(c.gold.SEKE_NIM)}\n` +
            `💵 دلار آمریکا: ${f(c.cur.USD)}\n` +
            `💶 یورو: ${f(c.cur.EUR)}\n` +
            `💷 پوند: ${f(c.cur.GBP)}\n\n` +
            "ℹ️ برای ثبت هشدار بنویسید: هشدار دلار 200000";
          return { message: c.reply, chatId: "128455901" };
        },
      },
      {
        name: "Parse Alert Command", type: "code", icon: "🎯",
        note: { fa: "استخراج دارایی، عدد هدف و جهت", en: "Extract asset, target and direction" },
        when: (c) => c.route === "هشدار",
        run: (c) => {
          const text = c.text;
          const nums = (text.match(/[\d۰-۹]{2,}/g) || []).map((s) => Number(digits(s))).filter((n) => n > 0);
          const target = nums.length ? Math.max.apply(null, nums) : 0;
          const table = [
            { sym: "SEKE_NIM", label: "نیم سکه", kw: ["نیم"] },
            { sym: "SEKE_EMAMI", label: "سکه امامی", kw: ["امامی", "تمام", "سکه"] },
            { sym: "GOLD18K", label: "طلای ۱۸ عیار", kw: ["طلا", "18", "۱۸"] },
            { sym: "EUR", label: "یورو", kw: ["یورو"] },
            { sym: "USD", label: "دلار", kw: ["دلار"] },
          ];
          const found = table.find((a) => a.kw.some((k) => text.includes(k))) || { sym: "USD", label: "دلار" };
          const direction = /پایین|کمتر|زیر/.test(text) ? "below" : "above";
          c.alert = { asset: found.sym, assetLabel: found.label, target, direction, valid: target > 0 };
          c.reply = `✅ هشدار قیمت ثبت شد.\n\nدارایی: ${found.label}\nقیمت هدف: ${target.toLocaleString("fa-IR")} تومان\nجهت: ${direction === "above" ? "رسیدن به بالاتر از این عدد" : "افت به پایین‌تر از این عدد"}`;
          return c.alert;
        },
      },
      {
        name: "Save Alert", type: "dataTable", icon: "🗄️",
        note: { fa: "ثبت در جدول price_alerts", en: "Store in the price_alerts table" },
        when: (c) => c.route === "هشدار",
        run: (c) => ({ table: "price_alerts", operation: "insert", inserted: c.alert.valid, asset: c.alert.asset, target: c.alert.target }),
      },
      {
        name: "Send Help", type: "telegram", icon: "❓",
        note: { fa: "ارسال راهنمای دستورها", en: "Send the command guide" },
        when: (c) => c.route === "راهنما",
        run: (c) => {
          c.reply = "👋 به ربات قیمت لحظه‌ای طلا، سکه و دلار خوش آمدید.\n\n📌 دستورها:\n• برای دیدن قیمت‌ها بنویسید: قیمت\n• برای ثبت هشدار بنویسید: هشدار سکه 190000000\n• برای هشدار نزولی بنویسید: هشدار دلار 180000 پایین";
          return { sent: true, chatId: "128455901" };
        },
      },
      {
        name: "Reply to User", type: "telegram", icon: "📤",
        note: { fa: "ارسال پاسخ نهایی به کاربر", en: "Send the final reply to the user" },
        run: (c) => ({ chatId: "128455901", text: c.reply, sent: true }),
      },
    ],
    result: (c) => `<div class="invoice"><div class="invoice-head"><h4>${window.Lang.current === "fa" ? "پیام ارسال‌شده در تلگرام" : "Message delivered on Telegram"}</h4><span>@price_bot</span></div><pre style="direction:rtl;text-align:right;white-space:pre-wrap;font-size:.88rem;line-height:2;margin-top:.8rem">${c.reply}</pre></div>`,
  },

  /* ==========================================================
     3 — AI receipt scanner → Google Sheets
     ========================================================== */
  {
    id: "invoice-ai",
    icon: "🤖",
    workflow: "اتوماسیون فاکتور خرید و فروش با هوش مصنوعی",
    title: { fa: "اسکن فاکتور خرید و فروش با هوش مصنوعی", en: "AI Receipt Scanner for Purchases & Sales" },
    tagline: { fa: "عکس فاکتور در تلگرام ← ردیف حسابداری", en: "Photo in Telegram → accounting row" },
    desc: {
      fa: "کاربر عکس فاکتور را با کپشن «خرید» یا «فروش» به تلگرام می‌فرستد. نوع سند از روی کپشن تشخیص داده می‌شود، تصویر دانلود و به یک مدل بینایی سازگار با OpenAI سپرده می‌شود تا فروشنده، تاریخ، مبلغ و مالیات استخراج شود. خروجی به ستون‌های دفتر حسابداری نگاشت و در گوگل شیت ثبت می‌شود و پیام تأیید برمی‌گردد.",
      en: "The user sends a photo of a receipt to Telegram captioned “خرید” (purchase) or “فروش” (sale). The document type is detected from the caption, the image is downloaded and passed to an OpenAI-compatible vision model that extracts vendor, date, amount and tax. The result is mapped to the accounting ledger columns, appended to Google Sheets, and a confirmation is sent back.",
    },
    tags: ["Telegram Trigger", "Switch", "AI Vision", "Code", "Google Sheets"],
    inputs: [
      {
        key: "caption", type: "select", value: "خرید",
        label: { fa: "کپشن عکس", en: "Photo caption" },
        options: [
          { value: "خرید", label: { fa: "خرید", en: "خرید (purchase)" } },
          { value: "فروش", label: { fa: "فروش", en: "فروش (sale)" } },
        ],
      },
      {
        key: "receipt", type: "textarea",
        value: { fa: "طلا و جواهر پارسیان\nتاریخ: 1405/05/12\nشرح: زنجیر ۱۸ عیار\nمبلغ کل: 48,750,000 ریال\nمالیات بر ارزش افزوده: 4,875,000 ریال", en: "طلا و جواهر پارسیان\nتاریخ: 1405/05/12\nشرح: زنجیر ۱۸ عیار\nمبلغ کل: 48,750,000 ریال\nمالیات بر ارزش افزوده: 4,875,000 ریال" },
        label: { fa: "متن روی فاکتور (شبیه‌سازی OCR)", en: "Text on the receipt (OCR stand-in)" },
        hint: { fa: "در گردش‌کار واقعی، این متن از روی عکس خوانده می‌شود", en: "In the real workflow this text is read from the photo" },
      },
    ],
    nodes: [
      {
        name: "Telegram Trigger", type: "telegramTrigger", icon: "📷",
        note: { fa: "دریافت عکس فاکتور", en: "Receive the receipt photo" },
        run: (c) => ({ message: { photo: [{ file_id: "AgACAgQAAxk…", width: 1280 }], caption: c.caption, chat: { id: 128455901 } } }),
      },
      {
        name: "Detect Type", type: "switch", icon: "🔀",
        note: { fa: "تشخیص خرید یا فروش از کپشن", en: "Purchase or sale, from the caption" },
        run: (c) => {
          c.kind = c.caption === "فروش" ? "sale" : "purchase";
          return { caption: c.caption, docType: c.kind, sheet: c.kind === "sale" ? "فروش" : "خرید" };
        },
      },
      {
        name: "Download Image", type: "telegram", icon: "⬇️",
        note: { fa: "دریافت فایل باینری از تلگرام", en: "Fetch the binary file from Telegram" },
        run: () => ({ binary: { data: { fileName: "receipt.jpg", mimeType: "image/jpeg", fileSize: "182 kB" } } }),
      },
      {
        name: "AI Extract Fields", type: "openAi", icon: "🧠",
        note: { fa: "مدل بینایی سازگار با OpenAI", en: "OpenAI-compatible vision model" },
        run: (c) => {
          const text = window.tx(c.receipt) || "";
          const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
          const amounts = (text.match(/[\d۰-۹][\d۰-۹,،٬]{3,}/g) || []).map((s) => num(s.replace(/[,،٬]/g, ""))).filter((n) => n > 0);
          const sorted = amounts.slice().sort((a, b) => b - a);
          const dateMatch = text.match(/1[34]\d{2}[\/\-]\d{1,2}[\/\-]\d{1,2}/);
          const descLine = lines.find((l) => /شرح|کالا|item/i.test(l)) || lines[2] || "—";

          c.extract = {
            vendor: lines[0] || "—",
            date: dateMatch ? dateMatch[0] : "—",
            description: descLine.replace(/^.*?:\s*/, ""),
            totalRial: sorted[0] || 0,
            taxRial: sorted[1] || 0,
            confidence: 0.96,
          };
          return c.extract;
        },
      },
      {
        name: "Map to Ledger", type: "code", icon: "🧮",
        note: { fa: "تبدیل ریال به تومان و ساخت ردیف دفتر", en: "Rial → Toman and ledger row assembly" },
        run: (c) => {
          const e = c.extract;
          const total = R(e.totalRial / 10);
          const tax = R(e.taxRial / 10);
          c.row = {
            docType: c.kind === "sale" ? "فروش" : "خرید",
            vendor: e.vendor,
            date: e.date,
            description: e.description,
            netToman: total - tax,
            taxToman: tax,
            totalToman: total,
            sign: c.kind === "sale" ? "+" : "-",
          };
          return c.row;
        },
      },
      {
        name: "Append to Sheet", type: "googleSheets", icon: "📊",
        note: { fa: "ثبت در دفتر حسابداری", en: "Append to the accounting ledger" },
        run: (c) => ({ spreadsheet: "دفتر حسابداری", sheetName: c.row.docType, operation: "append", updatedRange: "A" + (58 + R(Math.random() * 30)) }),
      },
      {
        name: "Confirm to User", type: "telegram", icon: "✅",
        note: { fa: "ارسال پیام تأیید ثبت", en: "Send the confirmation message" },
        run: (c) => ({ chatId: "128455901", text: `✅ ${c.row.docType} ثبت شد — ${c.row.totalToman.toLocaleString("fa-IR")} تومان`, sent: true }),
      },
    ],
    result: (c) => {
      const r = c.row;
      const cur = window.t("currency");
      const L = window.Lang.current === "fa";
      return `
        <div class="invoice">
          <div class="invoice-head"><h4>${L ? "ردیف ثبت‌شده در دفتر" : "Row written to the ledger"}</h4><span>${r.docType}</span></div>
          <div class="invoice-rows">
            <div class="invoice-row"><span>${L ? "طرف حساب" : "Counterparty"}</span><span>${r.vendor}</span></div>
            <div class="invoice-row"><span>${L ? "تاریخ" : "Date"}</span><span>${r.date}</span></div>
            <div class="invoice-row"><span>${L ? "شرح" : "Description"}</span><span>${r.description}</span></div>
            <div class="invoice-row"><span>${L ? "مبلغ خالص" : "Net amount"}</span><span>${window.fmt(r.netToman)} ${cur}</span></div>
            <div class="invoice-row"><span>${L ? "مالیات" : "Tax"}</span><span>${window.fmt(r.taxToman)} ${cur}</span></div>
            <div class="invoice-row total"><span>${L ? "جمع سند" : "Document total"}</span><span>${r.sign} ${window.fmt(r.totalToman)} ${cur}</span></div>
          </div>
        </div>`;
    },
  },

  /* ==========================================================
     4 — Daily report & task assistant
     ========================================================== */
  {
    id: "daily-report",
    icon: "🗓️",
    workflow: "دستیار گزارش روزانه و وظایف — Daily Report & Task Assistant",
    title: { fa: "دستیار گزارش روزانه و وظایف", en: "Daily Report & Task Assistant" },
    tagline: { fa: "یادآوری صبح، گزارش عصر، جمع‌بندی ماه", en: "Morning reminder, evening report, monthly roll-up" },
    desc: {
      fa: "هر صبح فهرست کارهای امروز از گوگل شیت خوانده و به تلگرام فرستاده می‌شود. عصر گزارش روزانه از کاربر گرفته می‌شود؛ یک نود Normalize متن ورودی را استاندارد می‌کند تا منبع ورودی (تلگرام، فرم وب، وبهوک یا ایمیل) قابل تعویض باشد، سپس گزارش در شیت آرشیو می‌شود. ابتدای هر ماه هم گزارش تجمیعی عملکرد ساخته و ارسال می‌گردد.",
      en: "Each morning today's task list is read from Google Sheets and pushed to Telegram. In the evening the user's daily report is collected; a Normalize node standardises the incoming text so the input source (Telegram, web form, webhook or email) stays swappable, and the report is archived to the sheet. At the start of every month an aggregated performance report is generated and sent.",
    },
    tags: ["Schedule Trigger", "Google Sheets", "Telegram", "Code", "Merge"],
    inputs: [
      {
        key: "tasks", type: "textarea",
        value: { fa: "تماس با تأمین‌کننده\nبررسی موجودی ویترین\nپاسخ به پیام‌های اینستاگرام", en: "Call the supplier\nCheck showcase stock\nAnswer Instagram messages" },
        label: { fa: "کارهای امروز (هر خط یک کار)", en: "Today's tasks (one per line)" },
      },
      {
        key: "report", type: "textarea",
        value: { fa: "تماس با تأمین‌کننده انجام شد. دو قلم جدید سفارش داده شد.\nموجودی ویترین بررسی شد.", en: "Called the supplier, ordered two new items.\nShowcase stock checked." },
        label: { fa: "گزارش عصرگاهی کاربر", en: "User's evening report" },
      },
    ],
    nodes: [
      {
        name: "Morning 08:00", type: "scheduleTrigger", icon: "⏰",
        note: { fa: "زمان‌بند صبحگاهی", en: "Morning scheduler" },
        run: () => ({ triggerAtHour: 8, timezone: "Asia/Tehran", firedAt: new Date().toISOString() }),
      },
      {
        name: "Get Tasks", type: "googleSheets", icon: "📋",
        note: { fa: "خواندن کارهای امروز از شیت", en: "Read today's tasks from the sheet" },
        run: (c) => {
          c.tasksList = String(window.tx(c.tasks) || "").split("\n").map((s) => s.trim()).filter(Boolean);
          return { rows: c.tasksList.length, tasks: c.tasksList };
        },
      },
      {
        name: "Build Reminder", type: "code", icon: "🧾",
        note: { fa: "ساخت متن یادآوری", en: "Compose the reminder text" },
        run: (c) => {
          c.reminder = "🌅 کارهای امروز:\n\n" + c.tasksList.map((t, i) => `${i + 1}. ${t}`).join("\n");
          return { text: c.reminder, count: c.tasksList.length };
        },
      },
      {
        name: "Send Reminder", type: "telegram", icon: "📤",
        note: { fa: "ارسال یادآوری به کاربر", en: "Push the reminder to the user" },
        run: () => ({ chatId: "128455901", sent: true }),
      },
      {
        name: "Evening 20:00", type: "scheduleTrigger", icon: "🌙",
        note: { fa: "درخواست گزارش روزانه", en: "Ask for the daily report" },
        run: () => ({ triggerAtHour: 20, prompt: "گزارش امروزت را بفرست 🙏" }),
      },
      {
        name: "Normalize Input", type: "code", icon: "🧩",
        note: { fa: "استانداردسازی ورودی (تلگرام/فرم/وبهوک)", en: "Standardise input (Telegram/form/webhook)" },
        run: (c) => {
          const lines = String(window.tx(c.report) || "").split("\n").map((s) => s.trim()).filter(Boolean);
          c.normalized = { source: "telegram", userId: "128455901", lines, charCount: lines.join(" ").length, day: new Date().toLocaleDateString("en-CA") };
          return c.normalized;
        },
      },
      {
        name: "Archive Report", type: "googleSheets", icon: "🗄️",
        note: { fa: "آرشیو گزارش در شیت", en: "Archive the report in the sheet" },
        run: (c) => {
          const done = c.tasksList.filter((t) => c.normalized.lines.some((l) => l.includes(t.split(" ")[0]))).length;
          c.summary = { total: c.tasksList.length, done, rate: c.tasksList.length ? R((done / c.tasksList.length) * 100) : 0 };
          return { operation: "append", day: c.normalized.day, lines: c.normalized.lines.length, doneTasks: done };
        },
      },
      {
        name: "Confirm", type: "telegram", icon: "✅",
        note: { fa: "تأیید ثبت گزارش", en: "Confirm the report was stored" },
        run: (c) => ({ chatId: "128455901", text: `✅ گزارش امروز ثبت شد — ${c.summary.done} از ${c.summary.total} کار انجام شد`, sent: true }),
      },
    ],
    result: (c) => {
      const L = window.Lang.current === "fa";
      const s = c.summary;
      return `
        <div class="invoice">
          <div class="invoice-head"><h4>${L ? "جمع‌بندی روز" : "Day summary"}</h4><span>${c.normalized.day}</span></div>
          <div class="invoice-rows">
            <div class="invoice-row"><span>${L ? "کارهای برنامه‌ریزی‌شده" : "Planned tasks"}</span><span>${window.fmt(s.total)}</span></div>
            <div class="invoice-row"><span>${L ? "کارهای انجام‌شده" : "Completed"}</span><span>${window.fmt(s.done)}</span></div>
            <div class="invoice-row"><span>${L ? "خطوط گزارش" : "Report lines"}</span><span>${window.fmt(c.normalized.lines.length)}</span></div>
            <div class="invoice-row total"><span>${L ? "درصد تحقق" : "Completion rate"}</span><span>${window.fmt(s.rate)}٪</span></div>
          </div>
        </div>`;
    },
  },

  /* ==========================================================
     5 — Gmail triage agent
     ========================================================== */
  {
    id: "gmail-agent",
    icon: "✉️",
    workflow: "Gmail Agent",
    title: { fa: "دستیار هوشمند ایمیل", en: "Gmail Triage Agent" },
    tagline: { fa: "دسته‌بندی، پیش‌نویس پاسخ، برچسب‌گذاری", en: "Classify, draft a reply, label" },
    desc: {
      fa: "هر ایمیل تازه با یک AI Agent دسته‌بندی می‌شود (سفارش، پشتیبانی، تبلیغ). بر اساس دسته، پیش‌نویس پاسخ ساخته و در جیمیل ذخیره می‌شود، برچسب مناسب می‌خورد و برای موارد فوری اعلان تلگرام فرستاده می‌شود. هیچ ایمیلی بدون تأیید انسان ارسال نمی‌شود — خروجی همیشه پیش‌نویس است.",
      en: "Every new email is classified by an AI Agent (order, support, promotion). Based on the category a reply draft is created and saved in Gmail, the right label is applied, and urgent cases trigger a Telegram notification. Nothing is sent without human approval — the output is always a draft.",
    },
    tags: ["Gmail Trigger", "AI Agent", "Switch", "Gmail Draft", "Telegram"],
    inputs: [
      { key: "from", type: "text", value: { fa: "sara.k@example.com", en: "sara.k@example.com" }, label: { fa: "فرستنده", en: "From" } },
      { key: "subject", type: "text", value: { fa: "استعلام قیمت دستبند", en: "Bracelet price enquiry" }, label: { fa: "موضوع", en: "Subject" } },
      {
        key: "body", type: "textarea",
        value: { fa: "سلام، قیمت دستبند طلای ۱۸ عیار ۱۲ گرمی چقدر است؟ لطفاً فاکتور بفرستید.", en: "Hello, how much is a 12 g 18K gold bracelet? Please send an invoice." },
        label: { fa: "متن ایمیل", en: "Email body" },
      },
    ],
    nodes: [
      {
        name: "Gmail Trigger", type: "gmailTrigger", icon: "📥",
        note: { fa: "دریافت ایمیل جدید", en: "New email received" },
        run: (c) => ({ from: window.tx(c.from), subject: window.tx(c.subject), snippet: String(window.tx(c.body)).slice(0, 60) + "…", labelIds: ["INBOX", "UNREAD"] }),
      },
      {
        name: "AI Agent", type: "agent", icon: "🧠",
        note: { fa: "دسته‌بندی و تولید پیش‌نویس", en: "Classify and draft" },
        run: (c) => {
          const text = (window.tx(c.subject) + " " + window.tx(c.body)).toLowerCase();
          let category = "general", urgency = "normal";
          if (/قیمت|فاکتور|سفارش|خرید|price|invoice|order/.test(text)) category = "sales";
          if (/شکایت|مشکل|خراب|عودت|complaint|broken|refund/.test(text)) { category = "support"; urgency = "high"; }
          if (/تخفیف|تبلیغ|newsletter|promo|unsubscribe/.test(text)) category = "promotion";

          const drafts = {
            sales: "سلام و وقت بخیر،\nممنون از پیام شما. برای وزن و عیار موردنظرتان فاکتور دقیق را همین امروز خدمتتان ارسال می‌کنیم. اگر نرخ روز تغییر کند، فاکتور تا ۲۴ ساعت معتبر است.",
            support: "سلام،\nبابت مشکل پیش‌آمده متأسفیم. پرونده‌ی شما ثبت شد و همکار ما تا حداکثر ۲۴ ساعت آینده با شما تماس می‌گیرد.",
            promotion: "",
            general: "سلام،\nپیام شما دریافت شد و در اولین فرصت پاسخ داده می‌شود.",
          };
          c.triage = { category, urgency, needsReply: category !== "promotion", draft: drafts[category], label: { sales: "فروش", support: "پشتیبانی", promotion: "تبلیغات", general: "عمومی" }[category] };
          return c.triage;
        },
      },
      {
        name: "Route by Category", type: "switch", icon: "🔀",
        note: { fa: "مسیر بر اساس دسته", en: "Branch on the category" },
        run: (c) => ({ matchedOutput: c.triage.category, needsReply: c.triage.needsReply }),
      },
      {
        name: "Create Draft", type: "gmail", icon: "📝",
        note: { fa: "ذخیره‌ی پیش‌نویس پاسخ", en: "Save the reply draft" },
        when: (c) => c.triage.needsReply,
        run: (c) => ({ operation: "createDraft", to: window.tx(c.from), subject: "پاسخ: " + window.tx(c.subject), draftId: "r-" + String(Date.now()).slice(-6) }),
      },
      {
        name: "Apply Label", type: "gmail", icon: "🏷️",
        note: { fa: "برچسب‌گذاری ایمیل", en: "Label the message" },
        run: (c) => ({ operation: "addLabels", labels: [c.triage.label], removed: ["UNREAD"] }),
      },
      {
        name: "Notify if Urgent", type: "telegram", icon: "🔔",
        note: { fa: "اعلان برای موارد فوری", en: "Notify on urgent cases" },
        when: (c) => c.triage.urgency === "high",
        run: (c) => ({ chatId: "128455901", text: `🔔 ایمیل فوری از ${window.tx(c.from)} — ${window.tx(c.subject)}`, sent: true }),
      },
    ],
    result: (c) => {
      const L = window.Lang.current === "fa";
      const tri = c.triage;
      const catFa = { sales: "فروش", support: "پشتیبانی", promotion: "تبلیغات", general: "عمومی" };
      return `
        <div class="invoice">
          <div class="invoice-head"><h4>${L ? "نتیجه‌ی دسته‌بندی" : "Triage result"}</h4><span>${tri.category}</span></div>
          <div class="invoice-rows">
            <div class="invoice-row"><span>${L ? "دسته" : "Category"}</span><span>${L ? catFa[tri.category] : tri.category}</span></div>
            <div class="invoice-row"><span>${L ? "فوریت" : "Urgency"}</span><span>${tri.urgency}</span></div>
            <div class="invoice-row"><span>${L ? "برچسب اعمال‌شده" : "Label applied"}</span><span>${tri.label}</span></div>
          </div>
          ${tri.draft ? `<div style="margin-top:1rem"><div style="font-size:.8rem;color:var(--text-mute);margin-bottom:.4rem">${L ? "پیش‌نویس ذخیره‌شده در جیمیل" : "Draft saved in Gmail"}</div><pre style="direction:rtl;text-align:right;white-space:pre-wrap;font-size:.86rem;line-height:2">${tri.draft}</pre></div>` : ""}
        </div>`;
    },
  },
];
