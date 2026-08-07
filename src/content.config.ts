import { z, defineCollection } from "astro:content";
import { glob, file } from 'astro/loaders';

// Define the schema for Categories
const categories = defineCollection({
  loader: file("src/data/categories.json"),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    nameAr: z.string(),
    nameEn: z.string(),
    descriptionAr: z.string().optional(),
    descriptionEn: z.string().optional(),
    icon: z.string().optional(),
  }),
});

// Define the schema for Businesses
const businesses = defineCollection({
  loader: file("src/data/businesses.json"),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    name: z.string().optional(), // fallback
    nameAr: z.string(),
    nameEn: z.string(),
    description: z.string().optional(), // fallback
    descriptionAr: z.string(),
    descriptionEn: z.string(),
    logo: z.string().optional(),
    coverImage: z.string().optional(),
    category: z.string(), // reference to category slug
    city: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    website: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    openingHours: z.string().optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    updatedAt: z.string().optional(),
    published: z.boolean().default(true),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
  }),
});

// Define the schema for Pages
const pages = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/data/pages" }),
  schema: ({ image }) => z.object({
    image: image().optional(),
    title: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const collections = {
  categories,
  businesses,
  pages,
};
