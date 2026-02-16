# API Documentation

## User Management

### Get User Listings (from Google Sheet)

**Endpoint:**
```
GET /api/users/@{username}/listings
```

**Parameters:**
- `username` - اسم المستخدم (مثال: `demo`)

**Response:**
```json
{
  "ok": true,
  "username": "demo",
  "count": 5,
  "listings": [
    {
      "id": "car-001",
      "title": "تويوتا كورولا 2024",
      "description": "سيارة مستعملة في حالة جيدة",
      "price": "20000",
      "currency": "SAR",
      "city": "Riyadh",
      "category": "vehicles",
      ...
    }
  ]
}
```

**Example:**
```bash
curl https://yourdomain.com/api/users/@demo/listings
```

---

## Merchant Feed

### Google Merchant Center Feed (XML)

**Endpoint:**
```
GET /api/merchants/@{username}/feed.xml
```

**Parameters:**
- `username` - اسم المستخدم

**Response Format:** XML (Google Merchant Center Compatible)

**Example:**
```bash
curl https://yourdomain.com/api/merchants/@demo/feed.xml
```

**How to use with Google Merchant Center:**
1. اذهب إلى Google Merchant Center
2. انسخ الـ Feed URL
3. اذهب إلى Products → Feeds
4. أضف feed جديد واختر "XML"
5. الصق الـ URL

**Caching:** 1 hour (Cache-Control: public, max-age=3600)

---

## Integration Flow

```
Google Sheet
    ↓
API reads data
    ↓
Transform to listings
    ↓
/api/users/@username/listings (JSON)
    ↓
/api/merchants/@username/feed.xml (XML for Google)
    ↓
Google Merchant Center
    ↓
Google Shopping / WhatsApp Catalog
```

---

## Error Handling

### Sheet Integration Disabled
```json
{
  "ok": true,
  "error": "Google Sheets integration is not enabled for this user",
  "listings": []
}
```

### User Not Found (404)
```json
{
  "error": "User not found"
}
```

### Failed to Read Sheet (502)
```json
{
  "ok": false,
  "error": "Failed to read Google Sheet: ..."
}
```

---

## Required Environment Variables

لا توجد متغيرات بيئة مطلوبة (الـ Google Sheet يجب أن تكون مشاركة علناً)

---

## Testing

### 1. اختبر إذا كانت البيانات تُقرأ:
```bash
curl https://yourdomain.com/api/users/@demo/listings | jq
```

### 2. اختبر Merchant Feed:
```bash
curl https://yourdomain.com/api/merchants/@demo/feed.xml
```

### 3. من الموقع:
- اذهب إلى `/@demo/settings`
- الصق Sheet ID
- فعّل التكامل
- انتظر 1 دقيقة
- اذهب إلى `/@demo` - يجب أن ترى الإعلانات
