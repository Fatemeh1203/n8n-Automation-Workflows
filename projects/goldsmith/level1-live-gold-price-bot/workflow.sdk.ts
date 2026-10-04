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

// Free, no-token source (iran-market, data from TGJU). Prices in Toman, refreshed every 30 min.
const getMarket = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Get Market Prices',
    parameters: {
      method: 'GET',
      url: 'https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/latest-toman.json',
      authentication: 'none',
      options: { timeout: 20000, response: { response: { responseFormat: 'json' } } },
    },
  },
  output: [{ data: { generated_at: '2026-10-04T07:00:01.566Z', categories: { gold: [{ symbol: 'GOLD_18K_IRR', price: 26225300 }], coin: [{ symbol: 'COIN_EMAMI_IRR', price: 269870000 }], currency: [{ symbol: 'USD_IRR_FREE', price: 267900 }] } } }],
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
        "const raw = $('Get Market Prices').first().json || {};\n" +
        "const cats = (raw.data && raw.data.categories) || {};\n" +
        "const bySym = {};\n" +
        "for (const list of Object.values(cats)) { for (const it of (list || [])) { if (it && it.symbol) bySym[it.symbol] = Number(it.price); } }\n" +
        "const MAP = { GOLD18K: 'GOLD_18K_IRR', GOLD24K: 'GOLD_24K_IRR', SEKE_EMAMI: 'COIN_EMAMI_IRR', SEKE_BAHAR: 'COIN_BAHAR_IRR', SEKE_NIM: 'COIN_HALF_IRR', SEKE_ROB: 'COIN_QUARTER_IRR', USD: 'USD_IRR_FREE', EUR: 'EUR_IRR_FREE', GBP: 'GBP_IRR_FREE' };\n" +
        "const priceOf = (sym) => { const n = bySym[MAP[sym]]; return Number.isFinite(n) && n > 0 ? n : null; };\n" +
        "const fmt = (n) => (n === null ? '—' : n.toLocaleString('fa-IR'));\n" +
        "const rows = [['🟡 طلای ۱۸ عیار (گرم)', priceOf('GOLD18K')],['🟡 طلای ۲۴ عیار (گرم)', priceOf('GOLD24K')],['🪙 سکه امامی', priceOf('SEKE_EMAMI')],['🪙 سکه بهار آزادی', priceOf('SEKE_BAHAR')],['🪙 نیم سکه', priceOf('SEKE_NIM')],['🪙 ربع سکه', priceOf('SEKE_ROB')],['💵 دلار آمریکا', priceOf('USD')],['💶 یورو', priceOf('EUR')],['💷 پوند', priceOf('GBP')]];\n" +
        "const ts = raw.data && raw.data.generated_at ? new Date(raw.data.generated_at) : new Date();\n" +
        "const updated = ts.toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' });\n" +
        "let message = '📊 قیمت بازار (تومان)\\n\\n';\n" +
        "for (const [label, price] of rows) { message += label + ': ' + fmt(price) + '\\n'; }\n" +
        "message += '\\n🕒 به‌روزرسانی: ' + updated;\n" +
        "message += '\\n\\nℹ️ برای ثبت هشدار بنویسید: هشدار دلار 200000';\n" +
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
        "const assets = [{ sym: 'SEKE_NIM', label: 'نیم سکه', kw: ['نیم'] },{ sym: 'SEKE_ROB', label: 'ربع سکه', kw: ['ربع'] },{ sym: 'SEKE_BAHAR', label: 'سکه بهار آزادی', kw: ['بهار'] },{ sym: 'SEKE_EMAMI', label: 'سکه امامی', kw: ['امامی','تمام','سکه'] },{ sym: 'GOLD24K', label: 'طلای ۲۴ عیار', kw: ['24','۲۴'] },{ sym: 'GOLD18K', label: 'طلای ۱۸ عیار', kw: ['طلا','18','۱۸','هجده'] },{ sym: 'EUR', label: 'یورو', kw: ['یورو'] },{ sym: 'GBP', label: 'پوند', kw: ['پوند'] },{ sym: 'USD', label: 'دلار', kw: ['دلار'] }];\n" +
        "const found = assets.find((a) => a.kw.some((k) => text.includes(k))) || { sym: 'USD', label: 'دلار' };\n" +
        "const direction = text.includes('پایین') || text.includes('کمتر') || text.includes('زیر') ? 'below' : 'above';\n" +
        "return [{ json: { chatId: String(chatId), asset: found.sym, assetLabel: found.label, target, direction, valid: target > 0 } }];",
    },
  },
  output: [{ chatId: '12345', asset: 'USD', assetLabel: 'دلار', target: 200000, direction: 'above', valid: true }],
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
        },
        matchingColumns: [],
        schema: [
          { id: 'chatId', displayName: 'chatId', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'asset', displayName: 'asset', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: true },
          { id: 'assetLabel', displayName: 'assetLabel', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
          { id: 'target', displayName: 'target', required: false, defaultMatch: false, display: true, type: 'number', canBeUsedToMatch: false },
          { id: 'direction', displayName: 'direction', required: false, defaultMatch: false, display: true, type: 'string', canBeUsedToMatch: false },
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
        '• برای ثبت هشدار بنویسید: هشدار سکه 190000000\n' +
        '• برای هشدار نزولی بنویسید: هشدار دلار 180000 پایین\n\n' +
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

const getMarketAlerts = node({
  type: 'n8n-nodes-base.httpRequest',
  version: 4.4,
  config: {
    name: 'Get Market Prices (Alerts)',
    parameters: {
      method: 'GET',
      url: 'https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/latest-toman.json',
      authentication: 'none',
      options: { timeout: 20000, response: { response: { responseFormat: 'json' } } },
    },
  },
  output: [{ data: { generated_at: '2026-10-04T07:00:01.566Z', categories: { gold: [{ symbol: 'GOLD_18K_IRR', price: 26225300 }], coin: [{ symbol: 'COIN_EMAMI_IRR', price: 269870000 }], currency: [{ symbol: 'USD_IRR_FREE', price: 267900 }] } } }],
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
  output: [{ id: 1, chatId: '12345', asset: 'SEKE_EMAMI', assetLabel: 'سکه امامی', target: 180000000, direction: 'above' }],
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
        "const raw = $('Get Market Prices (Alerts)').first().json || {};\n" +
        "const cats = (raw.data && raw.data.categories) || {};\n" +
        "const bySym = {};\n" +
        "for (const list of Object.values(cats)) { for (const it of (list || [])) { if (it && it.symbol) bySym[it.symbol] = Number(it.price); } }\n" +
        "const MAP = { GOLD18K: 'GOLD_18K_IRR', GOLD24K: 'GOLD_24K_IRR', SEKE_EMAMI: 'COIN_EMAMI_IRR', SEKE_BAHAR: 'COIN_BAHAR_IRR', SEKE_NIM: 'COIN_HALF_IRR', SEKE_ROB: 'COIN_QUARTER_IRR', USD: 'USD_IRR_FREE', EUR: 'EUR_IRR_FREE', GBP: 'GBP_IRR_FREE' };\n" +
        "const priceOf = (sym) => { const n = bySym[MAP[sym]]; return Number.isFinite(n) && n > 0 ? n : null; };\n" +
        "const out = [];\n" +
        "for (const item of $input.all()) { const a = item.json; const current = priceOf(a.asset); if (current === null) continue; const target = Number(a.target); const hit = a.direction === 'below' ? current <= target : current >= target; if (!hit) continue; out.push({ json: { alertId: a.id, chatId: String(a.chatId), assetLabel: a.assetLabel, target, current, direction: a.direction } }); }\n" +
        "return out;",
    },
  },
  output: [{ alertId: 1, chatId: '12345', assetLabel: 'سکه امامی', target: 180000000, current: 183500000, direction: 'above' }],
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
  '## 🤖 بخش پاسخ‌گویی (تلگرام)\nکاربر پیام می‌دهد → دستور تشخیص داده می‌شود → قیمت بازار (طلا + سکه + ارز) یا ثبت هشدار.',
  [telegramTrigger, routeCommand, sendPrices],
  { color: 4 },
);

const noteAlert = sticky(
  '## ⏰ بخش هشدار خودکار (هر ۱۰ دقیقه)\nقیمت طلا و ارز گرفته می‌شود → هشدارهای فعال بررسی می‌شوند → پیام هشدار ارسال و هشدار حذف می‌شود.',
  [everyTenMinutes, getMarketAlerts, removeFiredAlert],
  { color: 5 },
);

export default workflow('gold-coin-dollar-price-bot', 'ربات قیمت لحظه‌ای طلا، سکه و دلار')
  .add(telegramTrigger)
  .to(
    routeCommand
      .onCase(0, getMarket.to(buildPriceMessage.to(sendPrices)))
      .onCase(1, parseAlert.to(saveAlert.to(confirmAlert)))
      .onCase(2, sendHelp),
  )
  .add(everyTenMinutes)
  .to(getMarketAlerts.to(getActiveAlerts.to(checkTriggered.to(sendAlert.to(removeFiredAlert)))))
  .add(noteQuery)
  .add(noteAlert);
