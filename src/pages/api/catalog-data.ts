import type { APIRoute } from 'astro';
import { customFieldsByCategory } from '~/utils/customFields';
import { getCollection } from 'astro:content';



export const GET: APIRoute = async (context) => {
  let catalogProducts: any[] = [];
  try {
    const businesses = await getCollection('businesses');
    const activeAds = businesses.filter((b: any) => b.data?.status !== 'sold');

    catalogProducts = activeAds.map(p => ({
      id: p.id,
      name: p.data.title,
      sku: p.id || '',
      price: String(p.data.price || ''),
      description: (p.data.description || '').replace(/<[^>]*>/g, '').trim(),
      brand: (p.data as any).custom_fields?.brand || '',
      categories: p.data.category ? [p.data.category] : []
    })).slice(0, 100);
  } catch (e) {
    console.error('Failed to fetch products in API:', e);
  }

  return new Response(JSON.stringify({
    catalogProducts,
    customFieldsByCategory
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    }
  });
};
