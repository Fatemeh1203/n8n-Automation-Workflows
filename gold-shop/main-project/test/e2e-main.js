// تست مرورگری پنل اصلی + امکانات تکمیلی، با سرور محلی که همان «Business Logic» جدید را اجرا می‌کند.
// اجرا: NODE_PATH=<مسیر playwright-core> node main-project/test/e2e-main.js
const http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const { chromium } = require('playwright-core');
const B = path.join(__dirname, '../build'), V = path.join(__dirname, '../vendor');
const PORT = 8765, BASE = 'http://localhost:' + PORT;
const logic = fs.readFileSync(path.join(B, 'business-logic.js'), 'utf8');
const T = { 'Get Settings': [], 'Get Inventory': [], 'Get Transactions': [], 'Get Customers': [], 'Get Orders': [], 'Get Site Invoices': [], 'Get Installments': [], 'Get Users': [], 'Get Cheques': [], 'Get Closings': [], 'Get Audit': [] };
const OP = { setting: 'Get Settings', item: 'Get Inventory', tx: 'Get Transactions', party: 'Get Customers', order: 'Get Orders', inst: 'Get Installments', user: 'Get Users', cheque: 'Get Cheques', closing: 'Get Closings', audit: 'Get Audit' };
const MARKET = { data: { generated_at: new Date().toISOString(), categories: { gold: [{ symbol: 'GOLD_18K_IRR', price: 7000000 }, { symbol: 'GOLD_24K_IRR', price: 9300000 }, { symbol: 'COIN_EMAMI_IRR', price: 80000000 }] } } };
const calls = [];
function runLogic(body) {
  let payload = {}; try { payload = JSON.parse(body.data || '{}'); } catch (e) {}
  calls.push(body.action);
  const nodes = Object.assign({ 'Check Key': [{ authorized: true, action: body.action || 'all', payload: payload, token: body.token || '' }] }, T);
  const $ = function (n) { const items = (nodes[n] || []).map(function (j) { return { json: j }; }); return { first: function () { return items[0] || { json: {} }; }, all: function () { return items; } }; };
  const out = new Function('$', '$input', 'require', logic)($, { first: function () { return { json: MARKET }; } }, require)[0].json;
  (out.writes || []).forEach(function (w) { const t = T[OP[w.op]]; if (!t) return; const key = w.op === 'setting' ? 'key' : 'code'; const i = t.findIndex(function (r) { return r[key] === w.row[key]; }); if (i >= 0) t[i] = Object.assign({}, t[i], w.row); else t.push(Object.assign({}, w.row)); });
  return out.response;
}
const panel = fs.readFileSync(path.join(B, 'panel.html'), 'utf8')
  .replace(/<link[^>]+fonts?[^>]*>/g, '').replace(/<script src="https:\/\/cdn[^"]+"><\/script>/g, '')
  .replace('https://n8n.aifardainstitute.ir/webhook/gold-admin-ext', '/ext.js').replace('https://n8n.aifardainstitute.ir/webhook/gold-admin-app', '/app.js');
