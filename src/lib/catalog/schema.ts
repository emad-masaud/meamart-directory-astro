export type ProductStatus = 'active' | 'draft' | 'archived';
export type ProductCondition = 'new' | 'refurbished' | 'used';

export interface ProductRow {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  brand: string;
  category: string;
  subcategory: string;
  tags: string;
  status: ProductStatus;
  featured: boolean;
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock_qty: number;
  sku: string;
  barcode: string;
  condition: ProductCondition;
  image_1: string;
  image_2: string;
  image_3: string;
  gallery: string;
  whatsapp_message: string;
  product_url: string;
  checkout_url: string;
  merchant_name: string;
  mpn: string;
  gtin: string;
  google_product_category: string;
  fb_product_group: string;
  pixel_content_name: string;
  pixel_content_ids: string;
  pixel_value: string;
  pixel_currency: string;
  created_at: string;
  updated_at: string;
}

export const PRODUCT_HEADERS: (keyof ProductRow)[] = [
  "id",
  "slug",
  "title",
  "subtitle",
  "description",
  "brand",
  "category",
  "subcategory",
  "tags",
  "status",
  "featured",
  "price",
  "compare_at_price",
  "currency",
  "stock_qty",
  "sku",
  "barcode",
  "condition",
  "image_1",
  "image_2",
  "image_3",
  "gallery",
  "whatsapp_message",
  "product_url",
  "checkout_url",
  "merchant_name",
  "mpn",
  "gtin",
  "google_product_category",
  "fb_product_group",
  "pixel_content_name",
  "pixel_content_ids",
  "pixel_value",
  "pixel_currency",
  "created_at",
  "updated_at",
];
