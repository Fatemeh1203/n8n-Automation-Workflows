#!/usr/bin/env python3
"""عملیات update_workflow برای افزودن نودهای جدید به ورک‌فلوی «سطح سه (پروژه طلافروش)»."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent
B = lambda f: (ROOT / 'build' / f).read_text(encoding='utf-8')
MARKET = 'https://raw.githubusercontent.com/iran-market/iran-market.github.io/main/data/latest-toman.json'
HTML_H = {'responseHeaders': {'entries': [{'name': 'Content-Type', 'value': 'text/html; charset=utf-8'}, {'name': 'Cache-Control', 'value': 'no-store'}]}}

def hook(name, path, x, y):
    return {'type': 'addNode', 'node': {'name': name, 'type': 'n8n-nodes-base.webhook', 'typeVersion': 2.1, 'position': [x, y], 'parameters': {'httpMethod': 'GET', 'path': path, 'responseMode': 'responseNode', 'options': {}}}}
def table(name, t, x, y):
    return {'type': 'addNode', 'node': {'name': name, 'type': 'n8n-nodes-base.dataTable', 'typeVersion': 1.1, 'position': [x, y], 'parameters': {'resource': 'row', 'operation': 'get', 'dataTableId': {'__rl': True, 'mode': 'name', 'value': t}, 'returnAll': True}}}
def market(name, x, y):
    return {'type': 'addNode', 'node': {'name': name, 'type': 'n8n-nodes-base.httpRequest', 'typeVersion': 4.4, 'position': [x, y], 'parameters': {'method': 'GET', 'url': MARKET, 'authentication': 'none', 'options': {'timeout': 20000, 'response': {'response': {'responseFormat': 'json'}}}}}}
def code(name, f, x, y):
    return {'type': 'addNode', 'node': {'name': name, 'type': 'n8n-nodes-base.code', 'typeVersion': 2, 'position': [x, y], 'parameters': {'mode': 'runOnceForAllItems', 'language': 'javaScript', 'jsCode': B(f)}}}
def html(name, x, y):
    return {'type': 'addNode', 'node': {'name': name, 'type': 'n8n-nodes-base.respondToWebhook', 'typeVersion': 1.5, 'position': [x, y], 'parameters': {'respondWith': 'text', 'responseBody': '={{ $json.html }}', 'options': HTML_H}}}
def zp(name, url, x, y):
    return {'type': 'addNode', 'node': {'name': name, 'type': 'n8n-nodes-base.httpRequest', 'typeVersion': 4.4, 'position': [x, y], 'parameters': {'method': 'POST', 'url': url, 'authentication': 'none', 'sendBody': True, 'contentType': 'json', 'specifyBody': 'json', 'jsonBody': '={{ JSON.stringify($json.body) }}', 'options': {'timeout': 20000, 'response': {'response': {'neverError': True, 'responseFormat': 'json'}}}}}}
def iff(name, field, x, y):
    return {'type': 'addNode', 'node': {'name': name, 'type': 'n8n-nodes-base.if', 'typeVersion': 2.2, 'position': [x, y], 'parameters': {'conditions': {'options': {'caseSensitive': True, 'leftValue': '', 'typeValidation': 'loose', 'version': 2}, 'conditions': [{'leftValue': '={{ $json.%s }}' % field, 'rightValue': '', 'operator': {'type': 'boolean', 'operation': 'true', 'singleValue': True}}], 'combinator': 'and'}, 'options': {}}}}
def con(a, b, i=0, t=0):
    return {'type': 'addConnection', 'source': a, 'target': b, 'sourceIndex': i, 'targetIndex': t}
def settings(name, value):
    return {'type': 'setNodeSettings', 'nodeName': name, 'settings': value}

Y = 4300
ops = []
# 📺 تابلوی قیمت
ops += [hook('Board Page', 'gold-board', 0, Y), table('Board Settings', 'gs_settings', 224, Y), market('Board Market', 448, Y), code('Build Board', 'board.js', 672, Y), html('Send Board', 896, Y)]
ops += [con('Board Page', 'Board Settings'), con('Board Settings', 'Board Market'), con('Board Market', 'Build Board'), con('Build Board', 'Send Board')]
# 🔔 هشدار قیمت
Y2 = Y + 220
ops += [{'type': 'addNode', 'node': {'name': 'Price Alerts 30m', 'type': 'n8n-nodes-base.scheduleTrigger', 'typeVersion': 1.3, 'position': [0, Y2], 'parameters': {'rule': {'interval': [{'field': 'minutes', 'minutesInterval': 30}]}}}},
        table('Alert Settings', 'gs_settings', 224, Y2), market('Alert Market', 448, Y2), code('Check Alerts', 'alerts.js', 672, Y2)]
ops += [con('Price Alerts 30m', 'Alert Settings'), con('Alert Settings', 'Alert Market'), con('Alert Market', 'Check Alerts'), con('Check Alerts', 'Expand Writes')]
# 💳 شروع پرداخت
Y3 = Y2 + 220
ops += [hook('Pay Start', 'gold-pay', 0, Y3), table('Pay Settings', 'gs_settings', 224, Y3), table('Pay Customers', 'gs_customers', 448, Y3), table('Pay Installments', 'gs_installments', 672, Y3),
        code('Pay Prepare', 'pay-start.js', 896, Y3), iff('Pay OK?', 'ok', 1120, Y3), zp('Zarinpal Request', 'https://payment.zarinpal.com/pg/v4/payment/request.json', 1344, Y3 - 80),
        code('Pay Redirect', 'pay-redirect.js', 1568, Y3 - 80), html('Send Pay Page', 1792, Y3)]
ops += [con('Pay Start', 'Pay Settings'), con('Pay Settings', 'Pay Customers'), con('Pay Customers', 'Pay Installments'), con('Pay Installments', 'Pay Prepare'), con('Pay Prepare', 'Pay OK?'),
        con('Pay OK?', 'Zarinpal Request', 0), con('Pay OK?', 'Send Pay Page', 1), con('Zarinpal Request', 'Pay Redirect'), con('Pay Redirect', 'Send Pay Page'), con('Pay Redirect', 'Expand Writes')]
# 💳 برگشت از درگاه
Y4 = Y3 + 260
ops += [hook('Pay Callback', 'gold-pay-cb', 0, Y4), table('Cb Settings', 'gs_settings', 224, Y4), table('Cb Installments', 'gs_installments', 448, Y4), code('Pay Check', 'pay-check.js', 672, Y4),
        iff('Verify?', 'verify', 896, Y4), zp('Zarinpal Verify', 'https://payment.zarinpal.com/pg/v4/payment/verify.json', 1120, Y4 - 80), code('Pay Finish', 'pay-finish.js', 1344, Y4 - 80), html('Send Cb Page', 1568, Y4)]
ops += [con('Pay Callback', 'Cb Settings'), con('Cb Settings', 'Cb Installments'), con('Cb Installments', 'Pay Check'), con('Pay Check', 'Verify?'), con('Pay Check', 'Expand Writes'),
        con('Verify?', 'Zarinpal Verify', 0), con('Verify?', 'Send Cb Page', 1), con('Zarinpal Verify', 'Pay Finish'), con('Pay Finish', 'Send Cb Page'), con('Pay Finish', 'Expand Writes')]
# نودهای خواندنی فقط یک بار اجرا شوند و خروجیِ خالی هم ادامه دهد
for n in ['Board Settings', 'Alert Settings', 'Pay Settings', 'Pay Customers', 'Pay Installments', 'Cb Settings', 'Cb Installments']:
    ops.append(settings(n, {'executeOnce': True, 'alwaysOutputData': True}))
for n in ['Board Market', 'Alert Market']:
    ops.append(settings(n, {'executeOnce': True, 'onError': 'continueRegularOutput'}))
for n in ['Zarinpal Request', 'Zarinpal Verify']:
    ops.append(settings(n, {'onError': 'continueRegularOutput'}))
# 🧩 فایل امکانات تکمیلی پنل
Y5 = Y4 + 220
ops += [hook('Admin Ext JS', 'gold-admin-ext', 0, Y5),
        {'type': 'addNode', 'node': {'name': 'Send Ext JS', 'type': 'n8n-nodes-base.respondToWebhook', 'typeVersion': 1.5, 'position': [224, Y5], 'parameters': {'respondWith': 'text', 'responseBody': '// loading', 'options': {'responseHeaders': {'entries': [{'name': 'Content-Type', 'value': 'application/javascript; charset=utf-8'}, {'name': 'Cache-Control', 'value': 'no-store'}]}}}}},
        con('Admin Ext JS', 'Send Ext JS')]
ops.append({'type': 'addNode', 'node': {'name': 'Sticky Note ext', 'type': 'n8n-nodes-base.stickyNote', 'typeVersion': 1, 'position': [-40, Y - 160], 'parameters': {'width': 1900, 'height': 1260, 'color': 5, 'content': '## 🧩 امکانات تکمیلی (۱۴۰۵/۰۷)\nتابلوی قیمت: /webhook/gold-board · هشدار قیمت هر ۳۰ دقیقه (پیامک) · پرداخت آنلاین اقساط با زرین‌پال: /webhook/gold-pay و /webhook/gold-pay-cb · فایل تب‌های جدید پنل: /webhook/gold-admin-ext\nکد منبع و تست‌ها: ریپوی خصوصی gold-shop-app، پوشه‌ی main-project'}}})
(ROOT / 'build/ops1.json').write_text(json.dumps(ops, ensure_ascii=False), encoding='utf-8')
print(len(ops), 'ops', len(json.dumps(ops, ensure_ascii=False)), 'chars')
