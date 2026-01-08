import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type UserRole = 'member' | 'admin';

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Check if the current user is authenticated
 */
export async function checkAuth(): Promise<{ user: any; session: any } | null> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return { user: session.user, session };
}

/**
 * Get the current user's role
 */
export async function getUserRole(userId: string): Promise<UserRole | null> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user role:', error);
    return null;
  }

  return data.role as UserRole;
}

/**
 * Check if user has admin role
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}

/**
 * Check if user has member role (or admin, since admin has all member permissions)
 */
export async function isMemberOrAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'member' || role === 'admin';
}

/**
 * Get user with role information
 */
export async function getUserWithRole(userId: string): Promise<UserWithRole | null> {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data, error } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data as UserWithRole;
}

/**
 * Verify authentication and role for API routes
 */
export async function verifyAuthAndRole(
  authHeader: string | null,
  requiredRole?: UserRole
): Promise<{ user: any; role: UserRole } | { error: string; status: number }> {
  if (!authHeader) {
    return { error: 'Unauthorized', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } }
  });

  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 };
  }

  const role = await getUserRole(user.id);

  if (!role) {
    return { error: 'User role not found', status: 403 };
  }

  if (requiredRole && role !== requiredRole && role !== 'admin') {
    return { error: 'Insufficient permissions', status: 403 };
  }

  return { user, role };
}
