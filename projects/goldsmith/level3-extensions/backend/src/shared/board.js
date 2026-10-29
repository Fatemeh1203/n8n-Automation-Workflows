// ---- مشترک: تابلوی قیمت برای تلویزیون/نمایشگر مغازه (هر ۶۰ ثانیه تازه می‌شود)
// cfg: تنظیمات فروشگاه (shopName, shopPhone, buybackDeduction, bullionPremiumPct, bullionBuyDeduction)
function boardHtml(cfg, P) {
  const n = function (k, d) { const v = Number(cfg[k]); return Number.isFinite(v) && cfg[k] !== '' && cfg[k] != null ? v : d; };
  const bb = n('buybackDeduction', 2), prem = n('bullionPremiumPct', 0), bded = n('bullionBuyDeduction', 0);
  const rows = [
    ['طلای ۱۸ عیار — قیمت روز (هر گرم)', P.rate18],
    ['خرید طلای کهنه از شما (هر گرم ۱۸)', P.rate18 ? Math.round(P.rate18 * (1 - bb / 100)) : 0],
    ['شمش طلا — فروش (هر گرم خالص)', P.rate24 ? Math.round(P.rate24 * (1 + prem / 100)) : 0],
    ['شمش طلا — خرید از شما (هر گرم خالص)', P.rate24 ? Math.round(P.rate24 * (1 - bded / 100)) : 0],
    ['مظنه‌ی آبشده (مثقال)', P.mazaneh],
    ['سکه امامی', P.emami], ['سکه بهار آزادی', P.bahar], ['نیم سکه', P.nim], ['ربع سکه', P.rob], ['سکه گرمی', P.gerami],
    ['دلار آزاد', P.usd],
  ].filter(function (r) { return r[1] > 0; });
  const shop = escH(cfg.shopName || 'طلا و جواهر');
  return '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="60"><meta name="robots" content="noindex"><title>تابلوی قیمت — ' + shop + '</title>' +
    '<link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet"><style>' +
    ':root{--g:#d4a537;--g2:#f3d27a;--bg:#0f0d08;--card:#1a1610;--ink:#f6efe0;--mut:#a89a7c}*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--ink);font-family:Vazirmatn,Tahoma,sans-serif}' +
    'header{display:flex;justify-content:space-between;align-items:center;padding:2.2vh 3vw;border-bottom:2px solid #2c2416}h1{margin:0;font-size:4.2vh;color:var(--g2)}.t{color:var(--mut);font-size:2.4vh;text-align:left}' +
    'main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,520px),1fr));gap:1.6vh 2vw;padding:2.4vh 3vw}.r{display:flex;justify-content:space-between;align-items:center;background:var(--card);border:1px solid #2c2416;border-radius:1.6vh;padding:2vh 2.4vw}' +
    '.l{font-size:3vh}.v{font-size:4.4vh;font-weight:800;color:var(--g);font-variant-numeric:tabular-nums}.v small{font-size:2vh;color:var(--mut);font-weight:400;margin-inline-start:.6vw}footer{text-align:center;color:var(--mut);font-size:2.2vh;padding:1vh 0 3vh}' +
    '</style></head><body><header><h1>🥇 ' + shop + '</h1><div class="t">' + escH(P.updated || '') + '<br>' + escH(cfg.shopPhone || '') + '</div></header><main>' +
    rows.map(function (r) { return '<div class="r"><div class="l">' + r[0] + '</div><div class="v">' + faNum(r[1]) + '<small>تومان</small></div></div>'; }).join('') +
    '</main><footer>قیمت‌ها لحظه‌ای است و هر دقیقه به‌روز می‌شود · قیمت نهایی طلای ساخته‌شده با اجرت و سود محاسبه می‌شود</footer></body></html>';
}
