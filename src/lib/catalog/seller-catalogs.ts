import { kvGet, kvPut } from "~/utils/kv";
import type { AstroGlobal } from 'astro';

export interface SellerCatalog {
  id: string;
  name: string;
  slug: string;
  description?: string;
  product_codes: string[]; // ERPNext item_codes
  created_at: string;
}

/**
 * Get all catalogs for a specific seller
 */
export async function getSellerCatalogs(Astro: AstroGlobal, userId: string): Promise<SellerCatalog[]> {
  try {
    const key = `seller_catalogs_${userId}`;
    const dataStr = await kvGet(Astro, key);
    if (dataStr) {
      return JSON.parse(dataStr);
    }
  } catch (e) {
    console.error("Error fetching seller catalogs:", e);
  }
  return [];
}

/**
 * Create a new catalog for a seller
 */
export async function createSellerCatalog(
  Astro: AstroGlobal, 
  userId: string, 
  catalogData: Omit<SellerCatalog, 'id' | 'created_at'>
): Promise<SellerCatalog> {
  const catalogs = await getSellerCatalogs(Astro, userId);
  
  // Basic slug validation
  if (catalogs.some(c => c.slug === catalogData.slug)) {
    throw new Error("Catalog slug already exists");
  }

  const newCatalog: SellerCatalog = {
    ...catalogData,
    id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    created_at: new Date().toISOString()
  };

  catalogs.push(newCatalog);
  await kvPut(Astro, `seller_catalogs_${userId}`, JSON.stringify(catalogs));
  
  // Also store a reverse lookup for public access: `catalog_slug_{slug}` -> `{ userId, catalogId }`
  await kvPut(Astro, `catalog_slug_${newCatalog.slug}`, JSON.stringify({ userId, catalogId: newCatalog.id }));

  return newCatalog;
}

/**
 * Update an existing catalog
 */
export async function updateSellerCatalog(
  Astro: AstroGlobal, 
  userId: string, 
  catalogId: string,
  updates: Partial<Omit<SellerCatalog, 'id' | 'created_at'>>
): Promise<SellerCatalog> {
  const catalogs = await getSellerCatalogs(Astro, userId);
  const idx = catalogs.findIndex(c => c.id === catalogId);
  
  if (idx === -1) {
    throw new Error("Catalog not found");
  }

  const oldSlug = catalogs[idx].slug;
  const updatedCatalog = { ...catalogs[idx], ...updates };
  catalogs[idx] = updatedCatalog;

  await kvPut(Astro, `seller_catalogs_${userId}`, JSON.stringify(catalogs));

  // Update reverse lookup if slug changed
  if (updates.slug && updates.slug !== oldSlug) {
    await kvPut(Astro, `catalog_slug_${updatedCatalog.slug}`, JSON.stringify({ userId, catalogId }));
  }

  return updatedCatalog;
}

/**
 * Get a catalog by its public slug
 */
export async function getCatalogBySlug(Astro: AstroGlobal, slug: string): Promise<{ catalog: SellerCatalog, userId: string } | null> {
  try {
    const lookupStr = await kvGet(Astro, `catalog_slug_${slug}`);
    if (!lookupStr) return null;

    const lookup = JSON.parse(lookupStr);
    const catalogs = await getSellerCatalogs(Astro, lookup.userId);
    const catalog = catalogs.find(c => c.id === lookup.catalogId);
    
    if (catalog) {
      return { catalog, userId: lookup.userId };
    }
  } catch (e) {
    console.error("Error getting catalog by slug:", e);
  }
  return null;
}
