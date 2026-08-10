import { createSupabaseAdminServerClient } from '~/utils/supabase';

export const prerender = false;

export async function POST(context: any) {
  try {
    const body = await context.request.json();
    const { name, email, password, mode } = body;

    const supabase = createSupabaseAdminServerClient(context);

    if (mode === 'register') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });
      if (error) throw error;
      
      // Auto-set the session for Cloudflare Pages format (meamart_session cookie)
      if (data.user) {
        const userData = {
          email: data.user.email,
          name: name,
          id: data.user.id
        };
        const sessionData = btoa(encodeURIComponent(JSON.stringify(userData)));
        
        return new Response(JSON.stringify({ success: true, message: 'Registered successfully', requires2FA: false }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `meamart_session=${sessionData}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
          }
        });
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      if (data.user) {
        const userData = {
          email: data.user.email,
          name: data.user.user_metadata?.full_name || '',
          id: data.user.id
        };
        const sessionData = btoa(encodeURIComponent(JSON.stringify(userData)));
        
        return new Response(JSON.stringify({ success: true, message: 'Signed in successfully', requires2FA: false }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': `meamart_session=${sessionData}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`
          }
        });
      }
    }

    return new Response(JSON.stringify({ success: false, error: 'Unknown error occurred' }), { status: 400 });
  } catch (error: any) {
    console.error("Auth error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message || 'Authentication failed' }), { status: 400 });
  }
}
