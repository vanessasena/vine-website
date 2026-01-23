import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

async function getUserDisplayName(
  supabase: any,
  user: any
) {
  const { data: profile } = await supabase
    .from('member_profiles')
    .select('name')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    (profile?.name as string) ||
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email ||
    'Teacher'
  );
}

// GET /api/check-ins - Fetch current checked-in children or check-in history
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // 'checked_in' or 'checked_out' or null for all
    const fromDate = searchParams.get('from_date');
    const toDate = searchParams.get('to_date');
    const useView = searchParams.get('use_view') === 'true';

    // If use_view is true, use the materialized view for current check-ins
    if (useView && status === 'checked_in') {
      const { data: checkIns, error } = await supabase
        .from('current_checked_in_children')
        .select('*')
        .order('checked_in_at', { ascending: false });

      if (error) {
        console.error('Error fetching from view:', error);
        return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
      }

      return NextResponse.json(checkIns || []);
    }

    // Build query
    let query = supabase
      .from('check_ins')
      .select(`
        *,
        member_child:children(
          id,
          name,
          date_of_birth,
          allergies,
          special_needs,
          photo_permission,
          parent1:member_profiles!children_parent1_id_fkey(id, name, phone),
          parent2:member_profiles!children_parent2_id_fkey(id, name, phone)
        ),
        visitor_child:visitor_children(
          id,
          name,
          date_of_birth,
          parent_name,
          parent_phone,
          allergies,
          special_needs,
          emergency_contact_name,
          emergency_contact_phone,
          photo_permission
        )
      `);

    if (status) {
      query = query.eq('status', status);
    }

    // Handle date filtering using checked_in_at timestamp
    if (fromDate) {
      query = query.gte('checked_in_at', `${fromDate}T00:00:00`);
    }
    if (toDate) {
      query = query.lte('checked_in_at', `${toDate}T23:59:59`);
    }

    query = query.order('checked_in_at', { ascending: false });

    const { data: checkIns, error } = await query;

    if (error) {
      console.error('Error fetching check-ins:', error);
      return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
    }

    const transformed = (checkIns || []).map((ci) => {
      const child = ci.member_child || ci.visitor_child;
      const isMember = !!ci.member_child;

      const parentName = isMember
        ? ci.member_child?.parent1?.name || ci.member_child?.parent2?.name || ''
        : ci.visitor_child?.parent_name || '';

      const parentPhone = isMember
        ? ci.member_child?.parent1?.phone || ci.member_child?.parent2?.phone || ''
        : ci.visitor_child?.parent_phone || '';

      return {
        checked_in_id: ci.id,
        child_name: child?.name || 'Child',
        child_dob: child?.date_of_birth || '',
        is_member: isMember,
        parent_name: parentName,
        parent_phone: parentPhone,
        allergies: child?.allergies || null,
        special_needs: child?.special_needs || null,
        emergency_contact_name: isMember ? null : ci.visitor_child?.emergency_contact_name || null,
        emergency_contact_phone: isMember ? null : ci.visitor_child?.emergency_contact_phone || null,
        checked_in_at: ci.checked_in_at,
        checked_in_by_name: ci.checked_in_by_name,
        checked_out_at: ci.checked_out_at,
        checked_out_by_name: ci.checked_out_by_name,
        notes: ci.checkin_notes || null,
        status: ci.status,
      };
    });

    return NextResponse.json(transformed);
  } catch (error) {
    console.error('Error in GET /api/check-ins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/check-ins - Create a new check-in
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has teacher, leader, or admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== 'teacher' && userData.role !== 'leader' && userData.role !== 'admin')
    ) {
      return NextResponse.json({ error: 'Forbidden: Teacher, leader, or admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      member_child_id,
      visitor_child_id,
      checkin_notes
    } = body;

    // Ensure exactly one child type is provided
    if ((!member_child_id && !visitor_child_id) || (member_child_id && visitor_child_id)) {
      return NextResponse.json(
        { error: 'Exactly one of member_child_id or visitor_child_id must be provided' },
        { status: 400 }
      );
    }

    // Insert check-in record
    const displayName = await getUserDisplayName(supabase, user);

    const { data: checkIn, error } = await supabase
      .from('check_ins')
      .insert({
        member_child_id: member_child_id || null,
        visitor_child_id: visitor_child_id || null,
        checked_in_by: user.id,
        checked_in_by_name: displayName,
        checkin_notes: checkin_notes || null,
        status: 'checked_in'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating check-in:', error);
      return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 });
    }

    return NextResponse.json({ data: checkIn }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/check-ins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/check-ins - Update check-in (for check-out)
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user has teacher, leader, or admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (
      userError ||
      !userData ||
      (userData.role !== 'teacher' && userData.role !== 'leader' && userData.role !== 'admin')
    ) {
      return NextResponse.json({ error: 'Forbidden: Teacher, leader, or admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      checkout_notes
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      );
    }

    const displayName = await getUserDisplayName(supabase, user);

    // Update check-in to checked-out status
    const { data: checkIn, error } = await supabase
      .from('check_ins')
      .update({
        checked_out_at: new Date().toISOString(),
        checked_out_by: user.id,
        checked_out_by_name: displayName,
        checkout_notes: checkout_notes || null,
        status: 'checked_out'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating check-in:', error);
      return NextResponse.json({ error: 'Failed to update check-in' }, { status: 500 });
    }

    return NextResponse.json({ data: checkIn });
  } catch (error) {
    console.error('Error in PUT /api/check-ins:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
