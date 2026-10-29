---
description: Persian text normalization required before any keyword, menu, or code match.
paths:
  - "workflows/**"
---

# Persian normalization

Every flow that matches user text (menu keywords, FAQ keywords, the parent's verification code)
must normalize it first, inside a Code node, before comparing. Never compare raw Telegram text.

Normalize, in order:
1. Arabic ye (`ي`) → Persian ye (`ی`); Arabic kaf (`ك`) → Persian kaf (`ک`).
2. Collapse variant spaces to ZWNJ where a compound word expects it; trim/collapse plain whitespace.
3. Convert Persian digits (۰-۹) and Arabic-Indic digits (٠-٩) to Latin (0-9).
4. Trim, and lowercase only the Latin portion (Persian has no case).

## Reference implementation (n8n Code node, JavaScript)

Paste this as a "نرمال‌سازی متن" Code node right after any Telegram input node, before matching logic:

```javascript
function normalizePersian(input) {
  if (!input) return '';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  return String(input)
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[‌\s]+/g, ' ')
    .replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)))
    .trim();
}

return items.map(item => ({
  json: { ...item.json, normalized_text: normalizePersian(item.json.text) }
}));
```

Apply this to: menu-keyword matching (Flow 1), the unique-code check (Flow 2 step 1), and the
category/button match (Flow 2 step 2). FAQ `keywords` in the database must be stored already
normalized so the comparison is normalized-to-normalized.
