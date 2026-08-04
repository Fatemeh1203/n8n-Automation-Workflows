import {
  workflow,
  node,
  trigger,
  newCredential,
  expr,
  ifElse,
  sticky,
} from '@n8n/workflow-sdk';

const COMPUTE_JS = `
const form = $('Invoice Form').first().json;
const num = (x) => { const n = Number(String(x == null ? '' : x).replace(/[^0-9.\\-]/g, '')); return Number.isFinite(n) ? n : 0; };
const weight = num(form.weight);
const karat = num(form.karat) || 750;
const rate18 = num($json.rate18 != null ? $json.rate18 : form.rate18);
const feePct = num(form.feePct);
const profitPct = num(form.profitPct);
const goldValue = Math.round(weight * rate18 * (karat / 750));
const makingFee = Math.round(goldValue * feePct / 100);
const subtotal = goldValue + makingFee;
const profit = Math.round(subtotal * profitPct / 100);
const total = subtotal + profit;
const now = new Date();
const day = now.toLocaleDateString("en-CA", { timeZone: "Asia/Tehran" });
const dateFa = now.toLocaleDateString("fa-IR", { timeZone: "Asia/Tehran" });
const invoiceNo = "INV-" + now.getTime().toString().slice(-8);
const customer = form.customer || "—";
const item = form.item || "—";
const phone = form.phone || "—";
const email = form.email || "";
const money = (n) => Number(n || 0).toLocaleString("fa-IR");
const SHOP = { name: "طلا و جواهر شما", phone: "021-00000000", address: "آدرس فروشگاه شما", logoUrl: "", ownerEmail: "you@example.com", color: "#b8860b" };
const logo = SHOP.logoUrl ? ("<img src='" + SHOP.logoUrl + "' alt='logo' style='height:56px;border-radius:8px'>") : ("<div style='height:56px;width:56px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-size:26px'>\u{1F947}</div>");
const H = [];
H.push("<div style='direction:rtl;font-family:Tahoma,Arial,sans-serif;max-width:560px;margin:16px auto;border:1px solid #eee;border-radius:14px;overflow:hidden;box-shadow:0 6px 22px rgba(0,0,0,.10)'>");
H.push("<div style='background:linear-gradient(135deg," + SHOP.color + ",#7a5901);color:#fff;padding:18px 20px;display:flex;justify-content:space-between;align-items:center'>");
H.push("<div><div style='font-size:20px;font-weight:bold'>" + SHOP.name + "</div><div style='font-size:12px;opacity:.9'>" + SHOP.address + " — " + SHOP.phone + "</div></div>");
H.push(logo);
H.push("</div>");
H.push("<div style='padding:16px 20px'>");
H.push("<div style='display:flex;justify-content:space-between;font-size:13px;color:#555;margin-bottom:10px'><span>فاکتور: <b>" + invoiceNo + "</b></span><span>تاریخ: " + dateFa + "</span></div>");
H.push("<div style='font-size:14px;margin-bottom:10px'>مشتری: <b>" + customer + "</b>" + (phone && phone !== "—" ? " — " + phone : "") + "</div>");
H.push("<table style='border-collapse:collapse;width:100%;font-size:14px'>");
H.push("<thead><tr style='background:#faf6ec'><th style='text-align:right;padding:8px;border:1px solid #eee'>شرح</th><th style='padding:8px;border:1px solid #eee'>وزن</th><th style='padding:8px;border:1px solid #eee'>عیار</th><th style='padding:8px;border:1px solid #eee'>مبلغ (تومان)</th></tr></thead>");
H.push("<tbody><tr><td style='padding:8px;border:1px solid #eee'>" + item + "</td><td style='padding:8px;border:1px solid #eee;text-align:center'>" + weight + " گرم</td><td style='padding:8px;border:1px solid #eee;text-align:center'>" + karat + "</td><td style='padding:8px;border:1px solid #eee;text-align:left'>" + money(goldValue) + "</td></tr></tbody>");
H.push("</table>");
H.push("<table style='border-collapse:collapse;width:100%;font-size:14px;margin-top:8px'>");
H.push("<tr><td style='padding:6px 8px;color:#555'>ارزش طلا</td><td style='padding:6px 8px;text-align:left'>" + money(goldValue) + " تومان</td></tr>");
H.push("<tr><td style='padding:6px 8px;color:#555'>اجرت (" + feePct + "%)</td><td style='padding:6px 8px;text-align:left'>" + money(makingFee) + " تومان</td></tr>");
H.push("<tr><td style='padding:6px 8px;color:#555'>سود (" + profitPct + "%)</td><td style='padding:6px 8px;text-align:left'>" + money(profit) + " تومان</td></tr>");
H.push("<tr><td style='padding:10px 8px;font-weight:bold;font-size:16px;border-top:2px solid " + SHOP.color + "'>مبلغ نهایی</td><td style='padding:10px 8px;text-align:left;font-weight:bold;font-size:16px;border-top:2px solid " + SHOP.color + ";color:" + SHOP.color + "'>" + money(total) + " تومان</td></tr>");
H.push("</table>");
H.push("<div style='display:flex;justify-content:space-between;margin-top:18px;font-size:12px;color:#777'><span>مهر و امضای فروشنده</span><span>با تشکر از خرید شما \u{1F64F}</span></div>");
H.push("</div>");
H.push("<div style='background:#faf6ec;color:#8a6d1b;text-align:center;padding:8px;font-size:11px'>" + SHOP.name + " • " + SHOP.phone + "</div>");
H.push("</div>");
const invoiceHtml = H.join("");
const b64 = Buffer.from(invoiceHtml, "utf8").toString("base64");
return [{ json: { invoiceNo, day, dateFa, customer, phone, email, item, weight, karat, rate18, goldValue, makingFee, profit, total, ownerEmail: SHOP.ownerEmail, invoiceHtml }, binary: { invoice: { data: b64, fileName: invoiceNo + ".html", mimeType: "text/html" } } }];
`;

