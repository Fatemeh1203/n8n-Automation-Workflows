import {
  workflow,
  node,
  trigger,
  switchCase,
  sticky,
  newCredential,
  expr,
} from '@n8n/workflow-sdk';

const telegramTrigger = trigger({
  type: 'n8n-nodes-base.telegramTrigger',
  version: 1.5,
  config: {
    name: 'Telegram Trigger',
    parameters: { updates: ['message'] },
    credentials: { telegramApi: newCredential('Telegram Bot') },
  },
  output: [{ message: { text: 'قیمت', chat: { id: 12345 } } }],
});

const routeCommand = switchCase({
  version: 3.4,
  config: {
    name: 'Route Command',
    parameters: {
      mode: 'rules',
      rules: {
        values: [
          {
            renameOutput: true,
            outputKey: 'قیمت',
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              combinator: 'or',
              conditions: [
                { leftValue: expr('{{ $json.message.text }}'), rightValue: 'قیمت', operator: { type: 'string', operation: 'contains' } },
                { leftValue: expr('{{ $json.message.text }}'), rightValue: 'price', operator: { type: 'string', operation: 'contains' } },
                { leftValue: expr('{{ $json.message.text }}'), rightValue: 'نرخ', operator: { type: 'string', operation: 'contains' } },
              ],
            },
          },
          {
            renameOutput: true,
            outputKey: 'هشدار',
            conditions: {
              options: { caseSensitive: false, leftValue: '', typeValidation: 'loose' },
              combinator: 'or',
              conditions: [
                { leftValue: expr('{{ $json.message.text }}'), rightValue: 'هشدار', operator: { type: 'string', operation: 'contains' } },
                { leftValue: expr('{{ $json.message.text }}'), rightValue: 'alert', operator: { type: 'string', operation: 'contains' } },
              ],
            },
          },
        ],
      },
      options: { fallbackOutput: 'extra', renameFallbackOutput: 'راهنما' },
    },
  },
});

const getLivePrices = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Get Live Prices',
    parameters: {
      method: 'GET',
      url: 'https://BrsApi.ir/Api/Market/Gold_Currency.php',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpQueryAuth',
      options: { timeout: 15000 },
    },
    credentials: { httpQueryAuth: newCredential('BrsApi Key') },
  },
  output: [{ gold: [{ name: 'طلای 18 عیار', price: 3500000 }], currency: [{ name: 'دلار', price: 60000 }] }],
});

const buildPriceMessage = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Build Price Message',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const res = $input.first().json;\n" +
        "const buckets = [];\n" +
        "if (Array.isArray(res)) { buckets.push(res); } else if (res && typeof res === 'object') { for (const key of Object.keys(res)) { if (Array.isArray(res[key])) buckets.push(res[key]); } }\n" +
        "const flat = buckets.flat();\n" +
        "const priceOf = (keywords) => { const row = flat.find((r) => { const name = String(r.name || r.title || r.symbol || ''); return keywords.some((k) => name.includes(k)); }); if (!row) return null; const raw = row.price ?? row.value ?? row.sell ?? row.p; const num = Number(String(raw).replace(/[^\\d.]/g, '')); return Number.isFinite(num) ? num : null; };\n" +
        "const fmt = (n) => (n === null ? '—' : n.toLocaleString('fa-IR'));\n" +
        "const rows = [['🟡 طلای ۱۸ عیار (گرم)', priceOf(['طلای 18','طلای ۱۸','18 عیار','۱۸ عیار'])],['🪙 سکه امامی', priceOf(['امامی','سکه امامی'])],['🪙 نیم سکه', priceOf(['نیم'])],['🪙 ربع سکه', priceOf(['ربع'])],['💵 دلار آمریکا', priceOf(['دلار'])],['💶 یورو', priceOf(['یورو'])]];\n" +
        "const now = new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });\n" +
        "let message = '📊 قیمت لحظه‌ای بازار\\n\\n';\n" +
        "for (const [label, price] of rows) { message += label + ': ' + fmt(price) + ' تومان\\n'; }\n" +
        "message += '\\n🕒 به‌روزرسانی: ' + now;\n" +
        "message += '\\n\\nℹ️ برای ثبت هشدار بنویسید: هشدار سکه 50000000';\n" +
        "const chatId = $('Telegram Trigger').first().json.message.chat.id;\n" +
        "return [{ json: { message, chatId: String(chatId) } }];",
    },
  },
  output: [{ message: '...', chatId: '12345' }],
});

const sendPrices = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Send Prices to User',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: expr('{{ $json.chatId }}'),
      text: expr('{{ $json.message }}'),
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: newCredential('Telegram Bot') },
  },
  output: [{ ok: true }],
});

