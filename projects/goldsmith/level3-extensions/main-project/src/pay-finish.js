// 💳 تأیید زرین‌پال و ثبت دریافت قسط
const pre = $('Pay Check').first().json, res = $input.first().json || {}, d = res.data || {};
const pay = pre.pay;
if (!(d.code === 100 || d.code === 101)) return [{ json: { html: payPage(pre.shop, 'پرداخت تأیید نشد', '<p>اگر مبلغی کم شده، طبق قوانین بانکی برمی‌گردد. کد خطا: ' + escH(String(d.code || (res.errors && res.errors.code) || '')) + '</p>'), writes: [{ op: 'setting', row: { key: 'pay_' + pay.authority, value: JSON.stringify(Object.assign({}, pay, { status: 'failed' })) } }] } }];
const inst = $('Cb Installments').all().map(function (i) { return i.json; }).find(function (r) { return r.code === pay.inst; });
const writes = [{ op: 'setting', row: { key: 'pay_' + pay.authority, value: JSON.stringify(Object.assign({}, pay, { status: 'paid', refId: String(d.ref_id), cardPan: d.card_pan || '' })) } }];
if (inst) { const r = paidRows(inst, Number(pay.amount), d.ref_id); writes.push({ op: 'tx', row: r.tx }, { op: 'inst', row: r.inst }); }
return [{ json: { writes: writes, html: payPage(pre.shop, 'پرداخت با موفقیت انجام شد ✅', '<p>مبلغ ' + faNum(pay.amount) + ' تومان دریافت شد.</p><p>کد پیگیری: <b>' + escH(String(d.ref_id)) + '</b></p>', true) } }];
