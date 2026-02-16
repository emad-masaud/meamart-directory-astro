import { z } from "zod";

export const localeSchema = z.object({
  code: z.string(),
  name: z.string(),
  dir: z.enum(["ltr", "rtl"]),
  
  // Navigation
  nav: z.object({
    home: z.string(),
    blog: z.string(),
    tags: z.string(),
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
  }),
  
  // Footer
  footer: z.object({
    madeWith: z.string(),
    by: z.string(),
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
  }),
});

export type LocaleSchema = z.infer<typeof localeSchema>;