const AGG_JS =
  "const rows = $input.all().map((i) => i.json);\n" +
  "const count = rows.length;\n" +
  "const totalSum = rows.reduce((s, r) => s + Number(r.total || 0), 0);\n" +
  "const feeSum = rows.reduce((s, r) => s + Number(r.makingFee || 0) + Number(r.profit || 0), 0);\n" +
  "const day = rows[0]?.day || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });\n" +
  "const ownerEmail = \"you@example.com\";\n" +
  "return [{ json: { day, count, totalSum, feeSum, ownerEmail } }];";

const invoiceForm = trigger({
  type: 'n8n-nodes-base.formTrigger',
  version: 2.6,
  config: {
    name: 'Invoice Form',
    parameters: {
      formTitle: 'صدور فاکتور طلا',
      formDescription: 'وزن، عیار، اجرت و سود را وارد کنید. نرخ طلا را می‌توانید آنلاین بگیرید یا دستی وارد کنید.',
      formFields: {
        values: [
          { fieldLabel: 'شرح کالا (مثلاً انگشتر)', fieldName: 'item', fieldType: 'text', requiredField: false },
          { fieldLabel: 'نام مشتری', fieldName: 'customer', fieldType: 'text', requiredField: false },
          { fieldLabel: 'شماره تماس مشتری', fieldName: 'phone', fieldType: 'text', requiredField: false },
          { fieldLabel: 'ایمیل مشتری (برای ارسال فاکتور)', fieldName: 'email', fieldType: 'email', requiredField: false },
          { fieldLabel: 'وزن (گرم)', fieldName: 'weight', fieldType: 'number', requiredField: true },
          { fieldLabel: 'عیار (مثلاً 750 برای ۱۸)', fieldName: 'karat', fieldType: 'number', defaultValue: '750', requiredField: true },
          { fieldLabel: 'نرخ طلا', fieldName: 'rateMode', fieldType: 'dropdown', requiredField: true, defaultValue: 'آنلاین (خودکار)', fieldOptions: { values: [{ option: 'آنلاین (خودکار)' }, { option: 'دستی' }] } },
          { fieldLabel: 'نرخ هر گرم طلای ۱۸ عیار (تومان) — فقط حالت دستی', fieldName: 'rate18', fieldType: 'number', requiredField: false },
          { fieldLabel: 'درصد اجرت', fieldName: 'feePct', fieldType: 'number', requiredField: true },
          { fieldLabel: 'درصد سود', fieldName: 'profitPct', fieldType: 'number', requiredField: true },
        ],
      },
      options: { appendAttribution: false, buttonLabel: 'صدور فاکتور', path: 'gold-invoice' },
    },
  },
  output: [{ item: 'انگشتر', customer: 'آقای رضایی', phone: '0912...', email: 'a@b.com', weight: 5, karat: 750, rateMode: 'آنلاین (خودکار)', rate18: 3800000, feePct: 12, profitPct: 7 }],
});

const useOnlineRate = ifElse({
  version: 2.3,
  config: {
    name: 'Use Online Rate?',
    parameters: {
      conditions: {
        options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
        combinator: 'and',
        conditions: [
          { leftValue: expr('{{ $json.rateMode }}'), rightValue: 'آنلاین', operator: { type: 'string', operation: 'contains' } },
        ],
      },
    },
  },
});

