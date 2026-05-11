import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Mark this route as dynamic since it uses request headers
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      logger.authFailure('GET /api/available-spouses: missing auth header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // First verify the user with anon key
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user session
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      logger.authFailure('GET /api/available-spouses: invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key to bypass RLS for reading available spouses
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get current user's profile ID
    const { data: currentProfile, error: profileError } = await supabase
      .from('member_profiles')
      .select('id, spouse_id, gender')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      logger.error('GET /api/available-spouses: profile fetch failed', { error: profileError });
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get all members who don't have a spouse linked yet
    // Regardless of their is_married status (they might be waiting for spouse to register)
    // Exclude the current user's profile
    // If the current user's gender is not set, return a warning (cannot determine opposite gender)
    if (!currentProfile.gender) {
      return NextResponse.json({ data: [], warning: 'missing_gender' });
    }

    const { data: availableSpouses, error } = await supabase
      .from('member_profiles')
      .select('id, name, phone, is_married, spouse_id, gender')
      .is('spouse_id', null)
      .neq('id', currentProfile.id)
      .neq('gender', currentProfile.gender)
      .order('name');

    if (error) {
      logger.error('GET /api/available-spouses: fetch failed', { error });
      return NextResponse.json({ error: 'Failed to fetch available spouses' }, { status: 500 });
    }

    return NextResponse.json({
      data: availableSpouses || []
    });
  } catch (error) {
    logger.error('GET /api/available-spouses: unexpected error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
