import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration du client Supabase
let supabaseInstance: SupabaseClient | null = null;

declare const process: {
  env?: {
    [key: string]: string | undefined;
  };
};

const DEFAULT_SUPABASE_URL = 'https://sjrzcyfvrrfmrbgekwhn.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcnpjeWZ2cnJmbXJiZ2Vrd2huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTkwNDAsImV4cCI6MjEwNTEzNTA0MH0.8HuWJJbzaOTXTVCF8ddWpqgMtmRoTf0zCrNSuDPiTW8';

export function getSupabaseClient(supabaseUrl?: string, supabaseKey?: string): SupabaseClient | null {
  const metaEnv = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

  const url = supabaseUrl || metaEnv.VITE_SUPABASE_URL || procEnv.VITE_SUPABASE_URL || procEnv.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = supabaseKey || metaEnv.VITE_SUPABASE_ANON_KEY || procEnv.VITE_SUPABASE_ANON_KEY || procEnv.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

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

