// =============================================================================
// MEAMART SITE CONFIGURATION
// ملف الإعدادات المركزي للموقع — عدّل هنا فقط ولا تحتاج لتغيير أي ملف آخر
// =============================================================================

export const siteConfig = {
  // ── الهوية الأساسية ──────────────────────────────────────────────────────
  name: 'MeaMart | طلباتك أوامر',
  description: 'سوق ميمارت الذكي الأول لتلبية كافة احتياجاتك فوراً — أعلن أو تصفح الإعلانات وتحدث مع مساعدك الشخصي سند لتنفيذ كل ما تطلبه.',
  url: 'https://meamart.com', // الدومين الرسمي (يُستخدم في SEO + Schema)
  defaultLocale: 'ar',        // اللغة الافتراضية للموقع
  defaultTheme: 'light',      // الوضع الافتراضي (فاتح light)

  // ── العملة والرمز الافتراضي ──────────────────────────────────────────────
  currency: {
    code: 'SAR',
    symbol: '﷼',              // رمز الريال السعودي الافتراضي
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
  },

  // ── شات بوت ميا تشات ──────────────────────────────────────────────────────
  chatbot: {
    phoneNumber: '15559607109',       // رقم واتساب البوت الموحد (أرقام فقط مع رمز الدولة)
    phoneNumberId: '1188066204390074',  // معرف الهاتف من ميا تشات
  },

  logo: {
    src: '/logo.svg',
    srcDark: '/logo-dark.svg',
    alt: 'MeaMart Logo',
    strategy: 'switch' as 'invert' | 'switch' | 'static',
  },
  ogImage: '/og-image.webp', // صورة Open Graph الافتراضية (1200x630)
  primaryColor: '#00008B',   // اللون الأساسي — يُطبَّق على CSS variable

  // ── SEO المتقدم ──────────────────────────────────────────────────────────
  seo: {
    twitterHandle: '@meamart',       // حساب تويتر/X الرسمي
    facebookAppId: '',               // Facebook App ID لـ og:app_id (اختياري)
    keywords: 'ميمارت, طلباتك أوامر, مساعد ذكي, سوق الإعلانات, سند, إعلانات مبوبة, بيع وشراء, سيارات, عقارات, خدمات, وظائف',
    author: 'MeaMart Team',
    // Geo Tags — للمواقع المحلية (السعودية)
    geo: {
      enabled: true,
      region: 'SA',                  // ISO 3166-2 كود المنطقة
      placename: 'Al Khobar, Saudi Arabia',
      position: '26.2172;50.1971',   // latitude;longitude للخبر
      icbm: '26.2172, 50.1971',      // نفس الإحداثيات بصيغة ICBM
    },
  },



  // ── تبديل الميزات ─────────────────────────────────────────────────────────
  features: {
    search: true,          // Pagefind search
    auth: true,            // تسجيل الدخول بجوجل
    rss: true,             // خلاصة RSS للإعلانات
    sitemap: true,         // sitemap.xml التلقائي
    blog: false,           // قسم المدونة (غير مفعّل حالياً في MeaMart)
    docs: true,            // قسم الوثائق ومركز المعرفة
    portfolio: false,      // قسم Portfolio
    changelog: false,      // سجل التغييرات
    cookieConsent: true,   // نافذة الموافقة على الكوكيز
    announcement: false,   // شريط الإعلانات
  },

  // ── إعلان الشريط العلوي ──────────────────────────────────────────────────
  announcement: {
    id: 'launch_v2',             // غيّر الـ ID لإظهار البانر مجدداً
    link: '/ar/ads',
    localizeLink: false,
  },

  // ── التسويق والـ Tracking Pixels ─────────────────────────────────────────
  marketing: {
    // Google Tag Manager (يشمل GA4 وجميع التاقات)
    gtm: {
      enabled: false,
      id: 'GTM-XXXXXXX',       // مثال: 'GTM-ABC1234'
    },
    // Meta / Facebook Pixel
    facebookPixel: {
      enabled: false,
      id: 'XXXXXXXXXXXXXXXX',  // 16-digit Pixel ID من Meta Business Manager
    },
    // Snapchat Pixel
    snapchatPixel: {
      enabled: false,
      id: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', // UUID من Snapchat Ads Manager
    },
    // TikTok Pixel
    tiktokPixel: {
      enabled: false,
      id: 'XXXXXXXXXXXXXXXXXX', // Pixel ID من TikTok Ads Manager
    },
    // Google Site Verification (لـ Search Console)
    googleSiteVerification: '',   // مثال: 'abcdef123456...'
    // Facebook Domain Verification
    facebookDomainVerification: '', // مثال: 'abcdef123456...'
  },

  // ── Google Analytics / البديل ─────────────────────────────────────────────
  analytics: {
    alwaysLoad: true, // true = تحميل بدون انتظار موافقة الكوكيز
    vendors: {
      googleAnalytics: {
        id: 'G-XXXXXXXXXX',   // Google Analytics 4 Measurement ID
        enabled: false,
      },
      rybbit: {
        id: 'your-site-id',
        src: 'https://analytics.gladtek.cloud/api/script.js',
        enabled: false,
      },
      umami: {
        id: 'your-website-id',
        src: 'https://analytics.umami.is/script.js',
        enabled: false,
      },
    },
  },

  // ── معلومات التواصل ───────────────────────────────────────────────────────
  contact: {
    email: {
      support: 'support@meamart.com',
      sales: 'sales@meamart.com',
    },
    phone: {
      main: '+15559607109',    // رقم واتساب الدعم (بدون مسافات)
      label: 'Chatbot Support',
    },
    address: {
      city: 'Khobar',
      full: 'Khobar, Saudi Arabia',
    },
  },

  // ── البلوق ────────────────────────────────────────────────────────────────
  blog: {
    postsPerPage: 6,
  },

  // ── التواريخ والـ Localization ─────────────────────────────────────────────
  dateOptions: {
    localeMapping: {
      ar: 'ar-SA',
      en: 'en-GB',
    },
  },

  // ── بنرات الإعلانات المرنة ─────────────────────────────────────────────────
  banners: {
    enabled: true,
    // بنر تحت سلايدر الأقسام مباشرة
    belowCategories: {
      type: 'custom_image' as 'custom_image' | 'google_adsense' | 'custom_html',
      imageAr: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80', // خلفية تجريدية فاخرة
      imageEn: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      titleAr: 'أعلن عن عقارك أو سيارتك في ميمارت وأبرزها أمام الجميع',
      titleEn: 'Advertise your property or car on MeaMart and stand out from the crowd',
      link: '/pricing',
      html: '',
      adsense: {
        client: 'ca-pub-XXXXXXXXXXXXXXXX',
        slot: 'XXXXXXXXXX',
      }
    },
    // بنر بعد السلايدرات (مثل إعلانات مميزة، فئات شائعة، الخ)
    afterSliders: {
      type: 'custom_html' as 'custom_image' | 'google_adsense' | 'custom_html',
      imageAr: '',
      imageEn: '',
      link: '',
      html: '<div class="w-full bg-linear-to-r from-blue-900 via-indigo-950 to-zinc-950 text-white rounded-3xl p-8 text-center shadow-lg my-8 border border-white/5"><h3 class="text-2xl font-bold font-display mb-2">هل تبحث عن بيع سريع ومضمون؟</h3><p class="text-zinc-300 text-sm max-w-2xl mx-auto mb-6">تميز عن غيرك بتمييز إعلانك في باقات ميمارت الفضية والذهبية التي تجذب مئات المشترين يومياً</p><a href="/pricing" class="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-indigo-950 transition-all hover:bg-zinc-100 hover:scale-105 shadow-md">استكشف باقات التمييز من هنا</a></div>',
      adsense: {
        client: 'ca-pub-XXXXXXXXXXXXXXXX',
        slot: 'XXXXXXXXXX',
      }
    },
    // بنر مدمج في سوق الإعلانات (للجوال والكمبيوتر)
    inFeedMarketplace: {
      type: 'custom_image' as 'custom_image' | 'google_adsense' | 'custom_html',
      imageAr: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
      imageEn: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=800&q=80',
      titleAr: 'مساحة إعلانية مميزة - أعلن معنا الآن لتصل لعملائك المستهدفين',
      titleEn: 'Premium Ad Space - Advertise with us now to reach your targeted customers',
      link: '/contact',
      html: '',
      adsense: {
        client: 'ca-pub-XXXXXXXXXXXXXXXX',
        slot: 'XXXXXXXXXX',
      }
    }
  },

  // ── باقات الأسعار ومقارنة الميزات ──────────────────────────────────────────
  pricing: {
    titleAr: 'باقات تمييز الإعلانات',
    titleEn: 'Ad Promotion Packages',
    subtitleAr: 'اختر الباقة المناسبة لزيادة مبيعاتك وتصل إلى ملايين المشترين بدون وسيط',
    subtitleEn: 'Choose the right package to boost your sales and reach millions of buyers',
    plans: [
      {
        key: 'free',
        nameAr: 'العادية (مجانًا)',
        nameEn: 'Regular (Free)',
        priceAr: '0 ﷼',
        priceEn: '﷼0',
        periodAr: 'أسبوع واحد',
        periodEn: '1 week',
        descAr: 'مثالية للإعلانات السريعة والشخصية، ينتهي الإعلان تلقائياً بعد أسبوع.',
        descEn: 'Perfect for quick and personal listings, expires automatically after 1 week.',
        featuresAr: [
          'إعلان عادي نشط لمدة 7 أيام',
          'دعم فني أساسي عبر البريد الإلكتروني',
          'إمكانية إضافة حتى 3 صور للإعلان',
          'ظهور افتراضي عادي في قائمة البحث',
        ],
        featuresEn: [
          'Regular ad active for 7 days',
          'Basic email support',
          'Add up to 3 photos for the ad',
          'Standard appearance in search results',
        ],
        ctaAr: 'أضف إعلاناً مجانياً',
        ctaEn: 'Post Free Ad',
        ctaLink: '/ads/create',
        popular: false,
      },
      {
        key: 'silver',
        nameAr: 'الباقة الفضية المميزة',
        nameEn: 'Silver Featured Plan',
        priceAr: '49 ﷼',
        priceEn: '﷼49',
        periodAr: 'لكل إعلان / 30 يوم',
        periodEn: 'per ad / 30 days',
        descAr: 'لبيع أسرع مع تمييز الإعلان في فئته والظهور للمهتمين لمدة شهر كامل.',
        descEn: 'Sell faster with featured listing in its category for a full month.',
        featuresAr: [
          'تمييز الإعلان لمدة 30 يوم في قائمة البحث',
          'ظهور متقدم أعلى الإعلانات المجانية',
          'إمكانية إضافة حتى 10 صور بجودة عالية',
          'شارة "إعلان مميز" فضية تلفت الانتباه',
          'مشاركة تلقائية في حسابات السوشيال ميديا الخاصة بنا',
        ],
        featuresEn: [
          'Feature ad for 30 days in search results',
          'Advanced appearance above free ads',
          'Add up to 10 high-quality photos',
          'Silver "Featured" badge on the ad',
          'Automatic social media sharing on our channels',
        ],
        ctaAr: 'اختر الباقة الفضية',
        ctaEn: 'Choose Silver',
        ctaLink: '/ads/create?plan=silver',
        popular: false,
      },
      {
        key: 'gold',
        nameAr: 'الباقة الذهبية القصوى',
        nameEn: 'Gold VIP Plan',
        priceAr: '149 ﷼',
        priceEn: '﷼149',
        periodAr: 'لكل إعلان / 30 يوم',
        periodEn: 'per ad / 30 days',
        descAr: 'الخيار الأقوى للشركات والمعارض والباحثين عن بيع سريع وتثبيت ممتاز.',
        descEn: 'The best option for businesses, showrooms, and instant VIP exposure.',
        featuresAr: [
          'تمييز الإعلان وتثبيته لمدة 30 يوم كاملة',
          'ظهور دائم في السلايدر الرئيسي وفي الفئات الشائعة',
          'إمكانية إضافة صور وفيديو غير محدودة للإعلان',
          'شارة "VIP ذهبي" براقة لجذب انتباه المشترين فوراً',
          'تحديث تاريخ الإعلان تلقائياً كل أسبوع ليبقى دائماً في الأعلى',
          'دعم فني مخصص VIP على مدار الساعة هاتف وواتساب',
        ],
        featuresEn: [
          'Feature and pin ad for full 30 days',
          'Appears in homepage slider & popular categories',
          'Unlimited photos and video embed',
          'Shiny golden "VIP" badge to attract buyers',
          'Auto-refresh ad date weekly to stay on top',
          '24/7 dedicated VIP support via Phone & WhatsApp',
        ],
        ctaAr: 'احصل على باقة VIP',
        ctaEn: 'Get VIP Plan',
        ctaLink: '/ads/create?plan=gold',
        popular: true,
      }
    ],
    // مقارنة الميزات بالتفصيل
    comparison: {
      titleAr: 'مقارنة الميزات بالتفصيل',
      titleEn: 'Detailed Feature Comparison',
      subtitleAr: 'قارن ميزات كل باقة واختر ما يناسب تطلعاتك للوصول لعملائك',
      subtitleEn: 'Compare features in detail and choose what fits your business needs',
      categories: [
        {
          nameAr: 'الظهور والانتشار',
          nameEn: 'Visibility & Exposure',
          features: [
            {
              nameAr: 'مدة ظهور الإعلان',
              nameEn: 'Ad Duration',
              free: '7 أيام',
              silver: '30 يوم',
              gold: '30 يوم'
            },
            {
              nameAr: 'تمييز الإعلان بقائمة مميزة',
              nameEn: 'Featured Listing Badge',
              free: 'لا يوجد',
              silver: 'شارة فضية',
              gold: 'شارة VIP ذهبية'
            },
            {
              nameAr: 'التثبيت في الصفحة الرئيسية',
              nameEn: 'Pin on Homepage',
              free: false,
              silver: false,
              gold: true
            },
            {
              nameAr: 'إعادة التحديث الأسبوعي التلقائي',
              nameEn: 'Auto-Refresh Position',
              free: false,
              silver: false,
              gold: 'نعم، أسبوعياً'
            }
          ]
        },
        {
          nameAr: 'محتوى الإعلان والوسائط',
          nameEn: 'Ad Content & Media',
          features: [
            {
              nameAr: 'أقصى عدد للصور',
              nameEn: 'Maximum Photos',
              free: '3 صور',
              silver: '10 صور',
              gold: 'غير محدود'
            },
            {
              nameAr: 'تضمين فيديو (يوتيوب/تيك توك)',
              nameEn: 'Video Embedding',
              free: false,
              silver: false,
              gold: true
            }
          ]
        },
        {
          nameAr: 'الدعم والمميزات الإضافية',
          nameEn: 'Support & Extra Benefits',
          features: [
            {
              nameAr: 'نوع الدعم الفني',
              nameEn: 'Support Level',
              free: 'بريد إلكتروني',
              silver: 'سريع عبر التذاكر',
              gold: 'VIP (واتساب + هاتف 24/7)'
            },
            {
              nameAr: 'إحصائيات تفصيلية للزيارات',
              nameEn: 'Detailed Traffic Analytics',
              free: 'أساسية',
              silver: 'متقدمة',
              gold: 'متقدمة ولحظية'
            }
          ]
        }
      ]
    }
  }
};

