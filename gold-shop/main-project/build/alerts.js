// ---- مشترک: قالب‌بندی عدد و امن‌سازی HTML
const faNum = function (n) { return Math.round(Number(n) || 0).toLocaleString('fa-IR'); };
const escH = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
// ---- مشترک: خواندن قیمت‌های بازار از فایل iran-market (latest-toman.json)
function marketPrices(m) {
  const by = {};
  const cats = (m && m.data && m.data.categories) || {};
  Object.keys(cats).forEach(function (k) { (cats[k] || []).forEach(function (it) { if (it && it.symbol) by[it.symbol] = Number(it.price) || 0; }); });
  const rate18 = by.GOLD_18K_IRR || 0;
  return {
    rate18: rate18, rate24: by.GOLD_24K_IRR || (rate18 ? Math.round(rate18 * 1000 / 750) : 0), mazaneh: by.GOLD_MESGHAL_IRR || 0,
    emami: by.COIN_EMAMI_IRR || 0, bahar: by.COIN_BAHAR_IRR || 0, nim: by.COIN_HALF_IRR || 0, rob: by.COIN_QUARTER_IRR || 0, gerami: by.COIN_GRAMI_IRR || 0,
    usd: by.USD_IRR_FREE || 0, ounce: by.XAU_USD || 0,
    updated: m && m.data && m.data.generated_at ? new Date(m.data.generated_at).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' }) : '',
  };
}
const METRIC_FA = { rate18: 'طلای ۱۸ عیار (گرم)', rate24: 'طلای ۲۴ عیار / شمش (گرم)', mazaneh: 'مظنه (مثقال)', emami: 'سکه امامی', bahar: 'سکه بهار آزادی', nim: 'نیم سکه', rob: 'ربع سکه', usd: 'دلار' };
// ---- مشترک: بررسی هشدارهای قیمت (هر ۳۰ دقیقه)
// alerts: [{ code, phone, name, metric, dir, target, active }]  ← از تنظیمات alert_*
// خروجی: هشدارهایی که باید غیرفعال شوند + پیامک‌ها
function checkAlerts(alerts, P, sms, shopName) {
  const fired = [], msgs = [];
  alerts.forEach(function (a) {
    if (!a || a.active !== 'yes') return;
    const v = Number(P[a.metric]) || 0, t = Number(a.target) || 0;
    if (!v || !t) return;
    if (!((a.dir === 'below' && v <= t) || (a.dir === 'above' && v >= t))) return;
    fired.push(Object.assign({}, a, { active: 'no', firedAt: new Date().toISOString(), firedValue: v }));
    if (sms && sms.apiKey && a.phone) msgs.push({ to: a.phone, apiKey: sms.apiKey, sender: sms.sender || '', text: (shopName || 'طلافروشی') + '\n🔔 هشدار قیمت: ' + (METRIC_FA[a.metric] || a.metric) + ' به ' + faNum(v) + ' تومان رسید (' + (a.dir === 'below' ? 'زیر ' : 'بالای ') + faNum(t) + ').' });
  });
  return { fired: fired, sms: msgs };
}

// 🔔 بررسی هشدارهای قیمت (هر ۳۰ دقیقه) → پیامک + غیرفعال کردن هشدار
const cfg = {}; $('Alert Settings').all().forEach(function (i) { if (i.json && i.json.key) cfg[i.json.key] = i.json.value; });
const alerts = Object.keys(cfg).filter(function (k) { return k.indexOf('alert_') === 0 && cfg[k]; }).map(function (k) { try { return JSON.parse(cfg[k]); } catch (e) { return null; } }).filter(Boolean);
if (!alerts.length) return [];
const smsOn = cfg.smsEnabled === 'yes' && cfg.smsApiKey;
const r = checkAlerts(alerts, marketPrices($('Alert Market').first().json || {}), smsOn ? { apiKey: cfg.smsApiKey, sender: cfg.smsSender } : null, cfg.shopName);
if (!r.fired.length) return [];
const writes = r.fired.map(function (a) { return { op: 'setting', row: { key: 'alert_' + a.code, value: JSON.stringify(a) } }; }).concat(r.sms.map(function (m) { return { op: 'sms', row: m }; }));
return [{ json: { writes: writes } }];
