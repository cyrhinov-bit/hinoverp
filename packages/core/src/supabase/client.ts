import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration du client Supabase
let supabaseInstance: SupabaseClient | null = null;

declare const process: {
  env?: {
    [key: string]: string | undefined;
  };
};

export function getSupabaseClient(supabaseUrl?: string, supabaseKey?: string): SupabaseClient | null {
  const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

  const url = supabaseUrl || metaEnv.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL || procEnv.SUPABASE_URL;
  const key = supabaseKey || metaEnv.VITE_SUPABASE_ANON_KEY || procEnv.VITE_SUPABASE_ANON_KEY || procEnv.SUPABASE_ANON_KEY;

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

