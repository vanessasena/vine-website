import { supabase } from './supabase';

export async function getSession() {
  if (!supabase) {
    return null;
  }

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (err) {
    console.error('Unexpected error getting session:', err);
    return null;
  }
}

export async function signOut() {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('Unexpected error signing out:', err);
    return { error: err };
  }
}

export async function checkAuth() {
  const session = await getSession();
  return !!session;
}