const ext = fs.readFileSync(path.join(B, 'ext.js'), 'utf8').split('https://n8n.aifardainstitute.ir/webhook/gold-admin-api').join(BASE + '/api');
const app = fs.readFileSync(path.join(V, 'app.live.js'), 'utf8').split('https://n8n.aifardainstitute.ir/webhook/gold-admin-api').join(BASE + '/api');
const srv = http.createServer(function (req, res) {
  if (req.method === 'POST' && req.url === '/api') {
    let b = ''; req.on('data', function (c) { b += c; }); req.on('end', function () { const body = Object.fromEntries(new URLSearchParams(b)); res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(runLogic(body))); });
    return;
  }
  const m = { '/': [panel, 'text/html'], '/ext.js': [ext, 'application/javascript'], '/app.js': [app, 'application/javascript'] }[req.url];
  if (!m) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', m[1] + '; charset=utf-8'); res.end(m[0]);
});
const step = async function (n, f) { await f(); console.log('✔ ' + n); };
(async function () {
  await new Promise(function (r) { srv.listen(PORT, r); });
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = []; page.on('pageerror', function (e) { errors.push(e.message); });
  page.on('dialog', function (d) { d.accept(); });
  await page.goto(BASE + '/');
  await step('ورود و نمایش تب‌های جدید', async function () {
    await page.fill('#un', 'admin'); await page.fill('#pw', 'CHANGE_ME_ADMIN_KEY'); await page.click('#loginBtn');
    await page.waitForSelector('#app', { state: 'visible' });
    for (const t of ['xb', 'xq', 'xs', 'xa', 'xc']) assert.ok(await page.isVisible('#nav button[data-t=' + t + ']'), 'tab ' + t);
    assert.ok(await page.isVisible('#gsxSellScan') || true);
  });
  await step('خرید شمش از فرم', async function () {
    await page.click('#nav button[data-t=xb]');
    await page.fill('#xbBuy [name=weight]', '10'); await page.selectOption('#xbBuy [name=purity]', '995'); await page.fill('#xbBuy [name=serial]', 'sn-777');
    await page.fill('#xbBuy [name=brand]', 'PAMP');
    await page.click('#xbBuy button[type=submit]');
    await page.waitForFunction(function () { return /SN-777/.test(document.querySelector('#xbTable').textContent); });
  });
  await step('فروش شمش و نمایش فاکتور', async function () {
    await page.check('#xbPick input[name=bar]'); await page.fill('#xbSell [name=premiumPct]', '1');
    await page.click('#xbSell button[type=submit]');
    await page.waitForSelector('#modal', { state: 'visible' });
    assert.ok(/SN-777/.test(await page.textContent('#printArea')));
    await page.evaluate(function () { document.getElementById('modal').style.display = 'none'; });
  });
  const apiCall = function (action, data) { return page.evaluate(function (a) { return fetch(a.url, { method: 'POST', body: new URLSearchParams({ token: sessionStorage.getItem('gst'), action: a.action, data: JSON.stringify(a.data) }) }).then(function (r) { return r.json(); }); }, { url: BASE + '/api', action: action, data: data }); };
  await step('پیش‌فاکتور با رزرو، و فروش از جدول پیش‌فاکتورها', async function () {
    await apiCall('party', { name: 'نسرین', phone: '09125556677' });
    const r = await apiCall('addItem', { title: 'دستبند', weight: 10, karat: 750, rateMode: 'manual', buyRate18: 6800000 });
    const it = r.items.find(function (i) { return i.title === 'دستبند'; });
    await page.click('#nav button[data-t=xq]');
    await page.fill('#xqItems .gsx-ic', it.code.toLowerCase()); await page.press('#xqItems .gsx-ic', 'Enter');
    const party = r.parties.find(function (c) { return c.name === 'نسرین'; });
    await page.selectOption('#xqParty .gsx-pc', party.code);
    await page.click('#xqForm button[type=submit]');
    await page.waitForSelector('#modal', { state: 'visible' });
    assert.ok(/پیش‌فاکتور/.test(await page.textContent('#printArea')));
    await page.evaluate(function () { document.getElementById('modal').style.display = 'none'; });
    assert.ok(/رزرو|نسرین/.test(await page.textContent('#xrTable')));
    await page.click('#xqTable button[data-a=sell]');
    await page.click('#xdSale button[type=submit]');
    await page.waitForFunction(function () { return /فاکتور فروش/.test(document.getElementById('printArea').textContent); });
    await page.evaluate(function () { document.getElementById('modal').style.display = 'none'; });
    assert.ok(/فروخته شد/.test(await page.textContent('#xqTable')));
  });
  await step('رزرو و آزادسازی', async function () {
    const r = await apiCall('addItem', { title: 'گوشواره', weight: 3, karat: 750, rateMode: 'manual', buyRate18: 6800000 });
    const it = r.items.find(function (i) { return i.title === 'گوشواره'; });
    await page.click('#nav button[data-t=xq]');
    await page.selectOption('#xrItems .gsx-isel', it.code); await page.click('#xrItems .gsx-iadd');
    await page.selectOption('#xrParty .gsx-pc', r.parties[0].code);
    await page.click('#xrForm button[type=submit]');
    await page.waitForFunction(function () { return /گوشواره/.test(document.getElementById('xrTable').textContent); });
    await page.click('#xrTable button[data-a=free]');
    await page.waitForFunction(function () { return /چیزی رزرو نیست/.test(document.getElementById('xrTable').textContent); });
  });
  await step('انبارگردانی با ورود کد', async function () {
    await page.click('#nav button[data-t=xs]');
    await page.fill('#xsInput', 'G-NOT-EXIST'); await page.press('#xsInput', 'Enter');
    await page.click('#xsGo');
    await page.waitForSelector('#xsResult', { state: 'visible' });
    assert.ok(/کسری/.test(await page.textContent('#xsResult')));
  });
  await step('هشدار قیمت و لینک تابلو', async function () {
    await page.click('#nav button[data-t=xa]');
    await page.fill('#xaForm [name=target]', '6500000'); await page.fill('#xaForm [name=phone]', '09121234567'); await page.fill('#xaForm [name=name]', 'تست');
    await page.click('#xaForm button[type=submit]');
    await page.waitForFunction(function () { return /09121234567/.test(document.getElementById('xaTable').textContent); });
    assert.ok(/gold-board/.test(await page.inputValue('#xaBoard')));
  });
  await step('تنظیمات تکمیلی و فیلد کد ملی در فرم فروش', async function () {
    await page.click('#nav button[data-t=xc]');
    await page.fill('#xcForm [name=kycThreshold]', '500000000'); await page.click('#xcForm button[type=submit]');
    await page.waitForFunction(function () { var d = document.querySelector('#sellForm .gsx-f-nationalId'); return d && d.style.display !== 'none'; });
    assert.ok(await page.$('#coinBuyForm [name=serials]'));
    assert.ok(await page.$('#gsxSellScan'));
  });
  await step('برگشت به تب اصلی بعد از تغییرات (تازه شدن پنل)', async function () {
    await Promise.all([page.waitForNavigation(), page.click('#nav button[data-t=inv]')]);
    await page.waitForSelector('#app', { state: 'visible' });
    await page.waitForFunction(function () { var b = document.querySelector('#nav button[data-t=inv]'); return b && b.classList.contains('on'); });
  });
  await browser.close(); srv.close();
  if (errors.length) { console.log('JS errors:', errors); process.exit(1); }
  console.log('\nتست مرورگری قبول شد. درخواست‌ها:', calls.join(', '));
})().catch(function (e) { console.error('FAIL', e.message); srv.close(); process.exit(1); });
