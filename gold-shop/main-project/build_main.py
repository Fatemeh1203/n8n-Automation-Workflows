#!/usr/bin/env python3
"""ساخت نسخه‌ی جدید «Business Logic» پنل سطح ۳ پروژه‌ی اصلی با امکانات تکمیلی.

vendor/*.live.js همان نسخه‌ی فعلی روی سرور است (قبل از تغییر) تا هر وقت لازم شد برگردیم.
"""
import pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT.parent / 'backend'))
from ext_patch import apply_ext

src = (ROOT / 'vendor/business-logic.live.js').read_text(encoding='utf-8')
out = apply_ext(src)
(ROOT / 'build/business-logic.js').write_text(out, encoding='utf-8')
print('business-logic.js', len(out))
