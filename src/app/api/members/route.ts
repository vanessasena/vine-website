import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.authFailure('GET /api/members: missing token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logger.authFailure('GET /api/members: invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify leader or admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin' && userData?.role !== 'leader') {
      logger.authFailure('GET /api/members: forbidden', { userId: user.id, role: userData?.role });
      return NextResponse.json({ error: 'Forbidden: Admin or leader role required' }, { status: 403 });
    }

    // Fetch all member profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('member_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      throw profilesError;
    }

    return NextResponse.json(profiles || []);
  } catch (error) {
    logger.error('GET /api/members: error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
