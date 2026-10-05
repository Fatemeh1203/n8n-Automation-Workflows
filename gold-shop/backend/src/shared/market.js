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
