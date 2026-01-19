import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/visitor-children - Fetch visitor children
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

    // Verify user has teacher or admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || (userData.role !== 'teacher' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden: Teacher or admin role required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search'); // Search by name or phone

    let query = supabase
      .from('visitor_children')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,parent_phone.ilike.%${search}%,parent_name.ilike.%${search}%`);
    }

    const { data: children, error } = await query;

    if (error) {
      console.error('Error fetching visitor children:', error);
      return NextResponse.json({ error: 'Failed to fetch visitor children' }, { status: 500 });
    }

    return NextResponse.json(children || []);
  } catch (error) {
    console.error('Error in GET /api/visitor-children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/visitor-children - Create a new visitor child
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

    // Verify user has teacher or admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || (userData.role !== 'teacher' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden: Teacher or admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      date_of_birth,
      parent_name,
      parent_phone,
      parent_email,
      allergies,
      special_needs,
      emergency_contact_name,
      emergency_contact_phone,
      photo_permission
    } = body;

    // Validate required fields
    if (!name || !date_of_birth || !parent_name || !parent_phone) {
      return NextResponse.json(
        { error: 'name, date_of_birth, parent_name, and parent_phone are required' },
        { status: 400 }
      );
    }

    // Insert visitor child
    const { data: child, error } = await supabase
      .from('visitor_children')
      .insert({
        name,
        date_of_birth,
        parent_name,
        parent_phone,
        parent_email: parent_email || null,
        allergies: allergies || null,
        special_needs: special_needs || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        photo_permission: photo_permission !== undefined ? photo_permission : false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating visitor child:', error);
      return NextResponse.json({ error: 'Failed to create visitor child' }, { status: 500 });
    }

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/visitor-children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/visitor-children - Update a visitor child
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

    // Verify user has teacher or admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData || (userData.role !== 'teacher' && userData.role !== 'admin')) {
      return NextResponse.json({ error: 'Forbidden: Teacher or admin role required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      id,
      name,
      date_of_birth,
      parent_name,
      parent_phone,
      parent_email,
      allergies,
      special_needs,
      emergency_contact_name,
      emergency_contact_phone,
      photo_permission
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    // Update visitor child
    const { data: child, error } = await supabase
      .from('visitor_children')
      .update({
        name,
        date_of_birth,
        parent_name,
        parent_phone,
        parent_email: parent_email || null,
        allergies: allergies || null,
        special_needs: special_needs || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
        photo_permission: photo_permission !== undefined ? photo_permission : false
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating visitor child:', error);
      return NextResponse.json({ error: 'Failed to update visitor child' }, { status: 500 });
    }

    return NextResponse.json({ data: child });
  } catch (error) {
    console.error('Error in PUT /api/visitor-children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
