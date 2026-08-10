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
    author_id: z.string().optional(),
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

// Define the schema for Users (Seller Profiles)
const users = defineCollection({
  loader: glob({ pattern: '**/[^_]*.json', base: "./src/data/users" }),
  schema: z.object({
    id: z.string(),
    email: z.string(),
    username: z.string().optional(),
    name: z.string().optional(),
    avatar: z.string().optional(),
    header: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    description: z.string().optional(),
    createdAt: z.string().optional(),
  }),
});

// Old repo collections
const blog = defineCollection({
  loader: async () => {
    return [];
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    youtubeId: z.string().optional(),
    audioUrl: z.string().optional(),
    isVideo: z.boolean().optional().default(false),
    noindex: z.boolean().optional().default(false),
    nofollow: z.boolean().optional().default(false),
  }),
});

const ads = defineCollection({
  loader: async () => {
    return [];
  },
  schema: z.object({
    listing_title: z.string(),
    listing_description: z.string(),
    listing_price: z.number(),
    listing_currency: z.string(),
    listing_negotiable: z.boolean(),
    listing_condition: z.string(),
    listing_city: z.string(),
    listing_country: z.string().optional().default('Saudi Arabia'),
    listing_district: z.string(),
    listing_street: z.string().optional().default(''),
    listing_address: z.string().optional().nullable(),
    listing_latitude: z.string().optional().nullable(),
    listing_longitude: z.string().optional().nullable(),
    tags: z.array(z.string()).optional().default([]),
    contact_name: z.string(),
    contact_phone: z.string(),
    contact_whatsapp: z.string(),
    contact_method: z.string(),
    image: z.string(),
    images: z.array(z.string()),
    video_url: z.string().optional().nullable(),
    video_primary: z.boolean().optional().default(false),
    listing_status: z.string(),
    featured_flag: z.boolean(),
    expires_at: z.string().optional().nullable(),
    categoryKey: z.string(),
    custom_fields: z.record(z.string(), z.any()).optional(),
    pubDate: z.coerce.date(),
    wp_id: z.number().optional().default(0),
    wp_slug: z.string().optional().default(''),
    seller_avatar: z.string().optional().default(''),
    seller_banner: z.string().optional().default(''),
    seller_instagram: z.string().optional().default(''),
    seller_facebook: z.string().optional().default(''),
    seller_telegram: z.string().optional().default(''),
    seller_website: z.string().optional().default(''),
    seller_gmaps: z.string().optional().default(''),
    wp_author_id: z.number().optional().default(0),
    linked_product_id: z.number().optional()
  })
});

const portfolio = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/portfolio" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        heroImage: z.string(),
        tags: z.array(z.string()),
        link: z.string().optional(),
        noindex: z.boolean().optional().default(false),
        nofollow: z.boolean().optional().default(false),
    }),
});

const docs = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/docs" }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        order: z.number().optional(),
        noindex: z.boolean().optional().default(false),
        nofollow: z.boolean().optional().default(false),
    }),
});

const changelog = defineCollection({
    loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/changelog" }),
    schema: z.object({
        version: z.string(),
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        type: z.enum(['major', 'feature', 'security', 'fix', 'improvement', 'planned', 'other']).default('feature'),
        isSecurity: z.boolean().optional().default(false),
        detailsUrl: z.string().optional(),
        migrationUrl: z.string().optional(),
        noindex: z.boolean().optional().default(false),
        nofollow: z.boolean().optional().default(false),
    }),
});

export const collections = {
  categories,
  businesses,
  pages,
  users,
  blog,
  ads,
  portfolio,
  docs,
  changelog,
};
