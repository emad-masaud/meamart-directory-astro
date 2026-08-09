export async function onRequestPost(context) {
  try {
    const formData = await context.request.formData();
    
    // Extract text fields
    const title = formData.get('title') || 'إعلان جديد';
    const category = formData.get('category') || 'other';
    const city = formData.get('city') || '';
    const area = formData.get('area') || '';
    const description = formData.get('description') || '';
    const price = formData.get('price') || '';
    const name = formData.get('name') || '';
    const phone = formData.get('phone') || '';
    const callorchat = formData.get('callorchat') || 'whatsapp';
    
    // The images
    const images = formData.getAll('images');
    
    const githubToken = context.env.GITHUB_TOKEN;
    if (!githubToken) {
      return new Response(JSON.stringify({ success: false, error: "Missing GITHUB_TOKEN" }), { status: 500 });
    }

    // Generate unique slug
    const uniqueId = `ad-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const slug = uniqueId;
    const githubRepo = "emad-masaud/meamart-directory-astro";
    
    const finalImagePaths = [];

    // Upload images to GitHub
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      if (file && file.size > 0) {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        // Doing this in chunks or using a modern approach to avoid Maximum call stack size
        for (let j = 0; j < bytes.byteLength; j++) {
            binary += String.fromCharCode(bytes[j]);
        }
        const base64Image = btoa(binary);
        
        const ext = file.name.split('.').pop() || 'jpg';
        const imgFileName = i === 0 ? `${slug}.${ext}` : `${slug}-${i + 1}.${ext}`;
        const imagePath = `public/images/businesses/${imgFileName}`;
        
        const uploadImgRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${imagePath}`, {
          method: "PUT",
          headers: {
            "Authorization": `Bearer ${githubToken}`,
            "Content-Type": "application/json",
            "User-Agent": "MeaMart-Website"
          },
          body: JSON.stringify({
            message: `Upload image ${i + 1} for ad: ${slug}`,
            content: base64Image,
            branch: "main"
          })
        });

        if (uploadImgRes.ok) {
          finalImagePaths.push(`/images/businesses/${imgFileName}`);
        }
        
        // Wait 1 second before the next image to avoid GitHub API 409 Conflict (parallel commits)
        if (i < images.length - 1) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    // Prepare JSON file content
    const fileContent = {
      id: slug,
      slug: slug,
      title: title,
      advertiser_name: name,
      description: description,
      category: category,
      city: city,
      phone: phone,
      whatsapp: callorchat === 'whatsapp' || callorchat === 'callnchat' ? phone : "",
      price: price,
      image: finalImagePaths.length > 0 ? finalImagePaths[0] : "",
      images: finalImagePaths.length > 0 ? finalImagePaths : [],
      published: true,
      featured: false,
      tags: []
    };

    if (city) fileContent.tags.push(city);
    if (area) fileContent.tags.push(area);
    if (price) fileContent.tags.push(price);

    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(fileContent, null, 2))));
    const filePath = `src/data/businesses/${slug}.json`;

    // Save JSON to GitHub
    const response = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${filePath}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "MeaMart-Website",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Add new ad: ${title} via Website`,
        content: contentBase64,
        branch: "main"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({ success: false, error: "GitHub API Error", details: errorText }), { status: 500 });
    }

    // Trigger WhatsApp Flow (Flow ID: 2032843)
    // The user requested to send Flow 2032843 to the customer when the ad is created successfully.
    const metaToken = context.env.META_API_TOKEN;
    const phoneId = context.env.WABA_PHONE_ID; // WhatsApp Business Account Phone Number ID
    
    if (metaToken && phoneId && phone) {
      // Format phone (must be international format without +)
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('05')) {
         formattedPhone = '966' + formattedPhone.substring(1);
      }
      
      try {
        await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${metaToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: formattedPhone,
            type: "interactive",
            interactive: {
              type: "flow",
              header: {
                type: "text",
                text: "تم استلام إعلانك بنجاح!"
              },
              body: {
                text: `مرحباً ${name}، لقد تم استلام إعلانك "${title}". يرجى إكمال الخطوات عبر النموذج التالي.`
              },
              footer: {
                text: "ميمارت"
              },
              action: {
                name: "flow",
                parameters: {
                  flow_message_version: "3",
                  flow_token: slug, // we can use the ad slug as token to track it
                  flow_id: "2032843",
                  flow_cta: "إكمال الإجراءات",
                  flow_action: "navigate",
                  flow_action_payload: {
                    screen: "START",
                    data: {
                      ad_id: slug,
                      title: title
                    }
                  }
                }
              }
            }
          })
        });
      } catch (e) {
        console.error("Failed to send WhatsApp Flow", e);
        // We still return success since the ad was created successfully
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "تم إنشاء الإعلان بنجاح", 
      url: `/ar/ads/${slug}`
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
