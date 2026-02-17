# 🚨 تحذير أمني عاجل - Security Alert

## ⚠️ المشكلة

تم اكتشاف مفاتيح Google OAuth حساسة مكشوفة في GitHub عبر أداة GitGuardian:

### المفاتيح المكشوفة:
- `GOOGLE_CLIENT_ID`: 1087979039854-haa33086opu7q165qrpoac1s6anso15a.apps.googleusercontent.com
- `GOOGLE_CLIENT_SECRET`: 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
- `JWT_SECRET`: meamart-jwt-secret-change-in-production

## ✅ ما تم إصلاحه

1. ✅ تم تنظيف ملف `.env.example` واستبدال القيم بـ placeholders
2. ✅ تأكدت من أن `.env` موجود في `.gitignore`

## 🔴 إجراءات عاجلة مطلوبة منك

### 1. إلغاء Google OAuth Credentials فوراً

انتقل إلى Google Cloud Console:
https://console.cloud.google.com/apis/credentials

**خطوات إلغاء المفتاح:**
1. اذهب إلى **APIs & Services** → **Credentials**
2. ابحث عن OAuth 2.0 Client ID الذي يبدأ بـ `1087979039854-...`
3. اضغط عليه واختر **Delete** لحذفه نهائياً
4. **لا تستخدم هذا المفتاح مرة أخرى**

### 2. إنشاء مفتاح Google OAuth جديد

1. في نفس الصفحة، اضغط **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
2. اختر Application type: **Web application**
3. أضف Authorized redirect URIs:
   ```
   https://a55f440a.meamart-dashboard.pages.dev/api/auth/google/callback
   http://localhost:3000/api/auth/google/callback
   ```
4. احفظ المفاتيح الجديدة في مكان آمن (1Password, LastPass, etc.)

### 3. تحديث Environment Variables في Cloudflare

انتقل إلى: https://dash.cloudflare.com

**Dashboard Project:**
1. Pages → **meamart-dashboard** → Settings → Environment variables
2. عدّل:
   - `GOOGLE_CLIENT_ID` → المفتاح الجديد
   - `GOOGLE_CLIENT_SECRET` → السر الجديد
   - `JWT_SECRET` → سر جديد (استخدم مولد عشوائي قوي)

**لتوليد JWT_SECRET قوي:**
```powershell
# في PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | % {[char]$_})
```

أو استخدم: https://www.uuidgenerator.net/

### 4. تنظيف Git History (مهم جداً!)

المفاتيح لا تزال موجودة في تاريخ Git!

**الخيار الأول: إعادة كتابة التاريخ (معقد)**
```bash
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.example" \
  --prune-empty --tag-name-filter cat -- --all
```

**الخيار الثاني: إنشاء ريبو جديد (الأسهل والأكثر أماناً)**
1. احذف الريبو الحالي من GitHub: `emad-masaud/meamart-directory-astro`
2. أنشئ ريبو جديد
3. ارفع الكود الحالي (بعد التأكد من `.env.example` نظيف)

### 5. إنشاء ملف .env محلي

أنشئ ملف `.env` في جذر المشروع (لن يُرفع لـ GitHub):

```bash
# Application
SITE_URL=http://localhost:4321

# JWT - استخدم المفتاح الجديد
JWT_SECRET=your-new-secure-jwt-secret-here

# Google OAuth - استخدم المفاتيح الجديدة
GOOGLE_CLIENT_ID=your-new-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-new-client-secret

# Email Service
CLOUDFLARE_API_TOKEN=your_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
FROM_EMAIL=noreply@meamart.com
```

## 📋 قائمة مرجعية - Checklist

- [ ] حذف/إلغاء Google OAuth Client القديم من Google Cloud Console
- [ ] إنشاء Google OAuth Client جديد
- [ ] تحديث `GOOGLE_CLIENT_ID` في Cloudflare Pages
- [ ] تحديث `GOOGLE_CLIENT_SECRET` في Cloudflare Pages
- [ ] توليد `JWT_SECRET` جديد وتحديثه في Cloudflare
- [ ] إنشاء ملف `.env` محلي بالمفاتيح الجديدة
- [ ] اختبار تسجيل الدخول بـ Google OAuth
- [ ] حذف الريبو القديم من GitHub أو تنظيف التاريخ
- [ ] إنشاء ريبو جديد نظيف (إذا اخترت الخيار 2)
- [ ] commit التغييرات ورفعها:
  ```bash
  git add .env.example
  git commit -m "security: remove exposed secrets from .env.example"
  git push
  ```

## 🔐 ممارسات أمنية للمستقبل

1. **لا تضع أبداً** مفاتيح حقيقية في `.env.example`
2. استخدم placeholders فقط: `your-api-key-here`
3. احفظ المفاتيح في مدير كلمات مرور آمن
4. فعّل **Two-Factor Authentication** على:
   - GitHub
   - Google Cloud
   - Cloudflare
5. استخدم **GitHub Secret Scanning** alerts
6. راجع دورياً الـ OAuth apps المتصلة بحسابك

## 📚 مراجع

- [Google Cloud Security Best Practices](https://cloud.google.com/security/best-practices)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**تاريخ الاكتشاف:** 18 فبراير 2026
**الحالة:** 🔴 عاجل - يتطلب إجراء فوري
**المصدر:** GitGuardian
