// تست نودهای جدید پروژه‌ی اصلی با داده‌ی ساختگی (بدون تماس واقعی با زرین‌پال یا پیامک)
const fs = require('fs'), path = require('path'), assert = require('assert'), crypto = require('crypto');
const B = function (f) { return fs.readFileSync(path.join(__dirname, '../build', f), 'utf8'); };
function run(file, nodes, input) {
  const $ = function (n) { const items = (nodes[n] || []).map(function (j) { return { json: j }; }); return { first: function () { return items[0] || { json: {} }; }, all: function () { return items; } }; };
  return new Function('$', '$input', 'require', B(file))($, { first: function () { return { json: input || {} }; } }, require);
}
const MARKET = { data: { generated_at: new Date().toISOString(), categories: { g: [{ symbol: 'GOLD_18K_IRR', price: 7000000 }, { symbol: 'COIN_EMAMI_IRR', price: 95000000 }] } } };
const settings = [{ key: 'shopName', value: 'طلای تست' }, { key: 'portal_secret', value: 'sec' }, { key: 'zarinpalMerchant', value: 'MID' }, { key: 'smsEnabled', value: 'yes' }, { key: 'smsApiKey', value: 'K' },
  { key: 'alert_A1', value: JSON.stringify({ code: 'A1', phone: '09120000000', metric: 'emami', dir: 'above', target: 90000000, active: 'yes' }) },
  { key: 'alert_A2', value: JSON.stringify({ code: 'A2', phone: '09120000000', metric: 'rate18', dir: 'below', target: 6000000, active: 'yes' }) }];
const ok = function (n) { console.log('✔ ' + n); };
// تابلو
const h = run('board.js', { 'Board Settings': settings, 'Board Market': [MARKET] })[0].json.html;
assert.ok(/طلای تست/.test(h) && /۷٬۰۰۰٬۰۰۰/.test(h) && /۹٬۳۳۳٬۳۳۳/.test(h)); ok('تابلوی قیمت');
// هشدار
const a = run('alerts.js', { 'Alert Settings': settings, 'Alert Market': [MARKET] })[0].json.writes;
assert.strictEqual(a.filter(function (w) { return w.op === 'sms'; }).length, 1);
assert.strictEqual(JSON.parse(a[0].row.value).active, 'no'); ok('هشدار قیمت (فقط سکه پیامک شد)');
// پرداخت
const tok = crypto.createHash('sha256').update('sec|C1').digest('hex').slice(0, 20);
const custs = [{ code: 'C1', name: 'مریم', phone: '0935 123 4567' }];
const insts = [{ id: 9, code: 'Q1', customerCode: 'C1', customerName: 'مریم', invoice: 'INV-1', n: 1, count: 3, amount: 5000000, paid: 1000000, status: 'partial' }];
const bad = run('pay-start.js', { 'Pay Start': [{ query: { c: 'C1', t: 'wrong', q: 'Q1' } }], 'Pay Settings': settings, 'Pay Customers': custs, 'Pay Installments': insts })[0].json;
assert.strictEqual(bad.ok, false);
const pre = run('pay-start.js', { 'Pay Start': [{ query: { c: 'C1', t: tok, q: 'Q1' } }], 'Pay Settings': settings, 'Pay Customers': custs, 'Pay Installments': insts })[0].json;
assert.ok(pre.ok && pre.body.amount === 40000000 && pre.body.metadata.mobile === '09351234567'); ok('شروع پرداخت (مبلغ ریالی درست)');
const red = run('pay-redirect.js', { 'Pay Prepare': [pre] }, { data: { code: 100, authority: 'A0000123' } })[0].json;
assert.ok(/StartPay\/A0000123/.test(red.html)); const pend = red.writes[0].row;
const cbSet = settings.concat([{ key: pend.key, value: pend.value }]);
const nok = run('pay-check.js', { 'Pay Callback': [{ query: { Authority: 'A0000123', Status: 'NOK' } }], 'Cb Settings': cbSet })[0].json;
assert.strictEqual(nok.verify, false);
const chk = run('pay-check.js', { 'Pay Callback': [{ query: { Authority: 'A0000123', Status: 'OK' } }], 'Cb Settings': cbSet })[0].json;
assert.ok(chk.verify && chk.body.amount === 40000000);
const fin = run('pay-finish.js', { 'Pay Check': [chk], 'Cb Installments': insts }, { data: { code: 100, ref_id: 778899 } })[0].json;
const tx = fin.writes.find(function (w) { return w.op === 'tx'; }).row, ins = fin.writes.find(function (w) { return w.op === 'inst'; }).row;
assert.ok(tx.amount === 4000000 && tx.type === 'receive' && ins.status === 'paid' && ins.paid === 5000000 && ins.id === undefined);
ok('تأیید پرداخت و ثبت قسط');
const done = run('pay-check.js', { 'Pay Callback': [{ query: { Authority: 'A0000123', Status: 'OK' } }], 'Cb Settings': settings.concat([{ key: pend.key, value: fin.writes[0].row.value }]) })[0].json;
assert.strictEqual(done.verify, false); ok('پرداخت تکراری دوباره ثبت نمی‌شود');
// پرتال
const portal = B('build-portal.js'); assert.ok(/gold-pay\?c=/.test(portal)); new Function('$', 'require', portal); ok('پرتال مشتری با دکمه‌ی پرداخت');
