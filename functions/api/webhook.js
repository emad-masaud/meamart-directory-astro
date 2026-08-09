export async function onRequestPost(context) {
  try {
    // 1. Get the data from the webhook (MeaChat WhatsApp Flow)
    let data = {};
    const contentType = context.request.headers.get("content-type") || "";
    
    try {
      if (contentType.includes("application/json")) {
        data = await context.request.json();
      } else if (contentType.includes("form-data") || contentType.includes("x-www-form-urlencoded")) {
        const formData = await context.request.formData();
        data = Object.fromEntries(formData.entries());
      } else {
        const text = await context.request.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          // If it's URL-encoded string like phone=test...
          const searchParams = new URLSearchParams(text);
          data = Object.fromEntries(searchParams.entries());
        }
      }
    } catch (e) {
      return new Response(JSON.stringify({ error: "Failed to parse incoming data", details: e.message }), { status: 400 });
    }
    
    // Ignore BotSailor system webhooks (like message delivered, new subscriber)
    // We only want to process actual form submissions.
    if (data.webhook_type === "message_status_change" || data.webhook_type === "new_subscriber") {
      return new Response(JSON.stringify({ success: true, message: "Ignored system webhook" }), { status: 200 });
    }
    
    // 2. Get the GitHub Token from Cloudflare Environment Variables
    const githubToken = context.env.GITHUB_TOKEN;
    
    if (!githubToken) {
      return new Response(JSON.stringify({ error: "Missing GITHUB_TOKEN" }), { status: 500 });
    }

    // We use the ID generated from your WhatsApp Flow (if provided)
    // If not provided, we generate a SMART ID using a timestamp and random string (protects phone number privacy)
    const uniqueId = data.id || data.code || `ad-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    // Format it safely for URLs (lowercase, remove any special chars like # or ? that break URLs)
    const slug = uniqueId.toString().toLowerCase().replace(/[^a-z0-9\-_]+/gi, '-').replace(/^-+|-+$/g, '');
    
    // Handle photo which might be an array or object from MeaChat PhotoPicker
    let rawImages = data.image || data.photo || [];
    
    // Normalize to array
    if (!Array.isArray(rawImages)) {
      rawImages = rawImages ? [rawImages] : [];
    }
    
    // Extract URLs from each image (could be objects with id, or strings)
    const imageUrls = rawImages.map(img => {
      if (typeof img === 'string') return img;
      if (typeof img === 'object' && img !== null) {
        if (img.id) return `https://app.meachat.com/whatsapp/livechat/conversation/file/preview/${img.id}/image?bot_id=410479`;
        return img.url || img.media_url || img.link || img.cdn_url || "";
      }
      return "";
    }).filter(url => url && url !== "[object Object]");

    // 2.5 Fetch ALL images from Meta API and upload to GitHub
    const finalImagePaths = [];
    const githubRepo = "emad-masaud/meamart-directory-astro";
    
    for (let i = 0; i < imageUrls.length; i++) {
      const imgUrl = imageUrls[i];
      const mediaIdMatch = imgUrl.match(/\/preview\/(\d+)\//);
      
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
                  
                  const bytes = new Uint8Array(arrayBuffer);
                  let binary = '';
                  for (let j = 0; j < bytes.byteLength; j++) {
                      binary += String.fromCharCode(bytes[j]);
                  }
                  const base64Image = btoa(binary);
                  
                  const ext = contentType.split("/")[1] || "jpg";
                  // First image: slug.ext, subsequent: slug-2.ext, slug-3.ext
                  const imgFileName = i === 0 ? `${slug}.${ext}` : `${slug}-${i + 1}.${ext}`;
                  const imagePath = `public/images/businesses/${imgFileName}`;
                  
                  // Check if image exists (for updates)
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
                      message: `Upload image ${i + 1} for ad: ${slug}`,
                      content: base64Image,
                      branch: "main",
                      ...(imageSha && { sha: imageSha })
                    })
                  });

                  if (uploadImgRes.ok) {
                    finalImagePaths.push(`/images/businesses/${imgFileName}`);
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error(`Meta Image fetch/upload error for image ${i + 1}:`, error);
        }
      } else if (imgUrl.startsWith("http")) {
        // External URL, keep as-is
        finalImagePaths.push(imgUrl);
      }
    }

    // 3. Map WhatsApp data to our Astro JSON schema
    const fileContent = {
      id: uniqueId,
      slug: slug,
      title: data.title || data?.form_data?.title || "إعلان جديد",
      advertiser_name: data.advertiser_name || data.name || data?.form_data?.name || "",
      description: data.description || data?.form_data?.description || "",
      category: data.category || data?.form_data?.category || "other",
      city: data.city || data?.form_data?.city || "",
      phone: data.phone || data?.form_data?.phone || "",
      whatsapp: data.whatsapp || data.phone || data?.form_data?.whatsapp || "",
      image: finalImagePaths.length === 1 ? finalImagePaths[0] : (finalImagePaths.length > 1 ? finalImagePaths : ""),
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
    // githubRepo already declared above in image upload section
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

    // Handle Deletion
    if (data.action === "delete") {
      if (!fileSha) {
         return new Response(JSON.stringify({ error: "Ad not found or already deleted." }), { status: 404, headers: { "Content-Type": "application/json" } });
      }
      
      const delResponse = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "User-Agent": "MeaMart-Webhook",
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Delete ad: ${slug} via WhatsApp`,
          sha: fileSha,
          branch: "main"
        })
      });

      if (!delResponse.ok) {
        const errorText = await delResponse.text();
        return new Response(JSON.stringify({ error: "Failed to delete ad", details: errorText }), { status: 500, headers: { "Content-Type": "application/json" } });
      }

      return new Response(JSON.stringify({ success: true, message: "تم حذف الإعلان بنجاح" }), { headers: { "Content-Type": "application/json" } });
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
      url: `https://meamart.com/businesses/${slug}`,
      id: slug,
      advertiser_name: fileContent.advertiser_name
    }), {
      headers: { "Content-Type": "application/json" }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
