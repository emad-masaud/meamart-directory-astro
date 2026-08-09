export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const credential = data.credential;
    
    if (!credential) {
      return new Response(JSON.stringify({ success: false, error: "Credential is required" }), { status: 400 });
    }
    
    // Verify the credential using Google's tokeninfo endpoint
    // This works perfectly in Cloudflare Workers environment
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    
    if (!response.ok) {
      return new Response(JSON.stringify({ success: false, error: "Invalid Google Token" }), { status: 401 });
    }

    const payload = await response.json();
    
    // We only accept verified emails
    if (payload.email_verified !== "true") {
      return new Response(JSON.stringify({ success: false, error: "Email not verified" }), { status: 401 });
    }

    const userData = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };
    
    // Encode the JSON payload into a base64 string to store it in a cookie
    const sessionData = btoa(encodeURIComponent(JSON.stringify(userData)));
    
    // Cookie expires in 30 days
    const cookie = `meamart_session=${sessionData}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
    
    return new Response(JSON.stringify({ success: true, user: userData }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500 });
  }
}
