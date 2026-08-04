import {
  workflow,
  node,
  trigger,
  newCredential,
  expr,
  sticky,
} from '@n8n/workflow-sdk';

const invoiceForm = trigger({
  type: 'n8n-nodes-base.formTrigger',
  version: 2.6,
  config: {
    name: 'Invoice Form',
    parameters: {
      formTitle: 'صدور فاکتور طلا',
      formDescription: 'وزن، عیار، نرخ روز، اجرت و سود را وارد کنید تا فاکتور دقیق صادر شود.',
      formFields: {
        values: [
          { fieldLabel: 'شرح کالا (مثلاً انگشتر)', fieldName: 'item', fieldType: 'text', requiredField: false },
          { fieldLabel: 'نام مشتری', fieldName: 'customer', fieldType: 'text', requiredField: false },
          { fieldLabel: 'وزن (گرم)', fieldName: 'weight', fieldType: 'number', requiredField: true },
          { fieldLabel: 'عیار (مثلاً 750 برای ۱۸)', fieldName: 'karat', fieldType: 'number', defaultValue: '750', requiredField: true },
          { fieldLabel: 'نرخ هر گرم طلای ۱۸ عیار (تومان)', fieldName: 'rate18', fieldType: 'number', requiredField: true },
          { fieldLabel: 'درصد اجرت', fieldName: 'feePct', fieldType: 'number', requiredField: true },
          { fieldLabel: 'درصد سود', fieldName: 'profitPct', fieldType: 'number', requiredField: true },
        ],
      },
      options: { appendAttribution: false, buttonLabel: 'صدور فاکتور' },
    },
  },
  output: [{ item: 'انگشتر', customer: 'آقای رضایی', weight: 5, karat: 750, rate18: 3800000, feePct: 12, profitPct: 7 }],
});

