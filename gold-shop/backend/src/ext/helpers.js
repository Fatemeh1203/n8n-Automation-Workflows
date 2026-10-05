// ================== امکانات تکمیلی (مشترک بین پروژه‌ی اصلی و اپ) ==================
// شمش، پیش‌فاکتور با قیمت قفل، رزرو، انبارگردانی، هشدار قیمت، احراز هویت معاملات بزرگ، سریال سکه/شمش
const EXT_ACTIONS = ['bullionBuy', 'bullionSell', 'quote', 'quoteCancel', 'reserve', 'unreserve', 'stockCount', 'alertSave', 'alertDelete', 'serialFind', 'extSettings'];
const EXT_SET_NUM = ['kycThreshold', 'quoteHours', 'bullionPremiumPct', 'bullionBuyDeduction'];
const EXT_SET_TXT = ['zarinpalMerchant'];
const extOut = {};
const codeList = function (v) { return (Array.isArray(v) ? v : String(v || '').split(/[\s,،]+/)).map(str).filter(Boolean); };
// نرخ هر گرم طلای خالص (۲۴ عیار)
function pureRate(mode, manual) {
  if (mode === 'manual') return num(manual);
  return prices.rate24 || (prices.rate18 ? Math.round(prices.rate18 * 1000 / 750) : 0) || num(manual);
}
// اعتبارسنجی کد ملی ایران
function nidValid(s) {
  const d = jd(str(s)).replace(/\D/g, '');
  if (!/^\d{10}$/.test(d) || /^(\d)\1{9}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  const r = sum % 11, c = Number(d[9]);
  return r < 2 ? c === r : c === 11 - r;
}
// معامله‌ی بالای سقف (تنظیمات: kycThreshold) فقط با مشتری دارای کد ملی معتبر
function kycCheck(party, amount) {
  const lim = num(cfg.kycThreshold);
  if (!(lim > 0) || !(Math.abs(Number(amount) || 0) >= lim)) return;
  if (!party) throw new Error('برای معامله‌ی ' + money(lim) + ' تومان به بالا، مشتری با کد ملی باید ثبت شود (قانون مبارزه با پولشویی).');
  const nid = jd(str(p.nationalId) || str(party.nationalId)).replace(/\D/g, '');
  if (!nidValid(nid)) throw new Error('برای معامله‌ی ' + money(lim) + ' تومان به بالا، کد ملی معتبرِ ' + party.name + ' لازم است.');
  if (str(party.nationalId) !== nid) putParty({ code: party.code, nationalId: nid });
}
// رزرو: status = reserved و soldTx = RSV|کد مشتری|انقضا(ms)|کاربر|کد پیش‌فاکتور
function resInfo(it) {
  const x = String(it.soldTx || '').split('|');
  return it.status === 'reserved' && x[0] === 'RSV' ? { party: x[1] || '', until: Number(x[2]) || 0, by: x[3] || '', quote: x[4] || '' } : null;
}
function reserveItem(it, partyCode, until, quote) { putItem({ code: it.code, status: 'reserved', soldTx: ['RSV', partyCode || '', until, me ? me.code : '', quote || ''].join('|') }); }
function releaseItem(it) { putItem({ code: it.code, status: 'in_stock', soldTx: '' }); }
function quoteOf(code) { try { const q = JSON.parse(cfg['quote_' + code] || ''); return q && q.code ? q : null; } catch (e) { return null; } }
function alertsAll() { return Object.keys(cfg).filter(function (k) { return k.indexOf('alert_') === 0 && cfg[k]; }).map(function (k) { try { return JSON.parse(cfg[k]); } catch (e) { return null; } }).filter(Boolean); }
function quotesAll() { return Object.keys(cfg).filter(function (k) { return k.indexOf('quote_') === 0 && cfg[k]; }).map(function (k) { try { return JSON.parse(cfg[k]); } catch (e) { return null; } }).filter(Boolean); }
// قیمت فروش یک قلم طلا/نقره با فرمول پیش‌فرض فروش (اجرت و سود درصدی)
function itemQuotePrice(it, rate, fee, prof) {
  const silver = it.metal === 'silver', lr = silver ? silverRate(p) : rate;
  const w750 = Number(it.weight750) || w750Of(it.weight, it.karat), gold = Math.round(w750 * lr), stone = Number(it.stoneCost) || 0;
  const feeAmt = Math.round(gold * fee / 100);
  return { gold: gold, price: Math.round((gold + feeAmt + stone) * (1 + prof / 100)) };
}
function bullionPrice(it, rate, prem) {
  const pure = r3(Number(it.weight) * Number(it.karat) / 1000), base = Math.round(pure * rate);
  return { pure: pure, base: base, price: Math.round(base * (1 + prem / 100)) };
}
// قبل از فروش: اعمال پیش‌فاکتور (قیمت قفل‌شده) و آزاد کردن رزروِ همان مشتری
function extBeforeSell(bullion) {
  const codes = codeList(p.itemCodes);
  let q = null;
  if (str(p.quoteCode)) {
    q = quoteOf(str(p.quoteCode));
    if (!q) throw new Error('پیش‌فاکتور پیدا نشد.');
    if (q.status !== 'open') throw new Error('این پیش‌فاکتور قبلاً استفاده یا باطل شده.');
    if (Number(q.until) < nowMs) throw new Error('مهلت پیش‌فاکتور تمام شده؛ پیش‌فاکتور تازه بگیرید.');
    codes.forEach(function (c) { if (!q.lines.some(function (l) { return l.code === c; })) throw new Error('کالای ' + c + ' در این پیش‌فاکتور نیست.'); });
    if (!str(p.partyCode) && q.partyCode) { p.partyMode = 'existing'; p.partyCode = q.partyCode; }
    if (!bullion) {
      p.rateMode = 'manual'; p.rate18 = q.rate18; p.priceMode = 'fixed';
      p.amount = q.lines.filter(function (l) { return codes.indexOf(l.code) >= 0; }).reduce(function (s, l) { return s + l.price; }, 0);
    }
  }
  codes.forEach(function (c) {
    const it = items.find(function (r) { return r.code === c; }), rs = it && resInfo(it);
    if (!rs) return;
    if ((q && rs.quote === q.code) || (rs.party && rs.party === str(p.partyCode))) releaseItem(it);
    else throw new Error('«' + it.title + '» برای مشتری دیگری رزرو شده است.');
  });
  return q;
}
function extAfterSell(q, inv) { if (q) putSetting('quote_' + q.code, JSON.stringify(Object.assign({}, q, { status: 'sold', invoice: inv }))); }
// هر درخواست: رزروهای منقضی آزاد می‌شوند
function extInit() { items.slice().forEach(function (it) { const r = resInfo(it); if (r && r.until && r.until < nowMs) releaseItem(it); }); }

function extAction(A) {
  if (A === 'bullionBuy') {
    const weight = r3(num(p.weight)), purity = num(p.purity) || 995, serial = str(p.serial).toUpperCase();
    if (!(weight > 0)) throw new Error('وزن شمش را وارد کنید.');
    if (!(purity >= 900 && purity <= 1000)) throw new Error('عیار شمش باید بین ۹۰۰ و ۱۰۰۰ باشد (مثلاً ۹۹۵ یا ۹۹۹٫۹).');
    if (serial && items.some(function (it) { return it.metal === 'bullion' && str(it.cert).toUpperCase() === serial && ['in_stock', 'reserved', 'workshop'].indexOf(it.status) >= 0; })) throw new Error('شمشی با سریال ' + serial + ' همین الان در موجودی هست.');
    const rate = pureRate(p.rateMode, p.rate24), ded = num(pick(p.deductionPct, cfg.bullionBuyDeduction || 0));
    if (!(rate > 0)) throw new Error('نرخ طلای ۲۴ عیار در دسترس نیست؛ نرخ را دستی وارد کنید.');
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, p.partyKind === 'supplier' ? 'supplier' : 'customer');
    const pure = r3(weight * purity / 1000), price = Math.round(pure * rate * (1 - ded / 100)), w750 = r3(weight * purity / 750);
    kycCheck(party, price);
    const brand = str(p.brand), batch = newCode('BL');
    const item = putItem({ code: newCode('G'), title: (brand ? brand + ' — ' : '') + 'شمش ' + fd(weight) + ' گرمی ' + fd(purity), category: 'شمش', weight: weight, karat: purity, weight750: w750, buyRate18: w750 ? Math.round(price / w750) : 0, makingCost: 0, stoneCost: 0, cert: serial, buyCost: price, buyDay: jalali, supplier: party ? party.name : str(p.partyName), supplierCode: party ? party.code : '', metal: 'bullion', consign: '', stones: '', photoUrl: str(p.photoUrl), status: 'in_stock', soldTx: '', note: [str(p.certNo) ? 'گواهی: ' + str(p.certNo) : '', ded ? 'کسر ' + ded + '٪' : '', str(p.note)].filter(Boolean).join(' · ') });
    putTx(Object.assign({ type: 'buy', itemCode: item.code, title: item.title, weight750: w750, rate18: Math.round(rate * 750 / 1000), amount: price, costBasis: price, invoice: batch, category: 'شمش', payMethod: p.settle === 'credit' ? 'نسیه' : (str(p.payMethod) || 'نقد'), note: serial ? 'سریال: ' + serial : '' }, partyFields(party)));
    settlePaid(p, price, party, batch, 'پرداخت بابت خرید شمش');
    message = item.title + (serial ? ' (سریال ' + serial + ')' : '') + ' به ارزش ' + money(price) + ' تومان خریداری شد.';
  } else if (A === 'bullionSell') {
    const q = extBeforeSell(true);
    const codes = codeList(p.itemCodes);
    const sel = codes.map(function (c) { return items.find(function (r) { return r.code === c && r.status === 'in_stock' && r.metal === 'bullion'; }); });
    if (!codes.length || sel.some(function (x) { return !x; })) throw new Error('شمش انتخاب‌شده در موجودی نیست.');
    const rate = pureRate(p.rateMode, p.rate24), prem = num(pick(p.premiumPct, cfg.bullionPremiumPct || 0));
    if (!q && !(rate > 0)) throw new Error('نرخ طلای ۲۴ عیار در دسترس نیست؛ نرخ را دستی وارد کنید.');
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'customer');
    const vatOn = p.vatOn === true || p.vatOn === 'on' || p.vatOn === 'true';
    const inv = newCode('INV');
    let sum = 0, vat = 0, real = 0;
    const lines = sel.map(function (it) {
      const b = bullionPrice(it, q ? q.rate24 : rate, prem);
      const ql = q ? q.lines.find(function (l) { return l.code === it.code; }) : null;
      const price = ql ? ql.price : b.price, v = vatOn ? Math.round(Math.max(0, price - b.base) * settings.vatPct / 100) : 0;
      putTx(Object.assign({ type: 'sell', itemCode: it.code, title: it.title, weight750: Number(it.weight750), rate18: Math.round((q ? q.rate24 : rate) * 750 / 1000), amount: price, vat: v, costBasis: Number(it.buyCost), operatingProfit: price - b.base, holdingGain: b.base - Number(it.buyCost), realProfit: price - Number(it.buyCost), profitAmt: price - b.base, invoice: inv, category: 'شمش', payMethod: str(p.payMethod) || 'نقد', note: it.cert ? 'سریال: ' + it.cert : '' }, partyFields(party)));
      sum += price; vat += v; real += price - Number(it.buyCost);
      return { it: it, b: b, price: price };
    });
    lines.forEach(function (l) { putItem({ code: l.it.code, status: 'sold', soldTx: inv }); });
    finishSale(inv, party, lines.map(function (l) { return { title: l.it.title + (l.it.cert ? ' — سریال ' + l.it.cert : ''), weight: l.it.weight, karat: l.it.karat, gold: l.b.base, price: l.price }; }), sum, vat, real, 0);
    extAfterSell(q, inv);
  } else if (A === 'quote') {
    const codes = codeList(p.itemCodes);
    const sel = codes.map(function (c) { return items.find(function (r) { return r.code === c && r.status === 'in_stock'; }); });
    if (!codes.length || sel.some(function (x) { return !x; })) throw new Error('کالای انتخاب‌شده در موجودی نیست (یا رزرو است).');
    if (sel.some(function (x) { return x.metal === 'bullion'; }) && sel.some(function (x) { return x.metal !== 'bullion'; })) throw new Error('پیش‌فاکتور شمش و طلای ساخته‌شده را جدا صادر کنید.');
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'customer');
    const hours = Math.max(0.25, Math.min(72, num(pick(p.hours, cfg.quoteHours || 2))));
    const rate18 = rateFrom(p.rateMode, p.rate18), rate24 = pureRate(p.rateMode24, p.rate24);
    const fee = num(pick(p.feePct, settings.feePct)), prof = num(pick(p.profitPct, settings.profitPct)), prem = num(pick(p.premiumPct, cfg.bullionPremiumPct || 0));
    if (!(rate18 > 0)) throw new Error('نرخ روز در دسترس نیست؛ نرخ را دستی وارد کنید.');
    const lines = sel.map(function (it) {
      const pr = it.metal === 'bullion' ? bullionPrice(it, rate24, prem).price : itemQuotePrice(it, rate18, fee, prof).price;
      return { code: it.code, title: it.title, weight: Number(it.weight), karat: Number(it.karat), bullion: it.metal === 'bullion', price: pr };
    });
    const total = lines.reduce(function (s, l) { return s + l.price; }, 0), until = nowMs + Math.round(hours * 3600000);
    const q = { code: newCode('QT'), status: 'open', dateFa: jalali, time: timeFa, until: until, hours: hours, rate18: rate18, rate24: rate24, feePct: fee, profitPct: prof, premiumPct: prem, partyCode: party ? party.code : '', partyName: party ? party.name : str(p.partyName), lines: lines, total: total, user: me.code };
    putSetting('quote_' + q.code, JSON.stringify(q));
    if (p.reserve === true || p.reserve === 'on' || p.reserve === 'true') sel.forEach(function (it) { reserveItem(it, q.partyCode, until, q.code); });
    extOut.quote = q;
    message = 'پیش‌فاکتور ' + q.code + ' به مبلغ ' + money(total) + ' تومان تا ' + fd(hours) + ' ساعت معتبر است.';
  } else if (A === 'quoteCancel') {
    const q = quoteOf(str(p.code));
    if (!q || q.status !== 'open') throw new Error('پیش‌فاکتور باز پیدا نشد.');
    putSetting('quote_' + q.code, JSON.stringify(Object.assign({}, q, { status: 'cancelled' })));
    items.slice().forEach(function (it) { const r = resInfo(it); if (r && r.quote === q.code) releaseItem(it); });
    message = 'پیش‌فاکتور ' + q.code + ' باطل شد.';
  } else if (A === 'reserve') {
    const codes = codeList(p.itemCodes);
    const sel = codes.map(function (c) { return items.find(function (r) { return r.code === c && r.status === 'in_stock'; }); });
    if (!codes.length || sel.some(function (x) { return !x; })) throw new Error('فقط کالای موجود را می‌شود رزرو کرد.');
    const party = resolveParty(p.partyMode, p.partyCode, p.partyName, p.partyPhone, 'customer');
    if (!party) throw new Error('مشتری رزرو را مشخص کنید.');
    const hours = Math.max(1, Math.min(24 * 30, num(p.hours) || 24)), until = nowMs + hours * 3600000;
    sel.forEach(function (it) { reserveItem(it, party.code, until, ''); });
    message = fd(sel.length) + ' قلم برای ' + party.name + ' تا ' + fd(hours) + ' ساعت رزرو شد.';
  } else if (A === 'unreserve') {
    const codes = codeList(p.itemCodes);
    const sel = items.filter(function (r) { return codes.indexOf(r.code) >= 0 && resInfo(r); });
    if (!sel.length) throw new Error('کالای رزروشده‌ای انتخاب نشده.');
    if (me.role === 'seller' && sel.some(function (it) { return resInfo(it).by !== me.code; })) throw new Error('فقط رزروهای خودتان را می‌توانید آزاد کنید.');
    sel.forEach(releaseItem);
    message = fd(sel.length) + ' قلم از رزرو خارج شد.';
  } else if (A === 'stockCount') {
    const br = str(p.branch), scanned = [];
    codeList(p.codes).forEach(function (c) { c = c.toUpperCase(); if (scanned.indexOf(c) < 0) scanned.push(c); });
    if (!scanned.length) throw new Error('هیچ کدی اسکن نشده.');
    const onHand = items.filter(function (r) { return (r.status === 'in_stock' || r.status === 'reserved') && (!br || r.branch === br); });
    const has = function (r) { return scanned.indexOf(String(r.code).toUpperCase()) >= 0; };
    const matched = onHand.filter(has), missing = onHand.filter(function (r) { return !has(r); });
    const extra = scanned.filter(function (c) { return !onHand.some(function (r) { return String(r.code).toUpperCase() === c; }); }).map(function (c) { const it = items.find(function (r) { return String(r.code).toUpperCase() === c; }); return { code: c, title: it ? it.title : 'ناشناس', status: it ? it.status : 'unknown' }; });
    const g = function (l) { return r3(l.reduce(function (s, r) { return s + (Number(r.weight750) || 0); }, 0)); };
    const short = function (r) { return { code: r.code, title: r.title, weight: r.weight, karat: r.karat, branch: r.branch || '' }; };
    putClosing({ code: newCode('SC'), dateFa: jalali, time: timeFa, user: me.code, branch: br, expected: onHand.length, counted: matched.length, diff: matched.length - onHand.length, goldSystem: g(onHand), goldCounted: g(matched), goldDiff: r3(g(matched) - g(onHand)), detail: 'انبارگردانی — کسری: ' + (missing.map(function (r) { return r.code; }).join('، ') || 'ندارد') + ' | اضافه: ' + (extra.map(function (r) { return r.code; }).join('، ') || 'ندارد'), note: str(p.note) });
    extOut.stockResult = { matched: matched.length, expected: onHand.length, missing: missing.map(short), extra: extra, goldMissing: g(missing) };
    message = 'انبارگردانی ثبت شد: ' + fd(matched.length) + ' از ' + fd(onHand.length) + ' قلم پیدا شد' + (missing.length ? '، ' + fd(missing.length) + ' قلم کسری (' + fd(g(missing)) + ' گرم معادل ۱۸)' : '') + (extra.length ? '، ' + fd(extra.length) + ' کد اضافه' : '') + '.';
  } else if (A === 'alertSave') {
    const METRICS = ['rate18', 'rate24', 'mazaneh', 'emami', 'bahar', 'nim', 'rob', 'usd'];
    const metric = METRICS.indexOf(p.metric) >= 0 ? p.metric : 'rate18', dir = p.dir === 'above' ? 'above' : 'below', target = Math.round(num(p.target));
    if (!(target > 0)) throw new Error('قیمت هدف را وارد کنید.');
    const party = parties.find(function (c) { return c.code === str(p.partyCode); });
    const phone = str(p.phone) || (party ? str(party.phone) : '');
    if (!/^0?9\d{9}$/.test(jd(phone).replace(/\D/g, ''))) throw new Error('شماره موبایل برای پیامک هشدار لازم است.');
    const a = { code: str(p.code) || newCode('AL'), partyCode: party ? party.code : '', name: party ? party.name : str(p.name), phone: jd(phone).replace(/\D/g, ''), metric: metric, dir: dir, target: target, active: 'yes', created: jalali, by: me.code, firedAt: '' };
    putSetting('alert_' + a.code, JSON.stringify(a));
    message = 'هشدار قیمت ذخیره شد؛ وقتی قیمت ' + (dir === 'below' ? 'به زیر ' : 'به بالای ') + money(target) + ' تومان برسد پیامک می‌شود.';
  } else if (A === 'alertDelete') {
    if (!cfg['alert_' + str(p.code)]) throw new Error('هشدار پیدا نشد.');
    putSetting('alert_' + str(p.code), '');
    message = 'هشدار حذف شد.';
  } else if (A === 'serialFind') {
    const s = str(p.serial).toUpperCase();
    if (s.length < 3) throw new Error('حداقل ۳ حرف از سریال را وارد کنید.');
    extOut.serialResult = {
      items: items.filter(function (it) { return str(it.cert).toUpperCase().indexOf(s) >= 0; }).map(function (it) { return { code: it.code, title: it.title, status: it.status, cert: it.cert, buyDay: it.buyDay, supplier: it.supplier }; }),
      txs: txs.filter(function (t) { return String(t.note || '').toUpperCase().indexOf(s) >= 0; }).map(function (t) { return { code: t.code, dateFa: t.dateFa, type: t.type, title: t.title, customerName: t.customerName, note: t.note, invoice: t.invoice }; }),
    };
    message = 'نتیجه‌ی جستجوی سریال: ' + fd(extOut.serialResult.items.length + extOut.serialResult.txs.length) + ' مورد.';
  } else if (A === 'extSettings') {
    EXT_SET_NUM.forEach(function (k) { if (p[k] !== undefined) putSetting(k, String(num(p[k]))); });
    EXT_SET_TXT.forEach(function (k) { if (p[k] !== undefined) putSetting(k, str(p[k])); });
    message = 'تنظیمات امکانات تکمیلی ذخیره شد.';
  }
}
function extResponse(response) {
  const hide = me && me.role === 'seller';
  const bars = items.filter(function (it) { return it.metal === 'bullion' && (it.status === 'in_stock' || it.status === 'reserved'); });
  const pr = pureRate('market', 0);
  response.ext = Object.assign({
    pureRate: pr,
    settings: { kycThreshold: num(cfg.kycThreshold), quoteHours: num(cfg.quoteHours) || 2, bullionPremiumPct: num(cfg.bullionPremiumPct), bullionBuyDeduction: num(cfg.bullionBuyDeduction), zarinpalSet: !!str(cfg.zarinpalMerchant) },
    bullion: { count: bars.length, pure: r3(bars.reduce(function (s, it) { return s + Number(it.weight) * Number(it.karat) / 1000; }, 0)), cost: hide ? 0 : bars.reduce(function (s, it) { return s + (Number(it.buyCost) || 0); }, 0), value: Math.round(bars.reduce(function (s, it) { return s + Number(it.weight) * Number(it.karat) / 1000; }, 0) * pr) },
    reservations: items.filter(resInfo).map(function (it) { const r = resInfo(it), c = parties.find(function (x) { return x.code === r.party; }); return { code: it.code, title: it.title, party: r.party, partyName: c ? c.name : '', until: r.until, by: r.by, quote: r.quote }; }),
    quotes: quotesAll().filter(function (q) { return q.status === 'open' || nowMs - Number(q.until) < 7 * 86400000; }).sort(function (a, b) { return Number(b.until) - Number(a.until); }).slice(0, 100).map(function (q) { return Object.assign({}, q, { expired: q.status === 'open' && Number(q.until) < nowMs }); }),
    alerts: hide ? [] : alertsAll(),
  }, extOut);
}
// ================== پایان امکانات تکمیلی (توابع) ==================
