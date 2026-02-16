import { z } from "zod";

export const googleSheetListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  year: z.string().optional(),
  condition: z.string().optional(),
  price: z.string().optional(),
  currency: z.string().optional(),
  availability: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  location: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone_number: z.string().optional(),
  contact_name: z.string().optional(),
  image_url: z.string().optional(),
  external_link: z.string().optional(),
  tags: z.string().optional(),
  featured: z.string().optional(),
});

export type GoogleSheetListing = z.infer<typeof googleSheetListingSchema>;

/**
 * Transform Google Sheet row to Listing
 */
export function transformGoogleSheetRow(row: Record<string, string>): GoogleSheetListing | null {
  try {
    // Filter only valid keys
    const filteredRow: Record<string, string> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (googleSheetListingSchema.shape[key as keyof typeof googleSheetListingSchema.shape]) {
        filteredRow[key] = value;
      }
    });

    return googleSheetListingSchema.parse(filteredRow);
  } catch (error) {
    console.error("Failed to transform Google Sheet row:", error);
    return null;
  }
}
