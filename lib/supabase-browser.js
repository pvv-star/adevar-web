/**
 * Browser-side Supabase client (singleton)
 * Used by AuthContext and client components.
 * Session is persisted in localStorage by default.
 */

import { createClient } from '@supabase/supabase-js';

let client = null;

export function getSupabaseBrowserClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  client = createClient(url, anonKey);
  return client;
}
