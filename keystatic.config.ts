import { config, fields, collection } from '@keystatic/core';

export default config({
  // Use local storage in dev, github storage in production
  storage: import.meta.env.DEV 
    ? { kind: 'local' }
    : { kind: 'github', repo: 'emad-masaud/meamart-directory-astro' },
  
  collections: {
    businesses: collection({
      label: 'الإعلانات (Businesses)',
      slugField: 'slug',
      path: 'src/data/businesses/*',
      format: { data: 'json' },
      schema: {
        id: fields.text({ label: 'معرف الإعلان (ID)', description: 'يجب أن يكون مميزاً' }),
        slug: fields.text({ label: 'الرابط (Slug)' }),
        nameAr: fields.text({ label: 'الاسم (عربي)' }),
        nameEn: fields.text({ label: 'الاسم (إنجليزي)' }),
        descriptionAr: fields.text({ label: 'الوصف (عربي)', multiline: true }),
        descriptionEn: fields.text({ label: 'الوصف (إنجليزي)', multiline: true }),
        category: fields.select({
          label: 'التصنيف',
          options: [
            { label: 'سيارات ومركبات', value: 'cars-and-vehicles' },
            { label: 'عقار', value: 'real-estate' },
            { label: 'بيع وشراء', value: 'buy-and-sell' },
            { label: 'خدمات', value: 'services' },
            { label: 'مجتمع', value: 'community' },
            { label: 'وظائف', value: 'jobs' },
            { label: 'أخرى', value: 'other' }
          ],
          defaultValue: 'other'
        }),
        city: fields.text({ label: 'المدينة' }),
        phone: fields.text({ label: 'الجوال' }),
        whatsapp: fields.text({ label: 'الواتساب' }),
        coverImage: fields.text({ label: 'رابط الصورة (Cover Image)' }),
        published: fields.checkbox({ label: 'نشر الإعلان (Published)', defaultValue: true }),
        featured: fields.checkbox({ label: 'إعلان مميز (Featured)', defaultValue: false }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'الكلمات الدلالية (Tags)', itemLabel: props => props.value }),
      },
    }),
  },
});