const getGoldRate = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Get Live Gold Rate',
    onError: 'continueRegularOutput',
    parameters: {
      method: 'GET',
      url: 'https://api.nerkh.io/v1/prices/json/gold',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpQueryAuth',
      options: { timeout: 15000 },
    },
    credentials: { httpQueryAuth: newCredential('Nerkh API Key') },
  },
  output: [{ data: { prices: { GOLD18K: { current: '18281100' } } } }],
});

const applyOnlineRate = node({
  type: 'n8n-nodes-base.set',
  version: 3.5,
  config: {
    name: 'Apply Online Rate',
    parameters: {
      mode: 'manual',
      includeOtherFields: false,
      assignments: {
        assignments: [
          { id: 'r', name: 'rate18', value: expr("{{ $json.data?.prices?.GOLD18K?.current ?? $('Invoice Form').item.json.rate18 }}"), type: 'number' },
        ],
      },
    },
  },
  output: [{ rate18: 18281100 }],
});

const computeInvoice = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Compute & Render Invoice',
    parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: COMPUTE_JS },
  },
  output: [{ invoiceNo: 'INV-12345678', day: '2026-08-04', dateFa: '۱۴۰۵/۵/۱۳', customer: 'آقای رضایی', phone: '0912', email: 'a@b.com', item: 'انگشتر', weight: 5, karat: 750, rate18: 18281100, goldValue: 19000000, makingFee: 2280000, profit: 1489600, total: 22769600, ownerEmail: 'you@example.com', invoiceHtml: '<div>...</div>' }],
});

const archiveInvoice = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Archive Invoice',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'name', value: 'invoices' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          invoiceNo: expr('{{ $json.invoiceNo }}'), day: expr('{{ $json.day }}'), dateFa: expr('{{ $json.dateFa }}'),
          customer: expr('{{ $json.customer }}'), phone: expr('{{ $json.phone }}'), email: expr('{{ $json.email }}'),
          item: expr('{{ $json.item }}'), weight: expr('{{ $json.weight }}'), karat: expr('{{ $json.karat }}'),
          rate18: expr('{{ $json.rate18 }}'), goldValue: expr('{{ $json.goldValue }}'), makingFee: expr('{{ $json.makingFee }}'),
          profit: expr('{{ $json.profit }}'), total: expr('{{ $json.total }}'),
        },
        matchingColumns: [],
        schema: [
          { id: 'invoiceNo', displayName: 'invoiceNo', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'day', displayName: 'day', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'dateFa', displayName: 'dateFa', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'customer', displayName: 'customer', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'phone', displayName: 'phone', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'email', displayName: 'email', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'item', displayName: 'item', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'weight', displayName: 'weight', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'karat', displayName: 'karat', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'rate18', displayName: 'rate18', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'goldValue', displayName: 'goldValue', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'makingFee', displayName: 'makingFee', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'profit', displayName: 'profit', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'total', displayName: 'total', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
        ],
      },
      options: {},
    },
  },
  output: [{ id: 1 }],
});

const appendSheet = node({
  type: 'n8n-nodes-base.googleSheets',
  version: 4.7,
  config: {
    name: 'Append to Sheet',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'sheet',
      operation: 'append',
      documentId: { __rl: true, mode: 'id', value: '19fTJM9-sIyVrv1MivnnpWRv_yNEIXd75dKmJEgvhtwg' },
      sheetName: { __rl: true, mode: 'list', value: '0', cachedResultName: 'Sheet1' },
      columns: {
        mappingMode: 'autoMapInputData',
        value: {},
        matchingColumns: [],
        schema: [
          { id: 'invoiceNo', displayName: 'invoiceNo', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'day', displayName: 'day', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'dateFa', displayName: 'dateFa', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'customer', displayName: 'customer', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'phone', displayName: 'phone', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'email', displayName: 'email', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'item', displayName: 'item', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'weight', displayName: 'weight', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'karat', displayName: 'karat', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'rate18', displayName: 'rate18', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'goldValue', displayName: 'goldValue', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'makingFee', displayName: 'makingFee', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'profit', displayName: 'profit', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'total', displayName: 'total', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
        ],
      },
      options: { useAppend: true },
    },
    credentials: { googleSheetsOAuth2Api: newCredential('Google Sheets') },
  },
  output: [{ appended: true }],
});

const sendEmail = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Email Invoice',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'message',
      operation: 'send',
      sendTo: expr('{{ $json.email || $json.ownerEmail }}'),
      subject: expr('فاکتور خرید شما — {{ $json.invoiceNo }}'),
      emailType: 'html',
      message: expr('{{ $json.invoiceHtml }}'),
      options: {
        appendAttribution: false,
        bccList: expr('{{ $json.ownerEmail }}'),
        attachmentsUi: { attachmentsBinary: [{ property: 'invoice' }] },
      },
    },
    credentials: { gmailOAuth2: newCredential('Gmail') },
  },
  output: [{ id: 'sent' }],
});

