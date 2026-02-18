# 🌐 إعداد النطاق meamart.com - خطوة بخطوة

## ⚠️ المشكلة الحالية
```
Error: DNS_PROBE_FINISHED_NXDOMAIN
↓
النطاق غير مرتبط بـ Cloudflare Pages
```

---

## 📋 الخطوتان المطلوبة

### ✅ الخطوة 1: التحقق من أن النطاق موجود في Cloudflare

1. اذهب إلى: https://dash.cloudflare.com
2. من القائمة اليسرى: **Websites**
3. ابحث عن **meamart.com**

**إذا كنت تراه:**
- الخطوة 2 أدناه

**إذا لم تره:**
- اضغط **+ Add a domain**
- أدخل `meamart.com`
- اختر **Free plan**
- اضغط **Continue**

---

### ✅ الخطوة 2: ربط النطاق مع Pages

#### أ) إذا كنت بحاجة إلى Nameservers جديدة:

1. في Cloudflare، سيعطيك **Cloudflare Nameservers**:
   ```
   مثال:
   ns1.cloudflare.com
   ns2.cloudflare.com
   ```

2. اذهب إلى **Registrar** الخاص بك (حيث اشتريت النطاق):
   - GoDaddy
   - Namecheap
   - Arab Domains
   - أي جهة أخرى

3. ابحث عن **Nameservers** أو **DNS Settings**

4. غيّر الـ nameservers إلى Cloudflare (أعلاه)

5. انتظر 24-48 ساعة للتحديث (قد يأخذ دقائق)

---

#### ب) أو إذا كنت تستخدم Cloudflare Nameservers بالفعل:

1. في Cloudflare، اذهب إلى: **DNS > Records**

2. أضف **CNAME Record**:
   ```
   Name: @  (أو meamart.com)
   Type: CNAME
   Target: meamart-directory.pages.dev
   TTL: Auto
   ```

3. أو أضف **CNAME** للـ subdomain:
   ```
   Name: www
   Type: CNAME
   Target: meamart-directory.pages.dev
   TTL: Auto
   ```

---

## 🎯 إعادة التوجيه (موصى به)

### للرئيسية (meamart.com):

#### خيار 1: استخدام CNAME
```
Name: @
Type: CNAME  
Target: meamart-directory.pages.dev
```

#### خيار 2: استخدام Pages Redirect
1. في Cloudflare Pages
2. Custom domains
3. أضف `meamart.com`

---

## 📍 ربط Subdomains

### لـ dashboard:
```
Name: dashboard
Type: CNAME
Target: cd155f50.meamart-dashboard.pages.dev
```

### لـ directory:
```
Name: directory
Type: CNAME
Target: meamart-directory.pages.dev
```

### لـ api (إذا كنت بحاجة):
```
Name: api
Type: CNAME
Target: meamart-api.meamart.com (أو الـ worker الخاص بك)
```

---

## ⏱️ ما الذي يجب الانتظار له؟

**DNS Propagation:**
- عادة: 5-30 دقيقة ✅
- أحياناً: 24-48 ساعة

**اختبر التغييرات:**
```powershell
# في PowerShell
nslookup meamart.com
```

يجب أن تحصل على:
```
Server: 1.1.1.1
Address: 1.1.1.1

Non-authoritative answer:
Name: meamart.com
Address: (IP من Cloudflare)
```

---

## 🚨 الأخطاء الشائعة

### ❌ "NXDOMAIN"
- ✅ النطاق لم يتم إضافته إلى Cloudflare
- ✅ Nameservers لم يتم تحديثها
- الحل: اتبع الخطوات أعلاه

### ❌ "REFUSED"
- ✅ الـ DNS مرتبك
- الحل: اسمح لـ propagation بـ 24-48 ساعة

### ❌ "Server not found"
- ✅ أنت لم تأضف CNAME records
- الحل: أضف الـ records كما هو موضح أعلاه

---

## ✅ خطوات التحقق بعد التكوين

```
1. اختبر الرابط:
   https://meamart.com ✓
   
2. اختبر الـ subdomain:
   https://dashboard.meamart.com ✓
   https://directory.meamart.com ✓

3. تحقق من الشهادة:
   يجب أن ترى 🔒 (HTTPS)

4. اختبر الروابط من Directory:
   اضغط "سجّل عملك" من:
   https://meamart.com/
   (يجب أن يوجهك إلى signup page بنجاح)
```

---

## 📞 المساعدة الفنية

إذا حصلت على مشكلة:

1. **ما هي جهة التسجيل** (Registrar)؟
   - GoDaddy, Namecheap, Arab Domains, إلخ

2. **هل nameservers موجودة؟**
   ```powershell
   nslookup -type=NS meamart.com
   ```

3. **اتصل بـ Cloudflare Support** إن لزم الحال

---

**تاريخ التعديل:** 18 فبراير 2026
**الحالة:** 🔴 عاجل - يجب تكوين DNS اليوم
