export async function onRequestGet(context) {
  try {
    // 1. Get the phone number from the query parameters
    const url = new URL(context.request.url);
    const phone = url.searchParams.get('phone');

    if (!phone) {
      return new Response(JSON.stringify({ error: "Missing 'phone' parameter" }), { 
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    // 2. Fetch the master ads.json list
    // We fetch it from the same origin to get the latest published data
    const baseUrl = url.origin;
    const adsResponse = await fetch(`${baseUrl}/api/ads.json`);
    
    if (!adsResponse.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch ads database" }), { 
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const allAds = await adsResponse.json();

    // 3. Filter ads belonging to this phone number
    // We check both the exact phone field, or if the ID starts with the phone
    const myAds = allAds.filter(ad => 
      String(ad.phone) === String(phone) || 
      String(ad.id).startsWith(`${phone}-`) ||
      String(ad.id).startsWith(`${phone}`)
    );

    // 4. Return the filtered list
    return new Response(JSON.stringify(myAds), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
