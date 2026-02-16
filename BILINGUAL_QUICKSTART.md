# Quick Start - Bilingual Support (العربية/English)

## ✅ What's Been Implemented

Your site now supports **Arabic** and **English** dynamically, similar to how themes work!

### 🎯 Key Features

- ✅ **Language Switcher** in navigation bar (flag icon)
- ✅ **RTL Support** - Arabic automatically displays right-to-left
- ✅ **Persistent Language Choice** - Saved in browser localStorage
- ✅ **Dynamic Content** - All UI text translates automatically
- ✅ **Directory Listings** - Remain unchanged (as requested)

## 🚀 How to Use

### 1. View Language Switcher
Run your dev server and look for the language icon (🌐) in the navbar next to the color mode selector.

```bash
pnpm dev
# or
npm run dev
```

### 2. Switch Languages
- Click the language icon
- Select "English" or "العربية"
- Page reloads with your chosen language

### 3. Verify RTL Support
- Switch to Arabic
- Notice the entire layout flips to right-to-left
- Switch back to English for left-to-right

## 📁 File Structure

```
src/
├── config/locales/          # Translation files
│   ├── ar.toml             # العربية
│   └── en.toml             # English
├── util/
│   ├── i18nConfig.ts       # Core i18n setup
│   ├── clientTranslations.ts
│   └── useTranslations.ts
├── components/
│   └── app/header/
│       └── LanguageSelector.astro  # Language switcher button
└── validation/
    └── i18n.ts             # Translation schema
```

## 🎨 Customizing Translations

### Add New Text

1. **Edit Schema** (`src/validation/i18n.ts`):
```typescript
export const localeSchema = z.object({
  // Add your new section
  pricing: z.object({
    free: z.string(),
    premium: z.string(),
  }),
});
```

2. **Add to English** (`src/config/locales/en.toml`):
```toml
[pricing]
free = "Free"
premium = "Premium"
```

3. **Add to Arabic** (`src/config/locales/ar.toml`):
```toml
[pricing]
free = "مجاني"
premium = "مميز"
```

4. **Use in Components**:
```astro
---
import { getClientTranslations } from "@util/clientTranslations";
---
<script>
  const { t } = getClientTranslations();
  console.log(t.pricing.free); // "Free" or "مجاني"
</script>
```

## 📝 Available Translation Keys

### Navigation (`t.nav`)
- `home` - Home / الرئيسية
- `blog` - Blog / المدونة
- `tags` - Tags / الوسوم

### Common (`t.common`)
- `search` - Search / بحث
- `searchPlaceholder` - Search placeholder with {0} for count
- `noResults` - No results message
- `loading` - Loading text
- `featured` - Featured label
- `readMore` - Read more link
- `viewAll` - View all link

### Directory (`t.directory`)
- `title` - Directory / الدليل
- `listings` - listings / إدراجات
- `tags` - Tags / الوسوم
- `filterByTag` - Filter by tag / تصفية حسب الوسم

### Blog (`t.blog`)
- `title` - Blog / المدونة
- `readTime` - Reading time suffix
- `publishedOn` - Published date prefix

### Footer (`t.footer`)
- `madeWith` - Made with / صُنع بـ
- `by` - by / بواسطة

## 🔧 Technical Details

### How It Works
1. **Storage**: Language preference stored in `localStorage`
2. **Detection**: BaseLayout reads locale on page load
3. **Direction**: Automatically sets `dir="rtl"` for Arabic
4. **Updates**: Page reload required when switching languages

### Directory Data (Important!)
As per your requirement, data from `directory.json` is **NOT translated**:
```json
{
  "title": "Calm",
  "description": "Offers guided meditations..."
}
```
This appears the same in both English and Arabic views.

## 📚 Documentation Files

- `I18N_GUIDE.md` - Detailed usage guide (bilingual)
- `I18N_IMPLEMENTATION.md` - Technical implementation details
- `src/components/examples/ExampleI18n.astro` - Usage example

## 🌍 Adding More Languages

Want to add French, Spanish, or another language?

1. Create `src/config/locales/fr.toml`
2. Add translations following the same structure
3. Update `src/util/i18nConfig.ts`:
   ```typescript
   import frData from "../config/locales/fr.toml";
   
   export const locales = {
     en: localeSchema.parse(enData),
     ar: localeSchema.parse(arData),
     fr: localeSchema.parse(frData), // Add this
   };
   ```
4. Update `LanguageSelector.astro` to show French flag/name

## 🎓 Learn More

See the detailed guides:
- [I18N_GUIDE.md](./I18N_GUIDE.md) - Usage examples
- [I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md) - Architecture

---

**Need help?** Check the example component at `src/components/examples/ExampleI18n.astro`
