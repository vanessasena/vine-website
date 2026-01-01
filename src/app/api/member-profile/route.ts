import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile
    const { data: profile, error } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Get user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError) {
      console.error('Error fetching user role:', userError);
    }

    return NextResponse.json({
      data: profile || null,
      role: userData?.role || 'member'
    });
  } catch (error) {
    console.error('Error in GET /api/member-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      date_of_birth,
      phone,
      email,
      is_baptized,
      pays_tithe,
      volunteer_areas,
      volunteer_outros_details,
      life_group,
      is_married,
      spouse_name,
      children
    } = body;

    // Validate required fields
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: 'Name, phone, and email are required' },
        { status: 400 }
      );
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('member_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already exists. Use PUT to update.' },
        { status: 400 }
      );
    }

    // Create the profile
    const { data, error } = await supabase
      .from('member_profiles')
      .insert({
        user_id: user.id,
        name,
        date_of_birth: date_of_birth || null,
        phone,
        email,
        is_baptized: is_baptized || false,
        pays_tithe: pays_tithe || false,
        volunteer_areas: volunteer_areas || [],
        volunteer_outros_details: volunteer_outros_details || null,
        life_group: life_group || null,
        is_married: is_married || false,
        spouse_name: spouse_name || null
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/member-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      date_of_birth,
      phone,
      email,
      is_baptized,
      pays_tithe,
      volunteer_areas,
      volunteer_outros_details,
      life_group,
      is_married,
      spouse_name,
      children
    } = body;

    // Validate required fields
    if (!name || !phone || !email) {
      return NextResponse.json(
        { error: 'Name, phone, and email are required' },
        { status: 400 }
      );
    }

    // Update the profile
    const { data, error } = await supabase
      .from('member_profiles')
      .update({
        name,
        date_of_birth: date_of_birth || null,
        phone,
        email,
        is_baptized: is_baptized || false,
        pays_tithe: pays_tithe || false,
        volunteer_areas: volunteer_areas || [],
        volunteer_outros_details: volunteer_outros_details || null,
        life_group: life_group || null,
        is_married: is_married || false,
        spouse_name: spouse_name || null
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/member-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
