// Fetch products from Dashboard API
const DASHBOARD_API_URL = import.meta.env.PUBLIC_DASHBOARD_API_URL || 'https://dashboard.example.com';

export interface DashboardProduct {
  id: number;
  title: string;
  description?: string;
  price?: number;
  currency: string;
  image_url?: string;
  availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'backorder';
  condition: 'new' | 'used' | 'refurbished';
  link?: string;
  brand?: string;
  gtin?: string;
  mpn?: string;
  google_product_category?: string;
  whatsapp?: string;
  email?: string;
  created_at: number;
  updated_at: number;
}

export interface DashboardProductsResponse {
  products: DashboardProduct[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    generated_at: string;
  };
}

export async function fetchProductsFromDashboard(
  limit: number = 100,
  offset: number = 0
): Promise<DashboardProductsResponse> {
  try {
    const url = `${DASHBOARD_API_URL}/api/export-json?limit=${limit}&offset=${offset}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const data: DashboardProductsResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products from dashboard:', error);
    throw error;
  }
}

export async function fetchAllProducts(): Promise<DashboardProduct[]> {
  const allProducts: DashboardProduct[] = [];
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const response = await fetchProductsFromDashboard(limit, offset);
      
      if (response.products.length === 0) {
        break;
      }

      allProducts.push(...response.products);
      
      // If we got fewer products than the limit, we've reached the end
      if (response.products.length < limit) {
        break;
      }

      offset += limit;
    }

    return allProducts;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

// Convert dashboard product to directory listing format
export function convertProductToListing(product: DashboardProduct) {
  return {
    id: `product-${product.id}`,
    title: product.title,
    description: product.description || '',
    featured: false,
    published: true,
    image: product.image_url || '/default-product.jpg',
    website: product.link || '#',
    tags: [
      product.availability === 'in_stock' ? 'available' : 'unavailable',
      product.condition,
      ...(product.brand ? [product.brand] : [])
    ],
    custom: {
      price: product.price,
      currency: product.currency,
      whatsapp: product.whatsapp,
      email: product.email,
      gtin: product.gtin,
      mpn: product.mpn,
      google_product_category: product.google_product_category
    }
  };
}
