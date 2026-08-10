import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { getEnv } from './env';

// 1. Client for browser/static use
const STATIC_URL = process.env.PUBLIC_SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || import.meta.env.SUPABASE_URL || 'https://db.meamart.com';
const STATIC_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || 'dummy_anon_key_for_build_purposes_only';
const STATIC_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key_for_build_purposes_only';

export const supabaseBrowserClient = createClient(STATIC_URL, STATIC_ANON_KEY);

// 2. Client for Server Side Rendering (SSR) in Astro endpoints/pages
export function createSupabaseServerClient(context: any) {
  const url = getEnv(context?.locals, 'PUBLIC_SUPABASE_URL') || getEnv(context?.locals, 'SUPABASE_URL', STATIC_URL);
  const anonKey = getEnv(context?.locals, 'PUBLIC_SUPABASE_ANON_KEY') || getEnv(context?.locals, 'SUPABASE_ANON_KEY', STATIC_ANON_KEY);

  return createServerClient(url, anonKey, {
    cookies: {
      get(name) {
        return context?.cookies?.get(name)?.value;
      },
      set(name, value, options) {
        context?.cookies?.set(name, value, options);
      },
      remove(name, options) {
        context?.cookies?.delete(name, options);
      },

    },
  });
}

// 3. Admin client helper (Bypasses RLS dynamically per request)
export function createSupabaseAdminServerClient(context?: any) {
  const url = getEnv(context?.locals, 'PUBLIC_SUPABASE_URL') || getEnv(context?.locals, 'SUPABASE_URL', STATIC_URL);
  const serviceKey = getEnv(context?.locals, 'SUPABASE_SERVICE_ROLE_KEY', STATIC_SERVICE_KEY);
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// Static admin fallback
export const supabaseAdminClient = createClient(STATIC_URL, STATIC_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});
