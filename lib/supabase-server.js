import { createClient } from '@supabase/supabase-js';

let serviceSingleton = null;
let readSingleton = null;

function mustEnv(name, value) {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function getSupabaseServerClient() {
  if (serviceSingleton) return serviceSingleton;

  const supabaseUrl = mustEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseServiceKey = mustEnv('SUPABASE_SERVICE_ROLE_KEY', process.env.SUPABASE_SERVICE_ROLE_KEY);

  serviceSingleton = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return serviceSingleton;
}

export function getSupabaseReadClient() {
  if (readSingleton) return readSingleton;

  const supabaseUrl = mustEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = mustEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  readSingleton = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return readSingleton;
}
