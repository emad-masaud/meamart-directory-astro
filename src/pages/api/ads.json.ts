import { getCollection } from 'astro:content';

export async function GET() {
  // Fetch all published ads from the "businesses" collection
  const allAds = await getCollection('businesses', ({ data }) => {
    return data.published === true;
  });

  // Map the ads to a clean JSON structure
  const adsApiData = allAds.map(ad => ({
    id: ad.data.id,
    title_ar: ad.data.nameAr,
    title_en: ad.data.nameEn,
    description: ad.data.descriptionAr,
    category: ad.data.category,
    city: ad.data.city,
    phone: ad.data.phone,
    coverImage: ad.data.coverImage,
    url: `https://meamart.com/businesses/${ad.data.slug}`,
    tags: ad.data.tags || []
  }));

  // Return as a JSON API response
  return new Response(JSON.stringify(adsApiData), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      // Allow other websites to fetch this API (CORS)
      "Access-Control-Allow-Origin": "*" 
    }
  });
}
