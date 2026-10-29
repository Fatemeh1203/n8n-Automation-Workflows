function sha256(ascii) {
  function rr(v, a) { return (v >>> a) | (v << (32 - a)); }
  var mp = Math.pow, mw = mp(2, 32), i, j, res = '', words = [], blen = ascii.length * 8, hash = [], k = [], pc = 0, cand = {};
  for (var c = 2; pc < 64; c++) { if (!cand[c]) { for (i = 0; i < 313; i += c) cand[i] = c; hash[pc] = (mp(c, .5) * mw) | 0; k[pc++] = (mp(c, 1 / 3) * mw) | 0; } }
  hash = hash.slice(0, 8);
  ascii += '\x80'; while (ascii.length % 64 - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) { j = ascii.charCodeAt(i); words[i >> 2] |= j << ((3 - i) % 4) * 8; }
  words[words.length] = ((blen / mw) | 0); words[words.length] = blen;
  for (j = 0; j < words.length;) {
    var w = words.slice(j, j += 16), oh = hash; hash = hash.slice(0, 8);
    for (i = 0; i < 64; i++) {
      var w15 = w[i - 15], w2 = w[i - 2], a = hash[0], e = hash[4];
      var t1 = hash[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i] + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))) | 0);
      var t2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(t1 + t2) | 0].concat(hash); hash[4] = (hash[4] + t1) | 0;
    }
    for (i = 0; i < 8; i++) hash[i] = (hash[i] + oh[i]) | 0;
  }
  for (i = 0; i < 8; i++) for (j = 3; j + 1; j--) { var b = (hash[i] >> (j * 8)) & 255; res += ((b < 16) ? 0 : '') + b.toString(16); }
  return res;
}
const hashPw = function (salt, pw) { return sha256(unescape(encodeURIComponent(salt + '|' + pw))); };

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit';
const req = $('Check Key').first().json;
const p = req.payload || {};
const rows = function (n) { try { return $(n).all().map(function (i) { return i.json; }).filter(function (r) { return r && (r.code || r.key || r.invoiceNo); }); } catch (e) { return []; } };
const items = rows('Get Inventory');
const txs = rows('Get Transactions');
const parties = rows('Get Customers');
const orders = rows('Get Orders');
const siteInvoices = rows('Get Site Invoices');
const insts = rows('Get Installments');
const users = rows('Get Users');
const cheques = rows('Get Cheques');
const closings = rows('Get Closings');
const auditRows = rows('Get Audit');
const setRows = rows('Get Settings');
const cfg = {};
setRows.forEach(function (r) { cfg[r.key] = r.value; });

const num = function (x) { const t = String(x == null ? '' : x).replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); }).replace(/[٫]/g, '.').replace(/[^0-9.\-]/g, ''); const n = Number(t); return Number.isFinite(n) ? n : 0; };
const str = function (x) { return String(x == null ? '' : x).trim(); };
const r3 = function (n) { return Math.round(n * 1000) / 1000; };
const money = function (n) { return Math.round(Number(n) || 0).toLocaleString('fa-IR'); };
const esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
const fd = function (n) { return Number(n || 0).toLocaleString('fa-IR', { useGrouping: false, maximumFractionDigits: 3 }); };
const pick = function (v, d) { return v === undefined || v === null || v === '' ? d : v; };

// ---- settings (public part)
const settings = {
  shopName: pick(cfg.shopName, 'طلا و جواهر شما'), shopPhone: pick(cfg.shopPhone, ''), shopAddress: pick(cfg.shopAddress, ''),
  ownerEmail: pick(cfg.ownerEmail, ''), ownerChatId: pick(cfg.ownerChatId, ''), logoUrl: pick(cfg.logoUrl, ''),
  vatPct: num(pick(cfg.vatPct, '10')), feePct: num(pick(cfg.feePct, '12')), profitPct: num(pick(cfg.profitPct, '7')),
  buybackDeduction: num(pick(cfg.buybackDeduction, '2')), abCommission: num(pick(cfg.abCommission, '0')), feePerGram: num(pick(cfg.feePerGram, '0')),
  savingsFeePct: num(pick(cfg.savingsFeePct, '1')), branches: pick(cfg.branches, ''), taxGoodsId: pick(cfg.taxGoodsId, ''), sellerEconomicCode: pick(cfg.sellerEconomicCode, ''),
  sellerNationalId: pick(cfg.sellerNationalId, ''), taxMemoryId: pick(cfg.taxMemoryId, ''), smsEnabled: pick(cfg.smsEnabled, ''), smsProvider: pick(cfg.smsProvider, 'kavenegar'),
  smsSender: pick(cfg.smsSender, ''), smsKeySet: !!cfg.smsApiKey, printMode: pick(cfg.printMode, 'a5'), labelSize: pick(cfg.labelSize, '50x30'),
};
const NUM_SET = ['vatPct', 'feePct', 'profitPct', 'buybackDeduction', 'abCommission', 'feePerGram', 'savingsFeePct'];
const TXT_SET = ['shopName', 'shopPhone', 'shopAddress', 'ownerEmail', 'ownerChatId', 'logoUrl', 'branches', 'taxGoodsId', 'sellerEconomicCode', 'sellerNationalId', 'taxMemoryId', 'smsEnabled', 'smsProvider', 'smsSender', 'printMode', 'labelSize'];
const smsOn = settings.smsEnabled === 'yes' && !!cfg.smsApiKey;
const sms = function (to, text) { if (smsOn && str(to)) writes.push({ op: 'sms', row: { to: str(to), text: text, apiKey: cfg.smsApiKey, sender: settings.smsSender, provider: settings.smsProvider } }); };

// ---- market prices
const market = $input.first().json || {};
const by = {};
const cats = (market.data && market.data.categories) || {};
for (const list of Object.values(cats)) { for (const it of (list || [])) { if (it && it.symbol) by[it.symbol] = Number(it.price) || 0; } }
// سکه‌ها: [کلید، نام، نماد قیمت، نماد حباب]
const COINS = [['emami', 'سکه امامی', 'COIN_EMAMI_IRR', 'COIN_EMAMI_BUBBLE_IRR'], ['bahar', 'سکه بهار آزادی', 'COIN_BAHAR_IRR', 'COIN_BAHAR_BUBBLE_IRR'], ['nim', 'نیم سکه', 'COIN_HALF_IRR', 'COIN_HALF_BUBBLE_IRR'], ['rob', 'ربع سکه', 'COIN_QUARTER_IRR', 'COIN_QUARTER_BUBBLE_IRR'], ['gerami', 'سکه گرمی', 'COIN_GRAMI_IRR', 'COIN_GRAMI_BUBBLE_IRR']];
const COIN_LABELS = COINS.map(function (c) { return c[1]; });
const coinPrices = {}, coinBubbles = {};
COINS.forEach(function (c) { coinPrices[c[0]] = by[c[2]] || 0; coinBubbles[c[0]] = by[c[3]] || 0; });
const prices = {
  rate18: by.GOLD_18K_IRR || 0, rate24: by.GOLD_24K_IRR || 0, rate740: by.GOLD_18K_740_IRR || 0, used: by.GOLD_USED_IRR || 0,
  mazaneh: by.GOLD_MESGHAL_IRR || 0, abCash: by.GOLD_FUTURES || 0, abWholesale: by.GOLD_MELTED_WHOLESALE || 0, abTransfer: by.GOLD_MELTED_TRANSFER || 0,
  emami: coinPrices.emami, bahar: coinPrices.bahar, half: coinPrices.nim, quarter: coinPrices.rob, gerami: coinPrices.gerami, coins: coinPrices, bubbles: coinBubbles,
  silver925: by.SILVER_925_IRR || 0, silver999: by.SILVER_999_IRR || 0, ounce: by.XAU_USD || 0, usd: by.USD_IRR_FREE || 0, eur: by.EUR_IRR_FREE || 0,
  fromOunce: by.XAU_USD && by.USD_IRR_FREE ? Math.round(by.XAU_USD * by.USD_IRR_FREE / 31.1035 * 0.75) : 0,
  updated: market.data && market.data.generated_at ? new Date(market.data.generated_at).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }) : '',
};

// ---- dates
const now = new Date();
const day = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });
const jp = {};
new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now).forEach(function (x) { jp[x.type] = x.value; });
const jalali = String(jp.year).replace(/\D/g, '') + '/' + jp.month + '/' + jp.day;
let seq = 0;
const newCode = function (prefix) { seq++; return prefix + '-' + Date.now().toString(36).toUpperCase().slice(-5) + seq.toString(36).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase(); };

const writes = [];
let message = '';
let error = '';
let invoiceHtml = '';
const upsert = function (list, row) { const i = list.findIndex(function (r) { return r.code === row.code; }); if (i >= 0) list[i] = Object.assign({}, list[i], row); else list.push(row); return i >= 0 ? list[i] : row; };
const put = function (op, list) { return function (row) { const full = upsert(list, row); writes.push({ op: op, row: Object.assign({}, full) }); return full; }; };
const putItem0 = put('item', items);
const ITEM_NEW = { stoneCost: 0, cert: '', metal: '', consign: '', supplierCode: '', photoUrl: '', stones: '', branch: '' };
const putItem = function (row) { if (!items.some(function (r) { return r.code === row.code; })) row = Object.assign({}, ITEM_NEW, { branch: str(p.branch) || (me && me.branch) || '' }, row); return putItem0(row); };
const putParty = put('party', parties);
const putOrder = put('order', orders);
const putInst = put('inst', insts);
const putSetting = function (k, v) { writes.push({ op: 'setting', row: { key: k, value: String(v) } }); cfg[k] = String(v); };
const TX_DEFAULT = { qty: 0, feeAmt: 0, profitAmt: 0, branch: '', user: '', itemCode: '', title: '', weight750: 0, rate18: 0, amount: 0, costBasis: 0, operatingProfit: 0, holdingGain: 0, realProfit: 0, customerCode: '', customerName: '', note: '', payMethod: '', vat: 0, invoice: '', grams: 0, category: '', voided: '' };
const putTx = function (fields) { const row = Object.assign({ code: newCode('T'), day: day, dateFa: jalali }, TX_DEFAULT, { branch: str(p.branch) || (me && me.branch) || '', user: me ? me.code : '' }, fields); const full = upsert(txs, row); writes.push({ op: 'tx', row: Object.assign({}, full) }); return full; };

