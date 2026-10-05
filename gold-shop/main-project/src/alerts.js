// 🔔 بررسی هشدارهای قیمت (هر ۳۰ دقیقه) → پیامک + غیرفعال کردن هشدار
const cfg = {}; $('Alert Settings').all().forEach(function (i) { if (i.json && i.json.key) cfg[i.json.key] = i.json.value; });
const alerts = Object.keys(cfg).filter(function (k) { return k.indexOf('alert_') === 0 && cfg[k]; }).map(function (k) { try { return JSON.parse(cfg[k]); } catch (e) { return null; } }).filter(Boolean);
if (!alerts.length) return [];
const smsOn = cfg.smsEnabled === 'yes' && cfg.smsApiKey;
const r = checkAlerts(alerts, marketPrices($('Alert Market').first().json || {}), smsOn ? { apiKey: cfg.smsApiKey, sender: cfg.smsSender } : null, cfg.shopName);
if (!r.fired.length) return [];
const writes = r.fired.map(function (a) { return { op: 'setting', row: { key: 'alert_' + a.code, value: JSON.stringify(a) } }; }).concat(r.sms.map(function (m) { return { op: 'sms', row: m }; }));
return [{ json: { writes: writes } }];
