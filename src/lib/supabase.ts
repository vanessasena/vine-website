import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using fallback static data.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
