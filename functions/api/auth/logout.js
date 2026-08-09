export async function onRequestPost(context) {
  const cookie = `meamart_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
  
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': cookie
    }
  });
}
