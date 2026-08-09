export async function onRequestGet(context) {
  try {
    const cookieHeader = context.request.headers.get("Cookie");
    let phone = null;
    
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      const sessionCookie = cookies.find(c => c.startsWith('meamart_session='));
      if (sessionCookie) {
        phone = sessionCookie.split('=')[1];
      }
    }
    
    if (!phone) {
      return new Response(JSON.stringify({ authenticated: false }), { status: 401 });
    }
    
    return new Response(JSON.stringify({ authenticated: true, phone }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({ authenticated: false, error: error.message }), { status: 500 });
  }
}
