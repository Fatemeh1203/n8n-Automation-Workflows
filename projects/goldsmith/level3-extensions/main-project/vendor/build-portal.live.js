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

// 🔗 پرتال مشتری — فقط‌خواندنی؛ لینک = کد مشتری + امضای اختصاصی (sha256 با portal_secret)
const q = ($('Customer Portal').first().json.query) || {};
const rows = function (n) { try { return $(n).all().map(function (i) { return i.json; }).filter(function (r) { return r && (r.code || r.key); }); } catch (e) { return []; } };
const cfg = {}; rows('Portal Settings').forEach(function (r) { cfg[r.key] = r.value; });
const esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
const fa = function (n, d) { return (Number(n) || 0).toLocaleString('fa-IR', { maximumFractionDigits: d == null ? 0 : d }); };
const faS = function (s) { return String(s == null ? '' : s).replace(/\d/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'[c]; }); };
const SHOP = cfg.shopName || 'طلا و جواهر';
const page = function (body) {
  return '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>حساب من — ' + esc(SHOP) + '</title><style>' +
    ':root{--g:#b8860b;--ink:#2b2416;--mut:#7a705c;--bg:#faf6ec;--card:#fff;--pos:#1f7a3d;--neg:#b42318}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Vazirmatn,Tahoma,Arial,sans-serif;line-height:1.8}' +
    'header{background:linear-gradient(135deg,#b8860b,#7a5901);color:#fff;padding:18px 16px}header h1{margin:0;font-size:20px}header div{opacity:.9;font-size:13px}main{max-width:760px;margin:auto;padding:12px 16px 40px}' +
    '.card{background:var(--card);border:1px solid #ece4d2;border-radius:14px;padding:14px;margin:12px 0}.card h2{font-size:16px;margin:0 0 8px;color:#7a5901}.k{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}' +
    '.kp{background:var(--bg);border-radius:10px;padding:10px}.kp .l{font-size:12px;color:var(--mut)}.kp .v{font-size:18px;font-weight:800}.pos{color:var(--pos)}.neg{color:var(--neg)}.mut{color:var(--mut);font-size:12px}' +
    'table{width:100%;border-collapse:collapse;font-size:13px}th,td{padding:6px 4px;border-bottom:1px solid #f0e9d8;text-align:right}th{color:var(--mut);font-weight:600}.tbl{overflow-x:auto}' +
    '</style></head><body>' + body + '</body></html>';
};
const code = String(q.c || ''), tok = String(q.t || '');
const c = rows('Portal Customers').find(function (r) { return r.code === code; });
if (!c || !cfg.portal_secret || tok !== sha256(cfg.portal_secret + '|' + code).slice(0, 20)) {
  return [{ json: { html: page('<header><h1>' + esc(SHOP) + '</h1></header><main><div class="card"><h2>لینک نامعتبر است</h2>این لینک منقضی شده یا اشتباه است. لطفاً لینک تازه را از فروشگاه بگیرید.</div></main>') } }];
}
// قیمت روز
const by = {}; const m = $('Portal Market').first().json || {};
for (const list of Object.values((m.data && m.data.categories) || {})) for (const it of (list || [])) if (it && it.symbol) by[it.symbol] = Number(it.price) || 0;
const R = by.GOLD_18K_IRR || 0;
// حساب (مثبت = مشتری به فروشگاه بدهکار است)
const txs = rows('Portal Transactions').filter(function (t) { return t.customerCode === code && !t.voided; }).sort(function (a, b) { return (String(b.dateFa) + b.code).localeCompare(String(a.dateFa) + a.code); });
let mo = 0, g = 0, sv = 0;
txs.forEach(function (t) {
  const a = Number(t.amount) || 0, v = Number(t.vat) || 0, gr = Number(t.grams) || 0;
  if (t.type === 'sell') mo += a + v; else if (t.type === 'return') mo -= a + v; else if (t.type === 'buyback') mo -= a;
  else if (t.type === 'buy') { if (t.payMethod === 'طلایی') { mo -= a - Math.round(Number(t.weight750) * Number(t.rate18)); g -= gr; } else mo -= a; }
  else if (t.type === 'receive' || t.type === 'deposit') { mo -= a; g -= gr; } else if (t.type === 'pay') { mo += a; g += gr; }
  else if (t.type === 'wsOut') g += gr; else if (t.type === 'wsIn') { g -= gr; mo -= a; } else if (t.type === 'wsLoss') g -= gr;
  else if (t.type === 'goldSave') { g -= gr; sv += gr; } else if (t.type === 'goldRedeem') { g += gr; sv -= gr; if (t.payMethod === 'اعتبار حساب') mo -= a; }
});
g += sv; // پس‌انداز طلایی جداگانه نمایش داده می‌شود
const TYPE = { sell: 'خرید از فروشگاه', 'return': 'مرجوعی', buyback: 'فروش طلای کهنه به فروشگاه', receive: 'پرداخت شما', deposit: 'بیعانه', pay: 'پرداخت فروشگاه به شما', goldSave: 'واریز پس‌انداز طلایی', goldRedeem: 'برداشت پس‌انداز', buy: 'خرید فروشگاه از شما' };
const bal = mo > 0 ? '<span class="neg">' + fa(mo) + ' تومان بدهکار</span>' : (mo < 0 ? '<span class="pos">' + fa(-mo) + ' تومان بستانکار</span>' : '<span class="pos">تسویه</span>');
const gb = g > 0.0005 ? '<span class="neg">' + fa(g, 3) + ' گرم بدهکار</span>' : (g < -0.0005 ? '<span class="pos">' + fa(-g, 3) + ' گرم بستانکار</span>' : '—');
const inst = rows('Portal Installments').filter(function (x) { return x.customerCode === code && (x.status === 'open' || x.status === 'partial'); }).sort(function (a, b) { return String(a.dueDate).localeCompare(String(b.dueDate)); });
const html = '<header><h1>' + esc(SHOP) + '</h1><div>' + esc(c.name) + ' عزیز، خوش آمدید 🌟' + (cfg.shopPhone ? ' · تلفن فروشگاه: ' + esc(cfg.shopPhone) : '') + '</div></header><main>' +
  '<div class="card"><h2>💼 خلاصه‌ی حساب</h2><div class="k">' +
  '<div class="kp"><div class="l">مانده‌ی تومانی</div><div class="v">' + bal + '</div></div>' +
  '<div class="kp"><div class="l">مانده‌ی طلایی</div><div class="v">' + gb + '</div></div>' +
  '<div class="kp"><div class="l">پس‌انداز طلایی شما</div><div class="v">' + fa(sv, 3) + ' گرم</div><div class="mut">ارزش امروز: ' + fa(sv * R) + ' تومان</div></div>' +
  '<div class="kp"><div class="l">اقساط باز</div><div class="v">' + fa(inst.length) + ' قسط</div><div class="mut">' + fa(inst.reduce(function (s, x) { return s + Number(x.amount) - (Number(x.paid) || 0); }, 0)) + ' تومان</div></div>' +
  '</div></div>' +
  (inst.length ? '<div class="card"><h2>📅 اقساط</h2><div class="tbl"><table><tr><th>قسط</th><th>سررسید</th><th>مبلغ</th><th>پرداخت‌شده</th></tr>' + inst.map(function (x) { return '<tr><td>' + fa(x.n) + ' از ' + fa(x.count) + '</td><td>' + faS(x.dueDate) + '</td><td>' + fa(x.amount) + '</td><td>' + fa(x.paid) + '</td></tr>'; }).join('') + '</table></div></div>' : '') +
  '<div class="card"><h2>🧾 گردش حساب (۳۰ مورد آخر)</h2>' + (txs.length ? '<div class="tbl"><table><tr><th>تاریخ</th><th>شرح</th><th>مبلغ (تومان)</th><th>گرم</th></tr>' + txs.slice(0, 30).map(function (t) { return '<tr><td>' + faS(t.dateFa) + '</td><td>' + (TYPE[t.type] || '') + ' — ' + esc(t.title) + '</td><td>' + fa(Number(t.amount) + (Number(t.vat) || 0)) + '</td><td>' + (Number(t.grams) ? fa(t.grams, 3) : '—') + '</td></tr>'; }).join('') + '</table></div>' : '<div class="mut">هنوز معامله‌ای ثبت نشده.</div>') + '</div>' +
  '<div class="card"><h2>📈 قیمت امروز</h2><div class="k"><div class="kp"><div class="l">طلای ۱۸ عیار (گرم)</div><div class="v">' + fa(R) + '</div></div><div class="kp"><div class="l">مظنه (مثقال)</div><div class="v">' + fa(by.GOLD_MESGHAL_IRR) + '</div></div><div class="kp"><div class="l">سکه امامی</div><div class="v">' + fa(by.COIN_EMAMI_IRR) + '</div></div><div class="kp"><div class="l">ربع سکه</div><div class="v">' + fa(by.COIN_QUARTER_IRR) + '</div></div></div><div class="mut">قیمت‌ها تقریبی و برای اطلاع است.</div></div>' +
  '<div class="mut" style="text-align:center">این صفحه فقط برای شماست؛ لینک را با دیگران به اشتراک نگذارید.' + (cfg.shopAddress ? '<br>' + esc(cfg.shopAddress) : '') + '</div></main>';
return [{ json: { html: page(html) } }];

