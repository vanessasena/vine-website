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
      gender,
      is_baptized,
      pays_tithe,
      spiritual_courses,
      encounter_with_god,
      church_role,
      volunteer_areas,
      volunteer_outros_details,
      life_group,
      is_married,
      spouse_id,
      children
    } = body;

    let spouse_name = body.spouse_name; // Extract separately so it can be reassigned

    // Validate required fields
    if (!name || !phone || !email || !date_of_birth || !gender || !church_role) {
      return NextResponse.json(
        { error: 'Name, phone, email, date_of_birth, gender, and church_role are required' },
        { status: 400 }
      );
    }

    // If spouse_id is provided, validate it exists and doesn't have a spouse
    if (spouse_id) {
      const { data: spouseProfile, error: spouseError } = await supabase
        .from('member_profiles')
        .select('id, name, spouse_id')
        .eq('id', spouse_id)
        .single();

      if (spouseError || !spouseProfile) {
        return NextResponse.json(
          { error: 'Selected spouse not found' },
          { status: 400 }
        );
      }

      if (spouseProfile.spouse_id) {
        return NextResponse.json(
          { error: 'Selected person already has a spouse' },
          { status: 400 }
        );
      }

      // Set spouse_name from the spouse's profile for denormalization
      spouse_name = spouseProfile.name;
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
        gender,
        is_baptized: is_baptized || false,
        pays_tithe: pays_tithe || false,
        spiritual_courses: spiritual_courses || [],
        encounter_with_god: encounter_with_god || false,
        church_role,
        volunteer_areas: volunteer_areas || [],
        volunteer_outros_details: volunteer_outros_details || null,
        life_group: life_group || null,
        is_married: is_married || false,
        spouse_id: spouse_id || null,
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
      gender,
      is_baptized,
      pays_tithe,
      spiritual_courses,
      encounter_with_god,
      church_role,
      volunteer_areas,
      volunteer_outros_details,
      life_group,
      is_married,
      spouse_id,
      children
    } = body;

    let spouse_name = body.spouse_name; // Extract separately so it can be reassigned

    // Validate required fields
    if (!name || !phone || !email || !date_of_birth || !gender || !church_role) {
      return NextResponse.json(
        { error: 'Name, phone, email, date_of_birth, gender, and church_role are required' },
        { status: 400 }
      );
    }

    // Get current user's profile to check spouse relationships
    const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: currentProfile } = await supabaseServiceRole
      .from('member_profiles')
      .select('id, spouse_id')
      .eq('user_id', user.id)
      .single();

    if (!currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // If spouse_id is provided, validate it exists and doesn't have a different spouse
    if (spouse_id) {
      const { data: spouseProfile, error: spouseError } = await supabaseServiceRole
        .from('member_profiles')
        .select('id, name, spouse_id')
        .eq('id', spouse_id)
        .single();

      if (spouseError || !spouseProfile) {
        return NextResponse.json(
          { error: 'Selected spouse not found' },
          { status: 400 }
        );
      }

      // Allow if spouse has no spouse_id, or if it already points to current user
      if (spouseProfile.spouse_id && spouseProfile.spouse_id !== currentProfile.id) {
        return NextResponse.json(
          { error: 'Selected person already has a different spouse' },
          { status: 400 }
        );
      }

      // Set spouse_name from the spouse's profile for denormalization
      spouse_name = spouseProfile.name;
    }

    // Update the profile
    const { data, error } = await supabase
      .from('member_profiles')
      .update({
        name,
        date_of_birth: date_of_birth || null,
        phone,
        email,
        gender,
        is_baptized: is_baptized || false,
        pays_tithe: pays_tithe || false,
        spiritual_courses: spiritual_courses || [],
        encounter_with_god: encounter_with_god || false,
        church_role,
        volunteer_areas: volunteer_areas || [],
        volunteer_outros_details: volunteer_outros_details || null,
        life_group: life_group || null,
        is_married: is_married || false,
        spouse_id: spouse_id || null,
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

    // If spouse_id is provided and is_married is true, update the spouse's profile with mutual relationship
    if (spouse_id && is_married) {
      // Get current user's name and ID for the spouse's denormalization
      const currentUserName = name;
      const currentUserId = data.id;

      // Update spouse's profile to link back to current user (use service role to bypass RLS)
      await supabaseServiceRole
        .from('member_profiles')
        .update({
          spouse_id: currentUserId,
          spouse_name: currentUserName,
          is_married: true
        })
        .eq('id', spouse_id);
    }

    // If spouse was removed (spouse_id is null but was previously set), clear spouse's link too
    if (!spouse_id && data.spouse_id) {
      // Previous spouse_id was removed, so clear the previous spouse's link (use service role to bypass RLS)
      await supabaseServiceRole
        .from('member_profiles')
        .update({
          spouse_id: null,
          spouse_name: null,
          is_married: false
        })
        .eq('id', data.spouse_id);
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/member-profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
