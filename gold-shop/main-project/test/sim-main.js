// شبیه‌ساز «Business Logic» پنل سطح ۳ پروژه‌ی اصلی (بعد از وصله‌ی امکانات تکمیلی)
// اجرا: node main-project/test/sim-main.js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const logic = fs.readFileSync(path.join(__dirname, '../build/business-logic.js'), 'utf8');
const T = { 'Get Settings': [], 'Get Inventory': [], 'Get Transactions': [], 'Get Customers': [], 'Get Orders': [], 'Get Site Invoices': [], 'Get Installments': [], 'Get Users': [], 'Get Cheques': [], 'Get Closings': [], 'Get Audit': [] };
const OP = { setting: 'Get Settings', item: 'Get Inventory', tx: 'Get Transactions', party: 'Get Customers', order: 'Get Orders', inst: 'Get Installments', user: 'Get Users', cheque: 'Get Cheques', closing: 'Get Closings', audit: 'Get Audit' };
const MARKET = { data: { generated_at: new Date().toISOString(), categories: { gold: [{ symbol: 'GOLD_18K_IRR', price: 7000000 }, { symbol: 'GOLD_24K_IRR', price: 9300000 }] } } };
let TOKEN = '';
function call(action, data) {
  const nodes = Object.assign({ 'Check Key': [{ authorized: true, action: action, payload: data || {}, token: TOKEN }] }, T);
  const $ = function (n) { const items = (nodes[n] || []).map(function (j) { return { json: j }; }); return { first: function () { return items[0] || { json: {} }; }, all: function () { return items; } }; };
  const $input = { first: function () { return { json: MARKET }; } };
  const out = new Function('$', '$input', 'require', logic)($, $input, require)[0].json;
  (out.writes || []).forEach(function (w) {
    const t = T[OP[w.op]]; if (!t) return;
    const key = w.op === 'setting' ? 'key' : 'code';
    const i = t.findIndex(function (r) { return r[key] === w.row[key]; });
    if (i >= 0) t[i] = Object.assign({}, t[i], w.row); else t.push(Object.assign({}, w.row));
  });
  if (out.response.token) TOKEN = out.response.token;
  return JSON.parse(JSON.stringify(out.response));
}
const ok = function (r, m) { assert.ok(r.ok, (m || '') + ' → ' + JSON.stringify(r).slice(0, 300)); return r; };
const bad = function (r, m) { assert.ok(!r.ok, (m || '') + ' (should fail)'); return r; };
const step = function (n, f) { f(); console.log('✔ ' + n); };

step('ورود (همان روش فعلی پنل)', function () { ok(call('login', { username: 'admin', password: 'CHANGE_ME_ADMIN_KEY' })); });
step('پاسخ پنل بخش ext دارد و منطق قبلی سالم است', function () {
  const r = ok(call('addItem', { title: 'انگشتر', weight: 3, karat: 750, rateMode: 'manual', buyRate18: 6800000 }));
  assert.ok(r.ext && r.ext.pureRate === 9300000);
  ok(call('sell', { itemCodes: [r.items[0].code], rateMode: 'manual', rate18: 7000000 }));
});
let BAR;
step('خرید و فروش شمش', function () {
  const r = ok(call('bullionBuy', { weight: 5, purity: 999.9, serial: 'X9', rateMode: 'market' }));
  BAR = r.items.find(function (i) { return i.metal === 'bullion'; });
  assert.strictEqual(BAR.buyCost, Math.round(r3(5 * 999.9 / 1000) * 9300000));
  const s = ok(call('bullionSell', { itemCodes: [BAR.code], premiumPct: 2, rateMode: 'market', partyMode: 'new', partyName: 'مشتری' }));
  assert.ok(s.invoiceHtml && /X9/.test(s.invoiceHtml));
});
step('پیش‌فاکتور کالای عادی و فروش با قیمت قفل', function () {
  const a = ok(call('addItem', { title: 'دستبند', weight: 10, karat: 750, rateMode: 'manual', buyRate18: 6800000 }));
  const it = a.items.find(function (i) { return i.title === 'دستبند'; });
  const q = ok(call('quote', { itemCodes: [it.code], rateMode: 'manual', rate18: 7000000, hours: 1 })).ext.quote;
  const s = ok(call('sell', { itemCodes: [it.code], quoteCode: q.code, rateMode: 'manual', rate18: 9999999 }));
  assert.strictEqual(s.txs.find(function (t) { return t.type === 'sell' && t.itemCode === it.code; }).amount, q.total);
});
step('انبارگردانی و هشدار در پروژه‌ی اصلی', function () {
  ok(call('addItem', { title: 'گوشواره', weight: 2, karat: 750, rateMode: 'manual', buyRate18: 6800000 }));
  assert.strictEqual(ok(call('stockCount', { codes: ['G-NONE'] })).ext.stockResult.matched, 0);
  ok(call('party', { name: 'مینا', phone: '09121112233' }));
  const c = call('all').parties.find(function (x) { return x.name === 'مینا'; });
  ok(call('alertSave', { partyCode: c.code, metric: 'emami', dir: 'above', target: 90000000 }));
  assert.strictEqual(call('all').ext.alerts.length, 1);
});
function r3(n) { return Math.round(n * 1000) / 1000; }
console.log('\nتست‌های پروژه‌ی اصلی قبول شد.');
