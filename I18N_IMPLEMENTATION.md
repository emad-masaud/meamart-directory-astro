# Internationalization (i18n) Implementation Summary

## What Was Added

A complete bilingual system (Arabic/English) similar to the dynamic theme system.

### New Files Created

1. **Translation Configuration**
   - `src/config/locales/ar.toml` - Arabic translations
   - `src/config/locales/en.toml` - English translations
   - `src/validation/i18n.ts` - Zod schemas for translations
   - `src/util/i18nConfig.ts` - Core i18n configuration (similar to themeConfig)
   
2. **Utilities**
   - `src/util/clientTranslations.ts` - Client-side translation helper
   - `src/util/useTranslations.ts` - Server-side/Astro component helper
   
3. **Components**
   - `src/components/app/header/LanguageSelector.astro` - Language switcher
   - `src/components/examples/ExampleI18n.astro` - Usage example

4. **Documentation**
   - `I18N_GUIDE.md` - Complete usage guide (English/Arabic)

### Modified Files

1. **Store**
   - `src/store.js` - Added `locale` persistent atom using `@nanostores/persistent`
   
2. **Layouts**
   - `src/layouts/BaseLayout.astro` - Added RTL support and dynamic lang/dir attributes
   
3. **Components**
   - `src/components/app/Navbar.astro` - Integrated LanguageSelector
   - `src/components/directory/Search.astro` - Dynamic placeholder based on locale

### Dependencies Added

- `@nanostores/persistent` - For persisting locale preference in localStorage

## How It Works

### 1. Locale Storage
- Selected language is stored in `localStorage` using nanostores
- Persists across page reloads
- Default: English (`en`)

### 2. RTL Support
- BaseLayout automatically detects locale from localStorage
- Sets `dir="rtl"` for Arabic, `dir="ltr"` for English
- Sets `lang` attribute appropriately

### 3. Translation Access

**In Astro Components (Server-side):**
```astro
---
import { useTranslations } from "@util/useTranslations";
const { t } = useTranslations();
---
<h1>{t.nav.home}</h1>
```

**In Client Scripts:**
```javascript
import { getClientTranslations } from "@util/clientTranslations";
const { t, formatString } = getClientTranslations();
console.log(t.common.search);
```

### 4. Language Switching
- Click language icon in navbar
- Select language from dropdown
- Page reloads with new language applied
- Direction (LTR/RTL) updates automatically

## Translation Structure

All translations are organized in TOML files with these sections:

- `nav` - Navigation items
- `common` - Common UI strings
- `footer` - Footer text
- `blog` - Blog-related text
- `directory` - Directory-specific text

## Important Notes

### ⚠️ Directory Data (Listings)
As requested, data from `directory.json` (listings/ads) is **NOT** translated. It appears the same in both languages. Only UI elements and static content are translated.

### Adding New Translations

1. Add to schema in `src/validation/i18n.ts`
2. Add to both `ar.toml` and `en.toml`
3. Use in components via `t.section.key`

### String Formatting
Use `formatString()` for placeholders:
```javascript
formatString(t.common.searchPlaceholder, "100")
// English: "Search among 100 listings of this directory :)"
// Arabic: "ابحث بين 100 إدراج في هذا الدليل :)"
```

## Testing

1. Start dev server: `npm run dev` or `pnpm dev`
2. Click language icon in navbar
3. Switch between English/Arabic
4. Observe:
   - Page direction changes (LTR ↔ RTL)
   - Text content translates
   - Directory listings remain unchanged

## Future Enhancements

- Add more languages (French, Spanish, etc.)
- Translate SEO meta tags
- Add locale-specific date/number formatting
- Implement URL-based locale routing (optional)
