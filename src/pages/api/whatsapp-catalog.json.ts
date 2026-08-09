import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

/**
 * WhatsApp Catalog / Meta Commerce Manager Feed API
 * Serves active products/ads in structured JSON ready for WhatsApp Catalog Sync
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const origin = url.origin || 'https://meamart.com';
    const businesses = await getCollection('businesses');
    const ads = businesses.filter((b: any) => b.data?.status !== 'sold').slice(0, 500);

    const catalogItems = ads.map(ad => {
      const link = `${origin}/ar/ads/${ad.id}`;
      const imageLink = (ad.data as any).image ? `${origin}${(ad.data as any).image}` : `${origin}/default-ad.png`;
      const additionalImages: any[] = [];

      return {
        id: `MM-${ad.id}`,
        title: ad.data.title || '',
        description: ad.data.description || '',
        availability: 'in stock',
        condition: (ad.data as any).condition === 'new' ? 'new' : 'used',
        price: `${(ad.data as any).price || 0} ${(ad.data as any).currency || 'SAR'}`,
        link: link,
        image_link: imageLink,
        additional_image_link: additionalImages.join(','),
        brand: (ad.data as any).custom_fields?.brand || 'MeaMart',
        currency: (ad.data as any).currency || 'SAR'
      };
    });

    return new Response(JSON.stringify({
      version: '1.0',
      title: 'MeaMart WhatsApp Commerce Catalog',
      total_items: catalogItems.length,
      items: catalogItems
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 's-maxage=3600, stale-while-revalidate'
      }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
