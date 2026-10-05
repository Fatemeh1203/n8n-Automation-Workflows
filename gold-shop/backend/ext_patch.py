"""وصله‌ی «امکانات تکمیلی» روی منطق کسب‌وکار طلافروشی.

هم روی کپیِ اپ (هسته‌ی مشترک) و هم روی «Business Logic» پنل سطح ۳ پروژه‌ی اصلی اعمال می‌شود.
هر جایگزینی باید دقیقاً یک بار پیدا شود؛ وگرنه ساخت با خطا متوقف می‌شود.
"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent
HELPERS = (ROOT / 'src/ext/helpers.js').read_text(encoding='utf-8')


class Patcher:
    def __init__(self, code):
        self.code = code

    def sub(self, old, new, count=1):
        n = self.code.count(old)
        if n != count:
            raise SystemExit(f'ext patch failed ({n} matches, expected {count}): {old[:90]!r}')
        self.code = self.code.replace(old, new)

    def resub(self, pattern, repl):
        self.code, n = re.subn(pattern, repl, self.code, count=1, flags=re.S)
        if n != 1:
            raise SystemExit(f'ext regex patch failed: {pattern[:90]!r}')


def apply_ext(code):
    x = Patcher(code)
    # توابع امکانات تکمیلی، قبل از بخش احراز هویت
    x.sub('const nowMs = Date.now();\n', HELPERS + '\nconst nowMs = Date.now();\n')
    # نقش‌ها
    x.sub("'goldSave', 'closeDay'];", "'goldSave', 'closeDay', 'bullionSell', 'quote', 'reserve', 'unreserve', 'stockCount', 'serialFind'];")
    x.sub("'restore', 'portalReset'];", "'restore', 'portalReset', 'extSettings'];")
    # بعد از احراز هویت: آزاد کردن رزروهای منقضی
    x.resub(r"(\nif \(!allowed\(me\.role, A\)\) error = [^\n]*\n)", r"\1extInit();\n")
    # فروش عادی: پیش‌فاکتور/رزرو، و شمش فقط از بخش شمش
    x.sub("} else if (A === 'sell') {\n", "} else if (A === 'sell') {\n    const extQ = extBeforeSell(false);\n")
    x.sub("if (!codes.length || sel.some(function (x) { return !x; })) throw new Error('کالای انتخاب‌شده در موجودی نیست.');\n",
          "if (!codes.length || sel.some(function (x) { return !x; })) throw new Error('کالای انتخاب‌شده در موجودی نیست.');\n"
          "    if (sel.some(function (x) { return x.metal === 'bullion'; })) throw new Error('برای فروش شمش از بخش «شمش» استفاده کنید.');\n")
    x.resub(r"(\n    finishSale\(inv, party, lines\.map\(function \(l\) \{ return \{ title: l\.it\.title \+ \(l\.stone \? [^\n]*\n)", r"\1    extAfterSell(extQ, inv);\n")
    # احراز هویت معاملات بزرگ
    x.sub("  const due = payable - paid;\n", "  const due = payable - paid;\n  kycCheck(party, total);\n")
    x.sub("    const r = addBuyback(p, party, inv, rate);\n", "    const r = addBuyback(p, party, inv, rate);\n    kycCheck(party, r.price);\n")
    x.sub("    const amount = Math.round(unit * qty), batch = newCode('CB');\n", "    const amount = Math.round(unit * qty), batch = newCode('CB');\n    kycCheck(party, amount);\n")
    # سریال سکه (و هر معامله‌ی تعدادی)
    x.sub("const putTx = function (fields) { const row =",
          "const putTx = function (fields) { if (str(p.serials) && Number(fields.qty) > 0) fields = Object.assign({}, fields, { note: (str(fields.note) ? str(fields.note) + ' · ' : '') + 'سریال: ' + str(p.serials) }); const row =")
    # اکشن‌های جدید
    x.sub("  } else if (A === 'portalReset') {\n", "  } else if (EXT_ACTIONS.indexOf(A) >= 0) {\n    extAction(A);\n  } else if (A === 'portalReset') {\n")
    # پاسخ
    x.resub(r"(\n\};\n)(return \[\{ json: \{ response: response, writes: )", r"\1extResponse(response);\n\2")
    return x.code
