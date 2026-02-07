import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type UserRole = 'member' | 'teacher' | 'leader' | 'admin' | 'trainee';

export interface UserWithRole {
  id: string;
  email: string;
  role: UserRole;
}

export interface RolePermissions {
  canAccessProfile: boolean;
  canAccessKidsCheckin: boolean;
  canManageMembers: boolean;
  canManageVisitors: boolean;
  canAccessAdmin: boolean;
}

/**
 * Get permissions based on user role
 */
export function getRolePermissions(role: UserRole): RolePermissions {
  const permissions: RolePermissions = {
    canAccessProfile: false,
    canAccessKidsCheckin: false,
    canManageMembers: false,
    canManageVisitors: false,
    canAccessAdmin: false,
  };

  switch (role) {
    case 'admin':
      // Admin has access to everything
      permissions.canAccessProfile = true;
      permissions.canAccessKidsCheckin = true;
      permissions.canManageMembers = true;
      permissions.canManageVisitors = true;
      permissions.canAccessAdmin = true;
      break;
    case 'trainee':
      // Trainee has access to profile and admin panel
      permissions.canAccessProfile = true;
      permissions.canAccessAdmin = true;
      break;
    case 'leader':
      // Leader has access to profile, member management, and visitor management
      permissions.canAccessProfile = true;
      permissions.canAccessKidsCheckin = true;
      permissions.canManageMembers = true;
      permissions.canManageVisitors = true;
      break;
    case 'teacher':
      // Teacher has access to profile and kids check-in
      permissions.canAccessProfile = true;
      permissions.canAccessKidsCheckin = true;
      break;
    case 'member':
      // Member only has access to their profile
      permissions.canAccessProfile = true;
      break;
  }

  return permissions;
}

/**
 * Get role label in the specified language
 */
export function getRoleLabel(role: UserRole, locale: string): string {
  const labels: Record<UserRole, { pt: string; en: string }> = {
    admin: { pt: 'Administrador', en: 'Administrator' },
    trainee: { pt: 'Estagiário', en: 'Trainee' },
    leader: { pt: 'Líder', en: 'Leader' },
    teacher: { pt: 'Professor', en: 'Teacher' },
    member: { pt: 'Membro', en: 'Member' },
  };

  return locale === 'pt' ? labels[role].pt : labels[role].en;
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
 * Check if user has admin or trainee role
 */
export async function isAdminOrTrainee(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin' || role === 'trainee';
}

/**
 * Check if user has teacher role or higher
 */
export async function isTeacherOrAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'teacher' || role === 'admin';
}

/**
 * Check if user has leader role or higher
 */
export async function isLeaderOrAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'leader' || role === 'admin';
}

/**
 * Check if user has member role (or admin, since admin has all member permissions)
 */
export async function isMemberOrAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'member' || role === 'teacher' || role === 'leader' || role === 'admin' || role === 'trainee';
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
