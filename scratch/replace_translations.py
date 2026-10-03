import os, glob

replacements = [
    {
        'file': 'src/components/sections/Hero.astro',
        'old': '{lang === "ar" ? "كيف أقدر أساعدك اليوم؟" : "What\'s the vibe today?"}',
        'new': '{t["hero.title"]}'
    },
    {
        'file': 'src/components/sections/Hero.astro',
        'old': 'placeholder={lang === "ar"\n              ? "ابحث هنا عن اللي تبيه..."\n              : "Search here..."}',
        'new': 'placeholder={t["hero.search_placeholder"]}'
    },
    {
        'file': 'src/components/sections/home/HomeCategories.astro',
        'old': 'label: lang === "ar" ? group.labelAr : group.labelEn',
        'new': 'label: lang === "ar" ? group.labelAr : group.labelEn' # Wait, this uses variable group.labelAr, not a static string! It should be kept.
    },
    {
        'file': 'src/components/dashboard/DashboardSubNav.astro',
        'old': 'label: lang === "ar" ? "المساحات (الكتالوج)" : "Workspaces"',
        'new': 'label: t["dashboard.workspaces"]'
    },
    {
        'file': 'src/components/dashboard/DashboardSubNav.astro',
        'old': 'label: lang === "ar" ? "الشركات والموردين" : "Companies & Suppliers"',
        'new': 'label: t["dashboard.companies"]'
    },
    {
        'file': 'src/components/dashboard/DashboardSubNav.astro',
        'old': 'label: lang === "ar" ? "البوت الذكي" : "Smart Bot"',
        'new': 'label: t["dashboard.smart_bot"]'
    },
    {
        'file': 'src/components/admin/AdminNavTabs.astro',
        'old': '{lang === "ar" ? "تسجيل الخروج" : "Logout"}',
        'new': '{t["admin.logout"]}'
    },
    {
        'file': 'src/components/layout/Footer.astro',
        'old': '{lang === "ar" ? "طلباتك أوامر" : "Your Wishes Are Commands"}',
        'new': '{t["footer.wishes"]}'
    },
    {
        'file': 'src/components/layout/Header.astro',
        'old': '{lang === "ar" ? "تحديث الآن" : "Update Now"}',
        'new': '{t["header.update_now"]}'
    },
    {
        'file': 'src/components/layout/Header.astro',
        'old': '{lang === "ar" ? "طلباتك أوامر" : "Your Wishes Are Commands"}',
        'new': '{t["footer.wishes"]}'
    },
    {
        'file': 'src/components/layout/Header.astro',
        'old': '(lang === "ar" ? "الباركود والرابط الموحد" : "QR & Bio Link")',
        'new': 't["header.qr_bio_link"]'
    }
]

for rep in replacements:
    filepath = rep['file']
    if filepath == 'src/components/sections/home/HomeCategories.astro':
        continue
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Need to ensure `const t = useTranslations(lang);` is present if `t` is used.
        # But wait, we can just replace. If `t` is missing, Astro will throw an error, but let's hope it's there.
        # Let's replace:
        new_content = content.replace(rep['old'], rep['new'])
        if new_content == content:
            # Maybe encoding issues or whitespace issues, let's try regex if direct replace fails.
            import re
            # Create regex pattern for the old string ignoring whitespaces
            pattern_str = re.escape(rep['old'])
            pattern_str = re.sub(r'\\\s+', r'\\s+', pattern_str) # replace escaped whitespaces with \s+
            new_content = re.sub(pattern_str, rep['new'].replace('\\', r'\\'), content)
            
        if new_content != content:
            # check if `useTranslations` is in the file
            if 'const t = useTranslations' not in new_content and 'useTranslations' not in new_content:
                # Add import and const
                import_stmt = 'import { useTranslations } from "~/i18n/utils";\n'
                if '---' in new_content:
                    parts = new_content.split('---', 2)
                    if len(parts) >= 3:
                        # Append inside frontmatter
                        parts[1] = import_stmt + parts[1]
                        
                        # Add const t = useTranslations(lang) or (currentLang)
                        # Let's check if lang is defined
                        if 'const { lang ' in parts[1] or 'const lang =' in parts[1]:
                            parts[1] += '\nconst t = useTranslations(lang);\n'
                        elif 'const isArabic = lang === "ar"' in parts[1]:
                            parts[1] += '\nconst t = useTranslations(lang);\n'
                        elif 'Astro.params' in parts[1]:
                            parts[1] += '\nconst t = useTranslations(Astro.params.lang || "en");\n'
                        else:
                            parts[1] += '\nconst t = useTranslations(Astro.params.lang || "en");\n'
                            
                        new_content = '---'.join(parts)
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filepath}")
        else:
            print(f"Could not find exact string in {filepath}: {rep['old'][:30]}...")

