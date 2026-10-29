window.GSX_CONF = { api: 'https://n8n.aifardainstitute.ir/webhook/gold-admin-api', board: 'https://n8n.aifardainstitute.ir/webhook/gold-board', mode: 'main' };
// ================== امکانات تکمیلی پنل طلافروشی ==================
// شمش · پیش‌فاکتور و رزرو · انبارگردانی با دوربین · هشدار قیمت · تنظیمات تکمیلی · اسکن بارکد در فروش
// این فایل قبل از app.js بارگذاری می‌شود؛ پاسخ‌های API را می‌بیند تا همیشه آخرین وضعیت را داشته باشد.
(function () {
  var C = window.GSX_CONF || {};
  var API = C.api, S = null, dirty = false, current = '';
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var fa = function (n, d) { return (Number(n) || 0).toLocaleString('fa-IR', { maximumFractionDigits: d == null ? 0 : d }); };
  var toEn = function (s) { return String(s == null ? '' : s).replace(/[۰-۹]/g, function (c) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(c); }).replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); }); };
  var role = function () { return S && S.me ? S.me.role : ''; };
  var token = function () { try { return sessionStorage.getItem('gst') || ''; } catch (e) { return ''; } };
  var shopSlug = function () { try { return localStorage.getItem('gshop') || ''; } catch (e) { return ''; } };
  function toast(msg, ok) { var t = $('toast'); if (!t) { alert(msg); return; } t.textContent = msg; t.style.background = ok === false ? 'var(--err)' : 'var(--ok)'; t.style.display = 'block'; clearTimeout(t._x); t._x = setTimeout(function () { t.style.display = 'none'; }, 5000); }

  // ---- همه‌ی پاسخ‌های API را می‌بینیم تا آخرین وضعیت پنل را داشته باشیم
  var origFetch = window.fetch.bind(window);
  window.fetch = function (url, opt) {
    var p = origFetch(url, opt);
    if (String(url) === API) p.then(function (r) { r.clone().json().then(function (d) { if (d && d.ok && d.me) { S = d; renderAll(); } }).catch(function () {}); });
    return p;
  };
  function api(action, data) {
    var body = { token: token(), action: action, data: JSON.stringify(data || {}) };
    if (C.mode === 'app') body.shop = shopSlug();
    return origFetch(API, { method: 'POST', body: new URLSearchParams(body) }).then(function (r) { return r.json(); });
  }
  // اجرای یک کار؛ بعد از موفقیت، پنل اصلی هم تازه می‌شود
  function run(action, data, btn, after) {
    if (btn) btn.disabled = true;
    return api(action, data).then(function (d) {
      if (d.unauthorized) { toast(d.error || 'نشست تمام شده؛ دوباره وارد شوید.', false); setTimeout(function () { location.reload(); }, 1500); return; }
      if (!d.ok) { toast(d.error || 'خطا', false); return; }
      if (d.token) try { sessionStorage.setItem('gst', d.token); } catch (e) {}
      S = d; dirty = true;
      if (window.GSX_BRIDGE) { window.GSX_BRIDGE.setState(d); dirty = false; }
      renderAll(); if (d.message) toast(d.message);
      if (after) after(d);
    }).catch(function () { toast('ارتباط با سرور برقرار نشد.', false); }).then(function () { if (btn) btn.disabled = false; });
  }
  function showPrint(html) { var pa = $('printArea'), m = $('modal'); if (pa && m) { pa.innerHTML = html; m.style.display = 'flex'; } }

  // ---- اسکنر بارکد با دوربین گوشی (BarcodeDetector یا کتابخانه‌ی html5-qrcode)
  var Scan = (function () {
    var box, video, stream, timer, h5, last = '', lastAt = 0, cb = null, cont = false;
    function ui() {
      if (box) return;
      box = document.createElement('div');
      box.id = 'gsxScan';
      box.innerHTML = '<div class="gsx-sbox"><div class="row between"><b>📷 اسکن بارکد</b><button type="button" class="btn ghost sm" id="gsxScanClose">✖ بستن</button></div>' +
        '<div id="gsxScanView"><video id="gsxVideo" playsinline muted></video></div><div class="muted" id="gsxScanMsg">بارکد را جلوی دوربین بگیرید…</div>' +
        '<div class="row"><input id="gsxScanManual" placeholder="یا کد را دستی بنویسید / با اسکنر دستی بزنید" style="flex:1"><button type="button" class="btn sm" id="gsxScanAdd">افزودن</button></div><div id="gsxScanList" class="muted"></div></div>';
      document.body.appendChild(box);
      $('gsxScanClose').onclick = close;
      var add = function () { var v = $('gsxScanManual').value.trim(); if (v) { hit(v); $('gsxScanManual').value = ''; } };
      $('gsxScanAdd').onclick = add; $('gsxScanManual').onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); add(); } };
    }
    function hit(code) {
      code = toEn(code).trim().toUpperCase(); var now = Date.now();
      if (!code || (code === last && now - lastAt < 2500)) return;
      last = code; lastAt = now;
      try { navigator.vibrate && navigator.vibrate(60); } catch (e) {}
      $('gsxScanMsg').textContent = '✅ ' + code;
      if (cb) cb(code);
      if (!cont) close();
    }
    function stop() { clearInterval(timer); timer = null; if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } if (h5) { try { h5.stop().catch(function () {}); } catch (e) {} h5 = null; } }
    function close() { stop(); if (box) box.style.display = 'none'; }
    function useLib() {
      var go = function () {
        $('gsxScanView').innerHTML = '<div id="gsxH5"></div>';
        h5 = new window.Html5Qrcode('gsxH5');
        h5.start({ facingMode: 'environment' }, { fps: 10, qrbox: { width: 260, height: 140 } }, hit, function () {}).catch(function () { $('gsxScanMsg').textContent = 'دسترسی به دوربین ممکن نشد؛ کد را دستی وارد کنید.'; });
      };
      if (window.Html5Qrcode) return go();
      var s = document.createElement('script'); s.src = 'https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js'; s.onload = go;
      s.onerror = function () { $('gsxScanMsg').textContent = 'اسکنر بارگذاری نشد؛ کد را دستی وارد کنید.'; }; document.head.appendChild(s);
    }
    function open(onCode, continuous) {
      ui(); cb = onCode; cont = !!continuous; last = ''; box.style.display = 'flex'; $('gsxScanMsg').textContent = 'بارکد را جلوی دوربین بگیرید…';
      if (!$('gsxVideo')) $('gsxScanView').innerHTML = '<video id="gsxVideo" playsinline muted></video>';
      setTimeout(function () { $('gsxScanManual').focus(); }, 50);
      if (!('BarcodeDetector' in window) || !navigator.mediaDevices) return useLib();
      var det;
      try { det = new window.BarcodeDetector({ formats: ['code_128', 'code_39', 'ean_13', 'qr_code'] }); } catch (e) { return useLib(); }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function (st) {
        stream = st; video = $('gsxVideo'); video.srcObject = st; video.play();
        timer = setInterval(function () { if (video.readyState < 2) return; det.detect(video).then(function (r) { if (r && r[0]) hit(r[0].rawValue); }).catch(function () {}); }, 250);
      }).catch(function () { $('gsxScanMsg').textContent = 'دسترسی به دوربین داده نشد؛ کد را دستی وارد کنید.'; });
    }
    return { open: open, setList: function (html) { if ($('gsxScanList')) $('gsxScanList').innerHTML = html; } };
  })();
  window.GSX_SCAN = Scan;

  // ---- انتخاب مشتری/طرف حساب
  function partyBox(id, kinds) {
    return '<div class="gsx-party" id="' + id + '"><div class="row"><select class="gsx-pc" style="flex:1"></select></div><div class="g2 gsx-pn" style="display:none"><div><label>نام *</label><input class="gsx-name"></div><div><label>موبایل</label><input class="gsx-phone" inputmode="tel"></div></div></div>';
  }
  function fillParty(id, kinds, keep) {
    var el = $(id); if (!el || !S) return;
    var sel = el.querySelector('.gsx-pc'), cur = keep ? sel.value : '';
    var list = (S.parties || []).filter(function (c) { return !kinds || kinds.indexOf(c.kind || 'customer') >= 0; });
    sel.innerHTML = '<option value="">— بدون نام (گذری) —</option><option value="__new">➕ مشتری / طرف جدید</option>' + list.map(function (c) { return '<option value="' + esc(c.code) + '">' + esc(c.name) + (c.phone ? ' · ' + esc(c.phone) : '') + '</option>'; }).join('');
    sel.value = cur; sel.onchange = function () { el.querySelector('.gsx-pn').style.display = sel.value === '__new' ? '' : 'none'; };
    sel.onchange();
  }
  function partyData(id) {
    var el = $(id), v = el.querySelector('.gsx-pc').value;
    if (v === '__new') return { partyMode: 'new', partyName: el.querySelector('.gsx-name').value.trim(), partyPhone: el.querySelector('.gsx-phone').value.trim() };
    if (v) return { partyMode: 'existing', partyCode: v };
    return { partyMode: '' };
  }
  function formData(f) { var o = {}; new FormData(f).forEach(function (v, k) { o[k] = toEn(v); }); f.querySelectorAll('input[type=checkbox]').forEach(function (c) { o[c.name] = c.checked; }); return o; }
  function tbl(cols, rows, empty) {
    if (!rows.length) return '<div class="muted">' + (empty || 'موردی نیست.') + '</div>';
    return '<table><tr>' + cols.map(function (c) { return '<th>' + c[0] + '</th>'; }).join('') + '</tr>' + rows.map(function (r) { return '<tr>' + cols.map(function (c) { return '<td>' + c[1](r) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  }
  var kpi = function (l, v, s) { return '<div class="kpi"><div class="l">' + l + '</div><div class="v">' + v + '</div>' + (s ? '<div class="muted">' + s + '</div>' : '') + '</div>'; };
  var inStock = function () { return (S.items || []).filter(function (r) { return r.status === 'in_stock'; }); };
  var bars = function () { return (S.items || []).filter(function (r) { return r.metal === 'bullion' && (r.status === 'in_stock' || r.status === 'reserved'); }); };
  var pureG = function (it) { return Number(it.weight) * Number(it.karat) / 1000; };
  var left = function (ms) { var m = Math.round((ms - Date.now()) / 60000); return m <= 0 ? '<span class="neg">منقضی</span>' : (m < 120 ? fa(m) + ' دقیقه' : fa(Math.round(m / 60)) + ' ساعت'); };
  var PAY = '<select name="payMethod"><option>نقد</option><option>کارتخوان</option><option>کارت به کارت</option><option>چک</option><option>نسیه</option></select>';

  // ---- ساخت تب‌ها
  var TABS = [
    ['xb', '🧈 شمش', ''], ['xq', '📝 پیش‌فاکتور و رزرو', ''], ['xs', '📷 انبارگردانی', ''], ['xa', '🔔 هشدار قیمت', 'owner,accountant'], ['xc', '🧩 تنظیمات تکمیلی', 'owner'],
  ];
  function build() {
    var nav = $('nav'), wrap = $('app'); if (!nav || !wrap || $('t-xb')) return;
    var st = document.createElement('style');
    st.textContent = '#gsxScan{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:9999;padding:12px}.gsx-sbox{background:#fff;border-radius:16px;padding:14px;width:min(520px,100%);max-height:94vh;overflow:auto}#gsxScanView video,#gsxScanView #gsxH5{width:100%;border-radius:12px;background:#000;min-height:200px}' +
      '.gsx-chips{display:flex;flex-wrap:wrap;gap:6px;margin:6px 0}.gsx-chip{background:var(--soft);border:1px solid var(--line);border-radius:999px;padding:2px 10px;font-size:12.5px}.gsx-chip button{border:0;background:none;color:var(--err);cursor:pointer}.gsx-scanbtn{white-space:nowrap}';
    document.head.appendChild(st);
    TABS.forEach(function (t) {
      var b = document.createElement('button'); b.dataset.t = t[0]; b.textContent = t[1]; if (t[2]) b.dataset.roles = t[2];
      b.onclick = function () { current = t[0]; document.querySelectorAll('#nav button').forEach(function (x) { x.classList.toggle('on', x === b); }); document.querySelectorAll('.tab').forEach(function (s) { s.classList.toggle('on', s.id === 't-' + t[0]); }); renderAll(); };
      nav.appendChild(b);
      var s = document.createElement('section'); s.className = 'tab'; s.id = 't-' + t[0]; wrap.appendChild(s);
    });
    // اگر بعد از کارهای این بخش به تب‌های اصلی برویم، پنل یک بار تازه می‌شود
    nav.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !dirty || /^x/.test(b.dataset.t || '')) return;
      try { sessionStorage.setItem('gsx_go', b.dataset.t); } catch (er) {} location.reload();
    }, true);
    layout(); inject();
  }
  function layout() {
    $('t-xb').innerHTML =
      '<div class="kpis" id="xbKpis"></div>' +
      '<div class="g2"><div class="card" data-roles="owner,accountant"><h2>📥 خرید شمش</h2><form id="xbBuy"><div class="g2">' +
      '<div><label>وزن (گرم) *</label><input name="weight" inputmode="decimal" required></div>' +
      '<div><label>عیار</label><select name="purity"><option value="995">۹۹۵</option><option value="999.9">۹۹۹٫۹</option><option value="999">۹۹۹</option><option value="750">۷۵۰</option></select></div>' +
      '<div><label>شماره‌ی سریال</label><div class="row"><input name="serial" style="flex:1"><button type="button" class="btn ghost sm gsx-scanbtn" data-scan="serial">📷</button></div></div>' +
      '<div><label>سازنده / برند</label><input name="brand" placeholder="مثلاً PAMP یا بانک ملی"></div>' +
      '<div><label>شماره‌ی گواهی</label><input name="certNo"></div>' +
      '<div><label>نرخ هر گرم خالص</label><select name="rateMode"><option value="market">قیمت روز</option><option value="manual">دستی</option></select></div>' +
      '<div><label>نرخ دستی هر گرم خالص</label><input name="rate24" inputmode="numeric"></div>' +
      '<div><label>کسر از قیمت (٪)</label><input name="deductionPct" inputmode="decimal" placeholder="پیش‌فرض تنظیمات"></div>' +
      '<div><label>تسویه</label><select name="settle"><option value="cash">نقد کامل</option><option value="credit">نسیه</option></select></div>' +
      '<div><label>روش پرداخت</label>' + PAY + '</div>' +
      '<div><label>پیش‌پرداخت (برای نسیه)</label><input name="paid" inputmode="numeric"></div>' +
      '<div><label>کد ملی فروشنده‌ی شمش</label><input name="nationalId" inputmode="numeric"></div>' +
      '</div><h3>فروشنده (مشتری یا همکار)</h3>' + partyBox('xbBuyParty') + '<div class="preview" id="xbBuyPrev"></div><button class="btn" type="submit">✅ ثبت خرید شمش</button></form></div>' +
      '<div class="card"><h2>📤 فروش شمش</h2><form id="xbSell"><div id="xbPick" class="tbl"></div><div class="g2">' +
      '<div><label>کارمزد / سود فروش (٪)</label><input name="premiumPct" inputmode="decimal" placeholder="پیش‌فرض تنظیمات"></div>' +
      '<div><label>نرخ هر گرم خالص</label><select name="rateMode"><option value="market">قیمت روز</option><option value="manual">دستی</option></select></div>' +
      '<div><label>نرخ دستی</label><input name="rate24" inputmode="numeric"></div>' +
      '<div><label>روش پرداخت</label>' + PAY + '</div>' +
      '<div><label>مبلغ پرداختی الان</label><input name="paid" inputmode="numeric" placeholder="خالی = کامل"></div>' +
      '<div><label>کد ملی خریدار</label><input name="nationalId" inputmode="numeric"></div>' +
      '<div><label>&nbsp;</label><label class="row" style="color:var(--ink)"><input type="checkbox" name="vatOn"> مالیات روی کارمزد</label></div>' +
      '</div><details class="inst"><summary>📅 تقسیط مانده</summary><div class="g3"><div><label>تعداد قسط</label><input name="instCount" inputmode="numeric"></div><div><label>شروع (۱۴۰۵/۰۸/۰۱)</label><input name="instStart"></div><div><label>هر چند ماه</label><input name="instEvery" inputmode="numeric" value="1"></div></div></details>' +
      '<h3>خریدار</h3>' + partyBox('xbSellParty') + '<div class="preview" id="xbSellPrev"></div><button class="btn" type="submit">✅ صدور فاکتور شمش</button></form></div></div>' +
      '<div class="card"><h2>🧈 موجودی شمش</h2><div class="tbl" id="xbTable"></div></div>' +
      '<div class="card"><h2>🔎 جستجوی سریال سکه و شمش</h2><div class="row"><input id="xbSerial" placeholder="بخشی از سریال" style="max-width:260px"><button type="button" class="btn ghost sm gsx-scanbtn" data-scan="xbSerial">📷</button><button type="button" class="btn sm" id="xbSerialGo">جستجو</button></div><div class="tbl" id="xbSerialRes"></div></div>';

    $('t-xq').innerHTML =
      '<div class="g2"><div class="card"><h2>📝 پیش‌فاکتور با قیمت قفل‌شده</h2><form id="xqForm">' + itemPicker('xqItems') +
      '<div class="g2"><div><label>اعتبار (ساعت)</label><input name="hours" inputmode="decimal" placeholder="پیش‌فرض تنظیمات"></div>' +
      '<div><label>&nbsp;</label><label class="row" style="color:var(--ink)"><input type="checkbox" name="reserve" checked> اقلام تا پایان مهلت رزرو شوند</label></div></div>' +
      '<details><summary>⚙️ نرخ و درصدها</summary><div class="g3"><div><label>نرخ ۱۸ عیار</label><select name="rateMode"><option value="market">قیمت روز</option><option value="manual">دستی</option></select></div><div><label>نرخ دستی ۱۸</label><input name="rate18" inputmode="numeric"></div><div><label>نرخ دستی خالص (شمش)</label><input name="rate24" inputmode="numeric"></div>' +
      '<div><label>اجرت ٪</label><input name="feePct" inputmode="decimal"></div><div><label>سود ٪</label><input name="profitPct" inputmode="decimal"></div><div><label>کارمزد شمش ٪</label><input name="premiumPct" inputmode="decimal"></div></div></details>' +
      '<h3>مشتری</h3>' + partyBox('xqParty') + '<button class="btn" type="submit">📝 صدور پیش‌فاکتور</button></form></div>' +
      '<div class="card"><h2>📌 رزرو جنس برای مشتری</h2><form id="xrForm">' + itemPicker('xrItems') +
      '<div class="g2"><div><label>مدت رزرو (ساعت)</label><input name="hours" inputmode="numeric" value="24"></div></div><h3>مشتری *</h3>' + partyBox('xrParty') + '<button class="btn" type="submit">📌 رزرو کن</button></form></div></div>' +
      '<div class="card"><h2>پیش‌فاکتورها</h2><div class="tbl" id="xqTable"></div></div>' +
      '<div class="card"><h2>اقلام رزروشده</h2><div class="tbl" id="xrTable"></div></div>';

    $('t-xs').innerHTML =
      '<div class="card"><h2>📷 انبارگردانی</h2><p class="muted">کد هر کالا را با دوربین گوشی یا بارکدخوان بزنید. در پایان «ثبت انبارگردانی» را بزنید تا کسری و اضافه مشخص شود.</p>' +
      '<div class="row"><select id="xsBranch" style="max-width:200px"></select><button type="button" class="btn" id="xsCam">📷 اسکن پیوسته با دوربین</button><input id="xsInput" placeholder="یا کد را بزنید و Enter" style="max-width:260px"></div>' +
      '<div class="gsx-chips" id="xsList"></div><div class="row"><button type="button" class="btn" id="xsGo">✅ ثبت انبارگردانی</button><button type="button" class="btn ghost" id="xsClear">پاک کردن فهرست</button></div></div>' +
      '<div class="card" id="xsResult" style="display:none"></div>';

    $('t-xa').innerHTML =
      '<div class="g2"><div class="card"><h2>🔔 هشدار قیمت برای مشتری</h2><form id="xaForm"><div class="g2">' +
      '<div><label>کدام قیمت</label><select name="metric"><option value="rate18">طلای ۱۸ عیار (گرم)</option><option value="rate24">طلای خالص / شمش (گرم)</option><option value="mazaneh">مظنه</option><option value="emami">سکه امامی</option><option value="bahar">سکه بهار</option><option value="nim">نیم سکه</option><option value="rob">ربع سکه</option><option value="usd">دلار</option></select></div>' +
      '<div><label>وقتی قیمت</label><select name="dir"><option value="below">پایین‌تر از</option><option value="above">بالاتر از</option></select></div>' +
      '<div><label>قیمت هدف (تومان) *</label><input name="target" inputmode="numeric" required></div>' +
      '<div><label>موبایل (اگر مشتری ثبت‌شده نیست)</label><input name="phone" inputmode="tel"></div><div><label>نام</label><input name="name"></div>' +
      '</div><div><label>مشتری</label><select name="partyCode" id="xaParty"></select></div><p class="muted">پیامک هشدار با تنظیمات پیامکِ فروشگاه فرستاده می‌شود و بعد از یک بار ارسال خاموش می‌شود.</p><button class="btn" type="submit">💾 ذخیره‌ی هشدار</button></form></div>' +
      '<div class="card"><h2>📺 تابلوی قیمت مغازه</h2><p>این لینک را روی تلویزیون یا تبلت مغازه باز کنید؛ هر دقیقه خودکار تازه می‌شود.</p><div class="row"><input id="xaBoard" readonly style="flex:1;direction:ltr"><button type="button" class="btn ghost sm" id="xaCopy">کپی</button><a class="btn sm" id="xaOpen" target="_blank" rel="noopener">باز کردن</a></div></div></div>' +
      '<div class="card"><h2>هشدارهای فعال</h2><div class="tbl" id="xaTable"></div></div>';

    $('t-xc').innerHTML =
      '<div class="card"><h2>🧩 تنظیمات امکانات تکمیلی</h2><form id="xcForm"><div class="g2">' +
      '<div><label>سقف احراز هویت (تومان)</label><input name="kycThreshold" inputmode="numeric" placeholder="۰ = خاموش"><div class="muted">معامله‌ی بالاتر از این مبلغ فقط با کد ملی معتبر مشتری ثبت می‌شود.</div></div>' +
      '<div><label>اعتبار پیش‌فرض پیش‌فاکتور (ساعت)</label><input name="quoteHours" inputmode="decimal"></div>' +
      '<div><label>کارمزد پیش‌فرض فروش شمش (٪)</label><input name="bullionPremiumPct" inputmode="decimal"></div>' +
      '<div><label>کسر پیش‌فرض خرید شمش (٪)</label><input name="bullionBuyDeduction" inputmode="decimal"></div>' +
      '<div><label>مرچنت‌کد زرین‌پال</label><input name="zarinpalMerchant" style="direction:ltr" placeholder="xxxxxxxx-xxxx-…"><div class="muted">با پر کردن این مورد، دکمه‌ی «پرداخت آنلاین» کنار اقساط در صفحه‌ی مشتری فعال می‌شود. درگاه زرین‌پال اینماد لازم دارد.</div></div>' +
      '</div><button class="btn" type="submit">💾 ذخیره</button></form></div>';
    bind();
  }
  function itemPicker(id) {
    return '<div id="' + id + '"><div class="row"><input class="gsx-ic" placeholder="کد کالا یا اسکن" style="max-width:220px"><button type="button" class="btn ghost sm gsx-scanbtn gsx-ics">📷</button><select class="gsx-isel" style="flex:1"></select><button type="button" class="btn ghost sm gsx-iadd">➕</button></div><div class="gsx-chips gsx-ilist"></div></div>';
  }
  var PICK = {};
  function pickerInit(id) {
    PICK[id] = PICK[id] || [];
    var el = $(id);
    var add = function (code) {
      code = toEn(code).trim().toUpperCase(); if (!code) return;
      var it = inStock().find(function (r) { return String(r.code).toUpperCase() === code; });
      if (!it) { toast('کد ' + code + ' در موجودی (آزاد) نیست.', false); return; }
      if (PICK[id].indexOf(it.code) < 0) PICK[id].push(it.code); pickerDraw(id);
    };
    el.querySelector('.gsx-ic').onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); add(this.value); this.value = ''; } };
    el.querySelector('.gsx-ics').onclick = function () { Scan.open(add, true); };
    el.querySelector('.gsx-iadd').onclick = function () { add(el.querySelector('.gsx-isel').value); };
    el.querySelector('.gsx-ilist').onclick = function (e) { var b = e.target.closest('button[data-rm]'); if (b) { PICK[id].splice(Number(b.dataset.rm), 1); pickerDraw(id); } };
  }
  function pickerDraw(id) {
    var el = $(id); if (!el || !S) return;
    PICK[id] = (PICK[id] || []).filter(function (c) { return inStock().some(function (r) { return r.code === c; }); });
    el.querySelector('.gsx-isel').innerHTML = '<option value="">— انتخاب از موجودی —</option>' + inStock().filter(function (r) { return PICK[id].indexOf(r.code) < 0; }).map(function (r) { return '<option value="' + esc(r.code) + '">' + esc(r.title) + ' · ' + fa(r.weight, 3) + ' گرم · ' + esc(r.code) + '</option>'; }).join('');
    el.querySelector('.gsx-ilist').innerHTML = PICK[id].map(function (c, i) { var it = S.items.find(function (r) { return r.code === c; }); return '<span class="gsx-chip">' + esc(it ? it.title : c) + ' <span class="muted">' + esc(c) + '</span> <button type="button" data-rm="' + i + '">✖</button></span>'; }).join('') || '<span class="muted">هنوز کالایی انتخاب نشده.</span>';
  }

  function bind() {
    document.querySelectorAll('#app .gsx-scanbtn[data-scan]').forEach(function (b) {
      b.onclick = function () { var t = b.dataset.scan, inp = $(t) || b.closest('form').querySelector('[name=' + t + ']'); Scan.open(function (c) { inp.value = c; if (t === 'xbSerial') $('xbSerialGo').click(); }); };
    });
    ['xqItems', 'xrItems'].forEach(pickerInit);
    var price = function () {
      var f = $('xbBuy'), d = formData(f), w = Number(d.weight) || 0, pu = Number(d.purity) || 995;
      var r = d.rateMode === 'manual' ? Number(d.rate24) || 0 : (S && S.ext ? S.ext.pureRate : 0);
      var ded = d.deductionPct !== '' ? Number(d.deductionPct) || 0 : (S && S.ext ? S.ext.settings.bullionBuyDeduction : 0);
      $('xbBuyPrev').innerHTML = w && r ? 'طلای خالص: <b>' + fa(w * pu / 1000, 3) + '</b> گرم · مبلغ خرید: <b>' + fa(Math.round(w * pu / 1000 * r * (1 - ded / 100))) + '</b> تومان' : '';
    };
    $('xbBuy').oninput = price;
    $('xbBuy').onsubmit = function (e) { e.preventDefault(); var f = this; run('bullionBuy', Object.assign(formData(f), partyData('xbBuyParty'), { partyKind: 'customer' }), f.querySelector('button[type=submit]'), function () { f.reset(); price(); }); };
    $('xbSell').oninput = sellPreview;
    $('xbSell').onsubmit = function (e) {
      e.preventDefault(); var f = this, codes = [].map.call(f.querySelectorAll('input[name=bar]:checked'), function (c) { return c.value; });
      if (!codes.length) { toast('حداقل یک شمش انتخاب کنید.', false); return; }
      var d = formData(f); delete d.bar;
      run('bullionSell', Object.assign(d, partyData('xbSellParty'), { itemCodes: codes }), f.querySelector('button[type=submit]'), function (r) { f.reset(); if (r.invoiceHtml) showPrint(r.invoiceHtml); });
    };
    $('xbSerialGo').onclick = function () { run('serialFind', { serial: toEn($('xbSerial').value) }, this, function (r) { var x = r.ext.serialResult || { items: [], txs: [] }; $('xbSerialRes').innerHTML = tbl([['کالا', function (it) { return esc(it.title) + ' <span class="muted">' + esc(it.code) + '</span>'; }], ['سریال', function (it) { return esc(it.cert); }], ['وضعیت', function (it) { return esc(ST[it.status] || it.status); }], ['تأمین', function (it) { return esc(it.supplier || ''); }]], x.items, 'در موجودی پیدا نشد.') + '<h3>معاملات</h3>' + tbl([['تاریخ', function (t) { return esc(t.dateFa); }], ['شرح', function (t) { return esc(t.title); }], ['طرف حساب', function (t) { return esc(t.customerName || ''); }], ['یادداشت', function (t) { return esc(t.note); }], ['فاکتور', function (t) { return esc(t.invoice || ''); }]], x.txs, 'معامله‌ای پیدا نشد.'); }); };
    $('xqForm').onsubmit = function (e) {
      e.preventDefault(); var f = this; if (!PICK.xqItems.length) { toast('کالاهای پیش‌فاکتور را انتخاب کنید.', false); return; }
      var d = formData(f); d.rateMode24 = d.rate24 ? 'manual' : 'market';
      run('quote', Object.assign(d, partyData('xqParty'), { itemCodes: PICK.xqItems.slice() }), f.querySelector('button[type=submit]'), function (r) { PICK.xqItems = []; f.reset(); if (r.ext.quote) showPrint(quoteHtml(r.ext.quote)); });
    };
    $('xrForm').onsubmit = function (e) {
      e.preventDefault(); var f = this; if (!PICK.xrItems.length) { toast('کالاهای رزرو را انتخاب کنید.', false); return; }
      run('reserve', Object.assign(formData(f), partyData('xrParty'), { itemCodes: PICK.xrItems.slice() }), f.querySelector('button[type=submit]'), function () { PICK.xrItems = []; f.reset(); });
    };
    $('xqTable').onclick = function (e) {
      var b = e.target.closest('button[data-q]'); if (!b) return; var q = (S.ext.quotes || []).find(function (x) { return x.code === b.dataset.q; }); if (!q) return;
      if (b.dataset.a === 'print') showPrint(quoteHtml(q));
      if (b.dataset.a === 'cancel' && confirm('پیش‌فاکتور ' + q.code + ' باطل شود؟')) run('quoteCancel', { code: q.code }, b);
      if (b.dataset.a === 'sell') saleDialog({ codes: q.lines.map(function (l) { return l.code; }), bullion: q.lines.some(function (l) { return l.bullion; }), quoteCode: q.code, partyCode: q.partyCode, title: 'فروش با پیش‌فاکتور ' + q.code + ' — ' + fa(q.total) + ' تومان' });
    };
    $('xrTable').onclick = function (e) {
      var b = e.target.closest('button[data-r]'); if (!b) return; var r = (S.ext.reservations || []).find(function (x) { return x.code === b.dataset.r; }); if (!r) return;
      if (b.dataset.a === 'free') run('unreserve', { itemCodes: [r.code] }, b);
      if (b.dataset.a === 'sell') { var it = S.items.find(function (x) { return x.code === r.code; }); saleDialog({ codes: [r.code], bullion: it && it.metal === 'bullion', quoteCode: r.quote, partyCode: r.party, title: 'فروش «' + r.title + '» به ' + (r.partyName || 'مشتری') }); }
    };
    var SC = [];
    var drawSC = function () { $('xsList').innerHTML = SC.map(function (c, i) { var it = (S && S.items || []).find(function (r) { return String(r.code).toUpperCase() === c; }); return '<span class="gsx-chip">' + esc(c) + (it ? ' · ' + esc(it.title) : ' · ❓') + ' <button type="button" data-rm="' + i + '">✖</button></span>'; }).join('') || '<span class="muted">هنوز کدی اسکن نشده.</span>'; Scan.setList('اسکن‌شده: ' + fa(SC.length)); };
    var addSC = function (c) { c = toEn(c).trim().toUpperCase(); if (c && SC.indexOf(c) < 0) { SC.push(c); drawSC(); } };
    $('xsCam').onclick = function () { Scan.open(addSC, true); };
    $('xsInput').onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); addSC(this.value); this.value = ''; } };
    $('xsList').onclick = function (e) { var b = e.target.closest('button[data-rm]'); if (b) { SC.splice(Number(b.dataset.rm), 1); drawSC(); } };
    $('xsClear').onclick = function () { if (confirm('فهرست اسکن پاک شود؟')) { SC = []; drawSC(); } };
    $('xsGo').onclick = function () {
      if (!SC.length) { toast('هنوز کدی اسکن نشده.', false); return; }
      run('stockCount', { codes: SC.slice(), branch: $('xsBranch').value }, this, function (r) {
        var x = r.ext.stockResult; SC = []; drawSC();
        $('xsResult').style.display = '';
        $('xsResult').innerHTML = '<h2>نتیجه‌ی انبارگردانی</h2><div class="kpis">' + kpi('پیدا شد', fa(x.matched) + ' از ' + fa(x.expected)) + kpi('کسری', '<span class="' + (x.missing.length ? 'neg' : 'pos') + '">' + fa(x.missing.length) + ' قلم</span>', fa(x.goldMissing, 3) + ' گرم معادل ۱۸') + kpi('کد اضافه / ناشناس', fa(x.extra.length)) + '</div>' +
          '<h3>کسری (در سیستم هست، اسکن نشد)</h3>' + tbl([['کد', function (i) { return esc(i.code); }], ['کالا', function (i) { return esc(i.title); }], ['وزن', function (i) { return fa(i.weight, 3); }], ['عیار', function (i) { return fa(i.karat); }], ['شعبه', function (i) { return esc(i.branch); }]], x.missing, 'کسری ندارد ✅') +
          '<h3>اضافه (اسکن شد ولی در موجودی نیست)</h3>' + tbl([['کد', function (i) { return esc(i.code); }], ['کالا', function (i) { return esc(i.title); }], ['وضعیت در سیستم', function (i) { return esc(ST[i.status] || 'ثبت‌نشده'); }]], x.extra, 'اضافه ندارد ✅');
      });
    };
    drawSC();
    $('xaForm').onsubmit = function (e) { e.preventDefault(); var f = this; run('alertSave', formData(f), f.querySelector('button[type=submit]'), function () { f.reset(); }); };
    $('xaTable').onclick = function (e) { var b = e.target.closest('button[data-al]'); if (b && confirm('این هشدار حذف شود؟')) run('alertDelete', { code: b.dataset.al }, b); };
    $('xaCopy').onclick = function () { var i = $('xaBoard'); i.select(); try { navigator.clipboard.writeText(i.value); } catch (er) { document.execCommand('copy'); } toast('لینک تابلو کپی شد.'); };
    $('xcForm').onsubmit = function (e) { e.preventDefault(); var f = this; run('extSettings', formData(f), f.querySelector('button[type=submit]')); };
  }
  var ST = { in_stock: 'موجود', sold: 'فروخته شد', melted: 'ذوب شد', workshop: 'در کارگاه', returned: 'برگشت به بنکدار', 'void': 'باطل', reserved: 'رزرو', unknown: 'ثبت‌نشده' };
  function sellPreview() {
    if (!S || !S.ext) return;
    var f = $('xbSell'), d = formData(f), codes = [].map.call(f.querySelectorAll('input[name=bar]:checked'), function (c) { return c.value; });
    var r = d.rateMode === 'manual' ? Number(d.rate24) || 0 : S.ext.pureRate, prem = d.premiumPct !== '' ? Number(d.premiumPct) || 0 : S.ext.settings.bullionPremiumPct;
    var sum = codes.reduce(function (s, c) { var it = S.items.find(function (x) { return x.code === c; }); return s + (it ? Math.round(Math.round(pureG(it) * 1000) / 1000 * r) * (1 + prem / 100) : 0); }, 0);
    $('xbSellPrev').innerHTML = codes.length ? 'جمع فاکتور (بدون مالیات): <b>' + fa(Math.round(sum)) + '</b> تومان' : '';
  }
  function quoteHtml(q) {
    var shop = (S && S.settings && S.settings.shopName) || '';
    return '<div style="direction:rtl;font-family:Vazirmatn,Tahoma,sans-serif;max-width:640px;margin:auto;border:1px solid #eee;border-radius:14px;overflow:hidden">' +
      '<div style="background:linear-gradient(135deg,#b8860b,#7a5901);color:#fff;padding:14px 18px"><b style="font-size:18px">' + esc(shop) + '</b><div style="font-size:12px;opacity:.9">پیش‌فاکتور ' + esc(q.code) + ' · ' + esc(q.dateFa) + ' ' + esc(q.time) + '</div></div><div style="padding:12px 16px">' +
      '<div>مشتری: <b>' + esc(q.partyName || 'مشتری گذری') + '</b></div><div style="color:#b42318;margin:6px 0">⏳ قیمت تا ' + fa(q.hours, 2) + ' ساعت از زمان صدور معتبر است.</div>' +
      '<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:#faf6ec"><th style="padding:6px;border:1px solid #eee">شرح</th><th style="padding:6px;border:1px solid #eee">وزن</th><th style="padding:6px;border:1px solid #eee">عیار</th><th style="padding:6px;border:1px solid #eee">مبلغ (تومان)</th></tr>' +
      q.lines.map(function (l) { return '<tr><td style="padding:6px;border:1px solid #eee">' + esc(l.title) + '</td><td style="padding:6px;border:1px solid #eee">' + fa(l.weight, 3) + '</td><td style="padding:6px;border:1px solid #eee">' + fa(l.karat, 1) + '</td><td style="padding:6px;border:1px solid #eee">' + fa(l.price) + '</td></tr>'; }).join('') +
      '</table><div style="text-align:left;font-size:16px;margin-top:10px">جمع: <b style="color:#b8860b">' + fa(q.total) + ' تومان</b></div><div style="font-size:11px;color:#777;margin-top:8px">نرخ مبنا: ۱۸ عیار ' + fa(q.rate18) + ' · خالص ' + fa(q.rate24) + ' تومان · مالیات بر ارزش افزوده در صورت تعلق جداگانه محاسبه می‌شود.</div></div></div>';
  }
  function saleDialog(o) {
    var html = '<h3>' + esc(o.title) + '</h3><form id="xdSale"><div class="g2"><div><label>روش پرداخت</label>' + PAY + '</div><div><label>مبلغ پرداختی الان</label><input name="paid" inputmode="numeric" placeholder="خالی = کامل"></div><div><label>کد ملی خریدار</label><input name="nationalId" inputmode="numeric"></div><div><label>&nbsp;</label><label class="row"><input type="checkbox" name="vatOn"> مالیات بر ارزش افزوده</label></div></div>' +
      (o.partyCode ? '' : '<h3>خریدار</h3>' + partyBox('xdParty')) + '<button class="btn" type="submit">✅ صدور فاکتور</button></form>';
    showPrint(html); if (!o.partyCode) fillParty('xdParty', ['customer']);
    $('xdSale').onsubmit = function (e) {
      e.preventDefault(); var d = Object.assign(formData(this), o.partyCode ? { partyMode: 'existing', partyCode: o.partyCode } : partyData('xdParty'), { itemCodes: o.codes, quoteCode: o.quoteCode || '' });
      if (!o.quoteCode && !o.bullion) d.rateMode = 'market';
      run(o.bullion ? 'bullionSell' : 'sell', d, this.querySelector('button[type=submit]'), function (r) { if (r.invoiceHtml) showPrint(r.invoiceHtml); else $('modal').style.display = 'none'; });
    };
  }
  // فیلدهای تکمیلی در فرم‌های اصلی + دکمه‌ی دوربین کنار جستجوی کالا
  function inject() {
    var addField = function (formId, name, label, ph) {
      var f = $(formId); if (!f || f.querySelector('[name=' + name + ']')) return;
      var g = f.querySelector('.g2, .g3'); if (!g) return;
      var d = document.createElement('div'); d.className = 'gsx-f-' + name; d.innerHTML = '<label>' + label + '</label><input name="' + name + '" placeholder="' + (ph || '') + '"' + (name === 'nationalId' ? ' inputmode="numeric"' : '') + '>'; g.appendChild(d);
    };
    ['sellForm', 'buyForm', 'coinSellForm', 'coinBuyForm', 'abBuyForm', 'abSellForm'].forEach(function (id) { addField(id, 'nationalId', 'کد ملی طرف معامله', 'برای معامله‌ی بالای سقف'); });
    ['coinBuyForm', 'coinSellForm'].forEach(function (id) { addField(id, 'serials', 'سریال سکه‌ها', 'با کاما جدا کنید'); });
    var s = $('itemSearch');
    if (s && !$('gsxSellScan')) {
      var b = document.createElement('button'); b.type = 'button'; b.id = 'gsxSellScan'; b.className = 'btn ghost sm gsx-scanbtn'; b.textContent = '📷 اسکن';
      b.onclick = function () { Scan.open(function (code) { s.value = code; s.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); }, true); };
      s.parentNode.insertBefore(b, s.nextSibling);
    }
  }

  function renderAll() {
    if (!S || !S.ext || !$('t-xb')) return;
    var X = S.ext, hide = role() === 'seller';
    document.querySelectorAll('.gsx-f-nationalId').forEach(function (d) { d.style.display = X.settings.kycThreshold > 0 ? '' : 'none'; });
    ['xbBuyParty', 'xbSellParty', 'xqParty', 'xrParty'].forEach(function (id) { fillParty(id, id === 'xbBuyParty' ? ['customer', 'supplier'] : ['customer'], true); });
    ['xqItems', 'xrItems'].forEach(pickerDraw);
    // شمش
    $('xbKpis').innerHTML = kpi('شمش در موجودی', fa(X.bullion.count) + ' عدد') + kpi('طلای خالص', fa(X.bullion.pure, 3) + ' گرم') + kpi('ارزش روز', fa(X.bullion.value) + ' تومان') + (hide ? '' : kpi('بهای خرید', fa(X.bullion.cost) + ' تومان', 'سود/زیان نوسان: ' + fa(X.bullion.value - X.bullion.cost))) + kpi('هر گرم خالص', fa(X.pureRate) + ' تومان');
    var free = bars().filter(function (r) { return r.status === 'in_stock'; });
    var checked = [].map.call(document.querySelectorAll('#xbPick input[name=bar]:checked'), function (c) { return c.value; });
    $('xbPick').innerHTML = free.length ? '<table><tr><th></th><th>شمش</th><th>سریال</th><th>خالص (گرم)</th></tr>' + free.map(function (r) { return '<tr><td><input type="checkbox" name="bar" value="' + esc(r.code) + '"' + (checked.indexOf(r.code) >= 0 ? ' checked' : '') + '></td><td>' + esc(r.title) + '</td><td>' + esc(r.cert || '—') + '</td><td>' + fa(pureG(r), 3) + '</td></tr>'; }).join('') + '</table>' : '<div class="muted">شمش آزاد در موجودی نیست.</div>';
    sellPreview();
    $('xbTable').innerHTML = tbl([['کد', function (r) { return esc(r.code); }], ['شمش', function (r) { return esc(r.title); }], ['سریال', function (r) { return esc(r.cert || '—'); }], ['وزن', function (r) { return fa(r.weight, 3); }], ['عیار', function (r) { return fa(r.karat, 1); }], ['خالص', function (r) { return fa(pureG(r), 3); }], ['ارزش روز', function (r) { return fa(pureG(r) * X.pureRate); }]].concat(hide ? [] : [['بهای خرید', function (r) { return fa(r.buyCost); }]]).concat([['وضعیت', function (r) { return r.status === 'reserved' ? '<span class="badge">رزرو</span>' : 'موجود'; }]]), bars(), 'هنوز شمشی ثبت نشده.');
    // پیش‌فاکتور و رزرو
    var QS = { open: 'باز', sold: 'فروخته شد', cancelled: 'باطل' };
    $('xqTable').innerHTML = tbl([['کد', function (q) { return esc(q.code); }], ['مشتری', function (q) { return esc(q.partyName || 'گذری'); }], ['اقلام', function (q) { return fa(q.lines.length); }], ['مبلغ', function (q) { return fa(q.total); }], ['مهلت', function (q) { return q.status === 'open' ? left(q.until) : '—'; }], ['وضعیت', function (q) { return esc(QS[q.status] || q.status); }],
      ['', function (q) { return '<button type="button" class="btn ghost sm" data-q="' + esc(q.code) + '" data-a="print">🖨️</button>' + (q.status === 'open' && !q.expired ? ' <button type="button" class="btn sm" data-q="' + esc(q.code) + '" data-a="sell">فروش</button> <button type="button" class="btn ghost sm" data-q="' + esc(q.code) + '" data-a="cancel">ابطال</button>' : ''); }]], X.quotes || [], 'پیش‌فاکتوری نیست.');
    $('xrTable').innerHTML = tbl([['کالا', function (r) { return esc(r.title) + ' <span class="muted">' + esc(r.code) + '</span>'; }], ['برای', function (r) { return esc(r.partyName || r.party || '—'); }], ['تا', function (r) { return left(r.until); }], ['ثبت‌کننده', function (r) { return esc(r.by); }], ['پیش‌فاکتور', function (r) { return esc(r.quote || '—'); }],
      ['', function (r) { return '<button type="button" class="btn sm" data-r="' + esc(r.code) + '" data-a="sell">فروش</button> <button type="button" class="btn ghost sm" data-r="' + esc(r.code) + '" data-a="free">آزاد کن</button>'; }]], X.reservations || [], 'چیزی رزرو نیست.');
    // انبارگردانی
    var brs = String((S.settings && S.settings.branches) || '').split(/[,،]/).map(function (b) { return b.trim(); }).filter(Boolean), bs = $('xsBranch'), bv = bs.value;
    bs.innerHTML = '<option value="">همه‌ی شعبه‌ها</option>' + brs.map(function (b) { return '<option>' + esc(b) + '</option>'; }).join(''); bs.value = bv; bs.style.display = brs.length ? '' : 'none';
    // هشدار و تابلو
    var ap = $('xaParty'), av = ap.value;
    ap.innerHTML = '<option value="">— مشتری ثبت‌شده (اختیاری) —</option>' + (S.parties || []).filter(function (c) { return (c.kind || 'customer') === 'customer' && c.phone; }).map(function (c) { return '<option value="' + esc(c.code) + '">' + esc(c.name) + ' · ' + esc(c.phone) + '</option>'; }).join(''); ap.value = av;
    var MF = { rate18: 'طلای ۱۸', rate24: 'طلای خالص', mazaneh: 'مظنه', emami: 'سکه امامی', bahar: 'سکه بهار', nim: 'نیم سکه', rob: 'ربع سکه', usd: 'دلار' };
    $('xaTable').innerHTML = tbl([['مشتری', function (a) { return esc(a.name || '—') + ' <span class="muted">' + esc(a.phone) + '</span>'; }], ['قیمت', function (a) { return esc(MF[a.metric] || a.metric); }], ['شرط', function (a) { return (a.dir === 'below' ? 'زیر ' : 'بالای ') + fa(a.target); }], ['وضعیت', function (a) { return a.active === 'yes' ? 'فعال' : '<span class="pos">ارسال شد</span>'; }], ['', function (a) { return '<button type="button" class="btn ghost sm" data-al="' + esc(a.code) + '">حذف</button>'; }]], X.alerts || [], 'هشداری ثبت نشده.');
    var board = C.board ? C.board + (C.mode === 'app' ? '?shop=' + encodeURIComponent(shopSlug()) : '') : '';
    $('xaBoard').value = board; $('xaOpen').href = board;
    // تنظیمات
    var cf = $('xcForm'); if (cf && !cf._filled) { cf._filled = true; cf.kycThreshold.value = X.settings.kycThreshold || ''; cf.quoteHours.value = X.settings.quoteHours || ''; cf.bullionPremiumPct.value = X.settings.bullionPremiumPct || ''; cf.bullionBuyDeduction.value = X.settings.bullionBuyDeduction || ''; cf.zarinpalMerchant.placeholder = X.settings.zarinpalSet ? '(ثبت شده؛ برای تغییر کد تازه را وارد کنید)' : 'xxxxxxxx-xxxx-…'; }
    // نقش‌ها
    document.querySelectorAll('#app [data-roles]').forEach(function (el) { el.style.display = el.dataset.roles.split(',').indexOf(role()) >= 0 ? '' : 'none'; });
    // بعد از تازه شدن صفحه، به تب مقصد برگرد
    try { var go = sessionStorage.getItem('gsx_go'); if (go) { sessionStorage.removeItem('gsx_go'); var nb = document.querySelector('#nav button[data-t="' + go + '"]'); if (nb) nb.click(); } } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