const showInvoice = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'Show Invoice',
    parameters: {
      operation: 'completion',
      respondWith: 'showText',
      responseText: expr('{{ $json.invoiceHtml }}'),
    },
  },
  output: [{}],
});

const dailyReport = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  config: {
    name: 'Daily 21:00',
    parameters: { rule: { interval: [{ field: 'days', daysInterval: 1, triggerAtHour: 21, triggerAtMinute: 0 }] } },
  },
  output: [{}],
});

const getTodayInvoices = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Today Invoices',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'name', value: 'invoices' },
      returnAll: true,
      filters: {
        conditions: [
          { keyName: 'day', condition: 'eq', keyValue: expr("{{ $now.setZone('Asia/Tehran').toFormat('yyyy-MM-dd') }}") },
        ],
      },
    },
  },
  output: [{ id: 1, day: '2026-08-04', total: 22769600, makingFee: 2280000, profit: 1489600 }],
});

const aggregateReport = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: { name: 'Aggregate Report', parameters: { mode: 'runOnceForAllItems', language: 'javaScript', jsCode: AGG_JS } },
  output: [{ day: '2026-08-04', count: 3, totalSum: 68000000, feeSum: 11000000, ownerEmail: 'you@example.com' }],
});

const sendReport = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Send Daily Report',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: '000000000',
      text: expr(
        '📊 گزارش فروش امروز ({{ $json.day }})\n\n' +
        'تعداد فاکتور: {{ $json.count }}\n' +
        "جمع کل فروش: {{ $json.totalSum.toLocaleString('fa-IR') }} تومان\n" +
        "جمع اجرت + سود: {{ $json.feeSum.toLocaleString('fa-IR') }} تومان"
      ),
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: newCredential('Telegram Bot') },
  },
  output: [{ ok: true }],
});

const emailReport = node({
  type: 'n8n-nodes-base.gmail',
  version: 2.2,
  config: {
    name: 'Email Daily Report',
    onError: 'continueRegularOutput',
    parameters: {
      resource: 'message',
      operation: 'send',
      sendTo: expr('{{ $json.ownerEmail }}'),
      subject: expr('گزارش فروش امروز ({{ $json.day }})'),
      emailType: 'html',
      message: expr(
        "<div style='direction:rtl;font-family:Tahoma,Arial,sans-serif;font-size:14px'>" +
        '📊 <b>گزارش فروش امروز {{ $json.day }}</b><br><br>' +
        'تعداد فاکتور: {{ $json.count }}<br>' +
        "جمع کل فروش: {{ $json.totalSum.toLocaleString('fa-IR') }} تومان<br>" +
        "جمع اجرت + سود: {{ $json.feeSum.toLocaleString('fa-IR') }} تومان" +
        '</div>'
      ),
      options: { appendAttribution: false },
    },
    credentials: { gmailOAuth2: newCredential('Gmail') },
  },
  output: [{ id: 'sent' }],
});

const noteForm = sticky(
  '## 🧾 صدور فاکتور\nفرم وب → (نرخ آنلاین یا دستی) → محاسبه و رندر فاکتور حرفه‌ای → آرشیو در Data Table + Google Sheet + ایمیل به مشتری → نمایش فاکتور.\n\nلینک عمومی فرم (path: gold-invoice) را برای تست به مشتری/خریدار بده.',
  [invoiceForm, computeInvoice, showInvoice],
  { color: 4 },
);

const noteReport = sticky(
  '## 📊 گزارش روزانه (ساعت ۲۱)\nفاکتورهای امروز جمع‌بندی و به تلگرام مالک ارسال می‌شوند. `chatId` را با آی‌دی خودتان جایگزین کنید.',
  [dailyReport, getTodayInvoices, sendReport],
  { color: 5 },
);

export default workflow('invoice-making-fee-assistant', 'دستیار محاسبه‌ی فاکتور و اجرت')
  .add(invoiceForm)
  .to(useOnlineRate.onTrue(getGoldRate.to(applyOnlineRate.to(computeInvoice))).onFalse(computeInvoice))
  .add(computeInvoice).to(archiveInvoice)
  .add(computeInvoice).to(appendSheet)
  .add(computeInvoice).to(sendEmail)
  .add(computeInvoice).to(showInvoice)
  .add(dailyReport)
  .to(getTodayInvoices.to(aggregateReport))
  .add(aggregateReport).to(sendReport)
  .add(aggregateReport).to(emailReport)
  .add(noteForm)
  .add(noteReport);