const computeInvoice = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Compute Invoice',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const f = $json;\n" +
        "const num = (x) => { const n = Number(String(x ?? '').replace(/[^\\d.\\-]/g, '')); return Number.isFinite(n) ? n : 0; };\n" +
        "const weight = num(f.weight);\n" +
        "const karat = num(f.karat) || 750;\n" +
        "const rate18 = num(f.rate18);\n" +
        "const feePct = num(f.feePct);\n" +
        "const profitPct = num(f.profitPct);\n" +
        "const goldValue = Math.round(weight * rate18 * (karat / 750));\n" +
        "const makingFee = Math.round(goldValue * feePct / 100);\n" +
        "const subtotal = goldValue + makingFee;\n" +
        "const profit = Math.round(subtotal * profitPct / 100);\n" +
        "const total = subtotal + profit;\n" +
        "const now = new Date();\n" +
        "const day = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });\n" +
        "const dateFa = now.toLocaleDateString('fa-IR', { timeZone: 'Asia/Tehran' });\n" +
        "const invoiceNo = 'INV-' + now.getTime().toString().slice(-8);\n" +
        "return [{ json: { invoiceNo, day, dateFa, customer: f.customer || '—', item: f.item || '—', weight, karat, rate18, goldValue, makingFee, profit, total } }];",
    },
  },
  output: [{ invoiceNo: 'INV-12345678', day: '2026-08-04', dateFa: '۱۴۰۵/۵/۱۳', customer: 'آقای رضایی', item: 'انگشتر', weight: 5, karat: 750, rate18: 3800000, goldValue: 19000000, makingFee: 2280000, profit: 1489600, total: 22769600 }],
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
          invoiceNo: expr('{{ $json.invoiceNo }}'),
          day: expr('{{ $json.day }}'),
          dateFa: expr('{{ $json.dateFa }}'),
          customer: expr('{{ $json.customer }}'),
          item: expr('{{ $json.item }}'),
          weight: expr('{{ $json.weight }}'),
          karat: expr('{{ $json.karat }}'),
          rate18: expr('{{ $json.rate18 }}'),
          goldValue: expr('{{ $json.goldValue }}'),
          makingFee: expr('{{ $json.makingFee }}'),
          profit: expr('{{ $json.profit }}'),
          total: expr('{{ $json.total }}'),
        },
        matchingColumns: [],
        schema: [
          { id: 'invoiceNo', displayName: 'invoiceNo', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'day', displayName: 'day', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'dateFa', displayName: 'dateFa', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'customer', displayName: 'customer', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
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

const showInvoice = node({
  type: 'n8n-nodes-base.form',
  version: 2.5,
  config: {
    name: 'Show Invoice',
    parameters: {
      operation: 'completion',
      respondWith: 'showText',
      responseText: expr(
        '<div style="direction:rtl;font-family:Tahoma,Arial,sans-serif;max-width:480px;margin:20px auto;border:1px solid #ddd;border-radius:8px;padding:16px">' +
        '<h2 style="margin:0 0 8px">🧾 فاکتور فروش طلا</h2>' +
        "<p style=\"margin:2px 0;color:#555\">شماره: {{ $('Compute Invoice').item.json.invoiceNo }} — تاریخ: {{ $('Compute Invoice').item.json.dateFa }}</p>" +
        "<p style=\"margin:2px 0;color:#555\">مشتری: {{ $('Compute Invoice').item.json.customer }} | کالا: {{ $('Compute Invoice').item.json.item }}</p>" +
        '<table style="border-collapse:collapse;width:100%;margin-top:10px">' +
        "<tr><td style=\"border:1px solid #eee;padding:6px\">وزن</td><td style=\"border:1px solid #eee;padding:6px\">{{ $('Compute Invoice').item.json.weight }} گرم ({{ $('Compute Invoice').item.json.karat }})</td></tr>" +
        "<tr><td style=\"border:1px solid #eee;padding:6px\">ارزش طلا</td><td style=\"border:1px solid #eee;padding:6px\">{{ $('Compute Invoice').item.json.goldValue.toLocaleString('fa-IR') }} تومان</td></tr>" +
        "<tr><td style=\"border:1px solid #eee;padding:6px\">اجرت</td><td style=\"border:1px solid #eee;padding:6px\">{{ $('Compute Invoice').item.json.makingFee.toLocaleString('fa-IR') }} تومان</td></tr>" +
        "<tr><td style=\"border:1px solid #eee;padding:6px\">سود</td><td style=\"border:1px solid #eee;padding:6px\">{{ $('Compute Invoice').item.json.profit.toLocaleString('fa-IR') }} تومان</td></tr>" +
        "<tr><td style=\"border:1px solid #eee;padding:6px;font-weight:bold\">مبلغ نهایی</td><td style=\"border:1px solid #eee;padding:6px;font-weight:bold\">{{ $('Compute Invoice').item.json.total.toLocaleString('fa-IR') }} تومان</td></tr>" +
        '</table></div>'
      ),
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
  config: {
    name: 'Aggregate Report',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const rows = $input.all().map((i) => i.json);\n" +
        "const count = rows.length;\n" +
        "const totalSum = rows.reduce((s, r) => s + Number(r.total || 0), 0);\n" +
        "const feeSum = rows.reduce((s, r) => s + Number(r.makingFee || 0) + Number(r.profit || 0), 0);\n" +
        "const day = rows[0]?.day || new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });\n" +
        "return [{ json: { day, count, totalSum, feeSum } }];",
    },
  },
  output: [{ day: '2026-08-04', count: 3, totalSum: 68000000, feeSum: 11000000 }],
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

const noteForm = sticky(
  '## 🧾 صدور فاکتور\nفرم وب → محاسبه (ارزش طلا + اجرت + سود) → آرشیو در Data Table → نمایش فاکتور به مشتری.\n\nلینک عمومی فرم را می‌توان برای تست به خریدار داد.',
  [invoiceForm, computeInvoice, showInvoice],
  { color: 4 },
);

const noteReport = sticky(
  '## 📊 گزارش روزانه (ساعت ۲۱)\nفاکتورهای امروز خوانده و جمع‌بندی می‌شوند و به تلگرام مالک ارسال می‌شود.\n\n`chatId` نود ارسال را با آی‌دی عددی تلگرام خودتان جایگزین کنید.',
  [dailyReport, getTodayInvoices, sendReport],
  { color: 5 },
);

export default workflow('invoice-making-fee-assistant', 'دستیار محاسبه‌ی فاکتور و اجرت')
  .add(invoiceForm)
  .to(computeInvoice.to(archiveInvoice.to(showInvoice)))
  .add(dailyReport)
  .to(getTodayInvoices.to(aggregateReport.to(sendReport)))
  .add(noteForm)
  .add(noteReport);