// مانده‌ی حساب طرف (مثبت = او به ما بدهکار است) و حساب طلایی (گرم)
function ledgerOf(code) {
  let m = 0, g = 0;
  txs.forEach(function (t) {
    if (t.voided || t.customerCode !== code) return;
    const a = Number(t.amount) || 0, v = Number(t.vat) || 0, gr = Number(t.grams) || 0;
    if (t.type === 'sell') m += a + v;
    else if (t.type === 'return') m -= a + v;
    else if (t.type === 'buyback') m -= a;
    else if (t.type === 'buy') { if (t.payMethod === 'طلایی') { m -= a - Math.round(Number(t.weight750) * Number(t.rate18)); g -= gr; } else m -= a; }
    else if (t.type === 'receive' || t.type === 'deposit') { m -= a; g -= gr; }
    else if (t.type === 'pay') { m += a; g += gr; }
    else if (t.type === 'wsOut') g += gr;
    else if (t.type === 'wsIn') { g -= gr; m -= a; }
    else if (t.type === 'wsLoss') g -= gr;
    else if (t.type === 'goldSave') g -= gr;
    else if (t.type === 'goldRedeem') { g += gr; if (t.payMethod === 'اعتبار حساب') m -= a; }
  });
  return { money: m, grams: r3(g) };
}
function resolveParty(mode, code, name, phone, kind) {
  if (mode === 'existing') return parties.find(function (c) { return c.code === str(code); }) || null;
  if (mode === 'new' && str(name)) return putParty({ code: newCode('C'), name: str(name), phone: str(phone), email: '', telegramChatId: '', birthday: '', anniversary: '', notes: '', kind: kind || 'customer' });
  return null;
}
const partyFields = function (c) { return { customerCode: c ? c.code : '', customerName: c ? c.name : '' }; };
// نرخ ۱۸ عیار: بازار، مظنه، انس×دلار، یا دستی
const rateFrom = function (mode, manual, q) {
  q = q || p;
  if (mode === 'manual') return num(manual);
  if (mode === 'mazaneh') return rateFromMazaneh(num(q.mazaneh) || prices.mazaneh);
  if (mode === 'ounce') { const o = num(q.ounce) || prices.ounce, u = num(q.usd) || prices.usd; return o && u ? Math.round(o * u / 31.1035 * 0.75) : 0; }
  return prices.rate18 || num(manual);
};
const silverRate = function (q) { return num((q || p).silverRate) || prices.silver925; };
// پس‌انداز طلایی، کارگاه و صندوق
function savingsOf(code) { let g = 0; txs.forEach(function (t) { if (t.voided || t.customerCode !== code) return; if (t.type === 'goldSave') g += Number(t.grams) || 0; if (t.type === 'goldRedeem') g -= Number(t.grams) || 0; }); return r3(g); }
function makerBook(code) { let g = 0, c = 0; txs.forEach(function (t) { if (t.voided || t.customerCode !== code) return; const gr = Number(t.grams) || 0, cb = Number(t.costBasis) || 0; if (t.type === 'wsOut') { g += gr; c += cb; } if (t.type === 'wsIn' || t.type === 'wsLoss') { g -= gr; c -= cb; } }); return { grams: r3(g), cost: Math.round(c), avg: g > 0 ? c / g : 0 }; }
function cashEff(t) { const pm = String(t.payMethod || ''); if (pm.indexOf('چک') === 0 || pm === 'اعتبار حساب' || pm === 'طلایی') return 0; const a = Number(t.amount) || 0; if (['receive', 'deposit', 'goldSave'].indexOf(t.type) >= 0) return a; if (['pay', 'expense', 'melt', 'goldRedeem'].indexOf(t.type) >= 0) return -a; return 0; }
const w750Of = function (w, k) { return r3(num(w) * (num(k) || 750) / 750); };
// مثقال آبشده (عیار ۷۰۵، ۴٫۶۰۸ گرم) و نرخ ۱۸ عیارِ معادلِ مظنه
const mesghalOf = function (w750) { return w750 * 750 / 705 / 4.608; };
const rateFromMazaneh = function (m) { return Math.round(m * 750 / 705 / 4.608); };
const ITEM_DEFAULT = { stoneCost: 0, cert: '', makingCost: 0, soldTx: '', note: '' };
// دفتر سکه: موجودی و میانگین بهای خرید هر نوع سکه
function coinBook() {
  const b = {};
  COINS.forEach(function (c) { b[c[0]] = { key: c[0], label: c[1], qty: 0, cost: 0 }; });
  txs.forEach(function (t) {
    if (t.voided || !(Number(t.qty) > 0)) return;
    const c = COINS.find(function (x) { return x[1] === t.category; }); if (!c) return;
    const e = b[c[0]], q = Number(t.qty);
    if (t.type === 'buy') { e.qty += q; e.cost += Number(t.amount) || 0; }
    else if (t.type === 'sell') { const avg = e.qty ? e.cost / e.qty : 0; e.cost -= avg * q; e.qty -= q; }
  });
  Object.keys(b).forEach(function (k) { const e = b[k]; e.cost = Math.round(e.cost); e.avg = e.qty ? Math.round(e.cost / e.qty) : 0; e.market = coinPrices[k] || 0; e.bubble = coinBubbles[k] || 0; e.value = e.qty * e.market; });
  return b;
}
const jd = function (s) { return String(s || '').replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); }); };
function addMonthsJ(s, k) { const q = jd(s).split('/').map(Number); let y = q[0], m = q[1] + k, d = q[2]; while (m > 12) { m -= 12; y++; } const dim = m <= 6 ? 31 : (m <= 11 ? 30 : 29); if (d > dim) d = dim; return y + '/' + String(m).padStart(2, '0') + '/' + String(d).padStart(2, '0'); }
// تقسیط مانده‌ی فاکتور
function makeInstallments(inv, party, due, n, start, every) {
  n = Math.max(1, Math.min(36, Math.round(num(n)))); every = Math.max(1, Math.round(num(every) || 1));
  const first = /^\d{4}\/\d{1,2}\/\d{1,2}$/.test(jd(start)) ? jd(start) : addMonthsJ(jalali, 1);
  const each = Math.floor(due / n / 1000) * 1000 || Math.floor(due / n);
  for (let i = 0; i < n; i++) putInst({ code: newCode('Q'), invoice: inv, customerCode: party.code, customerName: party.name, phone: party.phone || '', n: i + 1, count: n, dueDate: addMonthsJ(first, i * every), amount: i < n - 1 ? each : due - each * (n - 1), paid: 0, status: 'open', paidDate: '' });
  return n;
}
// پرداخت، نسیه، اقساط، فاکتور و ایمیل یک فروش
function finishSale(inv, party, lines, sum, vat, real, tradeIn) {
  const total = sum + vat, payable = total - tradeIn;
  const method = str(p.payMethod) || 'نقد';
  const paid = p.paid === '' || p.paid == null ? Math.max(0, payable) : Math.round(num(p.paid));
  const due = payable - paid;
  if (due > 0 && !party) throw new Error('برای فروش نسیه، مشتری را مشخص کنید (مشتری قدیمی یا جدید).');
  if (payable >= 0 && paid > 0) {
    const rx = putTx(Object.assign({ type: 'receive', amount: paid, invoice: inv, payMethod: method, title: 'دریافت بابت فاکتور ' + inv }, partyFields(party)));
    if (method === 'چک') putCheque({ code: newCode('CH'), dir: 'in', partyCode: party ? party.code : '', partyName: party ? party.name : 'مشتری گذری', bank: str(p.chequeBank), number: str(p.chequeNo), sayad: str(p.chequeSayad), amount: paid, dueDate: str(p.chequeDue), status: 'pending', txCode: rx.code, dateFa: jalali, settledDate: '', spentTo: '', note: 'فاکتور ' + inv, branch: rx.branch });
  }
  if (payable < 0) putTx(Object.assign({ type: 'pay', amount: -payable, invoice: inv, payMethod: method, title: 'مابه‌التفاوت تعویض ' + inv }, partyFields(party)));
  let nInst = 0;
  if (due > 0 && num(p.instCount) >= 1) nInst = makeInstallments(inv, party, due, p.instCount, p.instStart, p.instEvery);
  invoiceHtml = invoiceDoc(inv, party, lines, { sum: sum, vat: vat, total: total, tradeIn: tradeIn, paid: payable >= 0 ? paid : 0, method: method, due: Math.max(0, due), inst: nInst ? insts.filter(function (q) { return q.invoice === inv; }) : [] });
  if ((p.sendEmail === true || p.sendEmail === 'on') && party && party.email) writes.push({ op: 'email', row: { to: party.email, bcc: settings.ownerEmail, subject: 'فاکتور خرید — ' + settings.shopName + ' — ' + inv, html: invoiceHtml } });
  if (party) sms(party.phone, settings.shopName + '\nفاکتور ' + inv + '\nمبلغ: ' + money(total) + ' تومان' + (due > 0 ? '\nمانده: ' + money(due) : '') + '\nبا تشکر از خرید شما');
  message = 'فاکتور ' + inv + ' ثبت شد. سود واقعی: ' + money(real) + ' تومان' + (due > 0 ? ' · مانده‌ی نسیه: ' + money(due) + (nInst ? ' در ' + fd(nInst) + ' قسط' : '') : '');
}
function settlePaid(p, total, party, invoice, title) {
  const paid = p.settle === 'credit' ? Math.round(num(p.paid)) : (p.paid === '' || p.paid == null ? total : Math.round(num(p.paid)));
  if (paid < total && !party) throw new Error('برای خرید نسیه، طرف حساب را مشخص کنید.');
  if (paid > 0) putTx(Object.assign({ type: 'pay', amount: paid, invoice: invoice, payMethod: str(p.payMethod) || 'نقد', title: title }, partyFields(party)));
  return paid;
}

