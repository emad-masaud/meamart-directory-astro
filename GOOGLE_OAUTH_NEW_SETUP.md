#  إعداد Google OAuth الجديد - خطوة بخطوة

##  تنبيه أمني
تم اكتشاف Google OAuth credentials مكشوفة. يجب **حذفها وإنشاء مفاتيح جديدة فوراً**.

---

##  الخطوة 1: حذف OAuth القديم (المكشوف)

### من Google Cloud Console:

1. اذهب إلى: **https://console.cloud.google.com/apis/credentials**
2. تسجيل دخول بحسابك
3. اختر **Project** المناسب (مثل 'meamart')
4. ابحث عن **OAuth 2.0 Client IDs** 
5. ابحث عن الـ ID التي تبدأ بـ: '1087979039854-...'
6. اضغط عليها ثم اختر **Delete** (حذف نهائي)

---

##  الخطوة 2: إنشاء OAuth 2.0 Client ID جديد

### في Google Cloud Console:

1. في صفحة **Credentials**
2. اضغط على زر **+ CREATE CREDENTIALS** (أعلى الصفحة)
3. اختر **OAuth 2.0 Client ID**

### إذا ظهرت لك رسالة: "Configure OAuth consent screen first"

اتبع هذه الخطوات:

1. اضغط **CONFIGURE CONSENT SCREEN**
2. في **User Type**: اختر **Internal** (داخلي) أو **External** حسب احتياجاتك
3. اضغط **CREATE**
4. ملئ المعلومات:
   - **App name**: 'MeaMart Directory'
   - **User support email**: بريدك الإلكتروني
   - **Developer contact**: بريدك أيضاً
5. اضغط **NEXT** عدة مرات حتى تنتهي
6. اضغط **BACK TO DASHBOARD**

### إنشاء OAuth Client:

1. اذهب مرة أخرى إلى **Credentials**
2. اضغط **+ CREATE CREDENTIALS** 
3. اختر **OAuth 2.0 Client ID**
4. للـ **Application type**: اختر **Web application**
5. أسم المفتاح: **MeaMart Dashboard** (أو أي اسم تفضله)

### إضافة Authorized Redirect URIs:

في حقل **Authorized redirect URIs**, أضف هذه الروابط الثلاث:

https://a55f440a.meamart-dashboard.pages.dev/api/auth/google/callback
http://localhost:3000/api/auth/google/callback
http://localhost:4200/api/auth/google/callback

6. اضغط **CREATE**

---

##  الخطوة 3: حفظ المفاتيح الجديدة

ستظهر لك نافذة بـ:
- **Client ID** 
- **Client Secret** 

###  لا تنسخهم في البريد أو WhatsApp!

حفظهم في مكان آمن (Password Manager أو ملف محلي)

---

##  الخطوة 4: توليد JWT_SECRET جديد

افتح PowerShell وشغّل:

-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]})

---

##  الخطوة 5: تحديث Cloudflare Pages

### للـ Dashboard Project:

1. اذهب إلى: **https://dash.cloudflare.com**
2. Pages  **meamart-dashboard**
3. Settings  **Environment variables**
4. أضف:
   - GOOGLE_CLIENT_ID = (المفتاح الجديد)
   - GOOGLE_CLIENT_SECRET = (السر الجديد)
   - JWT_SECRET = (المفتاح المولد)

---

 بعد اتمامك لهذه الخطوات، سيعمل النظام بأمان!

