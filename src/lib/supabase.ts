import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase client configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Client-side Supabase client (singleton)
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

// Server-side client cache (singleton pattern)
let serverClientCache: SupabaseClient<Database> | null = null;
let adminClientCache: SupabaseClient<Database> | null = null;

// Create a Supabase client for server-side operations (for API routes)
// This uses environment variables directly from process.env which are only available server-side
// Returns cached instance to avoid multiple client creation
export function createSupabaseServerClient(): SupabaseClient<Database> | null {
  // Return cached client if available
  if (serverClientCache) {
    return serverClientCache;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  // Create and cache the client
  serverClientCache = createClient<Database>(url, key);
  return serverClientCache;
}

// Create admin client with service role key (bypasses RLS)
// This should ONLY be used server-side in API routes after verifying authentication
// Returns cached instance to avoid multiple client creation
export function createSupabaseAdminClient(): SupabaseClient<Database> | null {
  // Return cached client if available
  if (adminClientCache) {
    return adminClientCache;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return null;
  }

  // Create and cache the admin client
  adminClientCache = createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return adminClientCache;
}

// Deprecated - kept for backward compatibility
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
  return createSupabaseAdminClient();
}

// Create a server-side Supabase client with a user's access token
export function getSupabaseServerClient(accessToken: string): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
