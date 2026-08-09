export const categoriesStructure = [
  {
    labelAr: "سيارات ومركبات",
    labelEn: "Vehicles",
    key: "vehicles",
    icon: "Car",
    children: [
      { key: "cars-for-sale", ar: "سيارات للبيع", en: "Cars for Sale" },
      { key: "cars-for-rent", ar: "سيارات للإيجار", en: "Cars for Rent" },
      { key: "car-parts", ar: "قطع غيار وإكسسوارات", en: "Car Parts & Accessories" }
    ]
  },
  {
    labelAr: "عقار",
    labelEn: "Real Estate",
    key: "real-estate",
    icon: "Home",
    children: [
      { key: "apartments-for-sale", ar: "شقق للبيع", en: "Apartments for Sale" },
      { key: "apartments-for-rent", ar: "شقق للإيجار", en: "Apartments for Rent" },
      { key: "villas-for-sale", ar: "فلل للبيع", en: "Villas for Sale" },
      { key: "villas-for-rent", ar: "فلل للإيجار", en: "Villas for Rent" },
      { key: "lands", ar: "أراضي", en: "Lands" },
      { key: "commercial", ar: "عقارات تجارية", en: "Commercial Real Estate" }
    ]
  },
  {
    labelAr: "بيع وشراء",
    labelEn: "Buy and Sell",
    key: "buy-and-sell",
    icon: "ShoppingCart",
    children: [
      { key: "electronics", ar: "إلكترونيات وأجهزة", en: "Electronics & Appliances" },
      { key: "furniture", ar: "أثاث ومفروشات", en: "Furniture" },
      { key: "fashion", ar: "أزياء وملابس", en: "Fashion & Clothing" },
      { key: "baby", ar: "مستلزمات أطفال", en: "Baby Supplies" }
    ]
  },
  {
    labelAr: "خدمات",
    labelEn: "Services",
    key: "services",
    icon: "Wrench",
    children: [
      { key: "maintenance", ar: "صيانة وتصليح", en: "Maintenance & Repair" },
      { key: "moving", ar: "نقل عفش", en: "Moving Services" },
      { key: "cleaning", ar: "خدمات تنظيف", en: "Cleaning Services" },
      { key: "contracting", ar: "مقاولات وبناء", en: "Contracting & Construction" }
    ]
  },
  {
    labelAr: "مجتمع",
    labelEn: "Community",
    key: "community",
    icon: "Users",
    children: [
      { key: "events", ar: "فعاليات وأنشطة", en: "Events & Activities" },
      { key: "classes", ar: "دورات وتعليم", en: "Classes & Education" },
      { key: "lost-found", ar: "مفقودات ومعثورات", en: "Lost & Found" }
    ]
  },
  {
    labelAr: "وظائف",
    labelEn: "Jobs",
    key: "jobs",
    icon: "Briefcase",
    children: [
      { key: "full-time", ar: "دوام كامل", en: "Full Time" },
      { key: "part-time", ar: "دوام جزئي", en: "Part Time" },
      { key: "remote", ar: "عمل عن بعد", en: "Remote Work" }
    ]
  }
];

export const categoriesMap: Record<string, { ar: string, en: string }> = {};

categoriesStructure.forEach(group => {
  categoriesMap[group.key] = { ar: group.labelAr, en: group.labelEn };
  group.children.forEach(c => {
    categoriesMap[c.key] = { ar: c.ar, en: c.en };
  });
});

export function getCategoryLabel(key: string, lang: 'ar' | 'en' = 'ar'): string {
  const category = categoriesMap[key];
  if (!category) return key;
  return lang === 'ar' ? category.ar : category.en;
}

export function getAllParentCategories() {
  return categoriesStructure.map(group => ({
    key: group.key,
    ar: group.labelAr,
    en: group.labelEn,
    icon: group.icon
  }));
}

export function getSubcategories(parentKey: string) {
  const parent = categoriesStructure.find(g => g.key === parentKey);
  return parent ? parent.children : [];
}

export const categoryStyles: Record<string, { bg: string, text: string, border: string, hoverBg: string, hoverText: string }> = {
  "vehicles": {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-100 dark:border-blue-800",
    hoverBg: "group-hover:bg-blue-500",
    hoverText: "group-hover:text-white"
  },
  "real-estate": {
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-100 dark:border-emerald-800",
    hoverBg: "group-hover:bg-emerald-500",
    hoverText: "group-hover:text-white"
  },
  "buy-and-sell": {
    bg: "bg-orange-50 dark:bg-orange-900/20",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-100 dark:border-orange-800",
    hoverBg: "group-hover:bg-orange-500",
    hoverText: "group-hover:text-white"
  },
  "services": {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-100 dark:border-purple-800",
    hoverBg: "group-hover:bg-purple-500",
    hoverText: "group-hover:text-white"
  },
  "community": {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-100 dark:border-rose-800",
    hoverBg: "group-hover:bg-rose-500",
    hoverText: "group-hover:text-white"
  },
  "jobs": {
    bg: "bg-cyan-50 dark:bg-cyan-900/20",
    text: "text-cyan-600 dark:text-cyan-400",
    border: "border-cyan-100 dark:border-cyan-800",
    hoverBg: "group-hover:bg-cyan-500",
    hoverText: "group-hover:text-white"
  }
};
