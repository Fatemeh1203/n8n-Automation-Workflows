// ---- مشترک: قالب‌بندی عدد و امن‌سازی HTML
const faNum = function (n) { return Math.round(Number(n) || 0).toLocaleString('fa-IR'); };
const escH = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
