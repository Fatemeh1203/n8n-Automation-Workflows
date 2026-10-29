// 💳 گرفتن کد authority از زرین‌پال و رفتن به درگاه
const pre = $('Pay Prepare').first().json, res = $input.first().json || {};
const d = res.data || {};
if (!(d.code === 100 && d.authority)) return [{ json: { html: payPage(pre.shop, 'اتصال به درگاه ممکن نشد', '<p>' + escH(((res.errors && res.errors.message) || 'خطای درگاه') + '') + '</p>') } }];
const url = ZP.start + d.authority;
return [{ json: {
  html: payPage(pre.shop, 'در حال انتقال به درگاه…', '<p>مبلغ: <b>' + faNum(pre.amount) + ' تومان</b></p><a class="b" href="' + escH(url) + '">رفتن به درگاه پرداخت</a><script>location.href=' + JSON.stringify(url) + '</script>'),
  writes: [{ op: 'setting', row: { key: 'pay_' + d.authority, value: JSON.stringify({ authority: d.authority, inst: pre.inst, customer: pre.customer, amount: pre.amount, status: 'pending', at: new Date().toISOString() }) } }],
} }];
