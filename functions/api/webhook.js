export async function onRequestPost(context) {
  try {
    // 1. Get the data from the webhook (MeaChat WhatsApp Flow)
    const data = await context.request.json();
    
    // 2. Get the GitHub Token from Cloudflare Environment Variables
    const githubToken = context.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return new Response(JSON.stringify({ error: "Missing GITHUB_TOKEN" }), { status: 500 });
    }

    // 3. Prepare the new Ad (Business) details
    // We generate a unique slug based on the current timestamp
    const uniqueId = Date.now().toString();
    const slug = `ad-${uniqueId}`;
    
    // Map the WhatsApp data to our JSON structure
    // If the WhatsApp flow sends different keys, you can adjust them here
    const fileContent = {
      id: slug,
      slug: slug,
      nameAr: data.title || data.name || "إعلان جديد",
      nameEn: data.title || data.name || "New Ad",
      descriptionAr: data.description || "لا يوجد وصف",
      descriptionEn: data.description || "No description",
      category: data.category || "services", // default category
      city: data.city || "Riyadh",
      phone: data.phone || data.whatsapp || "",
      whatsapp: data.whatsapp || data.phone || "",
      published: true, // Automatically publish the ad
      featured: false
    };

    // 4. Convert the JSON object to Base64 (Required by GitHub API)
    // We use unescape(encodeURIComponent()) to handle Arabic text correctly
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(fileContent, null, 2))));
    
    // 5. GitHub API settings
    // Replace with your exact GitHub username and repository name
    const githubRepo = "emad-masaud/meamart-directory-astro";
    const filePath = `src/data/businesses/${slug}.json`;
    
    // 6. Send the file to GitHub
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "MeaMart-Webhook",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Add new ad: ${fileContent.nameAr} via WhatsApp`,
        content: contentBase64,
        branch: "main" // Change to "master" if your default branch is master
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ error: "GitHub API Error", details: errorText }), { status: 500 });
    }

    // Success!
    return new Response(JSON.stringify({ 
      success: true, 
      message: "تم رفع الإعلان بنجاح!", 
      url: `https://meamart.com/businesses/${slug}`
    }), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
