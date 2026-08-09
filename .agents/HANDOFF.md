# MeaMart Migration Handoff Document
# ملف تسليم مشروع ميمارت - للمحادثة الجديدة

## الوضع الحالي (مكتمل ويشتغل 100%)

### المشروع الحالي: meamart-directory-astro
- الموقع: https://meamart.com
- الريبو: https://github.com/emad-masaud/meamart-directory-astro
- المسار المحلي: b:\meamart-directory-astro
- التقنية: Astro 5 + TailwindCSS 4 + Cloudflare Pages
- الاستضافة: Cloudflare Pages (Auto Deploy من GitHub)

### نظام الإعلانات (شغال ومستقر - لا تغير فيه!)
- Webhook: functions/api/webhook.js - يستقبل بيانات الإعلانات من واتساب
- التخزين: ملفات JSON في src/data/businesses/ على GitHub
- الصور: تنسحب من Meta API وتتحفظ في public/images/businesses/
- يدعم صور متعددة: صورة واحدة = string، أكثر من صورة = array
- حماية: يتجاهل إشعارات النظام (message_status_change, new_subscriber)
- الأقسام: src/data/categories.json (6 أقسام)

### هيكل البيانات الحالي (Schema)
```json
{
  "id": "ad-xxx",
  "slug": "ad-xxx",
  "title": "عنوان الإعلان",
  "advertiser_name": "اسم المعلن",
  "description": "وصف الإعلان",
  "category": "vehicles",
  "city": "الخبر",
  "phone": "0575934833",
  "whatsapp": "0575934833",
  "image": "/images/businesses/ad-xxx.jpeg",
  "published": true,
  "featured": false,
  "tags": ["مستعمل", "نظيف"]
}
```

### ملفات API أخرى موجودة (لا تمسها)
- functions/api/my-ads.js
- functions/api/ai-cache.js
- src/pages/api/ads.json.ts

## المشروع القديم (المصدر للتصميم فقط)
- الريبو: https://github.com/emad-masaud/meamart-frontend-v2
- المسار المحلي: b:\meamart-frontend-v2
- التقنية: Astro + TailwindCSS + Supabase (لا تستخدم Supabase!)

### ما يجب نقله من المشروع القديم
1. التصميم والـ CSS: src/styles/ (theme.css, typography.css, components.css)
2. الـ Layout الرئيسي: src/layouts/Layout.astro (Header + Footer + Navigation)
3. نظام الترجمة: src/i18n/ + locales
4. الصفحة الرئيسية: src/pages/[lang]/index.astro + sections components
5. صفحة تفاصيل الإعلان: src/pages/[lang]/ads/[...slug].astro
6. صفحة الأقسام: src/pages/[lang]/categories/
7. site.config.ts: إعدادات الموقع المركزية

### ما يجب عدم نقله
- أي كود Supabase أو قاعدة بيانات
- نظام Auth/Login
- لوحة تحكم الأدمن
- لوحة البائع
- API routes حقت create-ad.ts / edit-ad.ts

## قواعد مهمة
1. لا تمس ملف functions/api/webhook.js
2. لا تمس ملف functions/api/my-ads.js
3. لا تمس ملف functions/api/ai-cache.js
4. لا تغير هيكل البيانات (Schema) في src/content.config.ts
5. لا تغير ملفات الأقسام src/data/categories.json
6. الموقع يُنشر تلقائياً على Cloudflare عند كل Push لـ GitHub
