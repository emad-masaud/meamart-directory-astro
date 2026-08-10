import { getCollection } from 'astro:content';

export async function GET() {
  // Fetch all published ads from the "businesses" collection
  const allAds = await getCollection('ads', ({ data }) => {
    return data.published === true;
  });
  // Sort by newest first (since id is a timestamp) and limit to 10 (BotSailor requirement for interactive lists)
  const sortedAds = allAds
    .sort((a, b) => Number(b.data.id) - Number(a.data.id))
    .slice(0, 10);

  // Map the ads to a clean JSON structure
  const adsApiData = sortedAds.map(ad => ({
    id: ad.data.id,
    title: ad.data.title,
    description: ad.data.description,
    category: ad.data.category,
    city: ad.data.city,
    phone: ad.data.phone,
    image: ad.data.image,
    url: `https://meamart.com/businesses/${ad.data.slug}`,
    tags: ad.data.tags || [],
    tags_text: (ad.data.tags || []).join('، ')
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
