export async function onRequestPost(context) {
  try {
    // 1. Get the data from the webhook (MeaChat WhatsApp Flow)
    const data = await context.request.json();
    
    // 2. Get the GitHub Token from Cloudflare Environment Variables
    const githubToken = context.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return new Response(JSON.stringify({ error: "Missing GITHUB_TOKEN" }), { status: 500 });
    }

    // We use the ID generated from your WhatsApp Flow (if provided), otherwise generate a unique one
    const uniqueId = data.id || data.code || Date.now().toString();
    // Format it safely for URLs (lowercase, no spaces)
    const slug = uniqueId.toString().toLowerCase().replace(/\s+/g, '-');
    
    // Handle photo which might be an array or object from MeaChat PhotoPicker
    let coverImageUrl = data.image || data.photo || "";
    
    if (Array.isArray(coverImageUrl)) {
      coverImageUrl = coverImageUrl.length > 0 ? coverImageUrl[0] : "";
    }
    
    if (typeof coverImageUrl === 'object' && coverImageUrl !== null) {
      // If it has an 'id' (WhatsApp Media ID), reconstruct the MeaChat preview URL
      if (coverImageUrl.id) {
        coverImageUrl = `https://app.meachat.com/whatsapp/livechat/conversation/file/preview/${coverImageUrl.id}/image?bot_id=410479`;
      } else {
        // Try to extract URL from common object keys used by chatbots/WhatsApp
        coverImageUrl = coverImageUrl.url || coverImageUrl.media_url || coverImageUrl.link || coverImageUrl.cdn_url || coverImageUrl.media_id || "";
      }
    }
    
    if (typeof coverImageUrl !== 'string' || coverImageUrl === "[object Object]") {
      coverImageUrl = "";
    }

    // 2.5 Fetch image from Meta API (bypassing MeaChat Cloudflare)
    let finalCoverImagePath = coverImageUrl;
    const mediaIdMatch = coverImageUrl.match(/\/preview\/(\d+)\//);
    
    if (mediaIdMatch && mediaIdMatch[1]) {
      const mediaId = mediaIdMatch[1];
      const metaToken = context.env.META_API_TOKEN || "EAASgaIVMPuUBSGoK1RjkaZAQbqXVej0jpecTg8yT0zu0C04WomLe3UzycjG5p7u3iOtb3uGB6nDhVvtl2iKVNWy5e8rWOA5yZBUZBVHSTFjgCUwZCsjbGm1omPBqsROA5gOU5xfqmPTFCd7DClLpYBY3mg9KYkFGhkuZB5ThFpOWK6wBJp4IanEfDgpFRXnmErgZDZD";
      
      try {
        // Step 1: Get media URL from Meta Graph API
        const metaRes = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
          headers: { "Authorization": `Bearer ${metaToken}` }
        });
        
        if (metaRes.ok) {
          const metaData = await metaRes.json();
          if (metaData.url) {
            // Step 2: Download the actual image binary
            const imageRes = await fetch(metaData.url, {
              headers: { "Authorization": `Bearer ${metaToken}` }
            });
            
            if (imageRes.ok) {
              const contentType = imageRes.headers.get("content-type") || "";
              if (contentType.startsWith("image/")) {
                const arrayBuffer = await imageRes.arrayBuffer();
                
                // Convert ArrayBuffer to Base64 safely
                const bytes = new Uint8Array(arrayBuffer);
                let binary = '';
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64Image = btoa(binary);
                
                // Determine extension and path
                const ext = contentType.split("/")[1] || "jpg";
                const imagePath = `public/images/businesses/${slug}.${ext}`;
                const githubRepo = "emad-masaud/meamart-directory-astro";
                
                // Check if image exists to get SHA (for updates)
                let imageSha = null;
                const getImgRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${imagePath}`, {
                    headers: { "Authorization": `Bearer ${githubToken}`, "User-Agent": "MeaMart-Webhook" }
                });
                if (getImgRes.ok) {
                    const imgData = await getImgRes.json();
                    imageSha = imgData.sha;
                }
                
                // Upload image to GitHub
                const uploadImgRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${imagePath}`, {
                  method: "PUT",
                  headers: {
                    "Authorization": `Bearer ${githubToken}`,
                    "Content-Type": "application/json",
                    "User-Agent": "MeaMart-Webhook"
                  },
                  body: JSON.stringify({
                    message: `Upload image for ad: ${slug}`,
                    content: base64Image,
                    branch: "main",
                    ...(imageSha && { sha: imageSha })
                  })
                });

                if (uploadImgRes.ok) {
                  finalCoverImagePath = `/images/businesses/${slug}.${ext}`;
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Meta Image fetch/upload error:", error);
      }
    }

    // 3. Map WhatsApp data to our Astro JSON schema
    const fileContent = {
      id: uniqueId,
      slug: slug,
      nameAr: data.title || "إعلان جديد",
      nameEn: data.title || "New Ad",
      descriptionAr: data.description || "",
      descriptionEn: data.description || "",
      category: data.category || "other",
      city: data.city || "",
      phone: data.phone || data.whatsapp || "",
      whatsapp: data.phone || data.whatsapp || "",
      coverImage: finalCoverImagePath,
      published: true, // Automatically publish the ad
      featured: false,
      tags: data.tags ? data.tags.split(",").map(t => t.trim()) : []
    };

    // If city or area are provided, automatically add them to tags so they become clickable filters!
    if (fileContent.city && !fileContent.tags.includes(fileContent.city)) {
      fileContent.tags.push(fileContent.city);
    }
    // We use "area" for neighborhood/landmark to keep "address" free for exact GPS/Street addresses in the future
    if (data.area && !fileContent.tags.includes(data.area)) {
      fileContent.tags.push(data.area);
    }

    // 4. Convert the JSON object to Base64 (Required by GitHub API)
    // We use unescape(encodeURIComponent()) to handle Arabic text correctly
    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(fileContent, null, 2))));
    
    // 5. GitHub API settings
    // Replace with your exact GitHub username and repository name
    const githubRepo = "emad-masaud/meamart-directory-astro";
    const filePath = `src/data/businesses/${slug}.json`;
    
    // 5.5 Check if file already exists to get its SHA (required for updating files)
    let fileSha = null;
    const getResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "MeaMart-Webhook",
        "Accept": "application/vnd.github.v3+json"
      }
    });
    
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      fileSha = fileData.sha;
    }

    // 6. Send the file to GitHub (Create or Update)
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "MeaMart-Webhook",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: fileSha ? `Update ad: ${fileContent.nameAr} via WhatsApp` : `Add new ad: ${fileContent.nameAr} via WhatsApp`,
        content: contentBase64,
        branch: "main",
        ...(fileSha && { sha: fileSha }) // Include SHA if we are updating an existing file
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
