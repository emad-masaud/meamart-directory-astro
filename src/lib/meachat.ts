/**
 * MeaChat API Client
 * Handles all API calls to MeaChat WhatsApp Business Platform
 * Documentation: https://meachat.com/api/docs
 */

interface MeaChatConfig {
  businessAccountId: string;
  apiToken: string;
}

interface MeaChatListing {
  id: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  image_url?: string;
  category?: string;
  availability?: "in_stock" | "out_of_stock" | "limited";
  sku?: string;
  brand?: string;
  condition?: "new" | "used" | "refurbished";
}

interface MeaChatCatalogProduct {
  external_id?: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image_url?: string;
  category?: string;
  availability?: "available" | "unavailable" | "limited";
  sku?: string;
}

interface MeaChatOrderWebhook {
  event: "order_received" | "order_updated" | "order_cancelled";
  order_id: string;
  phone_number: string;
  customer_name: string;
  products: Array<{
    id: string;
    title: string;
    quantity: number;
    price: number;
  }>;
  total_price: number;
  currency: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  timestamp: string;
}

/**
 * Send a message via MeaChat WhatsApp
 */
export async function sendWhatsAppMessage(
  config: MeaChatConfig,
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.meachat.com/v1/messages/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_account_id: config.businessAccountId,
        to: phoneNumber,
        type: "text",
        text: { body: message },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();
    return { success: true, messageId: data.messages[0].id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Create or update a catalog on MeaChat
 */
export async function createCatalog(
  config: MeaChatConfig,
  catalogName: string,
  description?: string
): Promise<{ success: boolean; catalogId?: string; error?: string }> {
  try {
    const response = await fetch("https://api.meachat.com/v1/catalogs", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_account_id: config.businessAccountId,
        name: catalogName,
        description: description || "",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();
    return { success: true, catalogId: data.catalog_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Add products to MeaChat catalog
 */
export async function addProductsToCatalog(
  config: MeaChatConfig,
  catalogId: string,
  products: MeaChatCatalogProduct[]
): Promise<{ success: boolean; productsAdded?: number; error?: string }> {
  try {
    const response = await fetch(
      `https://api.meachat.com/v1/catalogs/${catalogId}/products`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_account_id: config.businessAccountId,
          products: products.map((p) => ({
            external_id: p.external_id || p.sku || p.name,
            name: p.name,
            description: p.description,
            price: Math.round(p.price * 100), // MeaChat expects price in cents
            currency: p.currency,
            image_url: p.image_url,
            category: p.category,
            availability: p.availability,
            sku: p.sku,
          })),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();
    return { success: true, productsAdded: data.products_added };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Send listing catalog to customer
 */
export async function sendCatalog(
  config: MeaChatConfig,
  catalogId: string,
  phoneNumber: string,
  message?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      "https://api.meachat.com/v1/messages/send-catalog",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_account_id: config.businessAccountId,
          to: phoneNumber,
          catalog_id: catalogId,
          message: message || "عرض المنتجات المتاحة:",
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Transform listing to MeaChat product format
 */
export function transformListingToMeaChatProduct(listing: MeaChatListing): MeaChatCatalogProduct {
  return {
    external_id: listing.id,
    name: listing.title,
    description: listing.description,
    price: listing.price || 0,
    currency: listing.currency || "AED",
    image_url: listing.image_url,
    category: listing.category,
    availability: listing.availability === "in_stock" ? "available" : "unavailable",
    sku: listing.sku,
  };
}

/**
 * Sync listings to MeaChat catalog
 * Only syncs if MeaChat is enabled and configured
 */
export async function syncListingsToCatalog(
  config: MeaChatConfig,
  listings: MeaChatListing[],
  catalogId: string
): Promise<{ success: boolean; synced?: number; error?: string }> {
  if (!config.businessAccountId || !config.apiToken) {
    return {
      success: false,
      error: "MeaChat not configured (missing businessAccountId or apiToken)",
    };
  }

  try {
    const products = listings.map(transformListingToMeaChatProduct);
    const result = await addProductsToCatalog(config, catalogId, products);
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Handle incoming order webhook from MeaChat
 */
export function handleOrderWebhook(
  payload: MeaChatOrderWebhook
): {
  vendorNotification: string;
  orderDetails: Record<string, any>;
} {
  const orderDetails = {
    orderId: payload.order_id,
    customerPhone: payload.phone_number,
    customerName: payload.customer_name,
    items: payload.products,
    totalPrice: payload.total_price,
    currency: payload.currency,
    status: payload.status,
    timestamp: payload.timestamp,
  };

  const vendorNotification = `
📦 طلب جديد من MeaChat!

👤 العميل: ${payload.customer_name}
📱 الهاتف: ${payload.phone_number}
🆔 رقم الطلب: ${payload.order_id}

📋 المنتجات:
${payload.products.map((p) => `  • ${p.title} (${p.quantity}x) = ${(p.price * p.quantity).toFixed(2)} ${payload.currency}`).join("\n")}

💰 الإجمالي: ${payload.total_price.toFixed(2)} ${payload.currency}
⏰ الوقت: ${new Date(payload.timestamp).toLocaleString("ar-AE")}

✅ الحالة: ${payload.status}
  `;

  return { vendorNotification, orderDetails };
}

/**
 * Subscribe to webhooks
 */
export async function subscribeToWebhook(
  config: MeaChatConfig,
  webhookUrl: string,
  events: string[] = ["order_received", "order_updated"]
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    const response = await fetch(
      "https://api.meachat.com/v1/webhooks/subscribe",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          business_account_id: config.businessAccountId,
          url: webhookUrl,
          events: events,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();
    return { success: true, subscriptionId: data.subscription_id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get catalog statistics
 */
export async function getCatalogStats(
  config: MeaChatConfig,
  catalogId: string
): Promise<{
  success: boolean;
  stats?: {
    productsCount: number;
    viewsCount: number;
    ordersCount: number;
    lastUpdated: string;
  };
  error?: string;
}> {
  try {
    const response = await fetch(
      `https://api.meachat.com/v1/catalogs/${catalogId}/stats`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message };
    }

    const data = await response.json();
    return {
      success: true,
      stats: {
        productsCount: data.products_count,
        viewsCount: data.views_count,
        ordersCount: data.orders_count,
        lastUpdated: data.last_updated,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Test API connection
 */
export async function testConnection(
  config: MeaChatConfig
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("https://api.meachat.com/v1/account/info", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
      },
    });

    if (!response.ok) {
      return { success: false, error: "Invalid API token" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
