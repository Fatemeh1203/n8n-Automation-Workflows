// ---- مشترک: قالب‌بندی عدد و امن‌سازی HTML
const faNum = function (n) { return Math.round(Number(n) || 0).toLocaleString('fa-IR'); };
const escH = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
// ---- مشترک: پرداخت آنلاین قسط با زرین‌پال (API نسخه ۴، مبلغ به ریال)
const ZP = { request: 'https://payment.zarinpal.com/pg/v4/payment/request.json', verify: 'https://payment.zarinpal.com/pg/v4/payment/verify.json', start: 'https://payment.zarinpal.com/pg/StartPay/' };
const payPage = function (shopName, title, body, ok) {
  return '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' + escH(title) + '</title><style>body{margin:0;background:#faf6ec;color:#2b2416;font-family:Vazirmatn,Tahoma,sans-serif;line-height:1.9}header{background:linear-gradient(135deg,#b8860b,#7a5901);color:#fff;padding:16px}main{max-width:560px;margin:auto;padding:16px}.c{background:#fff;border:1px solid #ece4d2;border-radius:14px;padding:16px;margin-top:12px}h2{margin:0 0 8px;color:' + (ok ? '#1f7a3d' : '#7a5901') + '}a.b{display:inline-block;background:#b8860b;color:#fff;padding:10px 18px;border-radius:10px;text-decoration:none;margin-top:8px}</style></head><body><header><b>' + escH(shopName || '') + '</b></header><main><div class="c"><h2>' + escH(title) + '</h2>' + body + '</div></main></body></html>';
};
// مبلغ باقی‌مانده‌ی قسط (تومان)
function instRest(q) { return Math.max(0, Math.round(Number(q.amount) - Number(q.paid || 0))); }
function jalaliNow() { const jp = {}; new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).forEach(function (x) { jp[x.type] = x.value; }); return String(jp.year).replace(/\D/g, '') + '/' + jp.month + '/' + jp.day; }
// ردیف‌های لازم بعد از تأیید پرداخت: تراکنش دریافت + به‌روزرسانی قسط
function paidRows(q, amount, refId) {
  const jalali = jalaliNow(), day = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tehran' });
  const tx = { code: 'T-ZP' + String(refId).slice(-8) + Math.random().toString(36).slice(2, 4).toUpperCase(), day: day, dateFa: jalali, qty: 0, feeAmt: 0, profitAmt: 0, branch: '', user: 'online', itemCode: '', title: 'قسط ' + q.n + ' از ' + q.count + ' — فاکتور ' + q.invoice + ' (پرداخت آنلاین)', weight750: 0, rate18: 0, amount: amount, costBasis: 0, operatingProfit: 0, holdingGain: 0, realProfit: 0, customerCode: q.customerCode, customerName: q.customerName, note: 'زرین‌پال · کد پیگیری ' + refId, payMethod: 'درگاه آنلاین', vat: 0, invoice: q.invoice, grams: 0, category: '', voided: '', type: 'receive' };
  const np = Number(q.paid || 0) + amount;
  const inst = Object.assign({}, q, { paid: np, status: np >= Number(q.amount) ? 'paid' : 'partial', paidDate: jalali });
  ['id', 'createdAt', 'updatedAt'].forEach(function (k) { delete inst[k]; });
  return { tx: tx, inst: inst };
}

// 💳 برگشت از درگاه: GET /webhook/gold-pay-cb?Authority=…&Status=OK|NOK
const q = $('Pay Callback').first().json.query || {};
const cfg = {}; $('Cb Settings').all().forEach(function (i) { if (i.json && i.json.key) cfg[i.json.key] = i.json.value; });
const shop = cfg.shopName || 'طلا و جواهر', auth = String(q.Authority || '').replace(/[^A-Za-z0-9]/g, '');
let pay = null; try { pay = JSON.parse(cfg['pay_' + auth] || ''); } catch (e) {}
if (!pay) return [{ json: { verify: false, html: payPage(shop, 'تراکنش پیدا نشد', '<p>این پرداخت در سیستم ثبت نشده است.</p>') } }];
if (pay.status === 'paid') return [{ json: { verify: false, html: payPage(shop, 'پرداخت قبلاً ثبت شده ✅', '<p>کد پیگیری: ' + escH(pay.refId) + '</p>', true) } }];
if (String(q.Status) !== 'OK') return [{ json: { verify: false, html: payPage(shop, 'پرداخت انجام نشد', '<p>پرداخت لغو شد یا ناموفق بود. هیچ مبلغی از حساب شما کم نشده؛ اگر کم شده باشد تا ۷۲ ساعت برمی‌گردد.</p>'), writes: [{ op: 'setting', row: { key: 'pay_' + auth, value: JSON.stringify(Object.assign({}, pay, { status: 'failed' })) } }] } }];
return [{ json: { verify: true, shop: shop, pay: pay, body: { merchant_id: cfg.zarinpalMerchant, amount: Number(pay.amount) * 10, authority: auth } } }];
