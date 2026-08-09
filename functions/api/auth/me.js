export async function onRequestGet(context) {
  try {
    const cookieHeader = context.request.headers.get("Cookie");
    let user = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const sessionCookie = cookies.find(c => c.startsWith('meamart_session='));
      
      if (sessionCookie) {
        const sessionData = sessionCookie.split('=')[1];
        try {
          user = JSON.parse(decodeURIComponent(atob(sessionData)));
        } catch (e) {
          // Invalid session data
          user = null;
        }
      }
    }
    
    if (!user) {
      return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
    }
    
    return new Response(JSON.stringify({ authenticated: true, user }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ authenticated: false, error: error.message }), { status: 500 });
  }
}
