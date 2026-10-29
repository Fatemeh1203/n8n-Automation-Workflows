// 💳 شروع پرداخت آنلاین قسط: GET /webhook/gold-pay?c=کد مشتری&t=امضای لینک پرتال&q=کد قسط
const crypto = require('crypto');
const q = $('Pay Start').first().json.query || {};
const cfg = {}; $('Pay Settings').all().forEach(function (i) { if (i.json && i.json.key) cfg[i.json.key] = i.json.value; });
const shop = cfg.shopName || 'طلا و جواهر';
const fail = function (msg) { return [{ json: { ok: false, html: payPage(shop, 'پرداخت ممکن نیست', '<p>' + escH(msg) + '</p>') } }]; };
const code = String(q.c || ''), tok = String(q.t || '');
const sig = cfg.portal_secret ? crypto.createHash('sha256').update(cfg.portal_secret + '|' + code).digest('hex').slice(0, 20) : '';
const c = $('Pay Customers').all().map(function (i) { return i.json; }).find(function (r) { return r.code === code; });
if (!c || !sig || tok !== sig) return fail('لینک پرداخت معتبر نیست؛ لینک تازه را از فروشگاه بگیرید.');
if (!cfg.zarinpalMerchant) return fail('پرداخت آنلاین برای این فروشگاه فعال نیست.');
const inst = $('Pay Installments').all().map(function (i) { return i.json; }).find(function (r) { return r.code === String(q.q || '') && r.customerCode === code; });
if (!inst || !(inst.status === 'open' || inst.status === 'partial')) return fail('این قسط پیدا نشد یا قبلاً پرداخت شده.');
const amount = instRest(inst);
if (!(amount >= 1000)) return fail('مبلغ قسط برای پرداخت آنلاین معتبر نیست.');
return [{ json: { ok: true, shop: shop, inst: inst.code, customer: code, amount: amount, body: { merchant_id: cfg.zarinpalMerchant, amount: amount * 10, callback_url: 'https://n8n.aifardainstitute.ir/webhook/gold-pay-cb', description: shop + ' — قسط ' + inst.n + ' از ' + inst.count + ' فاکتور ' + inst.invoice, metadata: { mobile: String(c.phone || '').replace(/\D/g, '') } } } }];
