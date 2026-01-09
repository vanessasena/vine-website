import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/children - Fetch children for a parent
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get parent_id from query params
    const { searchParams } = new URL(request.url);
    const parent_id = searchParams.get('parent_id');

    if (!parent_id) {
      return NextResponse.json({ error: 'parent_id is required' }, { status: 400 });
    }

    // Fetch children where user is either parent1 or parent2
    const { data: children, error } = await supabase
      .from('children')
      .select('*')
      .or(`parent1_id.eq.${parent_id},parent2_id.eq.${parent_id}`)
      .order('date_of_birth', { ascending: true });

    if (error) {
      console.error('Error fetching children:', error);
      return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
    }

    return NextResponse.json({ data: children || [] });
  } catch (error) {
    console.error('Error in GET /api/children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/children - Create a new child
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      date_of_birth,
      parent1_id,
      parent2_id,
      allergies,
      medical_notes,
      special_needs,
      photo_permission
    } = body;

    // Validate required fields (name is optional)
    if (!date_of_birth || !parent1_id) {
      return NextResponse.json(
        { error: 'date_of_birth and parent1_id are required' },
        { status: 400 }
      );
    }

    // Insert child
    const { data: child, error } = await supabase
      .from('children')
      .insert({
        name,
        date_of_birth,
        parent1_id,
        parent2_id: parent2_id || null,
        allergies: allergies || null,
        medical_notes: medical_notes || null,
        special_needs: special_needs || null,
        photo_permission: photo_permission !== undefined ? photo_permission : true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating child:', error);
      return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
    }

    return NextResponse.json({ data: child }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/children - Delete a child
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const child_id = searchParams.get('id');

    if (!child_id) {
      return NextResponse.json({ error: 'child_id is required' }, { status: 400 });
    }

    // Delete the child
    const { error } = await supabase
      .from('children')
      .delete()
      .eq('id', child_id);

    if (error) {
      console.error('Error deleting child:', error);
      return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/children - Update a child
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      date_of_birth,
      parent1_id,
      parent2_id,
      allergies,
      medical_notes,
      special_needs,
      photo_permission
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'child id is required' }, { status: 400 });
    }

    // Update child
    const { data: child, error } = await supabase
      .from('children')
      .update({
        name,
        date_of_birth,
        parent1_id,
        parent2_id: parent2_id || null,
        allergies: allergies || null,
        medical_notes: medical_notes || null,
        special_needs: special_needs || null,
        photo_permission: photo_permission !== undefined ? photo_permission : true
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating child:', error);
      return NextResponse.json({ error: 'Failed to update child' }, { status: 500 });
    }

    return NextResponse.json({ data: child });
  } catch (error) {
    console.error('Error in PUT /api/children:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