const parseAlert = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Parse Alert Command',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const text = String($json.message.text || '');\n" +
        "const chatId = $json.message.chat.id;\n" +
        "const toEn = (s) => s.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));\n" +
        "const numbers = (text.match(/[\\d۰-۹]{2,}/g) || []).map((s) => Number(toEn(s))).filter((n) => Number.isFinite(n) && n > 0);\n" +
        "const target = numbers.length ? Math.max(...numbers) : 0;\n" +
        "const assets = [{ key: 'coin_emami', label: 'سکه امامی', kw: ['امامی','سکه'] },{ key: 'gold_18', label: 'طلای ۱۸ عیار', kw: ['طلا','18','۱۸'] },{ key: 'usd', label: 'دلار', kw: ['دلار'] },{ key: 'eur', label: 'یورو', kw: ['یورو'] }];\n" +
        "const found = assets.find((a) => a.kw.some((k) => text.includes(k))) || assets[0];\n" +
        "const direction = text.includes('پایین') || text.includes('کمتر') || text.includes('زیر') ? 'below' : 'above';\n" +
        "return [{ json: { chatId: String(chatId), asset: found.key, assetLabel: found.label, target, direction, createdAt: new Date().toISOString(), valid: target > 0 } }];",
    },
  },
  output: [{ chatId: '12345', asset: 'coin_emami', assetLabel: 'سکه امامی', target: 50000000, direction: 'above', createdAt: '2026-01-01T00:00:00.000Z', valid: true }],
});

const saveAlert = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Save Alert',
    parameters: {
      resource: 'row',
      operation: 'insert',
      dataTableId: { __rl: true, mode: 'name', value: 'price_alerts' },
      columns: {
        mappingMode: 'defineBelow',
        value: {
          chatId: expr('{{ $json.chatId }}'),
          asset: expr('{{ $json.asset }}'),
          assetLabel: expr('{{ $json.assetLabel }}'),
          target: expr('{{ $json.target }}'),
          direction: expr('{{ $json.direction }}'),
          createdAt: expr('{{ $json.createdAt }}'),
        },
        matchingColumns: [],
        schema: [
          { id: 'chatId', displayName: 'chatId', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'asset', displayName: 'asset', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'assetLabel', displayName: 'assetLabel', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'target', displayName: 'target', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'direction', displayName: 'direction', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'createdAt', displayName: 'createdAt', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
        ],
      },
      options: {},
    },
  },
  output: [{ id: 1 }],
});

const confirmAlert = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Confirm Alert',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: expr("{{ $('Parse Alert Command').item.json.chatId }}"),
      text: expr(
        '✅ هشدار قیمت ثبت شد.\n\n' +
        "دارایی: {{ $('Parse Alert Command').item.json.assetLabel }}\n" +
        "قیمت هدف: {{ $('Parse Alert Command').item.json.target.toLocaleString('fa-IR') }} تومان\n" +
        "جهت: {{ $('Parse Alert Command').item.json.direction === 'above' ? 'رسیدن به بالاتر از این عدد' : 'افت به پایین‌تر از این عدد' }}\n\n" +
        'به‌محض رسیدن قیمت به این عدد، همین‌جا به شما خبر می‌دهیم.'
      ),
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: newCredential('Telegram Bot') },
  },
  output: [{ ok: true }],
});

const sendHelp = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Send Help',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: expr('{{ $json.message.chat.id }}'),
      text: expr(
        '👋 به ربات قیمت لحظه‌ای طلا، سکه و دلار خوش آمدید.\n\n' +
        '📌 دستورها:\n' +
        '• برای دیدن قیمت‌ها بنویسید: قیمت\n' +
        '• برای ثبت هشدار بنویسید: هشدار سکه 50000000\n' +
        '• برای هشدار نزولی بنویسید: هشدار دلار 60000 پایین\n\n' +
        'قیمت‌ها لحظه‌ای از بازار دریافت می‌شوند.'
      ),
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: newCredential('Telegram Bot') },
  },
  output: [{ ok: true }],
});

const everyTenMinutes = trigger({
  type: 'n8n-nodes-base.scheduleTrigger',
  version: 1.3,
  config: {
    name: 'Every 10 Minutes',
    parameters: { rule: { interval: [{ field: 'minutes', minutesInterval: 10 }] } },
  },
  output: [{}],
});

const getPricesAlerts = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Get Prices (Alerts)',
    parameters: {
      method: 'GET',
      url: 'https://BrsApi.ir/Api/Market/Gold_Currency.php',
      authentication: 'genericCredentialType',
      genericAuthType: 'httpQueryAuth',
      options: { timeout: 15000 },
    },
    credentials: { httpQueryAuth: newCredential('BrsApi Key') },
  },
  output: [{ gold: [{ name: 'طلای 18 عیار', price: 3500000 }], currency: [{ name: 'دلار', price: 60000 }] }],
});

