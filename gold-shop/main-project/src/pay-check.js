// 💳 برگشت از درگاه: GET /webhook/gold-pay-cb?Authority=…&Status=OK|NOK
const q = $('Pay Callback').first().json.query || {};
const cfg = {}; $('Cb Settings').all().forEach(function (i) { if (i.json && i.json.key) cfg[i.json.key] = i.json.value; });
const shop = cfg.shopName || 'طلا و جواهر', auth = String(q.Authority || '').replace(/[^A-Za-z0-9]/g, '');
let pay = null; try { pay = JSON.parse(cfg['pay_' + auth] || ''); } catch (e) {}
if (!pay) return [{ json: { verify: false, html: payPage(shop, 'تراکنش پیدا نشد', '<p>این پرداخت در سیستم ثبت نشده است.</p>') } }];
if (pay.status === 'paid') return [{ json: { verify: false, html: payPage(shop, 'پرداخت قبلاً ثبت شده ✅', '<p>کد پیگیری: ' + escH(pay.refId) + '</p>', true) } }];
if (String(q.Status) !== 'OK') return [{ json: { verify: false, html: payPage(shop, 'پرداخت انجام نشد', '<p>پرداخت لغو شد یا ناموفق بود. هیچ مبلغی از حساب شما کم نشده؛ اگر کم شده باشد تا ۷۲ ساعت برمی‌گردد.</p>'), writes: [{ op: 'setting', row: { key: 'pay_' + auth, value: JSON.stringify(Object.assign({}, pay, { status: 'failed' })) } }] } }];
return [{ json: { verify: true, shop: shop, pay: pay, body: { merchant_id: cfg.zarinpalMerchant, amount: Number(pay.amount) * 10, authority: auth } } }];
