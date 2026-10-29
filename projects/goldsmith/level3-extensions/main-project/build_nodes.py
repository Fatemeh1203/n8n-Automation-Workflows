#!/usr/bin/env python3
"""ساخت کد نودهای جدید پروژه‌ی اصلی: تابلو، هشدار، پرداخت، و پرتال مشتری با دکمه‌ی پرداخت."""
import pathlib
ROOT = pathlib.Path(__file__).resolve().parent
SH = ROOT.parent / 'backend/src/shared'
rd = lambda p: p.read_text(encoding='utf-8')
util, market, board, alerts, pay = (rd(SH / f) for f in ('util.js', 'market.js', 'board.js', 'alerts.js', 'pay.js'))
NODES = {
    'board.js': util + market + board,
    'alerts.js': util + market + alerts,
    'pay-start.js': util + pay,
    'pay-redirect.js': util + pay,
    'pay-check.js': util + pay,
    'pay-finish.js': util + pay,
}
out = ROOT / 'build'
out.mkdir(exist_ok=True)
for name, prefix in NODES.items():
    (out / name).write_text(prefix + '\n' + rd(ROOT / 'src' / name), encoding='utf-8')

# پرتال مشتری: ستون «پرداخت آنلاین» برای اقساط باز
portal = rd(ROOT / 'vendor/build-portal.live.js')
old_h = "<th>پرداخت‌شده</th></tr>' + inst.map("
old_r = "'</td><td>' + fa(x.paid) + '</td></tr>'; }).join('') + '</table></div></div>' : '') +"
assert portal.count(old_h) == 1 and portal.count(old_r) == 1, 'portal anchors'
portal = portal.replace(old_h, "<th>پرداخت‌شده</th>' + (cfg.zarinpalMerchant ? '<th></th>' : '') + '</tr>' + inst.map(")
portal = portal.replace(old_r, "'</td><td>' + fa(x.paid) + '</td>' + (cfg.zarinpalMerchant ? '<td><a href=\"https://n8n.aifardainstitute.ir/webhook/gold-pay?c=' + encodeURIComponent(code) + '&t=' + encodeURIComponent(tok) + '&q=' + encodeURIComponent(x.code) + '\" style=\"background:#b8860b;color:#fff;padding:3px 10px;border-radius:8px;text-decoration:none;white-space:nowrap\">💳 پرداخت آنلاین</a></td>' : '') + '</tr>'; }).join('') + '</table></div></div>' : '') +")
(out / 'build-portal.js').write_text(portal, encoding='utf-8')
print('ok', sorted(p.name for p in out.iterdir()))

# پنل: بارگذاری امکانات تکمیلی قبل از app.js
panel = rd(ROOT / 'vendor/panel.live.html')
tag = '<script src="https://n8n.aifardainstitute.ir/webhook/gold-admin-app"></script>'
assert panel.count(tag) == 1
panel = panel.replace(tag, '<script src="https://n8n.aifardainstitute.ir/webhook/gold-admin-ext"></script>\n' + tag)
(out / 'panel.html').write_text(panel, encoding='utf-8')
conf = "window.GSX_CONF = { api: 'https://n8n.aifardainstitute.ir/webhook/gold-admin-api', board: 'https://n8n.aifardainstitute.ir/webhook/gold-board', mode: 'main' };\n"
(out / 'ext.js').write_text(conf + rd(ROOT.parent / 'web/ext.js'), encoding='utf-8')
print('panel.html + ext.js')
