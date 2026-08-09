import { z, defineCollection } from "astro:content";
import { glob, file } from 'astro/loaders';

// Define the schema for Categories
const categories = defineCollection({
  loader: file("src/data/categories.json"),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
  }),
});

// Define the schema for Businesses
const businesses = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: "./src/data/businesses" }),
  schema: z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.union([z.string(), z.number()]).optional(),
    currency: z.string().optional(),
    condition: z.string().optional(),
    negotiable: z.boolean().optional(),
    advertiser_name: z.string().optional(),
    logo: z.string().optional(),
    image: z.union([z.string(), z.array(z.string())]).optional(),
    images: z.array(z.string()).optional(),
    category: z.string(), // reference to category slug
    city: z.string().optional(),
    district: z.string().optional(),
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
    tags: z.array(z.string()).optional(),
    custom_fields: z.record(z.any()).optional(),
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
