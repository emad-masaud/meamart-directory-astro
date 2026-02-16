import { z } from "zod";

export const localeSchema = z.object({
  code: z.string(),
  name: z.string(),
  dir: z.enum(["ltr", "rtl"]),

  site: z.object({
    title: z.string(),
    seoName: z.string(),
    seoDescription: z.string(),
  }),
  
  // Navigation
  nav: z.object({
    home: z.string(),
    blog: z.string(),
    tags: z.string(),
    analytics: z.string(),
  }),

  header: z.object({
    bannerText: z.string(),
    bannerBrandText: z.string(),
    actionButtonText: z.string(),
  }),
  
  // Common
  common: z.object({
    search: z.string(),
    searchPlaceholder: z.string(),
    noResults: z.string(),
    loading: z.string(),
    featured: z.string(),
    readMore: z.string(),
    viewAll: z.string(),
    openMainMenu: z.string(),
  }),
  
  // Footer
  footer: z.object({
    madeWith: z.string(),
    by: z.string(),
    heading: z.string(),
    description: z.string(),
    navigationDirectory: z.string(),
    navigationCategories: z.string(),
    navigationBlog: z.string(),
    navigationLegal: z.string(),
    linkSubmit: z.string(),
    linkAdvertise: z.string(),
    linkArticles: z.string(),
    linkPrivacyPolicy: z.string(),
    linkTermsOfService: z.string(),
    rights: z.string(),
  }),
  
  // Blog
  blog: z.object({
    title: z.string(),
    readTime: z.string(),
    publishedOn: z.string(),
  }),
  
  // Directory
  directory: z.object({
    title: z.string(),
    listings: z.string(),
    tags: z.string(),
    filterByTag: z.string(),
    tagPagesTitle: z.string(),
    emptyStateText: z.string(),
    submitTitle: z.string(),
    submitDescription: z.string(),
    featuredLabel: z.string(),
  }),

  // Signup
  signup: z.object({
    usernameLabel: z.string(),
    usernamePlaceholder: z.string(),
    usernameHelp: z.string(),
    usernameInvalid: z.string(),
    usernameLength: z.string(),
    usernameTaken: z.string(),
    usernameCheckFailed: z.string(),
    displayNameLabel: z.string(),
    displayNamePlaceholder: z.string(),
    emailLabel: z.string(),
    emailPlaceholder: z.string(),
    emailHelp: z.string(),
    countryLabel: z.string(),
    countryPlaceholder: z.string(),
    cityLabel: z.string(),
    cityPlaceholder: z.string(),
    whatsappLabel: z.string(),
    whatsappCodeLabel: z.string(),
    whatsappPlaceholder: z.string(),
    whatsappInvalid: z.string(),
    whatsappHelp: z.string(),
    bioLabel: z.string(),
    bioPlaceholder: z.string(),
    termsPrefix: z.string(),
    termsAnd: z.string(),
    termsService: z.string(),
    termsPrivacy: z.string(),
    successMessage: z.string(),
    submitLabel: z.string(),
    submitLoading: z.string(),
    errorGeneric: z.string(),
    loginPrompt: z.string(),
    loginComingSoon: z.string(),
  }),
});

export type LocaleSchema = z.infer<typeof localeSchema>;
