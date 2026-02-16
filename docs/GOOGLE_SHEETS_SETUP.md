# Google Sheets Setup Guide

## هيكل الـ Google Sheet المطلوب

### الأعمدة المطلوبة (Headers):

| Column | Type | Required | Example | Notes |
|--------|------|----------|---------|-------|
| id | String | ✓ | car-001 | معرّف فريد للإعلان |
| title | String | ✓ | تويوتا كورولا 2024 | اسم المنتج/الإعلان |
| description | String | | سيارة تويوتا كورولا موديل 2024 مستعملة... | وصف تفصيلي |
| category | String | | vehicles | الفئة/القسم |
| brand | String | | Toyota | اسم البراند/الشركة المصنعة |
| model | String | | Corolla | نموذج المنتج |
| year | String | | 2024 | سنة الإنتاج |
| condition | String | | used | الحالة (new, used, refurbished) |
| price | String | ✓ | 20000 | السعر |
| currency | String | | SAR | العملة (SAR, USD, etc) |
| availability | String | | in_stock | التوفر (in_stock, out_of_stock) |
| color | String | | white | اللون |
| size | String | | L | الحجم |
| material | String | | leather | المادة |
| location | String | | Riyadh, Al-Olaya | الموقع التفصيلي |
| city | String | | Riyadh | المدينة |
| state | String | | Riyadh | المنطقة |
| country | String | | SA | رمز الدولة (ISO 3166-1 alpha-2) |
| phone_number | String | | 966501234567 | رقم التواصل |
| contact_name | String | | محمد أحمد | اسم المتصل |
| image_url | String | | https://example.com/image.jpg | رابط الصورة |
| external_link | String | | https://example.com | رابط خارجي |
| tags | String | | سيارات,بيع,سيارات مستعملة | وسوم مفصولة بفواصل |
| featured | String | | true | هل الإعلان مميز |

## مثال على الفورمات:

### Cars (السيارات):
```
id | title | brand | model | year | condition | price | currency | city
car-001 | تويوتا كورولا 2024 | Toyota | Corolla | 2024 | used | 20000 | SAR | Riyadh
```

### Real Estate (العقارات):
```
id | title | type | bedrooms | price | currency | city | location
apt-001 | شقة فاخرة 3 غرف | apartment | 3 | 500000 | SAR | Riyadh | Al-Olaya
```

### Service (الخدمات):
```
id | title | category | description | price | currency | city | phone_number
svc-001 | تصميم مواقع ويب | design | تصميم مواقع احترافية | 5000 | SAR | Riyadh | 966501234567
```

## الخطوات:

1. **إنشاء Google Sheet جديد**:
   - عنوان: "Listings" أو ما تفضل
   - أضف الأعمدة المطلوبة

2. **ملء البيانات**:
   - كل صف = إعلان واحد
   - اترك الأعمدة الاختيارية فارغة إن لم تحتجها

3. **مشاركة الـ Sheet**:
   - اذهب إلى Share
   - اختر "Anyone with the link can view"
   - انسخ الـ Sheet ID من الرابط

4. **في الموقع**:
   - اذهب إلى `/@yourappname/settings`
   - اللصق Sheet ID في Google Sheets section
   - فعّل التكامل

5. **اختبر**:
   - اذهب إلى `/api/users/@yourappname/listings` لرؤية البيانات
   - اذهب إلى `/api/merchants/@yourappname/feed.xml` لرؤية Merchant Feed

## ملاحظات مهمة:

- **المشاركة**: يجب أن تكون الورقة مشاركة علناً (public)
- **الرؤوس (Headers)**: يجب أن تكون في الصف الأول
- **الفراغات**: يتم تحويلها تلقائياً لـ underscores في الـ API
- **الكسل**: كل 1 ساعة يتم تخزين البيانات مؤقتاً
