import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role key to bypass RLS for reading available spouses
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Get current user's profile ID
    const { data: currentProfile, error: profileError } = await supabase
      .from('member_profiles')
      .select('id, spouse_id')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching current profile:', profileError);
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get all members without a spouse (spouse_id IS NULL)
    // Exclude the current user's profile
    const { data: availableSpouses, error } = await supabase
      .from('member_profiles')
      .select('id, name, phone, is_married, spouse_id')
      .is('spouse_id', null)
      .neq('id', currentProfile.id)
      .order('name');

    console.log('Current Profile:', currentProfile);
    console.log('Available Spouses:', availableSpouses);
    if (error) {
      console.error('Error fetching available spouses:', error);
      return NextResponse.json({ error: 'Failed to fetch available spouses' }, { status: 500 });
    }

    return NextResponse.json({
      data: availableSpouses || []
    });
  } catch (error) {
    console.error('Error in GET /api/available-spouses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