function invoiceDoc(inv, cust, lines, totals) {
  const td = 'padding:7px;border:1px solid #eee';
  const logo = settings.logoUrl ? "<img src='" + esc(settings.logoUrl) + "' style='height:52px;border-radius:8px'>" : "<div style='font-size:30px'>🥇</div>";
  const H = [];
  H.push("<div style='direction:rtl;font-family:Vazirmatn,Tahoma,Arial,sans-serif;max-width:640px;margin:0 auto;border:1px solid #eee;border-radius:14px;overflow:hidden;background:#fff;color:#2b2b2b'>");
  H.push("<div style='background:linear-gradient(135deg,#b8860b,#7a5901);color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center'><div><div style='font-size:20px;font-weight:bold'>" + esc(settings.shopName) + "</div><div style='font-size:12px;opacity:.9'>" + esc(settings.shopAddress) + (settings.shopPhone ? ' — ' + esc(settings.shopPhone) : '') + "</div></div>" + logo + "</div>");
  H.push("<div style='padding:14px 18px'><div style='display:flex;justify-content:space-between;font-size:13px;color:#555;margin-bottom:8px'><span>فاکتور فروش: <b>" + inv + "</b></span><span>تاریخ: " + jalali.replace(/\d/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'[c]; }) + "</span></div>");
  H.push("<div style='font-size:14px;margin-bottom:8px'>مشتری: <b>" + esc(cust ? cust.name : 'مشتری گذری') + "</b>" + (cust && cust.phone ? ' — ' + esc(cust.phone) : '') + "</div>");
  H.push("<table style='border-collapse:collapse;width:100%;font-size:13px'><tr style='background:#faf6ec'><th style='" + td + "'>شرح</th><th style='" + td + "'>وزن</th><th style='" + td + "'>عیار</th><th style='" + td + "'>ارزش طلا</th><th style='" + td + "'>اجرت و سود</th><th style='" + td + "'>مبلغ (تومان)</th></tr>");
  lines.forEach(function (l) { H.push("<tr><td style='" + td + "'>" + esc(l.title) + "</td><td style='" + td + ";text-align:center'>" + (l.weight ? Number(l.weight).toLocaleString('fa-IR', { maximumFractionDigits: 3 }) : (l.qty ? Number(l.qty).toLocaleString('fa-IR') + ' عدد' : '—')) + "</td><td style='" + td + ";text-align:center'>" + (l.karat ? Number(l.karat).toLocaleString('fa-IR', { useGrouping: false }) : '—') + "</td><td style='" + td + "'>" + money(l.gold) + "</td><td style='" + td + "'>" + money(l.price - l.gold) + "</td><td style='" + td + "'>" + money(l.price) + "</td></tr>"); });
  H.push("</table><table style='width:100%;font-size:14px;margin-top:8px'>");
  const row = function (k, v, bold) { H.push("<tr><td style='padding:5px 8px;color:#555" + (bold ? ";font-weight:bold;font-size:16px;border-top:2px solid #b8860b" : '') + "'>" + k + "</td><td style='padding:5px 8px;text-align:left" + (bold ? ";font-weight:bold;font-size:16px;color:#b8860b;border-top:2px solid #b8860b" : '') + "'>" + money(v) + " تومان</td></tr>"); };
  row('جمع کالاها', totals.sum);
  if (totals.vat) row('مالیات بر ارزش افزوده (' + settings.vatPct + '٪ اجرت و سود)', totals.vat);
  row('مبلغ فاکتور', totals.total, true);
  if (totals.tradeIn) row('کسر: طلای تعویضی مشتری', -totals.tradeIn);
  row('پرداخت‌شده (' + esc(totals.method) + ')', totals.paid);
  if (totals.due) row('مانده (نسیه)', totals.due);
  if (totals.inst && totals.inst.length) { H.push("</table><div style='font-size:13px;margin-top:8px;color:#555'>📅 اقساط:</div><table style='border-collapse:collapse;width:100%;font-size:13px'>"); totals.inst.forEach(function (q) { H.push("<tr><td style='" + td + "'>قسط " + q.n + "</td><td style='" + td + "'>" + jd(q.dueDate).replace(/\d/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'[c]; }) + "</td><td style='" + td + "'>" + money(q.amount) + " تومان</td></tr>"); }); }
  H.push("</table><div style='display:flex;justify-content:space-between;margin-top:16px;font-size:12px;color:#777'><span>مهر و امضای فروشنده</span><span>با تشکر از خرید شما 🙏</span></div></div>");
  H.push("<div style='background:#faf6ec;color:#8a6d1b;text-align:center;padding:7px;font-size:11px'>" + esc(settings.shopName) + (settings.shopPhone ? ' • ' + esc(settings.shopPhone) : '') + "</div></div>");
  return H.join('');
}

function addBuyback(o, party, invoice, rate) {
  const w = num(o.weight), k = num(o.karat) || 750, ded = num(pick(o.deductionPct, settings.buybackDeduction));
  const w750 = w750Of(w, k);
  const price = Math.round(w750 * rate * (1 - ded / 100));
  const item = putItem({ code: newCode('G'), stoneCost: 0, cert: '', title: str(o.title) || 'طلای کهنه', category: 'طلای دست‌دوم', weight: w, karat: k, weight750: w750, buyRate18: w750 ? Math.round(price / w750) : 0, makingCost: 0, buyCost: price, buyDay: jalali, supplier: party ? party.name : 'مشتری گذری', status: 'in_stock', soldTx: '', note: 'کسر افت ' + ded + '٪' });
  putTx(Object.assign({ type: 'buyback', itemCode: item.code, title: item.title, weight750: w750, rate18: rate, amount: price, costBasis: price, invoice: invoice, category: 'طلای دست‌دوم', note: 'کسر افت ' + ded + '٪' }, partyFields(party)));
  return { item: item, price: price };
}

// ---------- احراز هویت: کاربران، نقش‌ها، توکن ۱۲ ساعته، قفل پس از ۵ رمز اشتباه
const DEFAULT_KEY = 'CHANGE_ME_ADMIN_KEY';
const nowMs = Date.now();
const timeFa = now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Tehran', hour: '2-digit', minute: '2-digit' });
const putUser = put('user', users);
const putCheque = put('cheque', cheques);
const putClosing = put('closing', closings);
const authWrites = [];
const ROLE_FA = { owner: 'مدیر', accountant: 'حسابدار', seller: 'فروشنده' };
const SELLER_OK = ['all', 'login', 'sell', 'coinSell', 'buyback', 'order', 'orderStatus', 'payment', 'payInstallment', 'party', 'cheque', 'changePassword', 'goldSave', 'closeDay'];
const OWNER_ONLY = ['settings', 'userSave', 'backupNow', 'restore', 'portalReset'];
const allowed = function (role, a) { if (role === 'owner') return true; if (OWNER_ONLY.indexOf(a) >= 0) return false; return role === 'accountant' || SELLER_OK.indexOf(a) >= 0; };
const audit = function (u, action, summary, list) { (list || writes).push({ op: 'audit', row: { code: newCode('L'), at: now.toISOString(), dateFa: jalali, time: timeFa, user: u, action: action, summary: String(summary || '').slice(0, 300) } }); };
let secret = cfg.token_secret;
if (!secret) { secret = sha256(String(Math.random()) + nowMs).slice(0, 32); authWrites.push({ op: 'setting', row: { key: 'token_secret', value: secret } }); }
let portalSecret = cfg.portal_secret;
if (!portalSecret) { portalSecret = sha256(String(Math.random()) + 'p' + nowMs).slice(0, 32); authWrites.push({ op: 'setting', row: { key: 'portal_secret', value: portalSecret } }); }
const portalToken = function (code) { return sha256((cfg.portal_secret || portalSecret) + '|' + code).slice(0, 20); };
const sign = function (u, exp) { return sha256(secret + '|' + u.code + '|' + exp + '|' + u.hash).slice(0, 32); };
const makeToken = function (u) { const exp = nowMs + 12 * 3600 * 1000; return u.code + '.' + exp + '.' + sign(u, exp); };
let me = null, token = '', authError = '', wantBackup = false;
const A = req.action;
if (A === 'login') {
  const un = str(p.username).toLowerCase() || 'admin', pw = String(p.password || '');
  const lk = String(cfg['lock_' + un] || '0|0').split('|'), fails = Number(lk[0]) || 0, until = Number(lk[1]) || 0;
  if (until > nowMs) authError = 'به‌خاطر رمز اشتباهِ پشت‌سرهم، ورود این کاربر تا ' + fd(Math.ceil((until - nowMs) / 60000)) + ' دقیقه‌ی دیگر قفل است.';
  else {
    let u = users.find(function (x) { return x.code === un; }), ok = false;
    if (!u && !users.length && un === 'admin') {
      ok = cfg.admin_hash ? hashPw(cfg.admin_salt || '', pw) === cfg.admin_hash : pw === DEFAULT_KEY;
      if (ok) { const salt = cfg.admin_hash ? (cfg.admin_salt || '') : sha256(String(Math.random())).slice(0, 16); u = putUser({ code: 'admin', name: 'مدیر', role: 'owner', salt: salt, hash: cfg.admin_hash || hashPw(salt, pw), active: 'yes', branch: '' }); }
    } else ok = !!u && u.active !== 'no' && hashPw(u.salt || '', pw) === u.hash;
    if (ok) { me = u; token = makeToken(u); if (fails || until) authWrites.push({ op: 'setting', row: { key: 'lock_' + un, value: '0|0' } }); audit(u.code, 'login', 'ورود به پنل', authWrites); }
    else {
      const f = fails + 1;
      authWrites.push({ op: 'setting', row: { key: 'lock_' + un, value: f >= 5 ? '0|' + (nowMs + 15 * 60000) : f + '|0' } });
      audit(un, 'loginFail', 'ورود ناموفق (' + fd(f) + ')' + (f >= 5 ? ' — قفل ۱۵ دقیقه' : ''), authWrites);
      authError = f >= 5 ? 'رمز ۵ بار اشتباه وارد شد؛ ورود ۱۵ دقیقه قفل شد.' : 'نام کاربری یا رمز اشتباه است.';
    }
  }
} else {
  const tk = String(req.token || '').split('.'), u = users.find(function (x) { return x.code === tk[0]; });
  if (u && u.active !== 'no' && Number(tk[1]) > nowMs && tk[2] === sign(u, tk[1])) { me = u; token = req.token; }
}
if (!me) return [{ json: { response: { ok: false, unauthorized: true, error: authError }, writes: authWrites } }];
if (!allowed(me.role, A)) error = 'برای این کار دسترسی ندارید (نقش شما: ' + ROLE_FA[me.role] + ').';

try {
  if (error) throw new Error(error);
  if (A === 'all' || A === 'login') {
  } else if (A === 'addItem') {
    const silver = p.metal === 'silver';
    const weight = num(p.weight), karat = num(p.karat) || (silver ? 925 : 750);
    const rate = silver ? (p.rateMode === 'manual' ? num(p.buyRate18) : silverRate(p)) : rateFrom(p.rateMode, p.buyRate18);
    const qty = Math.max(1, Math.min(100, Math.round(num(p.qty) || 1)));
    const making = Math.round(num(p.makingCost)), stone = Math.round(num(p.stoneCost));
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'supplier');
    const settle = p.settle || 'cash';
    if (!(weight > 0)) throw new Error('وزن را درست وارد کنید.');
    if (!(rate > 0)) throw new Error('نرخ در دسترس نیست؛ نرخ را دستی وارد کنید.');
    if (settle !== 'cash' && !party) throw new Error('برای خرید نسیه، طلایی یا امانی، همکار/تأمین‌کننده را مشخص کنید.');
    if (silver && settle === 'gold') throw new Error('تسویه‌ی طلایی برای نقره ممکن نیست.');
    const w750 = silver ? r3(weight * karat / 925) : w750Of(weight, karat);
    const consign = settle === 'consign';
    const batch = newCode(consign ? 'CON' : 'BUY');
    let total = 0;
    for (let i = 0; i < qty; i++) {
      const item = putItem({ code: newCode('G'), title: str(p.title) || (silver ? 'کالای نقره' : 'کالای طلا'), category: str(p.category) || 'سایر', weight: weight, karat: karat, weight750: w750, buyRate18: rate, makingCost: making, stoneCost: stone, cert: str(p.cert), buyCost: Math.round(w750 * rate + making + stone), buyDay: jalali, supplier: party ? party.name : str(p.partyName), supplierCode: party ? party.code : '', metal: silver ? 'silver' : '', consign: consign ? 'yes' : '', stones: str(p.stones), photoUrl: str(p.photoUrl), status: 'in_stock', soldTx: '', note: str(p.note) });
      total += item.buyCost;
      putTx(Object.assign({ type: consign ? 'consignIn' : 'buy', itemCode: item.code, title: item.title, weight750: w750, rate18: rate, amount: item.buyCost, costBasis: item.buyCost, invoice: batch, category: item.category, payMethod: consign ? 'امانی' : (settle === 'gold' ? 'طلایی' : (settle === 'credit' ? 'نسیه' : str(p.payMethod) || 'نقد')), grams: settle === 'gold' ? w750 : 0, note: str(p.note) }, partyFields(party)));
    }
    const paid = settle === 'cash' ? total : (consign ? 0 : Math.round(num(p.paid)));
    if (paid > 0) putTx(Object.assign({ type: 'pay', amount: paid, invoice: batch, payMethod: str(p.payMethod) || 'نقد', title: 'پرداخت بابت خرید ' + batch }, partyFields(party)));
    message = fd(qty) + ' قلم ' + (consign ? 'امانی ' : '') + 'به موجودی اضافه شد (جمع ' + money(total) + ' تومان).' + (consign ? ' بدهی به بنکدار فقط پس از فروش ثبت می‌شود.' : '');
  } else if (A === 'buyback') {
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'customer');
    const rate = rateFrom(p.rateMode, p.rate18);
    if (!(num(p.weight) > 0)) throw new Error('وزن را درست وارد کنید.');
    if (!(rate > 0)) throw new Error('نرخ در دسترس نیست.');
    const inv = newCode('BB');
    const r = addBuyback(p, party, inv, rate);
    const paid = p.paid === '' || p.paid == null ? r.price : Math.round(num(p.paid));
    if (paid < r.price && !party) throw new Error('برای پرداخت ناقص، مشتری را مشخص کنید.');
    if (paid > 0) putTx(Object.assign({ type: 'pay', amount: paid, invoice: inv, payMethod: str(p.payMethod) || 'نقد', title: 'پرداخت بابت خرید طلای کهنه' }, partyFields(party)));
    message = 'طلای کهنه به ارزش ' + money(r.price) + ' تومان خریداری و به موجودی اضافه شد.';
  } else if (A === 'sell') {
    const codes = (Array.isArray(p.itemCodes) ? p.itemCodes : String(p.itemCodes || '').split(',')).map(str).filter(Boolean);
    const sel = codes.map(function (c) { return items.find(function (r) { return r.code === c && r.status === 'in_stock'; }); });
    if (!codes.length || sel.some(function (x) { return !x; })) throw new Error('کالای انتخاب‌شده در موجودی نیست.');
    const byMaz = p.priceMode === 'mazaneh';
    let rate, comm = 0, maz = 0;
    if (byMaz) { maz = p.rateMode === 'manual' ? num(p.mazaneh) : (prices.mazaneh || num(p.mazaneh)); if (!(maz > 0)) throw new Error('مظنه در دسترس نیست؛ مظنه را دستی وارد کنید.'); rate = rateFromMazaneh(maz); comm = num(pick(p.commission, settings.abCommission)); }
    else rate = rateFrom(p.rateMode, p.rate18);
    if (!(rate > 0)) throw new Error('نرخ روز در دسترس نیست؛ نرخ را دستی وارد کنید.');
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'customer');
    const fee = num(pick(p.feePct, settings.feePct)), prof = num(pick(p.profitPct, settings.profitPct)), feeG = num(pick(p.feePerGram, settings.feePerGram));
    const sRate = silverRate(p);
    const lines = sel.map(function (it) {
      const silver = it.metal === 'silver', lr = silver ? sRate : rate;
      const w750 = Number(it.weight750) || w750Of(it.weight, it.karat), gold = Math.round(w750 * lr), stone = Number(it.stoneCost) || 0;
      let price, feeAmt = 0;
      if (byMaz && !silver) price = Math.round(gold + comm * mesghalOf(w750));
      else if (p.feeMode === 'gram') { feeAmt = Math.round(feeG * Number(it.weight)); price = Math.round((gold + feeAmt + stone) * (1 + prof / 100)); }
      else { feeAmt = Math.round(gold * fee / 100); price = Math.round((gold + feeAmt + stone) * (1 + prof / 100)); }
      return { it: it, w750: w750, gold: gold, stone: stone, price: price, feeAmt: feeAmt, rate: lr };
    });
    if (p.priceMode === 'fixed') { const tot = num(p.amount), g = lines.reduce(function (s, l) { return s + l.gold; }, 0); if (!(tot > 0)) throw new Error('مبلغ توافقی را وارد کنید.'); lines.forEach(function (l) { l.price = Math.round(tot * l.gold / g); l.feeAmt = 0; }); }
    const disc = Math.round(num(p.discount)), sumP = lines.reduce(function (s, l) { return s + l.price; }, 0);
    if (disc > 0) lines.forEach(function (l) { l.price -= Math.round(disc * l.price / sumP); });
    const vatOn = p.vatOn === true || p.vatOn === 'on' || p.vatOn === 'true';
    const inv = newCode('INV');
    let sum = 0, vat = 0, real = 0;
    lines.forEach(function (l) {
      const it = l.it, v = vatOn ? Math.round(Math.max(0, l.price - l.gold) * settings.vatPct / 100) : 0;
      const hold = l.gold - Math.round(l.w750 * Number(it.buyRate18)), op = l.price - l.gold - Number(it.makingCost || 0) - l.stone, rp = l.price - Number(it.buyCost);
      l.feeAmt = Math.max(0, Math.min(l.feeAmt, l.price - l.gold - l.stone));
      const tx = putTx(Object.assign({ type: 'sell', itemCode: it.code, title: it.title, weight750: l.w750, rate18: l.rate, feeAmt: l.feeAmt, profitAmt: l.price - l.gold - l.stone - l.feeAmt, amount: l.price, vat: v, costBasis: Number(it.buyCost), operatingProfit: op, holdingGain: hold, realProfit: rp, invoice: inv, category: it.category, payMethod: str(p.payMethod) || 'نقد', note: str(p.note) || (byMaz ? 'مظنه ' + money(maz) + (comm ? ' + کارمزد ' + money(comm) + ' هر مثقال' : '') : '') }, partyFields(party)));
      putItem({ code: it.code, status: 'sold', soldTx: tx.code });
      if (it.consign === 'yes') putTx({ type: 'buy', itemCode: it.code, title: it.title + ' (تسویه‌ی امانی)', weight750: l.w750, rate18: Number(it.buyRate18), amount: Number(it.buyCost), costBasis: Number(it.buyCost), invoice: inv, category: it.category, payMethod: it.metal === 'silver' ? 'نسیه' : 'طلایی', grams: it.metal === 'silver' ? 0 : l.w750, note: 'فروش جنس امانی — بدهی به بنکدار', customerCode: it.supplierCode || '', customerName: it.supplier || '' });
      sum += l.price; vat += v; real += rp;
    });
    let tradeIn = 0;
    if (num(p.tradeWeight) > 0) tradeIn = addBuyback({ weight: p.tradeWeight, karat: p.tradeKarat, deductionPct: p.tradeDeduction, title: 'طلای تعویضی' }, party, inv, rate).price;
    finishSale(inv, party, lines.map(function (l) { return { title: l.it.title + (l.stone ? ' (با سنگ)' : ''), weight: l.it.weight, karat: l.it.karat, gold: l.gold, price: l.price }; }), sum, vat, real, tradeIn);
  } else if (A === 'coinSell') {
    const c = COINS.find(function (x) { return x[0] === str(p.coin); });
    if (!c) throw new Error('نوع سکه را انتخاب کنید.');
    const qty = Math.round(num(p.qty)), book = coinBook()[c[0]];
    if (!(qty > 0)) throw new Error('تعداد سکه را وارد کنید.');
    if (qty > book.qty) throw new Error('موجودی ' + c[1] + ' کافی نیست (موجودی: ' + fd(book.qty) + ' عدد).');
    const market = coinPrices[c[0]], unit = p.rateMode === 'manual' ? num(p.unitPrice) : (market || num(p.unitPrice));
    if (!(unit > 0)) throw new Error('قیمت روز سکه در دسترس نیست؛ قیمت را دستی وارد کنید.');
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'customer');
    const amount = Math.round(unit * qty) - Math.round(num(p.discount)), cost = Math.round(book.avg * qty), mk = Math.round((market || unit) * qty);
    const inv = newCode('INV');
    putTx(Object.assign({ type: 'sell', title: c[1] + ' × ' + fd(qty), category: c[1], qty: qty, amount: amount, costBasis: cost, operatingProfit: amount - mk, holdingGain: mk - cost, realProfit: amount - cost, invoice: inv, payMethod: str(p.payMethod) || 'نقد', note: str(p.note) }, partyFields(party)));
    finishSale(inv, party, [{ title: c[1], qty: qty, weight: 0, karat: 0, gold: amount, price: amount }], amount, 0, amount - cost, 0);
  } else if (A === 'coinBuy') {
    const c = COINS.find(function (x) { return x[0] === str(p.coin); });
    if (!c) throw new Error('نوع سکه را انتخاب کنید.');
    const qty = Math.round(num(p.qty)), unit = p.rateMode === 'manual' ? num(p.unitPrice) : (coinPrices[c[0]] || num(p.unitPrice));
    if (!(qty > 0)) throw new Error('تعداد سکه را وارد کنید.');
    if (!(unit > 0)) throw new Error('قیمت سکه را وارد کنید.');
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, p.partyKind === 'customer' ? 'customer' : 'supplier');
    const amount = Math.round(unit * qty), batch = newCode('CB');
    putTx(Object.assign({ type: 'buy', title: c[1] + ' × ' + fd(qty), category: c[1], qty: qty, amount: amount, costBasis: amount, invoice: batch, payMethod: p.settle === 'credit' ? 'نسیه' : (str(p.payMethod) || 'نقد'), note: str(p.note) }, partyFields(party)));
    settlePaid(p, amount, party, batch, 'پرداخت بابت خرید ' + c[1]);
    message = fd(qty) + ' عدد ' + c[1] + ' به ارزش ' + money(amount) + ' تومان به موجودی سکه اضافه شد.';
  } else if (A === 'abBuy') {
    const weight = num(p.weight), assay = num(p.karat), cert = str(p.cert);
    const maz = p.rateMode === 'manual' ? num(p.mazaneh) : (prices.mazaneh || num(p.mazaneh)), comm = num(pick(p.commission, settings.abCommission));
    if (!(weight > 0)) throw new Error('وزن آبشده را وارد کنید.');
    if (!(assay >= 500 && assay <= 1000)) throw new Error('عیار آزمایشگاه را درست وارد کنید (مثلاً ۷۴۰).');
    if (!(maz > 0)) throw new Error('مظنه در دسترس نیست؛ مظنه را دستی وارد کنید.');
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, p.partyKind === 'customer' ? 'customer' : 'supplier');
    if (p.settle === 'gold' && !party) throw new Error('برای تسویه‌ی طلایی، طرف حساب را مشخص کنید.');
    const w750 = w750Of(weight, assay), price = Math.round(weight * assay / 705 / 4.608 * (maz - comm)), batch = newCode('AB');
    const item = putItem({ code: newCode('G'), title: 'آبشده ' + fd(assay) + (cert ? ' — ' + cert : ''), category: 'آبشده', weight: weight, karat: assay, weight750: w750, buyRate18: w750 ? Math.round(price / w750) : 0, makingCost: 0, stoneCost: 0, cert: cert, buyCost: price, buyDay: jalali, supplier: party ? party.name : (str(p.partyName) || 'بازار'), status: 'in_stock', soldTx: '', note: str(p.note) });
    putTx(Object.assign({ type: 'buy', itemCode: item.code, title: item.title, weight750: w750, rate18: item.buyRate18, amount: price, costBasis: price, invoice: batch, category: 'آبشده', payMethod: p.settle === 'gold' ? 'طلایی' : (p.settle === 'credit' ? 'نسیه' : (str(p.payMethod) || 'نقد')), grams: p.settle === 'gold' ? w750 : 0, note: 'مظنه ' + money(maz) + (comm ? ' − کارمزد ' + money(comm) : '') }, partyFields(party)));
    if (p.settle !== 'gold') settlePaid(p, price, party, batch, 'پرداخت بابت خرید آبشده');
    message = 'آبشده ' + fd(weight) + ' گرم عیار ' + fd(assay) + ' (' + fd(mesghalOf(w750)) + ' مثقال) به ارزش ' + money(price) + ' تومان ثبت شد.';
  } else if (A === 'melt') {
    const codes = (Array.isArray(p.itemCodes) ? p.itemCodes : String(p.itemCodes || '').split(',')).map(str).filter(Boolean);
    const sel = codes.map(function (c) { return items.find(function (r) { return r.code === c && r.status === 'in_stock'; }); });
    if (!codes.length || sel.some(function (x) { return !x; })) throw new Error('اقلام انتخاب‌شده برای ذوب در موجودی نیستند.');
    const weight = num(p.weight), assay = num(p.karat), fee = Math.round(num(p.meltFee));
    if (!(weight > 0) || !(assay >= 500 && assay <= 1000)) throw new Error('وزن و عیار آبشده‌ی نهایی (برگه‌ی آزمایشگاه) را وارد کنید.');
    const inW = r3(sel.reduce(function (s, it) { return s + (Number(it.weight750) || 0); }, 0)), w750 = w750Of(weight, assay);
    const cost = sel.reduce(function (s, it) { return s + (Number(it.buyCost) || 0); }, 0) + fee;
    const item = putItem({ code: newCode('G'), title: 'آبشده ' + fd(assay) + ' (ذوب)' + (str(p.cert) ? ' — ' + str(p.cert) : ''), category: 'آبشده', weight: weight, karat: assay, weight750: w750, buyRate18: Math.round(cost / w750), makingCost: 0, stoneCost: 0, cert: str(p.cert), buyCost: cost, buyDay: jalali, supplier: str(p.lab) || 'ذوب', status: 'in_stock', soldTx: '', note: 'از ذوب: ' + codes.join('، ') });
    sel.forEach(function (it) { putItem({ code: it.code, status: 'melted', soldTx: item.code }); });
    putTx({ type: 'melt', itemCode: item.code, title: 'ذوب ' + fd(sel.length) + ' قلم ← ' + item.title, weight750: w750, amount: fee, costBasis: cost, grams: r3(w750 - inW), category: 'آبشده', payMethod: str(p.payMethod) || 'نقد', note: 'افت ذوب: ' + fd(r3(inW - w750)) + ' گرم (معادل ۱۸)' });
    message = fd(sel.length) + ' قلم ذوب شد و آبشده‌ی ' + fd(weight) + ' گرمی عیار ' + fd(assay) + ' به موجودی آمد. افت: ' + fd(r3(inW - w750)) + ' گرم (معادل ۱۸).';
  } else if (A === 'payInstallment') {
    const q = insts.find(function (x) { return x.code === str(p.code); });
    if (!q || q.status === 'paid' || q.status === 'void') throw new Error('قسط پیدا نشد یا قبلاً پرداخت شده.');
    const rest = Number(q.amount) - Number(q.paid || 0), amt = p.amount === '' || p.amount == null ? rest : Math.round(num(p.amount));
    if (!(amt > 0)) throw new Error('مبلغ قسط را وارد کنید.');
    putTx({ type: 'receive', amount: amt, invoice: q.invoice, payMethod: str(p.payMethod) || 'نقد', title: 'قسط ' + fd(q.n) + ' از ' + fd(q.count) + ' — فاکتور ' + q.invoice, customerCode: q.customerCode, customerName: q.customerName });
    const np = Number(q.paid || 0) + amt;
    putInst({ code: q.code, paid: np, status: np >= Number(q.amount) ? 'paid' : 'partial', paidDate: jalali });
    message = 'قسط ' + fd(q.n) + ' ' + q.customerName + ' (' + money(amt) + ' تومان) دریافت شد.';
  } else if (A === 'returnSale') {
    const it = items.find(function (r) { return r.code === str(p.itemCode) && r.status === 'sold'; });
    if (!it) throw new Error('این کالا فروخته نشده یا پیدا نشد.');
    const s = txs.filter(function (t) { return t.type === 'sell' && t.itemCode === it.code && !t.voided; }).pop();
    if (!s) throw new Error('فاکتور فروش این کالا پیدا نشد.');
    const refund = p.refund === '' || p.refund == null ? Number(s.amount) + Number(s.vat || 0) : Math.round(num(p.refund));
    const net = Math.max(0, refund - Number(s.vat || 0));
    const debtBefore = s.customerCode ? Math.max(0, ledgerOf(s.customerCode).money) : 0;
    putTx({ type: 'return', itemCode: it.code, title: it.title, weight750: s.weight750, rate18: s.rate18, amount: net, vat: Number(s.vat || 0), costBasis: -Number(s.costBasis), operatingProfit: -Number(s.operatingProfit) + (Number(s.amount) - net), holdingGain: -Number(s.holdingGain), realProfit: -Number(s.realProfit) + (Number(s.amount) - net), customerCode: s.customerCode, customerName: s.customerName, invoice: s.invoice, category: it.category, note: str(p.note) });
    putItem({ code: it.code, status: 'in_stock', soldTx: '' });
    if (it.consign === 'yes') txs.filter(function (t) { return t.type === 'buy' && t.itemCode === it.code && t.invoice === s.invoice && !t.voided; }).forEach(function (t) { putTx(Object.assign({}, t, { voided: 'yes' })); });
    const cashOut = p.paidOut === '' || p.paidOut == null ? Math.max(0, refund - debtBefore) : Math.round(num(p.paidOut));
    if (cashOut > 0) putTx({ type: 'pay', amount: cashOut, invoice: s.invoice, payMethod: str(p.payMethod) || 'نقد', title: 'استرداد وجه برگشتی', customerCode: s.customerCode, customerName: s.customerName });
    message = 'برگشت از فروش ثبت شد و کالا به موجودی برگشت.' + (refund - cashOut > 0 ? ' ' + money(refund - cashOut) + ' تومان از بدهی مشتری کم شد.' : '');
  } else if (A === 'voidItem') {
    const it = items.find(function (r) { return r.code === str(p.itemCode) && r.status === 'in_stock'; });
    if (!it) throw new Error('فقط کالای موجود (فروخته‌نشده) قابل ابطال است.');
    if (txs.some(function (t) { return t.type === 'melt' && t.itemCode === it.code && !t.voided; })) throw new Error('آبشده‌ی حاصل از ذوب قابل ابطال نیست.');
    putItem({ code: it.code, status: 'void' });
    const bt = txs.find(function (t) { return (t.type === 'buy' || t.type === 'buyback' || t.type === 'consignIn') && t.itemCode === it.code && !t.voided; });
    if (bt) {
      putTx(Object.assign({}, bt, { voided: 'yes' }));
      const left = items.filter(function (r) { return r.status !== 'void' && txs.some(function (t) { return t.itemCode === r.code && t.invoice === bt.invoice && !t.voided; }); });
      if (bt.invoice && !left.length) txs.filter(function (t) { return t.invoice === bt.invoice && (t.type === 'pay' || t.type === 'receive') && !t.voided; }).forEach(function (t) { putTx(Object.assign({}, t, { voided: 'yes' })); });
    }
    message = 'ثبت کالا ' + it.code + ' باطل شد.';
  } else if (A === 'voidTx') {
    const t = txs.find(function (x) { return x.code === str(p.code) && !x.voided; });
    const isCoin = t && Number(t.qty) > 0 && COIN_LABELS.indexOf(t.category) >= 0 && (t.type === 'buy' || t.type === 'sell');
    if (!t || (!isCoin && ['expense', 'receive', 'pay', 'deposit', 'goldSave', 'goldRedeem', 'wsLoss'].indexOf(t.type) < 0)) throw new Error('فقط هزینه، دریافت، پرداخت، بیعانه، پس‌انداز، افت کارگاه و معامله‌ی سکه قابل ابطال مستقیم است.');
    if (isCoin && t.type === 'buy' && coinBook()[COINS.find(function (c) { return c[1] === t.category; })[0]].qty < Number(t.qty)) throw new Error('این سکه‌ها فروخته شده‌اند؛ ابطال خرید ممکن نیست.');
    putTx(Object.assign({}, t, { voided: 'yes' }));
    if (isCoin && t.invoice) {
      txs.filter(function (x) { return x.invoice === t.invoice && x.code !== t.code && (x.type === 'pay' || x.type === 'receive') && !x.voided; }).forEach(function (x) { putTx(Object.assign({}, x, { voided: 'yes' })); });
      insts.filter(function (q) { return q.invoice === t.invoice && q.status !== 'paid'; }).forEach(function (q) { putInst({ code: q.code, status: 'void' }); });
    }
    message = 'تراکنش ' + t.code + ' باطل شد.';
  } else if (A === 'payment') {
    const party = parties.find(function (c) { return c.code === str(p.partyCode); });
    if (!party) throw new Error('طرف حساب را انتخاب کنید.');
    const amount = Math.round(num(p.amount)), grams = r3(num(p.grams));
    if (!(amount > 0) && !(grams > 0)) throw new Error('مبلغ یا مقدار طلا را وارد کنید.');
    putTx(Object.assign({ type: p.direction === 'pay' ? 'pay' : 'receive', amount: amount, grams: grams, payMethod: grams > 0 && !amount ? 'طلایی' : (str(p.payMethod) || 'نقد'), title: p.direction === 'pay' ? 'پرداخت به ' + party.name : 'دریافت از ' + party.name, note: str(p.note) }, partyFields(party)));
    message = 'تراکنش مالی ثبت شد.';
  } else if (A === 'expense') {
    const amount = Math.round(num(p.amount));
    if (!(amount > 0)) throw new Error('مبلغ هزینه را وارد کنید.');
    putTx({ type: 'expense', amount: amount, category: str(p.category) || 'سایر', title: str(p.title) || str(p.category) || 'هزینه', payMethod: str(p.payMethod) || 'نقد', note: str(p.note) });
    message = 'هزینه ثبت شد.';
  } else if (A === 'order') {
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'customer');
    if (!party) throw new Error('مشتری سفارش را مشخص کنید.');
    if (!str(p.description)) throw new Error('شرح سفارش را بنویسید.');
    const o = putOrder({ code: newCode('ORD'), dateFa: jalali, customerCode: party.code, customerName: party.name, phone: party.phone || '', kind: str(p.kind) || 'ساخت سفارشی', description: str(p.description), weight: num(p.weight), karat: num(p.karat) || 750, estimate: Math.round(num(p.estimate)), deposit: Math.round(num(p.deposit)), dueDate: str(p.dueDate), status: 'ثبت شد', note: str(p.note) });
    if (o.deposit > 0) putTx(Object.assign({ type: 'deposit', amount: o.deposit, invoice: o.code, payMethod: str(p.payMethod) || 'نقد', title: 'بیعانه سفارش ' + o.code }, partyFields(party)));
    message = 'سفارش ' + o.code + ' ثبت شد.';
  } else if (A === 'orderStatus') {
    const o = orders.find(function (x) { return x.code === str(p.code); });
    if (!o) throw new Error('سفارش پیدا نشد.');
    putOrder({ code: o.code, status: str(p.status) || o.status });
    message = 'وضعیت سفارش به «' + str(p.status) + '» تغییر کرد.';
  } else if (A === 'party') {
    if (!str(p.name)) throw new Error('نام را وارد کنید.');
    const md = function (m, d) { return m && d ? String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0') : ''; };
    const row = { code: str(p.code) || newCode('C'), name: str(p.name), phone: str(p.phone), email: str(p.email), telegramChatId: str(p.telegramChatId), birthday: md(p.bMonth, p.bDay), anniversary: md(p.aMonth, p.aDay), notes: str(p.notes), kind: ['supplier', 'maker'].indexOf(p.kind) >= 0 ? p.kind : 'customer', nationalId: str(p.nationalId), economicCode: str(p.economicCode), postalCode: str(p.postalCode), address: str(p.address) };
    putParty(row);
    message = ({ supplier: 'همکار ', maker: 'سازنده ' }[row.kind] || 'مشتری ') + row.name + ' ذخیره شد.';
  } else if (A === 'settings') {
    TXT_SET.concat(NUM_SET).forEach(function (k) { if (p[k] !== undefined) { const v = typeof p[k] === 'boolean' ? (p[k] ? 'yes' : '') : str(p[k]); putSetting(k, v); settings[k] = NUM_SET.indexOf(k) >= 0 ? num(v) : v; } });
    if (str(p.smsApiKey)) { putSetting('smsApiKey', str(p.smsApiKey)); settings.smsKeySet = true; }
    message = 'تنظیمات ذخیره شد.';
  } else if (A === 'changePassword') {
    const np = String(p.newPassword || '');
    if (hashPw(me.salt || '', String(p.oldPassword || '')) !== me.hash) throw new Error('رمز فعلی اشتباه است.');
    if (np.length < 6) throw new Error('رمز جدید باید حداقل ۶ کاراکتر باشد.');
    if (np !== String(p.confirm || '')) throw new Error('تکرار رمز با رمز جدید یکسان نیست.');
    const salt = sha256(String(Math.random()) + nowMs).slice(0, 16);
    me = putUser({ code: me.code, salt: salt, hash: hashPw(salt, np) });
    token = makeToken(me);
    message = 'رمز جدید ذخیره شد.';
  } else if (A === 'userSave') {
    const code = str(p.code).toLowerCase();
    if (!/^[a-z0-9_.-]{3,20}$/.test(code)) throw new Error('نام کاربری باید ۳ تا ۲۰ حرف انگلیسی یا عدد باشد.');
    const role = ROLE_FA[p.role] ? p.role : 'seller', active = p.active === false || p.active === 'no' ? 'no' : 'yes';
    const old = users.find(function (u) { return u.code === code; });
    const pw = String(p.password || '');
    if (!old && pw.length < 6) throw new Error('برای کاربر جدید رمز حداقل ۶ کاراکتری بگذارید.');
    if (pw && pw.length < 6) throw new Error('رمز باید حداقل ۶ کاراکتر باشد.');
    if (old && old.role === 'owner' && (role !== 'owner' || active === 'no') && !users.some(function (u) { return u.code !== code && u.role === 'owner' && u.active !== 'no'; })) throw new Error('حداقل یک مدیر فعال لازم است.');
    const row = { code: code, name: str(p.name) || code, role: role, branch: str(p.branch), active: active };
    if (pw) { row.salt = sha256(String(Math.random()) + code).slice(0, 16); row.hash = hashPw(row.salt, pw); }
    putUser(row);
    if (pw && old) writes.push({ op: 'setting', row: { key: 'lock_' + code, value: '0|0' } });
    message = 'کاربر ' + row.name + ' (' + ROLE_FA[role] + ') ذخیره شد.';
  } else if (A === 'transfer') {
    const codes = (Array.isArray(p.itemCodes) ? p.itemCodes : String(p.itemCodes || '').split(',')).map(str).filter(Boolean);
    const br = str(p.toBranch);
    if (!br) throw new Error('شعبه‌ی مقصد را انتخاب کنید.');
    const sel = items.filter(function (r) { return codes.indexOf(r.code) >= 0 && r.status === 'in_stock'; });
    if (!sel.length) throw new Error('کالایی برای انتقال انتخاب نشده.');
    sel.forEach(function (it) { putItem({ code: it.code, branch: br, note: (it.note ? it.note + ' · ' : '') + 'انتقال از ' + (it.branch || '—') + ' به ' + br + ' (' + jalali + ')' }); });
    message = fd(sel.length) + ' قلم به ' + br + ' منتقل شد.';
  } else if (A === 'consignReturn') {
    const codes = (Array.isArray(p.itemCodes) ? p.itemCodes : String(p.itemCodes || '').split(',')).map(str).filter(Boolean);
    const sel = items.filter(function (r) { return codes.indexOf(r.code) >= 0 && r.status === 'in_stock' && r.consign === 'yes'; });
    if (!sel.length) throw new Error('فقط جنس امانیِ موجود قابل برگشت به بنکدار است.');
    sel.forEach(function (it) { putItem({ code: it.code, status: 'returned' }); putTx({ type: 'consignOut', itemCode: it.code, title: it.title + ' — برگشت امانی', weight750: Number(it.weight750), amount: Number(it.buyCost), category: it.category, payMethod: 'امانی', customerCode: it.supplierCode || '', customerName: it.supplier || '' }); });
    message = fd(sel.length) + ' قلم امانی به ' + (sel[0].supplier || 'بنکدار') + ' برگشت داده شد.';
  } else if (A === 'wsIssue') {
    const mk = parties.find(function (c) { return c.code === str(p.partyCode); });
    if (!mk) throw new Error('سازنده/کارگاه را انتخاب کنید.');
    const codes = (Array.isArray(p.itemCodes) ? p.itemCodes : String(p.itemCodes || '').split(',')).map(str).filter(Boolean);
    const sel = items.filter(function (r) { return codes.indexOf(r.code) >= 0 && r.status === 'in_stock' && r.metal !== 'silver' && r.consign !== 'yes'; });
    if (!sel.length) throw new Error('اقلام طلای ملکی (نه امانی) را برای تحویل انتخاب کنید.');
    const g = r3(sel.reduce(function (s, it) { return s + (Number(it.weight750) || 0); }, 0)), c = sel.reduce(function (s, it) { return s + (Number(it.buyCost) || 0); }, 0);
    sel.forEach(function (it) { putItem({ code: it.code, status: 'workshop', soldTx: mk.code }); });
    putTx(Object.assign({ type: 'wsOut', title: 'تحویل ' + fd(sel.length) + ' قلم به ' + mk.name, grams: g, weight750: g, costBasis: c, note: codes.join('، ') + (str(p.note) ? ' · ' + str(p.note) : '') }, partyFields(mk)));
    message = fd(g) + ' گرم (معادل ۱۸) طلا به ' + mk.name + ' تحویل شد.';
  } else if (A === 'wsReceive') {
    const mk = parties.find(function (c) { return c.code === str(p.partyCode); });
    if (!mk) throw new Error('سازنده/کارگاه را انتخاب کنید.');
    const weight = num(p.weight), karat = num(p.karat) || 750, qty = Math.max(1, Math.min(100, Math.round(num(p.qty) || 1)));
    if (!(weight > 0)) throw new Error('وزن کالای ساخته‌شده را وارد کنید.');
    const book = makerBook(mk.code), avg = book.avg || prices.rate18, making = Math.round(num(p.makingFee)), stone = Math.round(num(p.stoneCost));
    const w750 = w750Of(weight, karat), batch = newCode('WS');
    for (let i = 0; i < qty; i++) {
      const gc = Math.round(w750 * avg);
      const it = putItem({ code: newCode('G'), title: str(p.title) || 'ساخت کارگاه', category: str(p.category) || 'سایر', weight: weight, karat: karat, weight750: w750, buyRate18: Math.round(avg), makingCost: making, stoneCost: stone, buyCost: gc + making + stone, buyDay: jalali, supplier: mk.name, supplierCode: mk.code, stones: str(p.stones), status: 'in_stock', soldTx: '', note: 'ساخت ' + mk.name });
      putTx(Object.assign({ type: 'wsIn', itemCode: it.code, title: 'دریافت از کارگاه: ' + it.title, grams: w750, weight750: w750, rate18: Math.round(avg), amount: making + stone, costBasis: gc, invoice: batch, category: it.category, note: str(p.note) }, partyFields(mk)));
    }
    const left = makerBook(mk.code);
    message = fd(qty) + ' قلم از ' + mk.name + ' دریافت شد. مانده‌ی طلای نزد کارگاه: ' + fd(left.grams) + ' گرم.';
  } else if (A === 'wsLoss') {
    const mk = parties.find(function (c) { return c.code === str(p.partyCode); });
    if (!mk) throw new Error('سازنده/کارگاه را انتخاب کنید.');
    const g = r3(num(p.grams)), book = makerBook(mk.code);
    if (!(g > 0)) throw new Error('مقدار افت را وارد کنید.');
    if (g > book.grams) throw new Error('افت بیشتر از طلای نزد کارگاه است (' + fd(book.grams) + ' گرم).');
    const amt = Math.round(g * book.avg);
    putTx(Object.assign({ type: 'wsLoss', title: 'افت ساخت ' + mk.name, grams: g, weight750: g, amount: amt, costBasis: amt, category: 'افت کارگاه', note: str(p.note) }, partyFields(mk)));
    message = 'افت ' + fd(g) + ' گرم (' + money(amt) + ' تومان) برای ' + mk.name + ' ثبت شد.';
  } else if (A === 'goldSave') {
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'customer');
    if (!party) throw new Error('مشتری پس‌انداز را مشخص کنید.');
    const amount = Math.round(num(p.amount)), rate = rateFrom(p.rateMode, p.rate18), fee = num(pick(p.feePct, settings.savingsFeePct));
    if (!(amount > 0)) throw new Error('مبلغ واریزی را وارد کنید.');
    if (!(rate > 0)) throw new Error('نرخ در دسترس نیست.');
    const g = r3(amount * (1 - fee / 100) / rate);
    putTx(Object.assign({ type: 'goldSave', title: 'پس‌انداز طلایی — ' + fd(g) + ' گرم', amount: amount, grams: g, weight750: g, rate18: rate, payMethod: str(p.payMethod) || 'نقد', category: 'پس‌انداز طلایی', note: 'کارمزد ' + fd(fee) + '٪' }, partyFields(party)));
    sms(party.phone, settings.shopName + '\nپس‌انداز طلایی: ' + fd(g) + ' گرم به حساب شما افزوده شد.\nمانده: ' + fd(r3(savingsOf(party.code))) + ' گرم');
    message = fd(g) + ' گرم طلای ۱۸ عیار به پس‌انداز ' + party.name + ' اضافه شد. مانده: ' + fd(savingsOf(party.code)) + ' گرم.';
  } else if (A === 'goldRedeem') {
    const party = parties.find(function (c) { return c.code === str(p.partyCode); });
    if (!party) throw new Error('مشتری را انتخاب کنید.');
    const bal = savingsOf(party.code), g = r3(num(p.grams)) || bal, rate = rateFrom(p.rateMode, p.rate18);
    if (!(g > 0) || g > bal) throw new Error('مقدار برداشت باید بین صفر و مانده‌ی پس‌انداز (' + fd(bal) + ' گرم) باشد.');
    if (!(rate > 0)) throw new Error('نرخ در دسترس نیست.');
    const amount = Math.round(g * rate), credit = p.mode === 'credit';
    putTx(Object.assign({ type: 'goldRedeem', title: (credit ? 'تبدیل پس‌انداز به اعتبار — ' : 'برداشت نقدی پس‌انداز — ') + fd(g) + ' گرم', amount: amount, grams: g, weight750: g, rate18: rate, payMethod: credit ? 'اعتبار حساب' : (str(p.payMethod) || 'نقد'), category: 'پس‌انداز طلایی' }, partyFields(party)));
    message = fd(g) + ' گرم (' + money(amount) + ' تومان) از پس‌انداز ' + party.name + (credit ? ' به اعتبار حسابش برای خرید تبدیل شد.' : ' پرداخت شد.');
  } else if (A === 'cheque') {
    const dir = p.dir === 'out' ? 'out' : 'in';
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, dir === 'in' ? 'customer' : 'supplier');
    const amount = Math.round(num(p.amount));
    if (!party) throw new Error('طرف حساب چک را مشخص کنید.');
    if (!(amount > 0)) throw new Error('مبلغ چک را وارد کنید.');
    if (!/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(jd(p.dueDate))) throw new Error('سررسید چک را به شکل ۱۴۰۵/۰۸/۱۵ وارد کنید.');
    const code = newCode('CH');
    const tx = putTx(Object.assign({ type: dir === 'in' ? 'receive' : 'pay', amount: amount, invoice: code, payMethod: 'چک', title: (dir === 'in' ? 'دریافت چک ' : 'صدور چک ') + str(p.number) + ' ' + str(p.bank), note: str(p.note) }, partyFields(party)));
    putCheque({ code: code, dir: dir, partyCode: party.code, partyName: party.name, bank: str(p.bank), number: str(p.number), sayad: str(p.sayad), amount: amount, dueDate: jd(p.dueDate), status: 'pending', txCode: tx.code, dateFa: jalali, settledDate: '', spentTo: '', note: str(p.note), branch: tx.branch });
    message = 'چک ' + (dir === 'in' ? 'دریافتی' : 'پرداختی') + ' ' + money(amount) + ' تومان با سررسید ' + jd(p.dueDate) + ' ثبت شد.';
  } else if (A === 'chequeStatus') {
    const ch = cheques.find(function (c) { return c.code === str(p.code); }), st = str(p.status);
    if (!ch || ch.status !== 'pending') throw new Error('فقط چک‌های در جریان قابل تغییر وضعیت هستند.');
    const tx = txs.find(function (t) { return t.code === ch.txCode; });
    if (st === 'cashed') putCheque({ code: ch.code, status: 'cashed', settledDate: jalali });
    else if (st === 'bounced' || st === 'returned') {
      if (tx && !tx.voided) putTx(Object.assign({}, tx, { voided: 'yes' }));
      putCheque({ code: ch.code, status: st, settledDate: jalali });
      if (st === 'bounced' && ch.dir === 'in') { const c = parties.find(function (x) { return x.code === ch.partyCode; }); if (c) sms(c.phone, settings.shopName + '\nچک شماره ' + ch.number + ' به مبلغ ' + money(ch.amount) + ' تومان برگشت خورد. لطفاً جهت تسویه اقدام فرمایید.'); }
    } else if (st === 'spent') {
      if (ch.dir !== 'in') throw new Error('فقط چک دریافتی قابل واگذاری است.');
      const to = parties.find(function (c) { return c.code === str(p.toPartyCode); });
      if (!to) throw new Error('طرفی که چک به او واگذار می‌شود را انتخاب کنید.');
      putTx(Object.assign({ type: 'pay', amount: Number(ch.amount), invoice: ch.code, payMethod: 'چک واگذاری', title: 'واگذاری چک ' + ch.number + ' (' + ch.partyName + ')' }, partyFields(to)));
      putCheque({ code: ch.code, status: 'spent', spentTo: to.name, settledDate: jalali });
    } else throw new Error('وضعیت نامعتبر است.');
    message = 'وضعیت چک ' + (ch.number || ch.code) + ' به «' + ({ cashed: 'وصول شد', bounced: 'برگشت خورد', spent: 'واگذار شد', returned: 'ابطال/عودت' }[st]) + '» تغییر کرد.';
  } else if (A === 'closeDay') {
    const br = str(p.branch);
    const today = txs.filter(function (t) { return !t.voided && t.dateFa === jalali && (!br || t.branch === br); });
    const exp = {}; today.forEach(function (t) { const e = cashEff(t); if (!e) return; const k = t.payMethod || 'نقد'; exp[k] = (exp[k] || 0) + e; });
    const cnt = { 'نقد': Math.round(num(p.cash)), 'کارتخوان': Math.round(num(p.pos)), 'کارت به کارت': Math.round(num(p.card)) };
    const sumE = Object.keys(exp).reduce(function (s, k) { return s + exp[k]; }, 0), sumC = cnt['نقد'] + cnt['کارتخوان'] + cnt['کارت به کارت'];
    const gSys = r3(items.filter(function (r) { return r.status === 'in_stock' && r.metal !== 'silver' && (!br || r.branch === br); }).reduce(function (s, r) { return s + (Number(r.weight750) || 0); }, 0));
    const gCnt = p.gold === '' || p.gold == null ? gSys : r3(num(p.gold));
    const detail = Object.keys(Object.assign({}, exp, cnt)).map(function (k) { return k + ': سیستم ' + money(exp[k] || 0) + ' / شمارش ' + money(cnt[k] || 0); }).join(' | ');
    putClosing({ code: newCode('CL'), dateFa: jalali, time: timeFa, user: me.code, branch: br, expected: sumE, counted: sumC, diff: sumC - sumE, goldSystem: gSys, goldCounted: gCnt, goldDiff: r3(gCnt - gSys), detail: detail, note: str(p.note) });
    message = 'صندوق بسته شد. مغایرت وجه: ' + money(sumC - sumE) + ' تومان · مغایرت طلا: ' + fd(r3(gCnt - gSys)) + ' گرم.';
  } else if (A === 'portalReset') {
    putSetting('portal_secret', sha256(String(Math.random()) + nowMs).slice(0, 32));
    message = 'همه‌ی لینک‌های پرتال مشتری عوض شد؛ لینک‌های قبلی دیگر کار نمی‌کنند.';
  } else if (A === 'backupNow') {
    wantBackup = true;
    message = 'فایل پشتیبان آماده شد.';
  } else if (A === 'restore') {
    const bk = p.backup || {};
    if (!bk.app || bk.app !== 'gold-shop') throw new Error('این فایل، پشتیبانِ این سامانه نیست.');
    const clean = function (r) { const c = Object.assign({}, r); delete c.id; delete c.createdAt; delete c.updatedAt; return c; };
    let n = 0;
    (bk.items || []).forEach(function (r) { if (r.code) { putItem0(clean(r)); n++; } });
    (bk.txs || []).forEach(function (r) { if (r.code) { upsert(txs, clean(r)); writes.push({ op: 'tx', row: clean(r) }); n++; } });
    (bk.parties || []).forEach(function (r) { if (r.code) { putParty(clean(r)); n++; } });
    (bk.orders || []).forEach(function (r) { if (r.code) { putOrder(clean(r)); n++; } });
    (bk.installments || []).forEach(function (r) { if (r.code) { putInst(clean(r)); n++; } });
    (bk.cheques || []).forEach(function (r) { if (r.code) { putCheque(clean(r)); n++; } });
    (bk.closings || []).forEach(function (r) { if (r.code) { putClosing(clean(r)); n++; } });
    message = fd(n) + ' ردیف از فایل پشتیبان (' + (bk.date || '') + ') بازیابی شد.';

  }
} catch (e) { error = e.message || String(e); }

