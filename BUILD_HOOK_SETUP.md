# MeaMart Directory - إعداد Build Hook

## خطوات إعداد Build Hook في Cloudflare Pages

### 1. إنشاء Build Hook

1. اذهب إلى Cloudflare Dashboard
2. اذهب إلى Pages → اختر مشروع `app-directory`
3. اذهب إلى Settings → Build Configuration
4. انقر على "Add build hook"
5. قم بتسمية الهوك مثل "Product Update Hook"
6. انسخ الرابط الناتج

### 2. إضافة Build Hook في Dashboard

1. اذهب إلى مشروع `app-dashboard` في Cloudflare Dashboard
2. Pages → Settings → Environment Variables
3. أضف متغير جديد:
   - **Name**: `BUILD_HOOK_URL`
   - **Value**: الرابط الذي نسخته من الخطوة السابقة
4. احفظ التغييرات

### 3. آلية العمل

عندما يحدث أي من الأحداث التالية في Dashboard، سيتم استدعاء Build Hook تلقائياً:

- إضافة منتج جديد (`POST /api/products`)
- تحديث منتج (`PUT /api/products/:id`)
- حذف منتج (`DELETE /api/products/:id`)
- المزامنة مع Google Merchant (`POST /api/products/:id/sync-google`)

### 4. ماذا يحدث عند استدعاء Build Hook؟

1. يتم إرسال طلب POST للـ hook
2. Cloudflare يبدأ build جديد للموقع
3. أثناء الـ build، يتم:
   - استدعاء `/api/export-json` من Dashboard
   - تحميل جميع المنتجات النشطة
   - توليد صفحات static لكل منتج
   - إضافة JSON-LD schema
4. يتم نشر النسخة الجديدة تلقائياً

### 5. وقت التحديث

- Build time: ~1-5 دقائق (حسب عدد المنتجات)
- Deploy time: ~30 ثانية
- إجمالي: ~2-6 دقائق من التحديث للظهور

### 6. التحقق من نجاح Build

يمكنك التحقق من نجاح الـ build من:
- Cloudflare Dashboard → Pages → app-directory → Deployments
- سترى deployment جديد مع timestamp

### 7. حل المشاكل

إذا لم يعمل Build Hook:

1. تأكد من صحة `BUILD_HOOK_URL`
2. تحقق من logs في Cloudflare
3. تأكد من أن Dashboard يمكنه الوصول للإنترنت
4. جرّب استدعاء الهوك يدوياً:
   ```bash
   curl -X POST "YOUR_BUILD_HOOK_URL"
   ```

### 8. بدائل التحديث

إذا كنت لا تريد التحديث التلقائي:
- أزل أو علّق على سطور `BUILD_HOOK_URL` في الكود
- أو لا تُعرّف المتغير في Environment Variables

### 9. تحديثات مجدولة

للتحديثات المجدولة، يمكنك استخدام:
- Cloudflare Cron Triggers
- GitHub Actions مع schedule
- خدمة cron خارجية تستدعي Build Hook

مثال GitHub Action:
```yaml
name: Scheduled Build
on:
  schedule:
    - cron: '0 */6 * * *'  # كل 6 ساعات
jobs:
  trigger-build:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Build
        run: |
          curl -X POST "${{ secrets.BUILD_HOOK_URL }}"
```
