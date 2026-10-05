// 📺 تابلوی قیمت: GET /webhook/gold-board
const cfg = {}; $('Board Settings').all().forEach(function (i) { if (i.json && i.json.key) cfg[i.json.key] = i.json.value; });
return [{ json: { html: boardHtml(cfg, marketPrices($('Board Market').first().json || {})) } }];