if (!error && A !== 'all' && A !== 'login') audit(me.code, A, message);
const hideCost = me.role === 'seller', myBr = hideCost && me.branch ? me.branch : '';
const strip = function (o, keys) { const c = Object.assign({}, o); keys.forEach(function (k) { delete c[k]; }); return c; };
const brOk = function (r) { return !myBr || !r.branch || r.branch === myBr; };
const book = coinBook();
const response = {
  ok: !error, error: error, message: message, invoiceHtml: error ? '' : invoiceHtml, token: token,
  me: { code: me.code, name: me.name, role: me.role, roleFa: ROLE_FA[me.role], branch: me.branch || '' },
  today: { day: day, jalali: jalali, time: timeFa }, prices: prices, settings: settings, sheetUrl: SHEET_URL,
  items: items.filter(brOk).map(function (r) { return hideCost ? strip(r, ['buyCost', 'buyRate18', 'makingCost']) : r; }),
  txs: txs.filter(brOk).sort(function (a, b) { return (String(b.dateFa) + b.code).localeCompare(String(a.dateFa) + a.code); }).map(function (t) { return hideCost ? strip(t, ['costBasis', 'operatingProfit', 'holdingGain', 'realProfit', 'profitAmt']) : t; }),
  parties: parties.map(function (c) { return Object.assign({}, c, { balance: ledgerOf(c.code), savings: savingsOf(c.code), maker: c.kind === 'maker' ? makerBook(c.code) : null, portal: hideCost ? '' : portalToken(c.code) }); }),
  orders: orders.slice().reverse(), siteInvoices: siteInvoices.slice().reverse(),
  installments: insts.slice().sort(function (a, b) { return (jd(a.dueDate) + a.code).localeCompare(jd(b.dueDate) + b.code); }),
  cheques: cheques.filter(brOk).slice().sort(function (a, b) { return (jd(a.dueDate) + a.code).localeCompare(jd(b.dueDate) + b.code); }),
  closings: hideCost ? [] : closings.slice().sort(function (a, b) { return (String(b.dateFa) + b.code).localeCompare(String(a.dateFa) + a.code); }).slice(0, 90),
  coins: hideCost ? Object.keys(book).reduce(function (o, k) { o[k] = strip(book[k], ['cost', 'avg']); return o; }, {}) : book, coinTypes: COINS.map(function (c) { return [c[0], c[1]]; }),
  users: me.role === 'owner' ? users.map(function (u) { return { code: u.code, name: u.name, role: u.role, roleFa: ROLE_FA[u.role], branch: u.branch || '', active: u.active !== 'no' }; }) : [],
  audit: me.role === 'owner' ? authWrites.concat(writes).filter(function (w) { return w.op === 'audit'; }).map(function (w) { return w.row; }).reverse().concat(auditRows.slice().sort(function (a, b) { return String(b.at).localeCompare(String(a.at)); })).slice(0, 300) : [],
  backup: wantBackup && !error ? { app: 'gold-shop', version: 4, date: jalali + ' ' + timeFa, items: items, txs: txs, parties: parties, orders: orders, installments: insts, cheques: cheques, closings: closings, siteInvoices: siteInvoices } : null,
};
return [{ json: { response: response, writes: error ? authWrites : authWrites.concat(writes) } }];