const getActiveAlerts = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Get Active Alerts',
    parameters: {
      resource: 'row',
      operation: 'get',
      dataTableId: { __rl: true, mode: 'name', value: 'price_alerts' },
      returnAll: true,
      filters: { conditions: [] },
    },
  },
  output: [{ id: 1, chatId: '12345', asset: 'coin_emami', assetLabel: 'سکه امامی', target: 50000000, direction: 'above' }],
});

const checkTriggered = node({
  type: 'n8n-nodes-base.code',
  version: 2,
  config: {
    name: 'Check Triggered Alerts',
    parameters: {
      mode: 'runOnceForAllItems',
      language: 'javaScript',
      jsCode:
        "const res = $('Get Prices (Alerts)').first().json;\n" +
        "const buckets = [];\n" +
        "if (Array.isArray(res)) { buckets.push(res); } else if (res && typeof res === 'object') { for (const key of Object.keys(res)) { if (Array.isArray(res[key])) buckets.push(res[key]); } }\n" +
        "const flat = buckets.flat();\n" +
        "const priceOf = (keywords) => { const row = flat.find((r) => { const name = String(r.name || r.title || r.symbol || ''); return keywords.some((k) => name.includes(k)); }); if (!row) return null; const raw = row.price ?? row.value ?? row.sell ?? row.p; const num = Number(String(raw).replace(/[^\\d.]/g, '')); return Number.isFinite(num) ? num : null; };\n" +
        "const priceByAsset = { coin_emami: priceOf(['امامی','سکه امامی']), gold_18: priceOf(['طلای 18','طلای ۱۸','18 عیار','۱۸ عیار']), usd: priceOf(['دلار']), eur: priceOf(['یورو']) };\n" +
        "const out = [];\n" +
        "for (const item of $input.all()) { const a = item.json; const current = priceByAsset[a.asset]; if (current === null || current === undefined) continue; const target = Number(a.target); const hit = a.direction === 'below' ? current <= target : current >= target; if (!hit) continue; out.push({ json: { alertId: a.id, chatId: String(a.chatId), assetLabel: a.assetLabel, target, current, direction: a.direction } }); }\n" +
        "return out;",
    },
  },
  output: [{ alertId: 1, chatId: '12345', assetLabel: 'سکه امامی', target: 50000000, current: 51000000, direction: 'above' }],
});

const sendAlert = node({
  type: 'n8n-nodes-base.telegram',
  version: 1.2,
  config: {
    name: 'Send Price Alert',
    parameters: {
      resource: 'message',
      operation: 'sendMessage',
      chatId: expr('{{ $json.chatId }}'),
      text: expr(
        '🔔 هشدار قیمت!\n\n' +
        '{{ $json.assetLabel }} به {{ $json.current.toLocaleString("fa-IR") }} تومان رسید.\n' +
        '(قیمت هدف شما: {{ $json.target.toLocaleString("fa-IR") }} تومان)'
      ),
      additionalFields: { appendAttribution: false },
    },
    credentials: { telegramApi: newCredential('Telegram Bot') },
  },
  output: [{ ok: true }],
});

const removeFiredAlert = node({
  type: 'n8n-nodes-base.dataTable',
  version: 1.1,
  config: {
    name: 'Remove Fired Alert',
    parameters: {
      resource: 'row',
      operation: 'deleteRows',
      dataTableId: { __rl: true, mode: 'name', value: 'price_alerts' },
      matchType: 'allConditions',
      filters: {
        conditions: [
          { keyName: 'id', condition: 'eq', keyValue: expr("{{ $('Check Triggered Alerts').item.json.alertId }}") },
        ],
      },
      options: {},
    },
  },
  output: [{ id: 1 }],
});

const noteQuery = sticky(
  '## 🤖 بخش پاسخ‌گویی (تلگرام)\nکاربر پیام می‌دهد → دستور تشخیص داده می‌شود → قیمت لحظه‌ای یا ثبت هشدار.',
  [telegramTrigger, routeCommand, sendPrices],
  { color: 4 },
);

const noteAlert = sticky(
  '## ⏰ بخش هشدار خودکار (هر ۱۰ دقیقه)\nقیمت گرفته می‌شود → هشدارهای فعال بررسی می‌شوند → پیام هشدار ارسال و هشدار حذف می‌شود.',
  [everyTenMinutes, getPricesAlerts, removeFiredAlert],
  { color: 5 },
);

export default workflow('gold-coin-dollar-price-bot', 'ربات قیمت لحظه‌ای طلا، سکه و دلار')
  .add(telegramTrigger)
  .to(
    routeCommand
      .onCase(0, getLivePrices.to(buildPriceMessage.to(sendPrices)))
      .onCase(1, parseAlert.to(saveAlert.to(confirmAlert)))
      .onCase(2, sendHelp),
  )
  .add(everyTenMinutes)
  .to(getPricesAlerts.to(getActiveAlerts.to(checkTriggered.to(sendAlert.to(removeFiredAlert)))))
  .add(noteQuery)
  .add(noteAlert);
