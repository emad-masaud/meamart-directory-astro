export async function onRequestPost(context) {
  try {
    const cookieHeader = context.request.headers.get("Cookie");
    let user = null;
    
    // Check authentication
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const sessionCookie = cookies.find(c => c.startsWith('meamart_session='));
      if (sessionCookie) {
        const sessionData = sessionCookie.split('=')[1];
        try {
          user = JSON.parse(decodeURIComponent(atob(sessionData)));
        } catch (e) {
          user = null;
        }
      }
    }

    if (!user || !user.email) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401 });
    }

    const formData = await context.request.formData();
    
    // Extract text fields
    const username = formData.get('username') || '';
    const name = formData.get('name') || user.name || '';
    const description = formData.get('description') || '';
    const countryCode = formData.get('countryCode') || '';
    let rawPhone = formData.get('phone') || '';
    if (countryCode && rawPhone.startsWith('0')) rawPhone = rawPhone.substring(1);
    const phone = countryCode ? countryCode + rawPhone : rawPhone;
    
    // Convert username to lowercase and remove spaces
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');

    const githubToken = context.env.GITHUB_TOKEN;
    if (!githubToken) {
      return new Response(JSON.stringify({ success: false, error: "Missing GITHUB_TOKEN" }), { status: 500 });
    }

    const githubRepo = "emad-masaud/meamart-directory-astro";
    const userId = btoa(user.email).replace(/=/g, '').toLowerCase();

    // 1. Check Username Uniqueness using usernames.json index
    const usernamesIndexPath = "src/data/usernames.json";
    let usernamesIndexSha = null;
    let usernamesData = {};
    
    if (cleanUsername) {
      const indexRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${usernamesIndexPath}`, {
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "User-Agent": "MeaMart-Website"
        }
      });
      
      if (indexRes.ok) {
        const indexFile = await indexRes.json();
        usernamesIndexSha = indexFile.sha;
        try {
          usernamesData = JSON.parse(decodeURIComponent(escape(atob(indexFile.content))));
        } catch (e) {
          console.error("Failed to parse usernames index", e);
        }
      }
      
      // If username exists and it doesn't belong to the current user
      if (usernamesData[cleanUsername] && usernamesData[cleanUsername] !== userId) {
        return new Response(JSON.stringify({ success: false, error: "Username is already taken. Please choose another one." }), { status: 400 });
      }
    }
    
    // Process Avatar
    const avatarFile = formData.get('avatar');
    let avatarPath = "";
    if (avatarFile && avatarFile.size > 0) {
      const ext = avatarFile.name.split('.').pop() || 'jpg';
      const imgFileName = `avatar-${cleanUsername || user.email.replace(/[^a-zA-Z0-9]/g, '')}.${ext}`;
      const imagePath = `public/images/users/${imgFileName}`;
      
      const arrayBuffer = await avatarFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let j = 0; j < bytes.byteLength; j++) {
          binary += String.fromCharCode(bytes[j]);
      }
      const base64Image = btoa(binary);
      
      const uploadImgRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${imagePath}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "MeaMart-Website"
        },
        body: JSON.stringify({
          message: `Update avatar for user: ${user.email}`,
          content: base64Image,
          branch: "main"
        })
      });

      if (uploadImgRes.ok) {
        avatarPath = `/images/users/${imgFileName}`;
      }
      
      // Delay to avoid 409
      await new Promise(r => setTimeout(r, 1000));
    }

    // Process Header
    const headerFile = formData.get('header');
    let headerPath = "";
    if (headerFile && headerFile.size > 0) {
      const ext = headerFile.name.split('.').pop() || 'jpg';
      const imgFileName = `header-${cleanUsername || user.email.replace(/[^a-zA-Z0-9]/g, '')}.${ext}`;
      const imagePath = `public/images/users/${imgFileName}`;
      
      const arrayBuffer = await headerFile.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let j = 0; j < bytes.byteLength; j++) {
          binary += String.fromCharCode(bytes[j]);
      }
      const base64Image = btoa(binary);
      
      const uploadImgRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${imagePath}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "Content-Type": "application/json",
          "User-Agent": "MeaMart-Website"
        },
        body: JSON.stringify({
          message: `Update header for user: ${user.email}`,
          content: base64Image,
          branch: "main"
        })
      });

      if (uploadImgRes.ok) {
        headerPath = `/images/users/${imgFileName}`;
      }
      
      await new Promise(r => setTimeout(r, 1000));
    }

    // Generate unique ID based on email hash or just base64 encode email (already defined above)
    
    // Check if user already exists
    const userFilePath = `src/data/users/${userId}.json`;
    
    // Try to get existing file to preserve old paths if new ones aren't uploaded
    let sha = null;
    let existingData = {};
    const checkRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${userFilePath}`, {
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "MeaMart-Website"
      }
    });
    
    if (checkRes.ok) {
      const fileData = await checkRes.json();
      sha = fileData.sha;
      try {
        existingData = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
      } catch (e) {
        console.error("Failed to parse existing user data", e);
      }
    }
    
    // Prepare JSON file content
    const fileContent = {
      id: userId,
      email: user.email,
      username: cleanUsername || existingData.username || '',
      name: name,
      avatar: avatarPath || existingData.avatar || user.picture || '',
      header: headerPath || existingData.header || '',
      phone: phone || existingData.phone || '',
      description: description || existingData.description || '',
      createdAt: existingData.createdAt || new Date().toISOString(),
    };

    const contentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(fileContent, null, 2))));

    // Save JSON to GitHub
    const reqBody = {
      message: `Update profile for user: ${user.email}`,
      content: contentBase64,
      branch: "main"
    };
    if (sha) reqBody.sha = sha;

    const saveRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${userFilePath}`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${githubToken}`,
        "User-Agent": "MeaMart-Website",
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reqBody)
    });

    if (!saveRes.ok) {
      const errorData = await saveRes.json();
      return new Response(JSON.stringify({ success: false, error: errorData.message || "Failed to save profile" }), { status: saveRes.status });
    }

    // Update usernames.json index if username changed or is new
    if (cleanUsername && usernamesData[cleanUsername] !== userId) {
      // Remove old username if they had one
      const oldUsername = Object.keys(usernamesData).find(key => usernamesData[key] === userId);
      if (oldUsername) {
        delete usernamesData[oldUsername];
      }
      
      usernamesData[cleanUsername] = userId;
      
      const indexContentBase64 = btoa(unescape(encodeURIComponent(JSON.stringify(usernamesData, null, 2))));
      const indexReqBody = {
        message: `Update username index for: ${cleanUsername}`,
        content: indexContentBase64,
        branch: "main"
      };
      if (usernamesIndexSha) indexReqBody.sha = usernamesIndexSha;
      
      // Delay to avoid 409
      await new Promise(r => setTimeout(r, 1000));
      
      await fetch(`https://api.github.com/repos/${githubRepo}/contents/${usernamesIndexPath}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${githubToken}`,
          "User-Agent": "MeaMart-Website",
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify(indexReqBody)
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      url: `/${cleanUsername ? 'seller/@' + cleanUsername : 'dashboard'}` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
