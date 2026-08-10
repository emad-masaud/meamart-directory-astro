import { createSupabaseAdminServerClient } from '~/utils/supabase';

export const prerender = false;

export async function POST(context: any) {
  try {
    const body = await context.request.json();
    const { name, email, password, mode } = body;

    // Mock authentication for UI testing phase
    const userData = {
      email: email || 'test@example.com',
      name: name || 'Test User',
      id: 'mock-user-123'
    };
    const sessionData = btoa(encodeURIComponent(JSON.stringify(userData)));
    
    return new Response(JSON.stringify({ success: true, message: mode === 'register' ? 'Registered successfully' : 'Signed in successfully', requires2FA: false }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `meamart_session=${sessionData}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
      }
    });

  } catch (error: any) {
    console.error("Auth error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Authentication failed' }), { status: 400 });
  }
}
