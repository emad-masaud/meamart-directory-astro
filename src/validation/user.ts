import { z } from "zod";

export const userSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/i),
  displayName: z.string().min(1).max(100),
  email: z.string().email(),
  country: z.string().length(2),
  city: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  whatsappNumber: z.string().optional(),
  bio: z.string().max(500).optional(),
  website: z.string().url().optional(),
  avatar: z.string().optional(),

  googleSheet: z
    .object({
      enabled: z.boolean().default(false),
      sheetId: z.string().optional(),
      sheetName: z.string().default("Products"),
      syncInterval: z.number().default(3600),
    })
    .optional(),

  googleMerchant: z
    .object({
      enabled: z.boolean().default(false),
      merchantId: z.string().optional(),
      currency: z.string().default("USD"),
      autoSync: z.boolean().default(false),
    })
    .optional(),

  meachat: z
    .object({
      enabled: z.boolean().default(false),
      businessAccountId: z.string().optional(),
      catalogId: z.string().optional(),
      apiToken: z.string().optional(),
    })
    .optional(),

  social: z
    .object({
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      facebook: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional(),

  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  featured: z.boolean().default(false),
});

export type UserSchema = z.infer<typeof userSchema>;
