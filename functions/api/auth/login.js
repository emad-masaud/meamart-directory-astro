export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const phone = data.phone;
    
    if (!phone) {
      return new Response(JSON.stringify({ success: false, error: "Phone number is required" }), { status: 400 });
    }
    
    // In a real app we'd verify OTP here.
    // For now we trust the phone number and set it in a secure HTTP Only cookie.
    
    // Cookie expires in 30 days
    const cookie = `meamart_session=${phone}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`;
    
    return new Response(JSON.stringify({ success: true }), {
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