// =============================================================================
// روابط التنقل الرئيسية
// =============================================================================
export const NAV_LINKS = [
  { href: '/ads',    label: 'Marketplace' },
  { href: '/catalog', label: 'Catalog' },
  { href: '/trend',  label: 'Trending' },
  { href: '/docs', label: 'Docs' },
];

// =============================================================================
// روابط الإجراءات والتواصل الاجتماعي
// =============================================================================
export const ACTION_LINKS = {
  primary: { label: 'Post an Ad', href: '/ads/create' },
  social: {
    twitter:   'https://twitter.com/meamart',
    linkedin:  'https://linkedin.com/company/meamart',
    //github:    'https://github.com/emad-masaud/meamart-frontend-v2',
    youtube:   'https://youtube.com/@meamart',
    facebook:  'https://facebook.com/meamart',
    instagram: 'https://instagram.com/meamart',
    tiktok:    'https://tiktok.com/@meamart',
    whatsapp:  `https://wa.me/${siteConfig.contact.phone.main.replace(/[^0-9]/g, '')}`,
  },
};

// =============================================================================
// روابط الفوتر
// =============================================================================
export const FOOTER_LINKS = {
  product: {
    title: 'Marketplace',
    links: [
      { href: '/ads',        label: 'All Ads' },
      { href: '/market',     label: 'Products' },
      { href: '/ads/create', label: 'Post an Ad' },
      { href: '/about',      label: 'About' },
      { href: '/contact',    label: 'Contact' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy', localize: true },
      { href: '/terms',   label: 'Terms',   localize: true },
    ],
  },
};
