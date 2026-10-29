(function () {
var API = 'https://n8n.aifardainstitute.ir/webhook/gold-admin-api';
var S = null, TOKEN = '', CART = [], BR = '';
var TYPE_FA = { buy: 'خرید', melt: 'ذوب به آبشده', consignIn: 'ورود امانی', consignOut: 'برگشت امانی', wsOut: 'تحویل به کارگاه', wsIn: 'دریافت از کارگاه', wsLoss: 'افت کارگاه', goldSave: 'پس‌انداز طلایی', goldRedeem: 'برداشت پس‌انداز', sell: 'فروش', buyback: 'خرید طلای کهنه', 'return': 'برگشت از فروش', expense: 'هزینه', receive: 'دریافت وجه', pay: 'پرداخت وجه', deposit: 'بیعانه سفارش' };
var STATUS_FA = { in_stock: 'موجود', sold: 'فروخته شد', melted: 'ذوب شد', workshop: 'در کارگاه', returned: 'برگشت به بنکدار', 'void': 'باطل شد' };
var CHQ_FA = { pending: 'در جریان', cashed: 'وصول شد', bounced: 'برگشتی', spent: 'واگذار شد', returned: 'ابطال/عودت' };
var KIND_FA = { supplier: 'همکار / تأمین‌کننده', maker: 'سازنده / کارگاه', customer: 'مشتری' };
var INST_FA = { open: 'باز', partial: 'پرداخت ناقص', paid: 'پرداخت شد', 'void': 'باطل شد' };
var MONTHS_FA = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
function mdFa(v) { if (!v) return ''; var p = String(v).split('-'); return Number(p[1]) + ' ' + (MONTHS_FA[Number(p[0]) - 1] || ''); }
function nz(v) { return v === undefined || v === null ? '' : v; }
var SHEET = {
  item: function (r) { return { 'کد': r.code, 'عنوان': nz(r.title), 'دسته': nz(r.category), 'وزن (گرم)': nz(r.weight), 'عیار': nz(r.karat), 'معادل ۱۸ عیار (گرم)': nz(r.weight750), 'نرخ خرید ۱۸ عیار': nz(r.buyRate18), 'اجرت پرداختی': nz(r.makingCost), 'بهای تمام‌شده': nz(r.buyCost), 'تاریخ خرید': nz(r.buyDay), 'تأمین‌کننده': nz(r.supplier), 'وضعیت': STATUS_FA[r.status] || nz(r.status), 'کد فروش': nz(r.soldTx), 'یادداشت': nz(r.note), 'قیمت سنگ / نگین': nz(r.stoneCost), 'آزمایشگاه / ری‌گیری': nz(r.cert), 'امانی': r.consign === 'yes' ? 'بله' : '', 'کد تأمین‌کننده': nz(r.supplierCode), 'فلز': r.metal === 'silver' ? 'نقره' : 'طلا', 'شعبه': nz(r.branch), 'مشخصات سنگ': nz(r.stones), 'لینک عکس': nz(r.photoUrl) }; },
  tx: function (r) { return { 'کد': r.code, 'تاریخ': nz(r.dateFa), 'نوع': TYPE_FA[r.type] || nz(r.type), 'شماره فاکتور': nz(r.invoice), 'شرح / کالا': nz(r.title), 'کد کالا': nz(r.itemCode), 'طرف حساب': nz(r.customerName), 'کد طرف حساب': nz(r.customerCode), 'روش پرداخت': nz(r.payMethod), 'معادل ۱۸ عیار (گرم)': nz(r.weight750), 'نرخ ۱۸ عیار': nz(r.rate18), 'مبلغ': nz(r.amount), 'مالیات ارزش افزوده': nz(r.vat), 'بهای تمام‌شده': nz(r.costBasis), 'سود فروش': nz(r.operatingProfit), 'سود/زیان نوسان': nz(r.holdingGain), 'سود واقعی': nz(r.realProfit), 'گرم طلا (حساب)': nz(r.grams), 'دسته': nz(r.category), 'وضعیت': r.voided ? 'باطل شد' : 'معتبر', 'یادداشت': nz(r.note), 'تعداد': nz(r.qty), 'اجرت (فاکتور)': nz(r.feeAmt), 'سود (فاکتور)': nz(r.profitAmt), 'شعبه': nz(r.branch), 'کاربر': nz(r.user) }; },
  party: function (r) { return { 'کد': r.code, 'نام': nz(r.name), 'نوع': KIND_FA[r.kind] || 'مشتری', 'تلفن': nz(r.phone), 'ایمیل': nz(r.email), 'تولد': mdFa(r.birthday), 'سالگرد ازدواج': mdFa(r.anniversary), 'Telegram Chat ID': nz(r.telegramChatId), 'یادداشت': nz(r.notes), 'کد ملی': nz(r.nationalId), 'کد اقتصادی': nz(r.economicCode), 'کد پستی': nz(r.postalCode), 'آدرس': nz(r.address) }; },
  order: function (r) { return { 'کد': r.code, 'تاریخ ثبت': nz(r.dateFa), 'مشتری': nz(r.customerName), 'کد مشتری': nz(r.customerCode), 'تلفن': nz(r.phone), 'نوع سفارش': nz(r.kind), 'شرح': nz(r.description), 'وزن تقریبی (گرم)': nz(r.weight), 'عیار': nz(r.karat), 'مبلغ برآوردی': nz(r.estimate), 'بیعانه': nz(r.deposit), 'تاریخ تحویل': nz(r.dueDate), 'وضعیت': nz(r.status), 'یادداشت': nz(r.note) }; },
  inst: function (r) { return { 'کد': r.code, 'شماره فاکتور': nz(r.invoice), 'مشتری': nz(r.customerName), 'کد مشتری': nz(r.customerCode), 'تلفن': nz(r.phone), 'قسط': nz(r.n), 'از': nz(r.count), 'سررسید': nz(r.dueDate), 'مبلغ قسط': nz(r.amount), 'پرداخت‌شده': nz(r.paid), 'وضعیت': INST_FA[r.status] || nz(r.status), 'تاریخ پرداخت': nz(r.paidDate) }; },
  cheque: function (r) { return { 'کد': r.code, 'تاریخ ثبت': nz(r.dateFa), 'نوع': r.dir === 'out' ? 'پرداختی' : 'دریافتی', 'طرف حساب': nz(r.partyName), 'کد طرف حساب': nz(r.partyCode), 'بانک': nz(r.bank), 'شماره چک': nz(r.number), 'شناسه صیاد': nz(r.sayad), 'مبلغ': nz(r.amount), 'سررسید': nz(r.dueDate), 'وضعیت': CHQ_FA[r.status] || nz(r.status), 'تاریخ تسویه': nz(r.settledDate), 'واگذار به': nz(r.spentTo), 'یادداشت': nz(r.note), 'شعبه': nz(r.branch) }; },
  closing: function (r) { return { 'کد': r.code, 'تاریخ': nz(r.dateFa), 'ساعت': nz(r.time), 'کاربر': nz(r.user), 'شعبه': nz(r.branch), 'مانده سیستمی': nz(r.expected), 'شمارش‌شده': nz(r.counted), 'مغایرت': nz(r.diff), 'طلای سیستمی (گرم)': nz(r.goldSystem), 'طلای شمارش‌شده (گرم)': nz(r.goldCounted), 'مغایرت طلا (گرم)': nz(r.goldDiff), 'جزئیات': nz(r.detail), 'یادداشت': nz(r.note) }; },
  site: function (r) { return { 'شماره فاکتور': nz(r.invoiceNo), 'تاریخ': nz(r.dateFa), 'مشتری': nz(r.customer), 'تلفن': nz(r.phone), 'ایمیل': nz(r.email), 'شرح کالا': nz(r.item), 'وزن (گرم)': nz(r.weight), 'عیار': nz(r.karat), 'نرخ هر گرم ۱۸ عیار': nz(r.rate18), 'ارزش طلا': nz(r.goldValue), 'اجرت': nz(r.makingFee), 'سود': nz(r.profit), 'مبلغ نهایی': nz(r.total) }; }
};

function $(id) { return document.getElementById(id); }
function fa(n, d) { n = Number(n) || 0; return n.toLocaleString('fa-IR', { maximumFractionDigits: d == null ? 0 : d }); }
function faStr(s) { return String(s == null ? '' : s).replace(/\d/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'[c]; }); }
function cls(n) { return n > 0 ? 'pos' : (n < 0 ? 'neg' : ''); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function sum(a, k) { return a.reduce(function (s, r) { return s + (Number(typeof k === 'function' ? k(r) : r[k]) || 0); }, 0); }
function toast(msg, ok) { var t = $('toast'); t.textContent = msg; t.style.background = ok === false ? 'var(--err)' : 'var(--ok)'; t.style.display = 'block'; clearTimeout(t._h); t._h = setTimeout(function () { t.style.display = 'none'; }, 5000); }
function formObj(f) { var o = {}; new FormData(f).forEach(function (v, k) { o[k] = v; }); f.querySelectorAll('input[type=checkbox]').forEach(function (c) { o[c.name] = c.checked; }); return o; }
function kpi(l, v, s, c) { return '<div class="kpi"><div class="l">' + l + '</div><div class="v ' + (c || '') + '">' + v + '</div>' + (s ? '<div class="s">' + s + '</div>' : '') + '</div>'; }
function table(cols, rows) {
  if (!rows.length) return '<div class="muted" style="padding:12px">موردی وجود ندارد.</div>';
  return '<table><thead><tr>' + cols.map(function (c) { return '<th>' + c[0] + '</th>'; }).join('') + '</tr></thead><tbody>' + rows.map(function (r) { return '<tr>' + cols.map(function (c) { return '<td>' + c[1](r) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
}
function T(t) { return TYPE_FA[t] || t; }
function money(n) { return fa(n) + ' ت'; }
function bal(b) { b = b || { money: 0, grams: 0 }; var m = b.money, g = b.grams, s = []; if (m > 0) s.push('<span class="pos">طلب ما: ' + fa(m) + '</span>'); if (m < 0) s.push('<span class="neg">بدهی ما: ' + fa(-m) + '</span>'); if (g > 0) s.push('<span class="pos">طلب طلایی: ' + fa(g, 3) + 'گ</span>'); if (g < 0) s.push('<span class="neg">بدهی طلایی: ' + fa(-g, 3) + 'گ</span>'); return s.join(' · ') || '<span class="muted">تسویه</span>'; }

// ---------- API
function api(action, data) { return fetch(API, { method: 'POST', body: new URLSearchParams({ token: TOKEN, action: action, data: JSON.stringify(data || {}) }) }).then(function (r) { return r.json(); }); }
function load(action, data, form, after) {
  var btn = form ? form.querySelector('button[type=submit]') : null; if (btn) btn.disabled = true;
  return api(action, data).then(function (d) {
    if (d.unauthorized) { logout(); $('loginMsg').textContent = d.error || 'نشست شما تمام شده؛ دوباره وارد شوید.'; return; }
    if (d.token) setToken(d.token);
    if (!d.ok) { toast(d.error || 'خطا', false); return; }
    S = d; render(); if (d.message) toast(d.message);
    if (form) { form.reset(); fillDefaults(); }
    if (after) after(d);
  }).catch(function () { toast('ارتباط با سرور برقرار نشد.', false); }).then(function () { if (btn) btn.disabled = false; });
}
function setToken(t) { TOKEN = t; try { sessionStorage.setItem('gst', t); } catch (e) {} }
function enter(d) { $('login').style.display = 'none'; $('app').style.display = 'block'; S = d; render(); fillDefaults(); fillSettings(); }
function login() {
  $('loginMsg').textContent = '…'; TOKEN = '';
  api('login', { username: $('un').value.trim() || 'admin', password: $('pw').value }).then(function (d) {
    if (d.unauthorized || !d.token) { $('loginMsg').textContent = d.error || 'نام کاربری یا رمز اشتباه است.'; return; }
    setToken(d.token); $('pw').value = ''; enter(d);
  }).catch(function () { $('loginMsg').textContent = 'ارتباط با سرور برقرار نشد.'; });
}
function resume() { api('all').then(function (d) { if (d.unauthorized) { logout(); return; } if (d.token) setToken(d.token); enter(d); }).catch(function () { $('loginMsg').textContent = 'ارتباط با سرور برقرار نشد.'; }); }
function logout() { TOKEN = ''; try { sessionStorage.removeItem('gst'); } catch (e) {} $('app').style.display = 'none'; $('login').style.display = 'flex'; }
$('loginBtn').onclick = login; $('pw').onkeydown = function (e) { if (e.key === 'Enter') login(); }; $('un').onkeydown = function (e) { if (e.key === 'Enter') $('pw').focus(); };
$('logout').onclick = logout; $('reload').onclick = function () { load('all'); };
document.querySelectorAll('#nav button').forEach(function (b) { b.onclick = function () { document.querySelectorAll('#nav button').forEach(function (x) { x.classList.toggle('on', x === b); }); document.querySelectorAll('.tab').forEach(function (t) { t.classList.toggle('on', t.id === 't-' + b.dataset.t); }); }; });
document.querySelectorAll('.months').forEach(function (s) { s.innerHTML = '<option value="">ماه</option>' + MONTHS_FA.map(function (m, i) { return '<option value="' + (i + 1) + '">' + m + '</option>'; }).join(''); });
document.querySelectorAll('.days').forEach(function (s) { var h = '<option value="">روز</option>'; for (var i = 1; i <= 31; i++) h += '<option value="' + i + '">' + fa(i) + '</option>'; s.innerHTML = h; });
function showModal(html) { $('printArea').innerHTML = html; $('modal').style.display = 'flex'; document.body.classList.toggle('thermal-default', S && S.settings.printMode === 'thermal'); }
$('closeModal').onclick = function () { $('modal').style.display = 'none'; }; $('printBtn').onclick = function () { if (S && S.settings.printMode === 'thermal') document.body.classList.add('thermal'); window.print(); setTimeout(function () { document.body.classList.remove('thermal'); }, 500); };

// ---------- party picker (old / new / walk-in)
function partyPicker(id, kind, allowWalkin) {
  var el = $(id), name = id + 'Mode';
  el.innerHTML = '<div class="seg">' + '<label><input type="radio" name="' + name + '" value="existing" checked><span>' + (kind === 'supplier' ? 'همکار قبلی' : (kind === 'any' ? 'طرف حساب قبلی' : 'مشتری قبلی')) + '</span></label>' + '<label><input type="radio" name="' + name + '" value="new"><span>' + (kind === 'supplier' ? 'همکار جدید' : (kind === 'any' ? 'طرف حساب جدید' : 'مشتری جدید')) + '</span></label>' + (allowWalkin ? '<label><input type="radio" name="' + name + '" value="walkin"><span>' + (kind === 'customer' ? 'مشتری گذری (بی‌نام)' : 'بدون ثبت (بازار)') + '</span></label>' : '') + '</div>' +
    '<div class="g3" style="margin-top:8px"><div class="pp-ex"><label>انتخاب از فهرست</label><select class="pp-code"></select></div><div class="pp-new" style="display:none"><label>نام</label><input class="pp-name"></div><div class="pp-new" style="display:none"><label>تلفن</label><input class="pp-phone" inputmode="tel"></div><div class="pp-bal muted" style="align-self:end"></div></div>';
  el.dataset.kind = kind;
  el.querySelectorAll('input[type=radio]').forEach(function (r) { r.onchange = function () { syncPicker(id); }; });
  el.querySelector('.pp-code').onchange = function () { syncPicker(id); };
}
function syncPicker(id) {
  var el = $(id), mode = el.querySelector('input[type=radio]:checked').value;
  el.querySelectorAll('.pp-ex').forEach(function (x) { x.style.display = mode === 'existing' ? '' : 'none'; });
  el.querySelectorAll('.pp-new').forEach(function (x) { x.style.display = mode === 'new' ? '' : 'none'; });
  var c = S && S.parties.find(function (p) { return p.code === el.querySelector('.pp-code').value; });
  el.querySelector('.pp-bal').innerHTML = mode === 'existing' && c ? 'مانده: ' + bal(c.balance) : (mode === 'walkin' ? 'برای مشتری گذری، فروش باید کامل تسویه شود.' : '');
  if (id === 'sellParty') sellPreview();
}
function fillPicker(id) {
  var el = $(id), kind = el.dataset.kind, sel = el.querySelector('.pp-code'), cur = sel.value;
  var list = S.parties.filter(function (p) { return kind === 'any' || (p.kind || 'customer') === kind; });
  sel.innerHTML = '<option value="">— انتخاب کنید —</option>' + list.map(function (p) { return '<option value="' + esc(p.code) + '">' + esc(p.name) + (p.phone ? ' · ' + esc(p.phone) : '') + '</option>'; }).join('');
  sel.value = cur; syncPicker(id);
}
function pickerData(id) { var el = $(id); return { partyMode: el.querySelector('input[type=radio]:checked').value, partyCode: el.querySelector('.pp-code').value, partyName: el.querySelector('.pp-name').value, partyPhone: el.querySelector('.pp-phone').value }; }
partyPicker('sellParty', 'customer', true); partyPicker('buyParty', 'supplier', true); partyPicker('orderParty', 'customer', false);
partyPicker('chqParty', 'any', false); partyPicker('saveParty', 'customer', false);
partyPicker('abBuyParty', 'any', true); partyPicker('abSellParty', 'customer', true); partyPicker('coinBuyParty', 'any', true); partyPicker('coinSellParty', 'customer', true);

// ---------- helpers
function stock() { return S.items.filter(function (r) { return r.status === 'in_stock' && brOk(r); }); }
function liveTx() { return S.txs.filter(function (t) { return !t.voided && brOk(t); }); }
function inPeriod(d, key) {
  var j = S.today.jalali, y = j.slice(0, 4), m = j.slice(0, 7), pm = Number(j.slice(5, 7)) - 1, py = Number(y); if (pm < 1) { pm = 12; py--; }
  d = String(d || ''); return key === 'all' || (key === 'day' && d === j) || (key === 'month' && d.slice(0, 7) === m) || (key === 'prev' && d.slice(0, 7) === py + '/' + String(pm).padStart(2, '0')) || (key === 'year' && d.slice(0, 4) === y);
}
function rate() { return S.prices.rate18 || 0; }
function fillDefaults() {
  var f = $('sellForm'); if (!f.feePct.value) f.feePct.value = S.settings.feePct; if (!f.profitPct.value) f.profitPct.value = S.settings.profitPct; if (!f.tradeDeduction.value) f.tradeDeduction.value = S.settings.buybackDeduction;
  var b = $('buyForm'); if (!b.deductionPct.value) b.deductionPct.value = S.settings.buybackDeduction;
  if (!f.feePerGram.value) f.feePerGram.value = S.settings.feePerGram || '';
  ['abBuyForm', 'abSellForm'].forEach(function (id) { var x = $(id); if (!x.commission.value) x.commission.value = S.settings.abCommission || ''; });
}
function fillSettings() { var f = $('setForm'), st = S.settings; ['shopName', 'shopPhone', 'shopAddress', 'ownerEmail', 'ownerChatId', 'logoUrl', 'feePct', 'profitPct', 'vatPct', 'buybackDeduction', 'feePerGram', 'abCommission', 'savingsFeePct', 'branches', 'printMode', 'labelSize', 'taxGoodsId', 'taxMemoryId', 'sellerEconomicCode', 'sellerNationalId', 'smsProvider', 'smsSender'].forEach(function (k) { if (f[k]) f[k].value = st[k] == null ? '' : st[k]; }); if (!f.printMode.value) f.printMode.value = 'a5'; if (!f.labelSize.value) f.labelSize.value = '50x30'; if (!f.smsProvider.value) f.smsProvider.value = 'kavenegar'; f.smsEnabled.checked = st.smsEnabled === 'yes'; f.smsApiKey.value = ''; f.smsApiKey.placeholder = st.smsKeySet ? 'کلید ذخیره شده — خالی = بدون تغییر' : 'هنوز کلیدی ذخیره نشده'; }

// ---------- render
function render() {
  applyRole();
  var P = S.prices, R = rate(), st = goldStock(), own = ownGold(), T0 = liveTx();
  $('shopTitle').textContent = '🥇 ' + (S.settings.shopName || 'پنل مدیریت طلافروشی');
  $('rateLine').textContent = '🟡 ۱۸ عیار: ' + fa(R) + ' · 🧈 مظنه: ' + fa(P.mazaneh) + ' · 🪙 امامی: ' + fa(P.emami) + ' · 💵 دلار: ' + fa(P.usd) + (P.updated ? ' · ' + P.updated : '');
  renderBoard();
  $('sheetBtn').href = S.sheetUrl;
  var g = sum(own, 'weight750'), unreal = sum(own, function (r) { return r.weight750 * (R - r.buyRate18); }), cons = st.length - own.length, svG = sum(S.parties, 'savings');
  var sToday = T0.filter(function (t) { return t.type === 'sell' && inPeriod(t.dateFa, 'day'); }), sMonth = T0.filter(function (t) { return (t.type === 'sell' || t.type === 'return') && inPeriod(t.dateFa, 'month'); });
  var recv = sum(S.parties, function (p) { return Math.max(0, p.balance.money); }), payb = sum(S.parties, function (p) { return Math.max(0, -p.balance.money); }), gpay = sum(S.parties, function (p) { return Math.max(0, -p.balance.grams); }), chq7 = chqDueList(7);
  var cashToday = sum(T0.filter(function (t) { return inPeriod(t.dateFa, 'day'); }), function (t) { return cashEffect(t); });
  var expM = sum(T0.filter(function (t) { return t.type === 'expense' && inPeriod(t.dateFa, 'month'); }), 'amount');
  var openO = S.orders.filter(function (o) { return o.status !== 'تحویل شد' && o.status !== 'لغو شد'; });
  $('kpis').innerHTML = kpi('موجودی طلای ملکی (معادل ۱۸)', fa(g, 3) + ' گرم', fa(own.length) + ' قلم' + (cons ? ' · امانی: ' + fa(cons) + ' قلم' : '')) + kpi('ارزش طلای موجودی', money(g * R), 'به نرخ روز') + kpi('سود/زیان نوسانِ موجودی', money(unreal), 'تحقق‌نیافته', cls(unreal)) + (ROLE === 'seller' ? '' : '') +
    kpi('فروش امروز', money(sum(sToday, 'amount')), fa(sToday.length) + ' قلم · سود واقعی ' + fa(sum(sToday, 'realProfit'))) + kpi('سود خالص این ماه', money(sum(sMonth, 'realProfit') - expM), 'سود واقعی ' + fa(sum(sMonth, 'realProfit')) + ' − هزینه ' + fa(expM), cls(sum(sMonth, 'realProfit') - expM)) +
    kpi('سکه‌های موجود', fa(coinCount()) + ' عدد', 'ارزش روز ' + fa(sum(coinList(), 'value')) + ' ت') + kpi('اقساط سررسیده', money(sum(instDue(0), function (q) { return q.amount - (q.paid || 0); })), fa(instDue(0).length) + ' قسط معوق یا امروز', instDue(0).length ? 'neg' : '') +
    kpi('خالص صندوق امروز', money(cashToday), 'ورودی − خروجی', cls(cashToday)) + kpi('طلب از مشتریان (نسیه)', money(recv), '', recv ? 'pos' : '') + kpi('بدهی به همکاران', money(payb), gpay ? 'بدهی طلایی: ' + fa(gpay, 3) + ' گرم' : '', payb || gpay ? 'neg' : '') + kpi('سفارش‌های باز', fa(openO.length), '') + kpi('چک‌های ۷ روز آینده', money(sum(chq7, 'amount')), fa(chq7.length) + ' فقره', chq7.length ? 'neg' : '') + (svG ? kpi('تعهد پس‌انداز طلایی', fa(svG, 3) + ' گرم', 'ارزش روز ' + fa(svG * R)) : '');
  if (ROLE === 'seller') $('kpis').innerHTML = kpi('موجودی (معادل ۱۸)', fa(g, 3) + ' گرم', fa(own.length) + ' قلم') + kpi('فروش امروز', money(sum(sToday, 'amount')), fa(sToday.length) + ' قلم') + kpi('اقساط سررسیده', fa(instDue(0).length), '') + kpi('سفارش‌های باز', fa(openO.length), '');
  $('recent').innerHTML = txTable(S.txs.filter(brOk).slice(0, 12), false);
  $('openOrders').innerHTML = openO.length ? table([['مشتری', function (o) { return esc(o.customerName); }], ['شرح', function (o) { return esc(o.description); }], ['تحویل', function (o) { return faStr(o.dueDate); }], ['وضعیت', function (o) { return esc(o.status); }]], openO.slice(0, 8)) : '<div class="muted">سفارش بازی ندارید.</div>';
  $('occList').innerHTML = occasions();
  $('instDue').innerHTML = instTable(instDue(7), false);
  renderInv(); renderCart(); renderAcc(); renderOrders(); renderCash(); renderAb(); renderCoin(); renderInst(); renderChq(); renderSave(); renderWs(); renderCalc(); renderClose();
  if (ROLE !== 'seller') { renderReport(); renderCharts(); renderBooks(); } renderSec();
  ['sellParty', 'buyParty', 'orderParty', 'abBuyParty', 'abSellParty', 'coinBuyParty', 'coinSellParty', 'chqParty', 'saveParty'].forEach(fillPicker);
  $('payParty').innerHTML = '<option value="">— انتخاب کنید —</option>' + S.parties.map(function (p) { return '<option value="' + esc(p.code) + '">' + esc(p.name) + ' (' + KIND_FA[p.kind || 'customer'] + ')</option>'; }).join('');
  buyPreview();
}
function cashEffect(t) { var pm = String(t.payMethod || ''), a = Number(t.amount) || 0; if (pm.indexOf('چک') === 0 || pm === 'اعتبار حساب' || pm === 'طلایی') return 0; if (['receive', 'deposit', 'goldSave'].indexOf(t.type) >= 0) return a; if (['pay', 'expense', 'melt', 'goldRedeem'].indexOf(t.type) >= 0) return -a; return 0; }
function occasions() {
  var j = S.today.jalali, m = Number(j.slice(5, 7)), d = Number(j.slice(8, 10)), out = [];
  var dim = function (mm) { return mm <= 6 ? 31 : (mm <= 11 ? 30 : 30); };
  for (var k = 0; k < 7; k++) {
    var key = String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    S.parties.forEach(function (p) { if (p.birthday === key) out.push([k, p, 'تولد']); if (p.anniversary === key) out.push([k, p, 'سالگرد ازدواج']); });
    d++; if (d > dim(m)) { d = 1; m = m % 12 + 1; }
  }
  return out.length ? out.map(function (o) { return '<div>🎉 <b>' + esc(o[1].name) + '</b> — ' + o[2] + ' — ' + (o[0] === 0 ? '<b class="pos">امروز</b>' : fa(o[0]) + ' روز دیگر') + (o[1].phone ? ' · ' + esc(o[1].phone) : '') + '</div>'; }).join('') : '<div class="muted">در ۷ روز آینده مناسبتی ثبت نشده.</div>';
}
function txTable(list, actions) {
  return table([
    ['تاریخ', function (t) { return faStr(t.dateFa); }],
    ['نوع', function (t) { return '<span class="badge ' + (t.voided ? 'b-void' : (t.type === 'sell' ? 'b-sell' : 'b-buy')) + '">' + T(t.type) + (t.voided ? ' (باطل)' : '') + '</span>'; }],
    ['شرح / کالا', function (t) { return esc(t.title) + (t.itemCode ? ' <span class="muted">' + esc(t.itemCode) + '</span>' : ''); }],
    ['طرف حساب', function (t) { return esc(t.customerName || '—'); }], ['روش', function (t) { return esc(t.payMethod || '—'); }],
    ['مبلغ', function (t) { return fa(t.amount) + (Number(t.vat) ? ' <span class="muted">+ مالیات ' + fa(t.vat) + '</span>' : '') + (Number(t.grams) ? ' <span class="muted">· ' + fa(t.grams, 3) + 'گ</span>' : ''); }],
    ['سود واقعی', function (t) { return (t.type === 'sell' || t.type === 'return') && t.realProfit != null ? '<span class="' + cls(t.realProfit) + '">' + fa(t.realProfit) + '</span>' : '—'; }],
    ['فاکتور', function (t) { return esc(t.invoice || ''); }]
  ].concat(actions ? [['', function (t) { return !t.voided && (['expense', 'receive', 'pay', 'deposit', 'goldSave', 'goldRedeem', 'wsLoss'].indexOf(t.type) >= 0 || isCoinTx(t)) && ROLE !== 'seller' ? '<button class="btn sm red" data-void="' + esc(t.code) + '">ابطال</button>' : ''; }]] : []), list);
}
document.addEventListener('click', function (e) {
  var b = e.target.closest('button'); if (!b) return;
  if (b.dataset.void && confirm('این تراکنش باطل شود؟')) load('voidTx', { code: b.dataset.void });
  if (b.dataset.voiditem && confirm('ثبت این کالا باطل شود؟ (فقط برای ثبت اشتباه)')) load('voidItem', { itemCode: b.dataset.voiditem });
  if (b.dataset.ret) { var r = prompt('مبلغ استرداد به مشتری (تومان) — خالی بگذارید تا کل مبلغ فاکتور حساب شود:', ''); if (r !== null) load('returnSale', { itemCode: b.dataset.ret, refund: r }); }
  if (b.dataset.edit) editParty(b.dataset.edit);
  if (b.dataset.paywith) { $('payParty').value = b.dataset.paywith; payInfo(); $('payForm').scrollIntoView({ behavior: 'smooth' }); }
  if (b.dataset.rm != null) { CART.splice(Number(b.dataset.rm), 1); renderCart(); }
  if (b.dataset.label) printLabels([S.items.find(function (r) { return r.code === b.dataset.label; })]);
  if (b.dataset.payinst) { var q = S.installments.find(function (x) { return x.code === b.dataset.payinst; }); var a = prompt('مبلغ دریافتی قسط (تومان) — خالی = کل قسط:', ''); if (a !== null) load('payInstallment', { code: q.code, amount: a, payMethod: 'نقد' }); }
});

// ---------- inventory
function renderInv() {
  var R = rate(), st = stock(), groups = {};
  st.forEach(function (r) { r._k = (isSilver(r) ? 'نقره ' : '') + r.karat + (r.consign === 'yes' ? ' (امانی)' : ''); });
  st.forEach(function (r) { var k = r._k; groups[k] = groups[k] || { karat: k, n: 0, w: 0, w750: 0, cost: 0 }; groups[k].n++; groups[k].w += Number(r.weight) || 0; groups[k].w750 += Number(r.weight750) || 0; groups[k].cost += Number(r.buyCost) || 0; });
  var gl = Object.keys(groups).map(function (k) { return groups[k]; });
  if (gl.length) { var gg = gl.filter(function (x) { return String(x.karat).indexOf('نقره') < 0; }); gl.push({ karat: 'جمع طلا', n: sum(gg, 'n'), w: sum(gg, 'w'), w750: sum(gg, 'w750'), cost: sum(gg, 'cost') }); }
  $('byKarat').innerHTML = table([['عیار', function (r) { return '<b>' + faStr(r.karat) + '</b>'; }], ['تعداد', function (r) { return fa(r.n); }], ['وزن خالص (گرم)', function (r) { return fa(r.w, 3); }], ['معادل ۱۸ عیار (گرم)', function (r) { return fa(r.w750, 3); }], ['مثقال (۴٫۶۰۸ گرم)', function (r) { return fa(r.w750 / 4.608, 3); }], ['بهای تمام‌شده', function (r) { return fa(r.cost); }], ['ارزش روز', function (r) { return fa(r.w750 * (String(r.karat).indexOf('نقره') === 0 ? S.prices.silver925 : R)); }]], gl);
  var cats = {}; S.items.forEach(function (r) { cats[r.category] = 1; });
  var cs = $('invCat'), cv = cs.value; cs.innerHTML = '<option value="">همه‌ی دسته‌ها</option>' + Object.keys(cats).map(function (c) { return '<option>' + esc(c) + '</option>'; }).join(''); cs.value = cv;
  var f = $('invFilter').value, q = $('invSearch').value.trim(), c = cs.value;
  var list = S.items.filter(function (r) { return r.status !== 'void' && brOk(r) && (f === 'all' || (f === 'consign' ? r.consign === 'yes' && r.status === 'in_stock' : r.status === f)) && (!c || r.category === c) && (!q || (r.title + r.code + r.supplier).indexOf(q) >= 0); });
  $('invTable').innerHTML = table([['', function (r) { return r.status === 'in_stock' ? '<input type="checkbox" class="invChk" value="' + esc(r.code) + '">' : ''; }], ['کد', function (r) { return esc(r.code); }], ['عنوان', function (r) { return esc(r.title) + (r.consign === 'yes' ? ' <span class="badge b-con">امانی</span>' : '') + (isSilver(r) ? ' <span class="badge b-sil">نقره</span>' : '') + (r.branch ? ' <span class="muted">' + esc(r.branch) + '</span>' : ''); }], ['دسته', function (r) { return esc(r.category); }], ['وزن', function (r) { return fa(r.weight, 3); }], ['عیار', function (r) { return faStr(r.karat); }], ['معادل ۱۸', function (r) { return fa(r.weight750, 3); }], ['نرخ خرید', function (r) { return fa(r.buyRate18); }], ['اجرت پرداختی', function (r) { return fa(r.makingCost); }], ['بهای تمام‌شده', function (r) { return fa(r.buyCost); }], ['ارزش روز', function (r) { return fa(r.weight750 * (isSilver(r) ? S.prices.silver925 : R)); }], ['نوسان', function (r) { if (r.buyRate18 == null) return '—'; var v = r.weight750 * ((isSilver(r) ? S.prices.silver925 : R) - r.buyRate18); return '<span class="' + cls(v) + '">' + fa(v) + '</span>'; }], ['تأمین‌کننده', function (r) { return esc(r.supplier); }], ['تاریخ خرید', function (r) { return faStr(r.buyDay); }], ['سنگ', function (r) { return Number(r.stoneCost) ? fa(r.stoneCost) : '—'; }], ['وضعیت', function (r) { return r.status === 'in_stock' ? '<span class="badge b-in">موجود</span>' : '<span class="badge b-out">' + (STATUS_FA[r.status] || r.status) + '</span>'; }], ['', function (r) { return r.status === 'in_stock' ? '<button class="btn sm ghost" data-label="' + esc(r.code) + '">🏷️</button> <button class="btn sm ghost" data-cert="' + esc(r.code) + '">📜</button>' + (ROLE !== 'seller' ? ' <button class="btn sm red" data-voiditem="' + esc(r.code) + '">ابطال</button>' : '') : (r.status === 'sold' && ROLE !== 'seller' ? '<button class="btn sm ghost" data-ret="' + esc(r.code) + '">برگشت از فروش</button>' : ''); }]], list);
}
['invFilter', 'invCat'].forEach(function (id) { $(id).onchange = renderInv; }); $('invSearch').oninput = renderInv;

// ---------- sell (cart)
function fillItemPick() {
  var q = $('itemSearch').value.trim(), st = stock().filter(function (r) { return CART.indexOf(r.code) < 0 && (!q || (r.code + r.title + r.category).indexOf(q) >= 0); });
  $('itemPick').innerHTML = st.length ? st.map(function (r) { return '<option value="' + esc(r.code) + '">' + esc(r.title) + ' · ' + fa(r.weight, 3) + 'گ · ' + faStr(r.karat) + ' · ' + esc(r.code) + '</option>'; }).join('') : '<option value="">کالای موجودی پیدا نشد</option>';
}
$('itemSearch').oninput = fillItemPick;
// اسکنر بارکد مثل کیبورد کد را تایپ می‌کند و Enter می‌زند
$('itemSearch').onkeydown = function (e) { if (e.key !== 'Enter') return; e.preventDefault(); var v = this.value.trim().toUpperCase(), it = stock().find(function (r) { return r.code.toUpperCase() === v; }); if (it) { if (CART.indexOf(it.code) < 0) CART.push(it.code); this.value = ''; renderCart(); } else toast('کالایی با این کد در موجودی نیست.', false); };
$('addToCart').onclick = function () { var c = $('itemPick').value; if (c && CART.indexOf(c) < 0) { CART.push(c); renderCart(); } };
function lines() {
  var f = formObj($('sellForm')), R = rateOf(f), SR = Number(f.silverRate) || S.prices.silver925 || 0, fee = Number(f.feePct) || 0, pr = Number(f.profitPct) || 0, fg = Number(f.feePerGram) || 0;
  var L = CART.map(function (c) { var it = S.items.find(function (r) { return r.code === c; }); var gold = it.weight750 * (isSilver(it) ? SR : R), st = Number(it.stoneCost) || 0; return { it: it, gold: gold, stone: st, price: f.feeMode === 'gram' ? (gold + fg * Number(it.weight) + st) * (1 + pr / 100) : (gold * (1 + fee / 100) + st) * (1 + pr / 100) }; });
  if (f.priceMode === 'fixed') { var tot = Number(f.amount) || 0, g = sum(L, 'gold') || 1; L.forEach(function (l) { l.price = tot * l.gold / g; }); }
  var disc = Number(f.discount) || 0, sp = sum(L, 'price') || 1; if (disc) L.forEach(function (l) { l.price -= disc * l.price / sp; });
  L.forEach(function (l) { l.vat = f.vatOn ? Math.max(0, l.price - l.gold) * S.settings.vatPct / 100 : 0; l.real = l.price - (l.it.buyCost || 0); l.hold = l.gold - l.it.weight750 * (l.it.buyRate18 || 0); l.op = l.price - l.gold - (Number(l.it.makingCost) || 0) - l.stone; });
  return { L: L, f: f, R: R };
}
function renderCart() {
  if (!S) return; CART = CART.filter(function (c) { return stock().some(function (r) { return r.code === c; }); }); fillItemPick();
  var x = lines();
  $('cart').innerHTML = table([['کالا', function (l) { return esc(l.it.title) + ' <span class="muted">' + esc(l.it.code) + '</span>'; }], ['وزن', function (l) { return fa(l.it.weight, 3); }], ['عیار', function (l) { return faStr(l.it.karat); }], ['ارزش طلا', function (l) { return fa(l.gold); }], ['مبلغ فروش', function (l) { return fa(l.price); }], ['سود واقعی', function (l) { return ROLE === 'seller' ? '—' : '<span class="' + cls(l.real) + '">' + fa(l.real) + '</span>'; }], ['', function (l) { return '<button type="button" class="btn sm red" data-rm="' + CART.indexOf(l.it.code) + '">حذف</button>'; }]], x.L);
  sellPreview();
}
function sellPreview() {
  if (!S) return; var x = lines(), L = x.L, f = x.f;
  if (!L.length) { $('sellPreview').textContent = 'کالا را به فاکتور اضافه کنید.'; return; }
  var sp = sum(L, 'price'), vat = sum(L, 'vat'), total = sp + vat, tw = Number(f.tradeWeight) || 0, tk = Number(f.tradeKarat) || 750, td = Number(f.tradeDeduction) || 0;
  var trade = tw ? tw * tk / 750 * x.R * (1 - td / 100) : 0, payable = total - trade, paid = f.paid === '' ? Math.max(0, payable) : Number(f.paid) || 0, due = payable - paid;
  $('sellPreview').innerHTML = 'جمع کالاها: <b>' + fa(sp) + '</b>' + (vat ? ' · مالیات: ' + fa(vat) : '') + ' · <b>مبلغ فاکتور: ' + fa(total) + ' تومان</b>' + (trade ? '<br>♻️ کسر طلای تعویضی: ' + fa(trade) : '') + '<br>قابل پرداخت: <b>' + fa(payable) + '</b> · پرداختی: ' + fa(paid) + (due > 0 ? ' · <b class="neg">نسیه: ' + fa(due) + '</b>' + (Number(f.instCount) ? ' در ' + fa(f.instCount) + ' قسط ≈ ' + fa(due / Number(f.instCount)) : '') : '') +
    (ROLE === 'seller' ? '' : '<br>سود فروش: <span class="' + cls(sum(L, 'op')) + '">' + fa(sum(L, 'op')) + '</span> · نوسان: <span class="' + cls(sum(L, 'hold')) + '">' + fa(sum(L, 'hold')) + '</span> · <b>سود واقعی: <span class="' + cls(sum(L, 'real')) + '">' + fa(sum(L, 'real')) + '</span></b>' + (x.R ? ' (≈ ' + fa(sum(L, 'real') / x.R, 3) + ' گرم طلا)' : ''));
}
$('sellForm').oninput = sellPreview; $('sellForm').onchange = function () { var g = this.feeMode.value === 'gram', ch = this.payMethod.value === 'چک'; document.querySelectorAll('#sellForm .chq-f').forEach(function (x) { x.style.display = ch ? '' : 'none'; }); document.querySelectorAll('#sellForm .fee-pct').forEach(function (x) { x.style.display = g ? 'none' : ''; }); document.querySelectorAll('#sellForm .fee-gram').forEach(function (x) { x.style.display = g ? '' : 'none'; }); renderCart(); };
$('sellForm').onsubmit = function (e) {
  e.preventDefault(); if (!CART.length) { toast('حداقل یک کالا به فاکتور اضافه کنید.', false); return; }
  var d = Object.assign(formObj(this), pickerData('sellParty'), { itemCodes: CART.slice() });
  load('sell', d, this, function (r) { CART = []; renderCart(); if (r.invoiceHtml) showModal(r.invoiceHtml); });
};

// ---------- buy
function buyKind() { return document.querySelector('input[name=buyKind]:checked').value; }
document.querySelectorAll('input[name=buyKind]').forEach(function (r) { r.onchange = function () { var old = buyKind() === 'old'; document.querySelectorAll('#buyForm .sup').forEach(function (x) { x.style.display = old ? 'none' : ''; }); document.querySelectorAll('#buyForm .old').forEach(function (x) { x.style.display = old ? '' : 'none'; }); partyPicker('buyParty', old ? 'customer' : 'supplier', true); fillPicker('buyParty'); buyPreview(); }; });
function buyPreview() {
  if (!S) return; var o = formObj($('buyForm')), sil = buyKind() !== 'old' && o.metal === 'silver', w = Number(o.weight) || 0, k = Number(o.karat) || (sil ? 925 : 750), q = buyKind() === 'old' ? 1 : Math.max(1, Number(o.qty) || 1), R = sil ? (o.rateMode === 'manual' ? Number(o.buyRate18) || 0 : S.prices.silver925) : rateOf(o, 'buyRate18'), w750 = sil ? w * k / 925 : w * k / 750;
  if (!w) { $('buyPreview').textContent = 'وزن را وارد کنید.'; return; }
  if (buyKind() === 'old') { var ded = Number(o.deductionPct) || 0; $('buyPreview').innerHTML = 'معادل ۱۸ عیار: ' + fa(w750, 3) + ' گرم · کسر افت ' + fa(ded, 1) + '٪ · <b>مبلغ خرید: ' + fa(w750 * R * (1 - ded / 100)) + ' تومان</b>'; return; }
  var c = w750 * R + (Number(o.makingCost) || 0) + (Number(o.stoneCost) || 0);
  $('buyPreview').innerHTML = (sil ? 'نقره · معادل ۹۲۵ هر قلم: <b>' : 'معادل ۱۸ عیار هر قلم: <b>') + fa(w750, 3) + ' گرم</b> · نرخ ' + fa(R) + ' · بهای تمام‌شده‌ی هر قلم: <b>' + fa(c) + '</b>' + (q > 1 ? ' · جمع ' + fa(q) + ' قلم: <b>' + fa(c * q) + ' تومان</b>' : '') + (o.settle === 'gold' ? '<br>بدهی طلایی به همکار: <b>' + fa(w750 * q, 3) + ' گرم</b> + اجرت ' + fa((Number(o.makingCost) || 0) * q) + ' تومان' : '') + (o.settle === 'consign' ? '<br>📦 امانی: بدهی به بنکدار فقط هنگام فروش ثبت می‌شود (طلایی، به گرم).' : '');
}
$('buyForm').oninput = buyPreview; $('buyForm').onchange = buyPreview;
$('buyForm').onsubmit = function (e) { e.preventDefault(); var d = Object.assign(formObj(this), pickerData('buyParty')); if (buyKind() === 'old') { d.rate18 = d.buyRate18; load('buyback', d, this); } else { if (d.settle === 'cash') d.paid = ''; load('addItem', d, this); } };

// ---------- accounts
function renderAcc() {
  var f = $('accFilter').value, q = $('accSearch').value.trim();
  var list = S.parties.filter(function (p) { var k = p.kind || 'customer'; return (f === 'all' || f === k || (f === 'debt' && (p.balance.money || p.balance.grams))) && (!q || (p.name + p.phone + p.code).indexOf(q) >= 0); });
  var T0 = liveTx();
  $('accKpis').innerHTML = kpi('مشتریان', fa(S.parties.filter(function (p) { return (p.kind || 'customer') === 'customer'; }).length), '') + kpi('همکاران / سازندگان', fa(S.parties.filter(function (p) { return p.kind === 'supplier'; }).length) + ' / ' + fa(S.parties.filter(function (p) { return p.kind === 'maker'; }).length), '') + kpi('جمع طلب از دیگران', money(sum(S.parties, function (p) { return Math.max(0, p.balance.money); })), '', 'pos') + kpi('جمع بدهی ما', money(sum(S.parties, function (p) { return Math.max(0, -p.balance.money); })), 'طلایی: ' + fa(sum(S.parties, function (p) { return Math.max(0, -p.balance.grams); }), 3) + ' گرم', 'neg');
  $('accTable').innerHTML = table([['نام', function (p) { return '<b>' + esc(p.name) + '</b>'; }], ['نوع', function (p) { return KIND_FA[p.kind || 'customer']; }], ['تلفن', function (p) { return esc(p.phone); }], ['مانده حساب', function (p) { return bal(p.balance) + (Number(p.savings) ? '<br><span class="muted">پس‌انداز طلایی: ' + fa(p.savings, 3) + ' گرم</span>' : ''); }],
    ['جمع خرید از ما', function (p) { return fa(sum(T0.filter(function (t) { return t.type === 'sell' && t.customerCode === p.code; }), 'amount')); }], ['آخرین معامله', function (p) { var t = T0.find(function (x) { return x.customerCode === p.code; }); return t ? faStr(t.dateFa) : '—'; }],
    ['تولد', function (p) { return mdFa(p.birthday) || '—'; }], ['', function (p) { return '<button class="btn sm ghost" data-edit="' + esc(p.code) + '">ویرایش</button> <button class="btn sm ghost" data-paywith="' + esc(p.code) + '">تسویه</button>' + (p.portal ? ' <button class="btn sm ghost" data-portal="' + esc(p.code) + '">🔗 پرتال</button>' : ''); }]], list);
}
['accFilter'].forEach(function (id) { $(id).onchange = renderAcc; }); $('accSearch').oninput = renderAcc;
function editParty(code) {
  var p = S.parties.find(function (x) { return x.code === code; }), f = $('partyForm'); if (!p) return;
  f.code.value = p.code; f.kind.value = p.kind || 'customer'; f.name.value = p.name; f.phone.value = p.phone || ''; f.email.value = p.email || ''; f.telegramChatId.value = p.telegramChatId || ''; f.notes.value = p.notes || ''; ['nationalId', 'economicCode', 'postalCode', 'address'].forEach(function (k) { if (f[k]) f[k].value = p[k] || ''; });
  var b = String(p.birthday || '').split('-'), a = String(p.anniversary || '').split('-'); f.bMonth.value = b[0] ? Number(b[0]) : ''; f.bDay.value = b[1] ? Number(b[1]) : ''; f.aMonth.value = a[0] ? Number(a[0]) : ''; f.aDay.value = a[1] ? Number(a[1]) : '';
  $('partyFormTitle').textContent = '✏️ ویرایش ' + p.name; f.scrollIntoView({ behavior: 'smooth' });
}
$('partyReset').onclick = function () { $('partyForm').reset(); $('partyForm').code.value = ''; $('partyFormTitle').textContent = '➕ مشتری / همکار جدید'; };
$('partyForm').onsubmit = function (e) { e.preventDefault(); load('party', formObj(this), this, function () { $('partyReset').onclick(); }); };
function payInfo() { var p = S.parties.find(function (x) { return x.code === $('payParty').value; }); $('payInfo').innerHTML = p ? 'مانده‌ی فعلی ' + esc(p.name) + ': ' + bal(p.balance) : 'طرف حساب را انتخاب کنید.'; }
$('payParty').onchange = payInfo;
$('payForm').onsubmit = function (e) { e.preventDefault(); load('payment', formObj(this), this); };

// ---------- orders
var OSTAT = ['ثبت شد', 'در حال ساخت', 'آماده تحویل', 'تحویل شد', 'لغو شد'];
function renderOrders() {
  $('orderTable').innerHTML = table([['کد', function (o) { return esc(o.code); }], ['تاریخ', function (o) { return faStr(o.dateFa); }], ['مشتری', function (o) { return esc(o.customerName) + (o.phone ? ' <span class="muted">' + esc(o.phone) + '</span>' : ''); }], ['نوع', function (o) { return esc(o.kind); }], ['شرح', function (o) { return esc(o.description); }], ['وزن', function (o) { return fa(o.weight, 2); }], ['برآورد', function (o) { return fa(o.estimate); }], ['بیعانه', function (o) { return fa(o.deposit); }], ['تحویل', function (o) { return faStr(o.dueDate); }],
    ['وضعیت', function (o) { return '<select data-ostat="' + esc(o.code) + '" style="width:auto">' + OSTAT.map(function (s) { return '<option' + (s === o.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select>'; }]], S.orders);
  document.querySelectorAll('[data-ostat]').forEach(function (s) { s.onchange = function () { load('orderStatus', { code: s.dataset.ostat, status: s.value }); }; });
}
$('orderForm').onsubmit = function (e) { e.preventDefault(); load('order', Object.assign(formObj(this), pickerData('orderParty')), this); };

// ---------- cash & expenses
function renderCash() {
  var per = $('cashPeriod').value, T0 = liveTx().filter(function (t) { return inPeriod(t.dateFa, per); }), m = {};
  T0.forEach(function (t) { var e = cashEffect(t); if (!e) return; var k = t.payMethod || 'نقد'; m[k] = m[k] || { method: k, inn: 0, out: 0, exp: 0 }; if (t.type === 'expense') m[k].exp += Number(t.amount); else if (e > 0) m[k].inn += e; else m[k].out -= e; });
  var L = Object.keys(m).map(function (k) { return m[k]; }); if (L.length) L.push({ method: 'جمع', inn: sum(L, 'inn'), out: sum(L, 'out'), exp: sum(L, 'exp') });
  $('cashTable').innerHTML = table([['روش', function (r) { return '<b>' + esc(r.method) + '</b>'; }], ['دریافتی‌ها', function (r) { return '<span class="pos">' + fa(r.inn) + '</span>'; }], ['پرداختی‌ها', function (r) { return '<span class="neg">' + fa(r.out) + '</span>'; }], ['هزینه‌ها', function (r) { return '<span class="neg">' + fa(r.exp) + '</span>'; }], ['خالص', function (r) { var v = r.inn - r.out - r.exp; return '<b class="' + cls(v) + '">' + fa(v) + '</b>'; }]], L);
  $('expTable').innerHTML = txTable(liveTx().filter(function (t) { return t.type === 'expense'; }).concat(S.txs.filter(function (t) { return t.voided && t.type === 'expense'; })), true);
}
$('cashPeriod').onchange = renderCash;
$('expForm').onsubmit = function (e) { e.preventDefault(); load('expense', formObj(this), this); };

// ---------- reports
function report(per) {
  var L = liveTx().filter(function (t) { return inPeriod(t.dateFa, per); }), sells = L.filter(function (t) { return t.type === 'sell'; }), rets = L.filter(function (t) { return t.type === 'return'; }), SR = sells.concat(rets);
  var rev = sum(sells, 'amount') - sum(rets, 'amount'), vat = sum(sells, 'vat') - sum(rets, 'vat'), real = sum(SR, 'realProfit'), exp = sum(L.filter(function (t) { return t.type === 'expense'; }), 'amount');
  return { L: L, sells: sells, SR: SR, rev: rev, vat: vat, cost: sum(SR, 'costBasis'), op: sum(SR, 'operatingProfit'), hold: sum(SR, 'holdingGain'), real: real, exp: exp, net: real - exp, buys: sum(L.filter(function (t) { return t.type === 'buy'; }), 'amount'), bb: sum(L.filter(function (t) { return t.type === 'buyback'; }), 'amount'), ret: sum(rets, 'amount') };
}
function renderReport() {
  var per = $('period').value, r = report(per), R = rate();
  $('repKpis').innerHTML = kpi('درآمد فروش (خالص برگشتی)', money(r.rev), fa(r.sells.length) + ' قلم فروش') + kpi('مالیات ارزش افزوده دریافتی', money(r.vat), 'جزو سود نیست') + kpi('بهای تمام‌شده', money(r.cost), '') + kpi('سود فروش (اجرت و سود)', money(r.op), '', cls(r.op)) + kpi('سود/زیان نوسان قیمت', money(r.hold), '', cls(r.hold)) + kpi('سود واقعی', money(r.real), R ? '≈ ' + fa(r.real / R, 2) + ' گرم طلا' : '', cls(r.real)) +
    kpi('هزینه‌ها', money(r.exp), '', r.exp ? 'neg' : '') + kpi('سود خالص', money(r.net), 'سود واقعی − هزینه‌ها', cls(r.net)) + kpi('حاشیه‌ی سود واقعی', fa(r.rev ? r.real / r.rev * 100 : 0, 1) + '٪', '') + kpi('خریدها (کالا، آبشده، سکه)', money(r.buys), '') + kpi('خرید طلای کهنه', money(r.bb), '') + kpi('برگشت از فروش', money(r.ret), '');
  var bc = {}; r.SR.forEach(function (t) { var c = t.category || 'سایر'; bc[c] = bc[c] || { c: c, n: 0, rev: 0, real: 0 }; bc[c].n += (t.type === 'sell' ? 1 : -1) * (Number(t.qty) || 1); bc[c].rev += (t.type === 'sell' ? 1 : -1) * Number(t.amount); bc[c].real += Number(t.realProfit); });
  $('byCat').innerHTML = table([['دسته', function (x) { return esc(x.c); }], ['تعداد', function (x) { return fa(x.n); }], ['فروش', function (x) { return fa(x.rev); }], ['سود واقعی', function (x) { return '<span class="' + cls(x.real) + '">' + fa(x.real) + '</span>'; }]], Object.keys(bc).map(function (k) { return bc[k]; }).sort(function (a, b) { return b.real - a.real; }));
  var tc = {}; r.sells.forEach(function (t) { if (!t.customerCode) return; tc[t.customerCode] = tc[t.customerCode] || { n: t.customerName, c: 0, s: 0 }; tc[t.customerCode].c++; tc[t.customerCode].s += Number(t.amount); });
  $('topCust').innerHTML = table([['مشتری', function (x) { return esc(x.n); }], ['تعداد قلم', function (x) { return fa(x.c); }], ['جمع خرید', function (x) { return fa(x.s); }]], Object.keys(tc).map(function (k) { return tc[k]; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 10));
  var tt = $('txType'), tv = tt.value; tt.innerHTML = '<option value="">همه‌ی انواع</option>' + Object.keys(TYPE_FA).map(function (k) { return '<option value="' + k + '">' + TYPE_FA[k] + '</option>'; }).join(''); tt.value = tv;
  var q = $('txSearch').value.trim();
  $('txTable').innerHTML = txTable(S.txs.filter(function (t) { return inPeriod(t.dateFa, per) && (!tt.value || t.type === tt.value) && (!q || (t.title + t.customerName + t.invoice + t.itemCode).indexOf(q) >= 0); }), true);
}
$('period').onchange = renderReport; $('txType').onchange = renderReport; $('txSearch').oninput = renderReport;

// ---------- price board
function renderBoard() {
  var P = S.prices, B = P.bubbles || {}, c = P.coins || {};
  var cell = function (l, v, sub) { return '<div class="pb"><div class="l">' + l + '</div><div class="v">' + (v ? fa(v) : '—') + '</div>' + (sub ? '<div class="s">' + sub + '</div>' : '') + '</div>'; };
  $('pboard').innerHTML = cell('🟡 طلای ۱۸ عیار (گرم)', P.rate18) + cell('🟡 ۱۸ عیار ۷۴۰ (گرم)', P.rate740) + cell('🟡 طلای ۲۴ عیار (گرم)', P.rate24) + cell('♻️ طلای دست‌دوم (گرم)', P.used) +
    cell('🧈 مظنه (مثقال)', P.mazaneh) + cell('🧈 آبشده نقدی', P.abCash) + cell('🧈 آبشده بنکداری', P.abWholesale) +
    S.coinTypes.map(function (t) { return cell('🪙 ' + t[1], c[t[0]], B[t[0]] ? 'حباب: ' + fa(B[t[0]]) : ''); }).join('') +
    cell('⚪ نقره ۹۲۵ (گرم)', P.silver925) + cell('🌍 انس جهانی (دلار)', P.ounce) + cell('💵 دلار', P.usd) + cell('💶 یورو', P.eur);
  $('pbTime').textContent = P.updated || '';
}
// ---------- coins
function coinList() { return S.coinTypes.map(function (t) { return S.coins[t[0]]; }); }
function coinCount() { return sum(coinList(), 'qty'); }
function isCoinTx(t) { return Number(t.qty) > 0 && (t.type === 'buy' || t.type === 'sell') && S.coinTypes.some(function (c) { return c[1] === t.category; }); }
function coinUnit(f) { return f.rateMode === 'manual' ? Number(f.unitPrice) || 0 : (S.prices.coins[f.coin] || 0); }
function renderCoin() {
  var L = coinList();
  document.querySelectorAll('.coinSel').forEach(function (s) { var v = s.value; s.innerHTML = S.coinTypes.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + '</option>'; }).join(''); if (v) s.value = v; });
  $('coinKpis').innerHTML = kpi('تعداد کل سکه', fa(coinCount()) + ' عدد', '') + kpi('بهای خرید', money(sum(L, 'cost')), '') + kpi('ارزش روز', money(sum(L, 'value')), '') + kpi('سود/زیان تحقق‌نیافته', money(sum(L, 'value') - sum(L, 'cost')), '', cls(sum(L, 'value') - sum(L, 'cost')));
  $('coinTable').innerHTML = table([['سکه', function (c) { return '<b>' + c.label + '</b>'; }], ['تعداد', function (c) { return fa(c.qty); }], ['میانگین خرید', function (c) { return fa(c.avg); }], ['قیمت روز', function (c) { return fa(c.market); }], ['حباب', function (c) { return fa(c.bubble); }], ['ارزش روز', function (c) { return fa(c.value); }], ['سود/زیان', function (c) { var v = c.value - c.cost; return '<span class="' + cls(v) + '">' + fa(v) + '</span>'; }]], L);
  $('coinTx').innerHTML = txTable(S.txs.filter(isCoinTx), true);
  coinPreview();
}
function coinPreview() {
  var b = formObj($('coinBuyForm')), u = coinUnit(b), q = Number(b.qty) || 0;
  $('coinBuyPreview').innerHTML = q ? 'قیمت هر عدد: ' + fa(u) + ' · <b>جمع: ' + fa(u * q) + ' تومان</b>' : 'تعداد را وارد کنید.';
  var s = formObj($('coinSellForm')), us = coinUnit(s), qs = Number(s.qty) || 0, c = S.coins[s.coin] || { qty: 0, avg: 0 };
  if (!qs) { $('coinSellPreview').textContent = 'موجودی: ' + fa(c.qty) + ' عدد · میانگین خرید: ' + fa(c.avg); return; }
  var amt = us * qs - (Number(s.discount) || 0), cost = c.avg * qs, paid = s.paid === '' ? amt : Number(s.paid) || 0;
  $('coinSellPreview').innerHTML = (qs > c.qty ? '<b class="neg">موجودی کافی نیست (' + fa(c.qty) + ' عدد)</b><br>' : '') + 'مبلغ: <b>' + fa(amt) + ' تومان</b> · بهای خرید: ' + fa(cost) + ' · <b>سود واقعی: <span class="' + cls(amt - cost) + '">' + fa(amt - cost) + '</span></b>' + (amt - paid > 0 ? ' · <b class="neg">نسیه: ' + fa(amt - paid) + '</b>' : '');
}
['coinBuyForm', 'coinSellForm'].forEach(function (id) { $(id).oninput = coinPreview; $(id).onchange = coinPreview; });
$('coinBuyForm').onsubmit = function (e) { e.preventDefault(); var d = Object.assign(formObj(this), pickerData('coinBuyParty')); if (d.settle === 'cash') d.paid = ''; load('coinBuy', d, this); };
$('coinSellForm').onsubmit = function (e) { e.preventDefault(); load('coinSell', Object.assign(formObj(this), pickerData('coinSellParty')), this, function (r) { if (r.invoiceHtml) showModal(r.invoiceHtml); }); };
// ---------- melted gold (آبشده)
function mesghal(w750) { return w750 * 750 / 705 / 4.608; }
function mazOf(f) { return f.rateMode === 'manual' ? Number(f.mazaneh) || 0 : (S.prices.mazaneh || 0); }
function abStock() { return stock().filter(function (r) { return r.category === 'آبشده'; }); }
function checks(id) { return Array.prototype.map.call(document.querySelectorAll('#' + id + ' input:checked'), function (c) { return c.value; }); }
function pickList(id, list) { var cur = checks(id); $(id).innerHTML = list.length ? list.map(function (r) { return '<label><input type="checkbox" value="' + esc(r.code) + '"' + (cur.indexOf(r.code) >= 0 ? ' checked' : '') + '> ' + esc(r.title) + ' · ' + fa(r.weight, 3) + 'گ · ' + faStr(r.karat) + ' <span class="muted">' + esc(r.code) + '</span></label>'; }).join('') : '<div class="muted">موردی نیست.</div>'; }
function renderAb() {
  var A = abStock(), m = S.prices.mazaneh, R = rate();
  var w = sum(A, 'weight750'), mq = mesghal(w);
  $('abKpis').innerHTML = kpi('مظنه‌ی روز', money(m), 'آبشده نقدی: ' + fa(S.prices.abCash)) + kpi('موجودی آبشده', fa(sum(A, 'weight'), 3) + ' گرم', fa(mq, 3) + ' مثقال · ' + fa(A.length) + ' قطعه') + kpi('ارزش روز', money(mq * m), 'بهای خرید ' + fa(sum(A, 'buyCost'))) + kpi('سود/زیان تحقق‌نیافته', money(mq * m - sum(A, 'buyCost')), '', cls(mq * m - sum(A, 'buyCost')));
  $('abTable').innerHTML = table([['کد', function (r) { return esc(r.code); }], ['عنوان', function (r) { return esc(r.title); }], ['وزن', function (r) { return fa(r.weight, 3); }], ['عیار', function (r) { return faStr(r.karat); }], ['مثقال', function (r) { return fa(mesghal(r.weight750), 3); }], ['آزمایشگاه / ری‌گیری', function (r) { return esc(r.cert || ''); }], ['بهای خرید', function (r) { return fa(r.buyCost); }], ['ارزش به مظنه', function (r) { return fa(mesghal(r.weight750) * m); }], ['', function (r) { return '<button class="btn sm ghost" data-label="' + esc(r.code) + '">🏷️</button>'; }]], A);
  pickList('abSellList', A);
  pickList('meltList', stock().filter(function (r) { return r.category !== 'آبشده'; }).sort(function (a, b) { return (b.category === 'طلای دست‌دوم') - (a.category === 'طلای دست‌دوم'); }));
  abPreview();
}
function abPreview() {
  var b = formObj($('abBuyForm')), w = Number(b.weight) || 0, k = Number(b.karat) || 0, mz = mazOf(b), cm = Number(b.commission) || 0;
  if (w && k) { var mq = mesghal(w * k / 750); $('abBuyPreview').innerHTML = fa(mq, 3) + ' مثقال × (مظنه ' + fa(mz) + (cm ? ' − کارمزد ' + fa(cm) : '') + ') = <b>' + fa(mq * (mz - cm)) + ' تومان</b> · معادل ۱۸ عیار: ' + fa(w * k / 750, 3) + ' گرم'; } else $('abBuyPreview').textContent = 'وزن و عیار را وارد کنید.';
  var s = formObj($('abSellForm')), sel = checks('abSellList').map(function (c) { return S.items.find(function (r) { return r.code === c; }); }), ms = mazOf(s), cs = Number(s.commission) || 0;
  if (sel.length) { var q = sum(sel, function (r) { return mesghal(r.weight750); }), price = q * (ms + cs), cost = sum(sel, 'buyCost'), paid = s.paid === '' ? price : Number(s.paid) || 0; $('abSellPreview').innerHTML = fa(sel.length) + ' قطعه · ' + fa(q, 3) + ' مثقال × (مظنه ' + fa(ms) + (cs ? ' + کارمزد ' + fa(cs) : '') + ') = <b>' + fa(price) + ' تومان</b><br>بهای خرید: ' + fa(cost) + ' · <b>سود واقعی: <span class="' + cls(price - cost) + '">' + fa(price - cost) + '</span></b>' + (price - paid > 0 ? ' · <b class="neg">نسیه: ' + fa(price - paid) + '</b>' : ''); } else $('abSellPreview').textContent = 'آبشده را انتخاب کنید.';
  var mf = formObj($('meltForm')), ms2 = checks('meltList').map(function (c) { return S.items.find(function (r) { return r.code === c; }); }), inW = sum(ms2, 'weight750'), outW = (Number(mf.weight) || 0) * (Number(mf.karat) || 0) / 750;
  $('meltPreview').innerHTML = ms2.length ? fa(ms2.length) + ' قلم · ورودی: ' + fa(inW, 3) + ' گرم (معادل ۱۸) · بهای تمام‌شده: ' + fa(sum(ms2, 'buyCost') + (Number(mf.meltFee) || 0)) + (outW ? '<br>خروجی: ' + fa(outW, 3) + ' گرم (معادل ۱۸) · <b>افت: <span class="' + cls(outW - inW) + '">' + fa(inW - outW, 3) + ' گرم</span></b>' : '') : 'اقلام را انتخاب کنید.';
}
['abBuyForm', 'abSellForm', 'meltForm'].forEach(function (id) { $(id).oninput = abPreview; $(id).onchange = abPreview; });
$('abBuyForm').onsubmit = function (e) { e.preventDefault(); var d = Object.assign(formObj(this), pickerData('abBuyParty')); if (d.settle === 'cash') d.paid = ''; load('abBuy', d, this); };
$('abSellForm').onsubmit = function (e) { e.preventDefault(); var c = checks('abSellList'); if (!c.length) { toast('آبشده را انتخاب کنید.', false); return; } load('sell', Object.assign(formObj(this), pickerData('abSellParty'), { itemCodes: c, priceMode: 'mazaneh' }), this, function (r) { if (r.invoiceHtml) showModal(r.invoiceHtml); }); };
$('meltForm').onsubmit = function (e) { e.preventDefault(); var c = checks('meltList'); if (!c.length) { toast('اقلام ذوب را انتخاب کنید.', false); return; } if (!confirm(fa(c.length) + ' قلم ذوب و به آبشده تبدیل شود؟')) return; load('melt', Object.assign(formObj(this), { itemCodes: c }), this); };
// ---------- installments
function openInst() { return S.installments.filter(function (q) { return q.status === 'open' || q.status === 'partial'; }); }
function jnum(d) { return Number(String(d || '').replace(/\D/g, '')); }
function instDue(days) { var t = S.today.jalali, lim = t; for (var i = 0; i < days; i++) lim = jAdd(lim); return openInst().filter(function (q) { return jnum(q.dueDate) <= jnum(lim); }); }
function jAdd(d) { var p = d.split('/').map(Number), dim = p[1] <= 6 ? 31 : (p[1] <= 11 ? 30 : 29); p[2]++; if (p[2] > dim) { p[2] = 1; p[1]++; if (p[1] > 12) { p[1] = 1; p[0]++; } } return p[0] + '/' + String(p[1]).padStart(2, '0') + '/' + String(p[2]).padStart(2, '0'); }
function instTable(list, all) {
  var t = jnum(S.today.jalali);
  return table([['مشتری', function (q) { return '<b>' + esc(q.customerName) + '</b>' + (q.phone ? ' <span class="muted">' + esc(q.phone) + '</span>' : ''); }], ['فاکتور', function (q) { return esc(q.invoice); }], ['قسط', function (q) { return fa(q.n) + ' از ' + fa(q.count); }], ['سررسید', function (q) { var late = (q.status === 'open' || q.status === 'partial') && jnum(q.dueDate) < t; return '<span class="' + (late ? 'neg' : '') + '">' + faStr(q.dueDate) + (late ? ' (معوق)' : '') + '</span>'; }], ['مبلغ', function (q) { return fa(q.amount); }], ['پرداخت‌شده', function (q) { return fa(q.paid); }], ['وضعیت', function (q) { return INST_FA[q.status] || q.status; }], ['', function (q) { return q.status === 'open' || q.status === 'partial' ? '<button class="btn sm" data-payinst="' + esc(q.code) + '">دریافت قسط</button>' : ''; }]], list);
}
function renderInst() { $('instTable').innerHTML = instTable($('instFilter').value === 'all' ? S.installments : openInst(), true); }
$('instFilter').onchange = renderInst;
// ---------- labels (اتیکت با بارکد)
function printLabels(list) {
  list = list.filter(Boolean); if (!list.length) { toast('کالایی برای اتیکت نیست.', false); return; }
  showModal('<div class="labels sz-' + String(S.settings.labelSize || '50x30') + '">' + list.map(function (r) { return '<div class="lbl"><b>' + esc(S.settings.shopName) + '</b><br>' + esc(r.title) + '<br><svg class="bc" data-code="' + esc(r.code) + '"></svg><br>' + fa(r.weight, 3) + ' گرم · ' + (isSilver(r) ? 'نقره ' : 'عیار ') + faStr(r.karat) + (Number(r.stoneCost) || r.stones ? ' · سنگ‌دار' : '') + '</div>'; }).join('') + '</div>');
  document.querySelectorAll('#printArea .labels svg.bc').forEach(function (el) { try { JsBarcode(el, el.dataset.code, { format: 'CODE128', height: 38, width: 1.4, fontSize: 11, margin: 2 }); } catch (e) { el.outerHTML = '<div style="font-family:monospace">' + esc(el.dataset.code) + '</div>'; } });
}
$('labelsBtn').onclick = function () { var f = $('invFilter').value, c = $('invCat').value, q = $('invSearch').value.trim(); printLabels(S.items.filter(function (r) { return r.status === 'in_stock' && (f === 'in_stock' || f === 'all') && (!c || r.category === c) && (!q || (r.title + r.code).indexOf(q) >= 0); })); };

// ---------- roles & branches
var ROLE = 'owner';
function applyRole() {
  ROLE = (S.me && S.me.role) || 'owner';
  document.body.classList.toggle('seller', ROLE === 'seller');
  document.querySelectorAll('[data-roles]').forEach(function (el) { el.style.display = el.dataset.roles.split(',').indexOf(ROLE) >= 0 ? '' : 'none'; });
  var cur = document.querySelector('#nav button.on'); if (cur && cur.style.display === 'none') document.querySelector('#nav button[data-t=dash]').onclick();
  $('meBox').textContent = '👤 ' + (S.me.name || S.me.code) + ' (' + S.me.roleFa + ')' + (S.me.branch ? ' · ' + S.me.branch : '');
  var brs = branches(), sel = $('brSel');
  sel.style.display = brs.length ? '' : 'none';
  if (brs.length) {
    var fixed = ROLE === 'seller' && S.me.branch;
    sel.innerHTML = (fixed ? '' : '<option value="">همه‌ی شعب</option>') + brs.map(function (b) { return '<option>' + esc(b) + '</option>'; }).join('');
    if (fixed) BR = S.me.branch; sel.value = BR; sel.disabled = !!fixed;
  } else BR = '';
  document.querySelectorAll('.brOpts').forEach(function (s) { var v = s.value; s.innerHTML = '<option value="">—</option>' + brs.map(function (b) { return '<option>' + esc(b) + '</option>'; }).join(''); s.value = v; });
  $('trBranch').innerHTML = brs.map(function (b) { return '<option>' + esc(b) + '</option>'; }).join('');
  document.querySelectorAll('.br-only').forEach(function (x) { x.style.display = brs.length && ROLE !== 'seller' ? '' : 'none'; });
  $('pwState').innerHTML = 'کاربر فعلی: <b>' + esc(S.me.name || S.me.code) + '</b> (' + S.me.code + ') — ' + S.me.roleFa;
}
function branches() { return String(S.settings.branches || '').split(/[,،]/).map(function (x) { return x.trim(); }).filter(Boolean); }
function brOk(r) { return !BR || !r.branch || r.branch === BR; }
$('brSel').onchange = function () { BR = this.value; render(); };
function rateOf(f, manualField) {
  var m = f.rateMode, P = S.prices;
  if (m === 'manual') return Number(f[manualField || 'rate18']) || 0;
  if (m === 'mazaneh') return Math.round((Number(f.mazaneh) || P.mazaneh) * 750 / 705 / 4.608);
  if (m === 'ounce') return P.fromOunce || 0;
  return rate();
}
function isSilver(r) { return r.metal === 'silver'; }
function goldStock() { return stock().filter(function (r) { return !isSilver(r); }); }
function ownGold() { return goldStock().filter(function (r) { return r.consign !== 'yes'; }); }

// ---------- dashboard extras
function chqDueList(days) { var lim = S.today.jalali; for (var i = 0; i < days; i++) lim = jAdd(lim); return S.cheques.filter(function (c) { return c.status === 'pending' && jnum(c.dueDate) <= jnum(lim) && brOk(c); }); }
function chqTable(list, actions) {
  var t = jnum(S.today.jalali), CF = { pending: 'در جریان', cashed: 'وصول شد', bounced: 'برگشتی', spent: 'واگذار شد', returned: 'ابطال/عودت' };
  return table([['نوع', function (c) { return c.dir === 'out' ? '<span class="badge b-void">پرداختی</span>' : '<span class="badge b-in">دریافتی</span>'; }], ['طرف حساب', function (c) { return esc(c.partyName); }], ['مبلغ', function (c) { return fa(c.amount); }], ['سررسید', function (c) { var late = c.status === 'pending' && jnum(c.dueDate) < t; return '<span class="' + (late ? 'neg' : '') + '">' + faStr(c.dueDate) + (late ? ' (گذشته)' : '') + '</span>'; }], ['بانک / شماره', function (c) { return esc(c.bank) + ' ' + faStr(c.number); }], ['صیاد', function (c) { return faStr(c.sayad); }], ['وضعیت', function (c) { return CF[c.status] + (c.spentTo ? ' ← ' + esc(c.spentTo) : ''); }],
    ['', function (c) { if (!actions || c.status !== 'pending' || ROLE === 'seller') return ''; return '<button class="btn sm" data-chq="' + c.code + '" data-st="cashed">وصول</button> <button class="btn sm red" data-chq="' + c.code + '" data-st="' + (c.dir === 'in' ? 'bounced' : 'returned') + '">' + (c.dir === 'in' ? 'برگشت' : 'ابطال') + '</button>' + (c.dir === 'in' ? ' <button class="btn sm ghost" data-chq="' + c.code + '" data-st="spent">واگذاری</button>' : ''); }]], list);
}
function renderChq() {
  var P = S.cheques.filter(function (c) { return c.status === 'pending' && brOk(c); }), inP = P.filter(function (c) { return c.dir === 'in'; }), outP = P.filter(function (c) { return c.dir === 'out'; });
  $('chqKpis').innerHTML = kpi('چک‌های دریافتی در جریان', money(sum(inP, 'amount')), fa(inP.length) + ' فقره', 'pos') + kpi('چک‌های پرداختی در جریان', money(sum(outP, 'amount')), fa(outP.length) + ' فقره', outP.length ? 'neg' : '') + kpi('سررسید ۷ روز آینده', fa(chqDueList(7).length) + ' فقره', '') + kpi('چک‌های برگشتی', fa(S.cheques.filter(function (c) { return c.status === 'bounced'; }).length), '', 'neg');
  var f = $('chqFilter').value, d = $('chqDir').value;
  $('chqTable').innerHTML = chqTable(S.cheques.filter(function (c) { return brOk(c) && (f === 'all' || c.status === 'pending') && (!d || c.dir === d); }), true);
  $('chqDue').innerHTML = chqTable(chqDueList(7), false);
}
['chqFilter', 'chqDir'].forEach(function (id) { $(id).onchange = renderChq; });
$('chqForm').onsubmit = function (e) { e.preventDefault(); load('cheque', Object.assign(formObj(this), pickerData('chqParty')), this); };
document.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-chq]'); if (!b) return;
  var st = b.dataset.st, d = { code: b.dataset.chq, status: st };
  if (st === 'spent') {
    var names = S.parties.map(function (p, i) { return (i + 1) + ') ' + p.name; }).join('\n'), i = prompt('چک به چه کسی واگذار شود؟ شماره را بنویسید:\n' + names, '');
    if (!i) return; var p = S.parties[Number(String(i).replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); })) - 1]; if (!p) { toast('انتخاب نامعتبر است.', false); return; } d.toPartyCode = p.code;
  } else if (!confirm('وضعیت چک تغییر کند؟')) return;
  load('chequeStatus', d);
});

// ---------- gold savings
function savers() { return S.parties.filter(function (p) { return Number(p.savings) > 0; }); }
function renderSave() {
  var L = savers(), g = sum(L, 'savings'), R = rate(), own = sum(ownGold(), 'weight750');
  $('saveKpis').innerHTML = kpi('پس‌اندازکنندگان', fa(L.length) + ' نفر', '') + kpi('تعهد طلایی پس‌انداز', fa(g, 3) + ' گرم', 'ارزش روز ' + fa(g * R) + ' ت', g ? 'neg' : '') + kpi('پوشش با طلای ملکی', g ? fa(own / g * 100, 0) + '٪' : '—', fa(own, 3) + ' گرم موجودی ملکی', g && own < g ? 'neg' : 'pos');
  $('saveTable').innerHTML = table([['مشتری', function (p) { return '<b>' + esc(p.name) + '</b> <span class="muted">' + esc(p.phone || '') + '</span>'; }], ['پس‌انداز (گرم)', function (p) { return fa(p.savings, 3); }], ['ارزش روز', function (p) { return fa(p.savings * R); }], ['آخرین واریز', function (p) { var t = S.txs.find(function (x) { return x.type === 'goldSave' && x.customerCode === p.code && !x.voided; }); return t ? faStr(t.dateFa) : '—'; }]], L);
  var rp = $('redeemParty'), v = rp.value; rp.innerHTML = '<option value="">— انتخاب کنید —</option>' + L.map(function (p) { return '<option value="' + esc(p.code) + '">' + esc(p.name) + ' · ' + fa(p.savings, 3) + ' گرم</option>'; }).join(''); rp.value = v;
  savePreview();
}
function savePreview() {
  var f = formObj($('saveForm')), R = rateOf(f), fee = f.feePct === '' ? S.settings.savingsFeePct : Number(f.feePct) || 0, a = Number(f.amount) || 0;
  $('savePreview').innerHTML = a && R ? 'نرخ ۱۸ عیار: ' + fa(R) + ' · کارمزد ' + fa(fee, 1) + '٪ · <b>' + fa(a * (1 - fee / 100) / R, 3) + ' گرم</b> به پس‌انداز اضافه می‌شود.' : 'مبلغ را وارد کنید.';
  var r = formObj($('redeemForm')), p = S.parties.find(function (x) { return x.code === r.partyCode; }), g = Number(r.grams) || (p ? p.savings : 0), R2 = rateOf(r);
  $('redeemPreview').innerHTML = p ? 'مانده: ' + fa(p.savings, 3) + ' گرم · برداشت ' + fa(g, 3) + ' گرم × ' + fa(R2) + ' = <b>' + fa(g * R2) + ' تومان</b> ' + (r.mode === 'credit' ? '(اعتبار خرید)' : '(پرداخت نقدی)') : 'مشتری را انتخاب کنید.';
}
['saveForm', 'redeemForm'].forEach(function (id) { $(id).oninput = savePreview; $(id).onchange = savePreview; });
$('saveForm').onsubmit = function (e) { e.preventDefault(); load('goldSave', Object.assign(formObj(this), pickerData('saveParty')), this); };
$('redeemForm').onsubmit = function (e) { e.preventDefault(); if (!confirm('برداشت از پس‌انداز ثبت شود؟')) return; load('goldRedeem', formObj(this), this); };

// ---------- consignment & workshop
function renderWs() {
  var C = stock().filter(function (r) { return r.consign === 'yes'; }), makers = S.parties.filter(function (p) { return p.kind === 'maker'; });
  var W = S.items.filter(function (r) { return r.status === 'workshop' && brOk(r); });
  $('wsKpis').innerHTML = kpi('جنس امانی نزد ما', fa(sum(C, 'weight750'), 3) + ' گرم', fa(C.length) + ' قلم · ارزش ' + fa(sum(C, 'buyCost'))) + kpi('طلای نزد کارگاه‌ها', fa(sum(makers, function (p) { return p.maker ? p.maker.grams : 0; }), 3) + ' گرم', fa(makers.length) + ' سازنده') + kpi('بدهی اجرت ساخت', money(sum(makers, function (p) { return Math.max(0, -p.balance.money); })), '', 'neg');
  var bySup = {}; C.forEach(function (r) { var k = r.supplier || '—'; bySup[k] = (bySup[k] || 0) + Number(r.weight750); });
  $('consTable').innerHTML = table([['', function (r) { return '<input type="checkbox" class="consChk" value="' + esc(r.code) + '">'; }], ['کد', function (r) { return esc(r.code); }], ['عنوان', function (r) { return esc(r.title); }], ['وزن', function (r) { return fa(r.weight, 3); }], ['عیار', function (r) { return faStr(r.karat); }], ['بنکدار', function (r) { return esc(r.supplier); }], ['بها (امانی)', function (r) { return fa(r.buyCost); }], ['تاریخ ورود', function (r) { return faStr(r.buyDay); }]], C) + (Object.keys(bySup).length ? '<div class="muted" style="margin-top:6px">' + Object.keys(bySup).map(function (k) { return esc(k) + ': ' + fa(bySup[k], 3) + ' گرم'; }).join(' · ') + '</div>' : '');
  $('makerTable').innerHTML = table([['سازنده', function (p) { return '<b>' + esc(p.name) + '</b>'; }], ['طلای نزد او (گرم ۱۸)', function (p) { return fa(p.maker.grams, 3); }], ['بهای طلای نزد او', function (p) { return fa(p.maker.cost); }], ['مانده‌ی حساب', function (p) { return bal(p.balance); }]], makers);
  document.querySelectorAll('.makerSel').forEach(function (s) { var v = s.value; s.innerHTML = '<option value="">— سازنده —</option>' + makers.map(function (p) { return '<option value="' + esc(p.code) + '">' + esc(p.name) + '</option>'; }).join(''); s.value = v; });
  pickList('wsIssueList', ownGold().sort(function (a, b) { return (b.category === 'آبشده') - (a.category === 'آبشده'); }));
  $('wsItems').innerHTML = table([['کد', function (r) { return esc(r.code); }], ['عنوان', function (r) { return esc(r.title); }], ['وزن', function (r) { return fa(r.weight, 3); }], ['معادل ۱۸', function (r) { return fa(r.weight750, 3); }], ['نزد', function (r) { var p = S.parties.find(function (x) { return x.code === r.soldTx; }); return p ? esc(p.name) : '—'; }]], W);
  wsPreview();
}
function wsPreview() { var sel = checks('wsIssueList').map(function (c) { return S.items.find(function (r) { return r.code === c; }); }); $('wsIssuePreview').innerHTML = sel.length ? fa(sel.length) + ' قلم · ' + fa(sum(sel, 'weight750'), 3) + ' گرم معادل ۱۸ · بها ' + fa(sum(sel, 'buyCost')) : 'اقلام را انتخاب کنید.'; }
$('wsIssueForm').onchange = wsPreview;
$('wsIssueForm').onsubmit = function (e) { e.preventDefault(); var c = checks('wsIssueList'); if (!c.length) { toast('اقلام را انتخاب کنید.', false); return; } load('wsIssue', Object.assign(formObj(this), { itemCodes: c }), this); };
$('wsRecvForm').onsubmit = function (e) { e.preventDefault(); load('wsReceive', formObj(this), this); };
$('wsLossForm').onsubmit = function (e) { e.preventDefault(); load('wsLoss', formObj(this), this); };
$('consReturn').onclick = function () { var c = Array.prototype.map.call(document.querySelectorAll('.consChk:checked'), function (x) { return x.value; }); if (!c.length) { toast('اقلام امانی را تیک بزنید.', false); return; } if (confirm(fa(c.length) + ' قلم به بنکدار برگشت داده شود؟')) load('consignReturn', { itemCodes: c }); };
$('trBtn').onclick = function () { var c = Array.prototype.map.call(document.querySelectorAll('.invChk:checked'), function (x) { return x.value; }); if (!c.length) { toast('اقلام را در فهرست تیک بزنید.', false); return; } load('transfer', { itemCodes: c, toBranch: $('trBranch').value }); };

// ---------- calculator
function renderCalc() {
  var f = formObj($('calcForm')), R = rateOf(f), w = Number(f.weight) || 0, k = Number(f.karat) || 750, gold = w * k / 750 * R, fee = Number(f.fee) || 0, pr = Number(f.profit) || 0, st = Number(f.stone) || 0;
  var feeA = f.feeMode === 'gram' ? fee * w : gold * fee / 100, price = (gold + feeA + st) * (1 + pr / 100), vat = f.vat ? (price - gold) * S.settings.vatPct / 100 : 0;
  $('calcOut').innerHTML = 'نرخ ۱۸ عیار: ' + fa(R) + ' (بازار ' + fa(rate()) + ' · انسی ' + fa(S.prices.fromOunce) + ' · حباب ' + fa(rate() - S.prices.fromOunce) + ')<br>ارزش طلا: <b>' + fa(gold) + '</b> · اجرت: ' + fa(feeA) + ' · سنگ: ' + fa(st) + ' · سود: ' + fa(price - gold - feeA - st) + '<br>مالیات: ' + fa(vat) + ' · <b>قیمت نهایی: ' + fa(price + vat) + ' تومان</b> · هر گرم: ' + fa(w ? (price + vat) / w : 0);
  var rv = formObj($('revForm')), B = Number(rv.budget) || 0, k2 = Number(rv.karat) || 750, perG = k2 / 750 * R, unit = f.feeMode === 'gram' ? (perG + fee) : perG * (1 + fee / 100), unitP = unit * (1 + pr / 100), unitT = unitP + (f.vat ? (unitP - perG) * S.settings.vatPct / 100 : 0);
  $('revOut').innerHTML = B && unitT ? 'با ' + fa(B) + ' تومان حدود <b>' + fa(B / unitT, 3) + ' گرم</b> طلای عیار ' + faStr(k2) + ' (با اجرت، سود و مالیات) می‌شود.' : 'بودجه را وارد کنید؛ اجرت و سود از فرم کنار خوانده می‌شود.';
  var cv = formObj($('convForm')), cw = Number(cv.w) || 0, a1 = Number(cv.k1) || 0, a2 = Number(cv.k2) || 0, mq = Number(cv.mq) || 0;
  $('convOut').innerHTML = (cw && a1 && a2 ? fa(cw, 3) + ' گرم عیار ' + faStr(a1) + ' = <b>' + fa(cw * a1 / a2, 3) + ' گرم</b> عیار ' + faStr(a2) + ' · ' + fa(cw * a1 / 705 / 4.608, 3) + ' مثقال (۷۰۵)' : '') + (mq ? '<br>' + fa(mq, 3) + ' مثقال = <b>' + fa(mq * 4.608, 3) + ' گرم</b>' : '');
}
['calcForm', 'revForm', 'convForm'].forEach(function (id) { $(id).oninput = renderCalc; $(id).onchange = renderCalc; });

// ---------- books: P&L, journal, tax export
function months() { var m = {}; S.txs.forEach(function (t) { if (t.dateFa) m[String(t.dateFa).slice(0, 7)] = 1; }); m[S.today.jalali.slice(0, 7)] = 1; return Object.keys(m).sort().reverse(); }
function plOf(ym) {
  var L = liveTx().filter(function (t) { return String(t.dateFa).slice(0, 7) === ym; }), S1 = L.filter(function (t) { return t.type === 'sell'; }), Rt = L.filter(function (t) { return t.type === 'return'; }), SR = S1.concat(Rt);
  var ex = {}; L.filter(function (t) { return t.type === 'expense' || t.type === 'wsLoss'; }).forEach(function (t) { var c = t.type === 'wsLoss' ? 'افت کارگاه' : (t.category || 'سایر'); ex[c] = (ex[c] || 0) + Number(t.amount); });
  var rev = sum(S1, 'amount') - sum(Rt, 'amount'), cogs = sum(SR, 'costBasis'), gross = rev - cogs, exT = Object.keys(ex).reduce(function (s, k) { return s + ex[k]; }, 0);
  return { rev: rev, vat: sum(S1, 'vat') - sum(Rt, 'vat'), cogs: cogs, gross: gross, op: sum(SR, 'operatingProfit'), hold: sum(SR, 'holdingGain'), ex: ex, exT: exT, net: gross - exT };
}
function renderBooks() {
  var ms = months(), sel = $('plMonth'), v = sel.value || ms[0]; sel.innerHTML = ms.map(function (m) { return '<option>' + m + '</option>'; }).join(''); sel.value = v;
  var p = plOf(v), row = function (k, n, b) { return '<tr' + (b ? ' style="font-weight:800"' : '') + '><td>' + k + '</td><td class="' + (b ? cls(n) : '') + '">' + fa(n) + '</td></tr>'; };
  $('plTable').innerHTML = '<table>' + row('درآمد فروش (خالص برگشتی، بدون مالیات)', p.rev) + row('بهای تمام‌شده‌ی کالای فروش‌رفته', -p.cogs) + row('سود ناخالص (سود واقعی)', p.gross, true) + row('— از محل فروش (اجرت و سود)', p.op) + row('— از محل نوسان قیمت طلا', p.hold) + Object.keys(p.ex).map(function (k) { return row('هزینه: ' + esc(k), -p.ex[k]); }).join('') + row('جمع هزینه‌ها', -p.exT) + row('سود خالص', p.net, true) + row('مالیات ارزش افزوده‌ی دریافتی (بدهی به دارایی، جزو سود نیست)', p.vat) + '</table>';
  $('jrTable').innerHTML = table([['تاریخ', function (j) { return faStr(j.d); }], ['شرح', function (j) { return esc(j.s); }], ['بدهکار', function (j) { return esc(j.dr); }], ['بستانکار', function (j) { return esc(j.cr); }], ['مبلغ', function (j) { return fa(j.a); }]], journal($('jrPeriod').value).slice(0, 400));
}
$('plMonth').onchange = renderBooks; $('jrPeriod').onchange = renderBooks;
function journal(per) {
  var J = [], add = function (t, dr, cr, a) { if (a) J.push({ d: t.dateFa, s: t.title || T(t.type), dr: dr, cr: cr, a: Math.round(a) }); };
  liveTx().filter(function (t) { return inPeriod(t.dateFa, per); }).forEach(function (t) {
    var who = t.customerName || 'مشتری گذری', box = 'صندوق/بانک (' + (t.payMethod || 'نقد') + ')', a = Number(t.amount) || 0;
    if (t.type === 'sell') { add(t, 'دریافتنی: ' + who, 'فروش کالا', a); add(t, 'دریافتنی: ' + who, 'مالیات بر ارزش افزوده پرداختنی', Number(t.vat)); add(t, 'بهای تمام‌شده‌ی فروش', 'موجودی کالا', Number(t.costBasis)); }
    else if (t.type === 'return') { add(t, 'برگشت از فروش', 'دریافتنی: ' + who, a); add(t, 'مالیات بر ارزش افزوده پرداختنی', 'دریافتنی: ' + who, Number(t.vat)); add(t, 'موجودی کالا', 'بهای تمام‌شده‌ی فروش', -Number(t.costBasis)); }
    else if (t.type === 'receive' || t.type === 'deposit') add(t, String(t.payMethod).indexOf('چک') === 0 ? 'اسناد دریافتنی (چک)' : box, t.type === 'deposit' ? 'پیش‌دریافت سفارش: ' + who : 'دریافتنی: ' + who, a);
    else if (t.type === 'pay') add(t, 'پرداختنی/دریافتنی: ' + who, String(t.payMethod).indexOf('چک') === 0 ? 'اسناد پرداختنی (چک)' : box, a);
    else if (t.type === 'buy' || t.type === 'buyback') add(t, 'موجودی کالا', 'پرداختنی: ' + who, a);
    else if (t.type === 'expense') add(t, 'هزینه: ' + (t.category || 'سایر'), box, a);
    else if (t.type === 'melt') { add(t, 'موجودی آبشده', 'موجودی طلای کهنه', Number(t.costBasis) - a); add(t, 'موجودی آبشده (هزینه ذوب)', box, a); }
    else if (t.type === 'wsOut') add(t, 'طلای نزد کارگاه: ' + who, 'موجودی کالا', Number(t.costBasis));
    else if (t.type === 'wsIn') { add(t, 'موجودی کالا', 'طلای نزد کارگاه: ' + who, Number(t.costBasis)); add(t, 'موجودی کالا (اجرت ساخت)', 'پرداختنی: ' + who, a); }
    else if (t.type === 'wsLoss') add(t, 'هزینه: افت کارگاه', 'طلای نزد کارگاه: ' + who, a);
    else if (t.type === 'goldSave') add(t, box, 'تعهد پس‌انداز طلایی: ' + who, a);
    else if (t.type === 'goldRedeem') add(t, 'تعهد پس‌انداز طلایی: ' + who, t.payMethod === 'اعتبار حساب' ? 'پرداختنی: ' + who : box, a);
  });
  return J;
}
function xlsDownload(sheets, name) {
  if (!window.XLSX) { toast('کتابخانه‌ی اکسل بارگذاری نشد.', false); return; }
  var wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] };
  sheets.forEach(function (s) { var ws = XLSX.utils.json_to_sheet(s[1].length ? s[1] : [{}]); var keys = s[1].length ? Object.keys(s[1][0]) : []; ws['!cols'] = keys.map(function (k) { return { wch: Math.max(12, k.length + 4) }; }); XLSX.utils.book_append_sheet(wb, ws, s[0]); });
  XLSX.writeFile(wb, name + '.xlsx');
}
$('jrXls').onclick = function () { xlsDownload([['دفتر روزنامه', journal($('jrPeriod').value).map(function (j) { return { 'تاریخ': j.d, 'شرح': j.s, 'بدهکار': j.dr, 'بستانکار': j.cr, 'مبلغ': j.a }; })]], 'journal-' + S.today.jalali.replace(/\//g, '-')); };
$('taxXls').onclick = function () {
  var per = $('taxPeriod').value, st = S.settings;
  var rows = liveTx().filter(function (t) { return t.type === 'sell' && inPeriod(t.dateFa, per); }).map(function (t) {
    var p = S.parties.find(function (x) { return x.code === t.customerCode; }) || {}, it = S.items.find(function (x) { return x.code === t.itemCode; }) || {}, gold = Number(t.amount) - Number(t.feeAmt || 0) - Number(t.profitAmt || 0) - Number(it.stoneCost || 0);
    return { 'شماره صورتحساب': t.invoice, 'تاریخ': t.dateFa, 'الگو': 'فروش طلا، جواهر و پلاتین', 'شناسه حافظه مالیاتی': st.taxMemoryId, 'کد اقتصادی فروشنده': st.sellerEconomicCode, 'شناسه ملی فروشنده': st.sellerNationalId, 'نوع خریدار': p.economicCode ? 'حقوقی/دارای کد اقتصادی' : 'حقیقی', 'نام خریدار': t.customerName || 'مشتری گذری', 'کد ملی خریدار': p.nationalId || '', 'کد اقتصادی خریدار': p.economicCode || '', 'کد پستی خریدار': p.postalCode || '', 'شناسه کالا/خدمت': st.taxGoodsId, 'شرح کالا': t.title, 'عیار': it.karat || '', 'وزن (گرم)': it.weight || Number(t.qty) || '', 'تعداد': Number(t.qty) || 1, 'ارزش طلا/کالا': gold, 'اجرت ساخت': Number(t.feeAmt) || 0, 'سود فروشنده': Number(t.profitAmt) || 0, 'سنگ': Number(it.stoneCost) || 0, 'جمع اجرت، سود و سنگ': Number(t.amount) - gold, 'نرخ مالیات ٪': Number(t.vat) ? st.vatPct : 0, 'مبلغ مالیات': Number(t.vat) || 0, 'مبلغ کل': Number(t.amount) + (Number(t.vat) || 0), 'روش تسویه': t.payMethod };
  });
  xlsDownload([['صورتحساب‌ها', rows]], 'tax-' + S.today.jalali.replace(/\//g, '-'));
};

// ---------- cash closing
function closeExpected() {
  var T0 = liveTx().filter(function (t) { return t.dateFa === S.today.jalali; }), e = {};
  T0.forEach(function (t) { var v = cashEffect(t); if (v) { var k = t.payMethod || 'نقد'; e[k] = (e[k] || 0) + v; } });
  return e;
}
function renderClose() {
  var e = closeExpected();
  $('closeExpected').innerHTML = 'مانده‌ی سیستمی امروز' + (BR ? ' (' + esc(BR) + ')' : '') + ': ' + (Object.keys(e).length ? Object.keys(e).map(function (k) { return esc(k) + ': <b>' + fa(e[k]) + '</b>'; }).join(' · ') : 'تراکنشی نیست') + ' · طلای موجود در فروشگاه (با امانی): <b>' + fa(sum(goldStock(), 'weight750'), 3) + ' گرم</b>';
  $('closeTable').innerHTML = table([['تاریخ', function (c) { return faStr(c.dateFa) + ' ' + faStr(c.time); }], ['کاربر', function (c) { return esc(c.user); }], ['شعبه', function (c) { return esc(c.branch || '—'); }], ['سیستم', function (c) { return fa(c.expected); }], ['شمارش', function (c) { return fa(c.counted); }], ['مغایرت', function (c) { return '<b class="' + cls(c.diff) + '">' + fa(c.diff) + '</b>'; }], ['مغایرت طلا (گرم)', function (c) { return '<span class="' + cls(c.goldDiff) + '">' + fa(c.goldDiff, 3) + '</span>'; }], ['یادداشت', function (c) { return esc(c.note); }]], S.closings);
}
$('closeForm').onsubmit = function (e) { e.preventDefault(); if (!confirm('صندوق امروز بسته شود؟')) return; load('closeDay', Object.assign(formObj(this), { branch: BR }), this); };

// ---------- users, audit, backup, portal
function renderSec() {
  if (ROLE !== 'owner') return;
  $('userTable').innerHTML = table([['نام کاربری', function (u) { return '<b dir="ltr">' + esc(u.code) + '</b>'; }], ['نام', function (u) { return esc(u.name); }], ['نقش', function (u) { return u.roleFa; }], ['شعبه', function (u) { return esc(u.branch || '—'); }], ['وضعیت', function (u) { return u.active ? '<span class="badge b-in">فعال</span>' : '<span class="badge b-void">غیرفعال</span>'; }], ['', function (u) { return '<button class="btn sm ghost" data-user="' + esc(u.code) + '">ویرایش</button>'; }]], S.users);
  var q = $('auditSearch').value.trim(), AF = { login: 'ورود', loginFail: '⚠️ ورود ناموفق' };
  $('auditTable').innerHTML = table([['تاریخ', function (a) { return faStr(a.dateFa) + ' ' + faStr(a.time); }], ['کاربر', function (a) { return '<span dir="ltr">' + esc(a.user) + '</span>'; }], ['کار', function (a) { return AF[a.action] || esc(a.action); }], ['شرح', function (a) { return esc(a.summary); }]], S.audit.filter(function (a) { return !q || (a.user + a.action + a.summary).indexOf(q) >= 0; }));
}
$('auditSearch').oninput = renderSec;
document.addEventListener('click', function (e) { var b = e.target.closest('button[data-user]'); if (!b) return; var u = S.users.find(function (x) { return x.code === b.dataset.user; }), f = $('userForm'); f.code.value = u.code; f.name.value = u.name; f.role.value = u.role; f.branch.value = u.branch; f.active.checked = u.active; f.password.value = ''; $('userFormTitle').textContent = '✏️ ویرایش ' + u.code + ' (رمز خالی = بدون تغییر)'; });
$('userForm').onsubmit = function (e) { e.preventDefault(); load('userSave', formObj(this), this, function () { $('userFormTitle').textContent = '➕ کاربر جدید / ویرایش'; }); };
$('bkNow').onclick = function () { api('backupNow').then(function (d) { if (!d.ok || !d.backup) { toast(d.error || 'خطا', false); return; } var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d.backup)], { type: 'application/json' })); a.download = 'gold-shop-backup-' + S.today.jalali.replace(/\//g, '-') + '.json'; document.body.appendChild(a); a.click(); a.remove(); toast('فایل پشتیبان دانلود شد.'); }); };
$('bkRestore').onclick = function () { var f = $('bkFile').files[0]; if (!f) { toast('فایل پشتیبان را انتخاب کنید.', false); return; } if (!confirm('اطلاعات این فایل بازیابی شود؟')) return; var r = new FileReader(); r.onload = function () { var j; try { j = JSON.parse(r.result); } catch (x) { toast('فایل خراب است.', false); return; } load('restore', { backup: j }); }; r.readAsText(f); };
$('portalReset').onclick = function () { if (confirm('همه‌ی لینک‌های قبلی پرتال مشتریان باطل شود؟')) load('portalReset'); };
var PORTAL = 'https://n8n.aifardainstitute.ir/webhook/gold-customer';
function portalLink(p) { return PORTAL + '?c=' + encodeURIComponent(p.code) + '&t=' + p.portal; }
document.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-portal]'); if (!b) return;
  var p = S.parties.find(function (x) { return x.code === b.dataset.portal; }), link = portalLink(p), msg = p.name + ' عزیز، از این لینک مانده‌ی حساب، اقساط و پس‌انداز طلایی خود را ببینید:\n' + link;
  showModal('<h3>🔗 لینک پرتال ' + esc(p.name) + '</h3><input value="' + esc(link) + '" dir="ltr" onclick="this.select()" style="margin:8px 0"><div class="row"><a class="btn" target="_blank" href="https://wa.me/' + String(p.phone || '').replace(/\D/g, '').replace(/^0/, '98') + '?text=' + encodeURIComponent(msg) + '">واتساپ</a><a class="btn ghost" target="_blank" href="https://t.me/share/url?url=' + encodeURIComponent(link) + '&text=' + encodeURIComponent(p.name + ' عزیز، حساب شما:') + '">تلگرام</a><a class="btn ghost" target="_blank" href="' + esc(link) + '">باز کردن</a></div>');
  try { navigator.clipboard.writeText(link); toast('لینک کپی شد.'); } catch (x) {}
});

// ---------- certificate, thermal print, scale
function printCert(r) {
  var st = S.settings;
  showModal('<div class="cert"><h3>📜 شناسنامه‌ی جواهر — ' + esc(st.shopName) + '</h3>' + (r.photoUrl ? '<img src="' + esc(r.photoUrl) + '" alt="">' : '') + '<table><tr><td>عنوان</td><td><b>' + esc(r.title) + '</b></td></tr><tr><td>کد</td><td dir="ltr">' + esc(r.code) + '</td></tr><tr><td>دسته</td><td>' + esc(r.category) + '</td></tr><tr><td>فلز / عیار</td><td>' + (isSilver(r) ? 'نقره' : 'طلا') + ' ' + faStr(r.karat) + '</td></tr><tr><td>وزن</td><td>' + fa(r.weight, 3) + ' گرم</td></tr>' + (r.stones ? '<tr><td>سنگ‌ها</td><td>' + esc(r.stones) + '</td></tr>' : '') + (r.cert ? '<tr><td>آزمایشگاه</td><td>' + esc(r.cert) + '</td></tr>' : '') + '<tr><td>تاریخ صدور</td><td>' + faStr(S.today.jalali) + '</td></tr></table><div style="text-align:center;margin-top:8px"><svg class="bc" data-code="' + esc(r.code) + '"></svg></div><div class="muted" style="text-align:center">' + esc(st.shopAddress) + ' ' + esc(st.shopPhone) + '</div></div>');
  document.querySelectorAll('#printArea svg.bc').forEach(function (el) { try { JsBarcode(el, el.dataset.code, { format: 'CODE128', height: 36, width: 1.4, fontSize: 11, margin: 2 }); } catch (x) {} });
}
document.addEventListener('click', function (e) {
  var b = e.target.closest('button[data-cert]'); if (b) printCert(S.items.find(function (r) { return r.code === b.dataset.cert; }));
  var s = e.target.closest('button.scale'); if (s) readScale(s.parentNode.querySelector('input'));
});
$('printThermal').onclick = function () { document.body.classList.add('thermal'); window.print(); setTimeout(function () { document.body.classList.remove('thermal'); }, 500); };
function readScale(input) {
  if (!('serial' in navigator)) { toast('اتصال ترازو در این مرورگر یا این صفحه پشتیبانی نمی‌شود (کروم دسکتاپ لازم است).', false); return; }
  navigator.serial.requestPort().then(function (port) { return port.open({ baudRate: 9600 }).then(function () { var rd = port.readable.getReader(), buf = '', dec = new TextDecoder(); var step = function () { return rd.read().then(function (x) { buf += dec.decode(x.value || new Uint8Array()); var m = buf.match(/(\d+[.,]\d+)/g); if (m && m.length > 1) { input.value = m[m.length - 1].replace(',', '.'); input.dispatchEvent(new Event('input', { bubbles: true })); rd.cancel(); port.close(); toast('وزن از ترازو خوانده شد.'); return; } if (x.done || buf.length > 400) { rd.cancel(); port.close(); toast('وزن از ترازو خوانده نشد.', false); return; } return step(); }); }; return step(); }); }).catch(function () { toast('اتصال به ترازو برقرار نشد.', false); });
}

// ---------- charts (SVG, same scale, hover = native tooltip)
function monthsBack(n) { var j = S.today.jalali.split('/').map(Number), y = j[0], m = j[1], out = []; for (var i = 0; i < n; i++) { out.unshift(y + '/' + String(m).padStart(2, '0')); m--; if (m < 1) { m = 12; y--; } } return out; }
function barChart(labels, series, colors) {
  var W = 760, H = 230, pl = 64, pb = 28, pt = 10, max = 1, n = labels.length, k = series.length;
  series.forEach(function (s) { s.v.forEach(function (v) { max = Math.max(max, Math.abs(v)); }); });
  var gw = (W - pl - 10) / n, bw = Math.max(4, Math.min(22, (gw - 8) / k - 2)), y = function (v) { return pt + (H - pt - pb) * (1 - Math.max(0, v) / max); }, h = '';
  for (var g = 0; g <= 4; g++) { var gv = max * g / 4, gy = y(gv); h += '<line x1="' + pl + '" x2="' + W + '" y1="' + gy + '" y2="' + gy + '" stroke="#ece4d2"/><text x="' + (pl - 6) + '" y="' + (gy + 4) + '" text-anchor="end">' + fa(gv / 1e6) + 'م</text>'; }
  labels.forEach(function (l, i) {
    var x0 = pl + gw * i + (gw - (bw + 2) * k) / 2;
    series.forEach(function (s, si) { var v = s.v[i], top = y(v), bh = Math.max(0, H - pb - top); h += '<rect x="' + (x0 + si * (bw + 2)) + '" y="' + top + '" width="' + bw + '" height="' + bh + '" rx="3" fill="' + colors[si] + '"><title>' + s.name + ' ' + l + ': ' + fa(v) + ' تومان</title></rect>'; });
    h += '<text x="' + (pl + gw * i + gw / 2) + '" y="' + (H - 8) + '" text-anchor="middle">' + faStr(l.slice(5)) + '</text>';
  });
  return '<svg class="chart" viewBox="0 0 ' + W + ' ' + H + '" role="img">' + h + '</svg>';
}
function renderCharts() {
  var ms = monthsBack(12), T0 = liveTx(), sales = ms.map(function (m) { return sum(T0.filter(function (t) { return t.type === 'sell' && String(t.dateFa).slice(0, 7) === m; }), 'amount') - sum(T0.filter(function (t) { return t.type === 'return' && String(t.dateFa).slice(0, 7) === m; }), 'amount'); });
  var prof = ms.map(function (m) { return sum(T0.filter(function (t) { return (t.type === 'sell' || t.type === 'return') && String(t.dateFa).slice(0, 7) === m; }), 'realProfit'); });
  $('chartMonthly').innerHTML = barChart(ms, [{ name: 'فروش', v: sales }, { name: 'سود واقعی', v: prof }], ['#b8860b', '#2c5aa0']);
  var r = report($('period').value), bc = {}; r.SR.forEach(function (t) { var c = t.category || 'سایر'; bc[c] = (bc[c] || 0) + Number(t.realProfit); });
  var cats = Object.keys(bc).sort(function (a, b) { return bc[b] - bc[a]; }).slice(0, 8), mx = Math.max.apply(null, cats.map(function (c) { return Math.abs(bc[c]); }).concat([1]));
  $('chartCat').innerHTML = cats.length ? cats.map(function (c) { return '<div style="display:flex;align-items:center;gap:8px;margin:5px 0;font-size:12px"><span style="width:110px">' + esc(c) + '</span><span style="flex:1;background:#faf6ec;border-radius:4px;height:14px"><span title="' + fa(bc[c]) + ' تومان" style="display:block;height:14px;border-radius:4px;background:#b8860b;width:' + Math.max(1, Math.abs(bc[c]) / mx * 100) + '%"></span></span><span style="width:110px;text-align:left" class="' + cls(bc[c]) + '">' + fa(bc[c]) + '</span></div>'; }).join('') : '<div class="muted">فروشی در این دوره نیست.</div>';
  var t = jnum(S.today.jalali), old = stock().filter(function (it) { return it.buyDay && t - jnum(it.buyDay) > 300; }).sort(function (a, b) { return jnum(a.buyDay) - jnum(b.buyDay); });
  $('slowTable').innerHTML = table([['کد', function (x) { return esc(x.code); }], ['عنوان', function (x) { return esc(x.title); }], ['وزن', function (x) { return fa(x.weight, 3); }], ['تاریخ خرید', function (x) { return faStr(x.buyDay); }], ['ارزش روز', function (x) { return fa(x.weight750 * (isSilver(x) ? S.prices.silver925 : rate())); }]], old.slice(0, 30));
}

// ---------- settings
$('pwForm').onsubmit = function (e) { e.preventDefault(); var d = formObj(this); if (d.newPassword !== d.confirm) { toast('تکرار رمز یکسان نیست.', false); return; } load('changePassword', d, this); };
$('setForm').onsubmit = function (e) { e.preventDefault(); var d = formObj(this); d.smsEnabled = d.smsEnabled ? 'yes' : 'no'; load('settings', d, null, fillSettings); };

// ---------- Excel export (same columns as the live Google Sheet)
function exportExcel() {
  var per = $('period').value, r = report(per), lbl = $('period').selectedOptions[0].textContent;
  var summary = [{ 'شرح': 'دوره‌ی گزارش', 'مقدار': lbl }, { 'شرح': 'تاریخ تهیه', 'مقدار': S.today.jalali }, { 'شرح': 'نرخ ۱۸ عیار', 'مقدار': rate() }, { 'شرح': 'درآمد فروش', 'مقدار': r.rev }, { 'شرح': 'مالیات ارزش افزوده', 'مقدار': r.vat }, { 'شرح': 'بهای تمام‌شده', 'مقدار': r.cost }, { 'شرح': 'سود فروش', 'مقدار': r.op }, { 'شرح': 'سود/زیان نوسان', 'مقدار': r.hold }, { 'شرح': 'سود واقعی', 'مقدار': r.real }, { 'شرح': 'هزینه‌ها', 'مقدار': r.exp }, { 'شرح': 'سود خالص', 'مقدار': r.net }, { 'شرح': 'موجودی طلای ملکی (گرم معادل ۱۸)', 'مقدار': Math.round(sum(ownGold(), 'weight750') * 1000) / 1000 }, { 'شرح': 'ارزش روز موجودی', 'مقدار': Math.round(sum(ownGold(), 'weight750') * rate()) }, { 'شرح': 'مظنه', 'مقدار': S.prices.mazaneh }].concat(coinList().map(function (c) { return { 'شرح': c.label + ' (عدد)', 'مقدار': c.qty }; })).concat([{ 'شرح': 'ارزش روز سکه‌ها', 'مقدار': sum(coinList(), 'value') }, { 'شرح': 'اقساط باز (مانده)', 'مقدار': sum(openInst(), function (q) { return q.amount - (q.paid || 0); }) }]);
  var sheets = [['خلاصه گزارش', summary], ['موجودی', S.items.map(SHEET.item)], ['تراکنش‌ها', S.txs.map(SHEET.tx)], ['مشتریان و همکاران', S.parties.map(SHEET.party)], ['سفارش‌ها', S.orders.map(SHEET.order)], ['اقساط', S.installments.map(SHEET.inst)], ['فاکتورهای سایت', S.siteInvoices.map(SHEET.site)], ['چک‌ها', S.cheques.map(SHEET.cheque)], ['بستن صندوق', S.closings.map(SHEET.closing)]];
  var name = 'gold-shop-' + S.today.jalali.replace(/\//g, '-');
  if (window.XLSX) {
    var wb = XLSX.utils.book_new(); wb.Workbook = { Views: [{ RTL: true }] };
    sheets.forEach(function (s) { var ws = XLSX.utils.json_to_sheet(s[1].length ? s[1] : [{}]); var keys = s[1].length ? Object.keys(s[1][0]) : []; ws['!cols'] = keys.map(function (k) { return { wch: Math.max(12, k.length + 4) }; }); XLSX.utils.book_append_sheet(wb, ws, s[0]); });
    XLSX.writeFile(wb, name + '.xlsx');
  } else {
    var rows = S.txs.map(SHEET.tx), keys = rows.length ? Object.keys(rows[0]) : [];
    var csv = '﻿' + keys.join(',') + '\n' + rows.map(function (o) { return keys.map(function (k) { return '"' + String(o[k]).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = name + '.csv'; document.body.appendChild(a); a.click(); a.remove();
  }
}
$('xlsBtn').onclick = exportExcel; $('xlsBtn2').onclick = exportExcel;

try { var k = sessionStorage.getItem('gst'); if (k) { TOKEN = k; resume(); } } catch (e) {}
})();

