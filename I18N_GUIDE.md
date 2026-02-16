# نظام الترجمة (i18n) / Translation System

تم إضافة دعم اللغة العربية والإنجليزية بطريقة ديناميكية مشابهة لنظام الثيمات.

## البنية / Structure

```
src/
├── config/
│   └── locales/
│       ├── ar.toml      # الترجمة العربية
│       └── en.toml      # English translations
├── util/
│   ├── i18nConfig.ts           # إعدادات الترجمة
│   ├── clientTranslations.ts  # للاستخدام في client-side
│   └── useTranslations.ts     # للاستخدام في Astro components
├── validation/
│   └── i18n.ts          # Zod schema للترجمات
└── store.js             # يتضمن locale store
```

## الاستخدام / Usage

### في مكونات Astro

```astro
---
import { useTranslations } from "@util/useTranslations";

const { t } = useTranslations();
---

<h1>{t.nav.home}</h1>
<p>{t.common.loading}</p>
```

### في السكريبتات (Client-side)

```javascript
import { getClientTranslations } from "@util/clientTranslations";

const { t, formatString } = getClientTranslations();

console.log(t.common.search);

// With placeholders
const message = formatString(t.common.searchPlaceholder, "100");
```

### في مكونات Vue

```vue
<script setup>
import { ref, onMounted } from 'vue';
import { getClientTranslations } from '@util/clientTranslations';

const translations = ref(null);

onMounted(() => {
  const { t } = getClientTranslations();
  translations.value = t;
});
</script>

<template>
  <div v-if="translations">
    {{ translations.common.loading }}
  </div>
</template>
```

## إضافة ترجمات جديدة / Adding New Translations

1. **أضف إلى Schema** في `src/validation/i18n.ts`:
```typescript
export const localeSchema = z.object({
  // ... existing fields
  myNewSection: z.object({
    myNewKey: z.string(),
  }),
});
```

2. **أضف إلى ملفات الترجمة**:

في `src/config/locales/en.toml`:
```toml
[myNewSection]
myNewKey = "My English translation"
```

في `src/config/locales/ar.toml`:
```toml
[myNewSection]
myNewKey = "الترجمة العربية"
```

## ملاحظات مهمة / Important Notes

### البيانات من directory.json
⚠️ **البيانات من `directory.json` لا تُترجم** - تظهر كما هي في كلا اللغتين (الإدراجات/الإعلانات).

### دعم RTL
- العربية تدعم RTL تلقائياً
- يتم تطبيق `dir="rtl"` على `<html>` عند اختيار العربية

### تبديل اللغة
- يتم حفظ اللغة المختارة في `localStorage`
- تحديث الصفحة مطلوب لتطبيق اللغة الجديدة
- مبدل اللغة موجود في شريط التنقل

## المكونات المحدثة / Updated Components

- ✅ `BaseLayout.astro` - دعم RTL
- ✅ `Navbar.astro` - مبدل اللغة
- ✅ `LanguageSelector.astro` - مكون جديد
- ✅ `Search.astro` - placeholder ديناميكي
- ✅ `store.js` - locale store

## التوسع / Extending

لإضافة لغة جديدة:

1. أنشئ ملف TOML جديد في `src/config/locales/`
2. أضف اللغة إلى `locales` object في `i18nConfig.ts`
3. حدث `LanguageSelector.astro` لإضافة العلم والاسم
