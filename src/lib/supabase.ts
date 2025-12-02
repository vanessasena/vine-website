import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Only create client if credentials are present
const supabaseClient: SupabaseClient<Database> | null = 
  supabaseUrl && supabaseAnonKey 
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;

if (!supabaseClient) {
  console.warn('Supabase credentials not found. Using fallback static data.');
}

export const supabase = supabaseClient;

// Helper function to check if supabase is available and return it with proper type
export function getSupabaseClient(): SupabaseClient<Database> | null {
  return supabase;
}
