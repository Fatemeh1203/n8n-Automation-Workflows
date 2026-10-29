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
