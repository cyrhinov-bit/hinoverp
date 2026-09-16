import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration du client Supabase
let supabaseInstance: SupabaseClient | null = null;

declare const process: {
  env?: {
    [key: string]: string | undefined;
  };
};

export function getSupabaseClient(supabaseUrl?: string, supabaseKey?: string): SupabaseClient | null {
  const envObj = typeof process !== 'undefined' && process.env ? process.env : {};
  const url = supabaseUrl || envObj.VITE_SUPABASE_URL || envObj.SUPABASE_URL;
  const key = supabaseKey || envObj.VITE_SUPABASE_ANON_KEY || envObj.SUPABASE_ANON_KEY;

  if (!url || !key || url.includes('votre-projet') || key.includes('votre-cle')) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return supabaseInstance;
}

export const isSupabaseConfigured = (supabaseUrl?: string, supabaseKey?: string): boolean => {
  return !!getSupabaseClient(supabaseUrl, supabaseKey);
};

