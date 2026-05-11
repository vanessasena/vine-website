import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger } from '@/lib/logger';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/children - Fetch children for a parent
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.authFailure('GET /api/children: missing token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logger.authFailure('GET /api/children: invalid token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get parent_id from query params
    const { searchParams } = new URL(request.url);
    const parent_id = searchParams.get('parent_id');
    const fetch_all = searchParams.get('all'); // For teachers/admins to fetch all children

    // Check if user is teacher, leader, or admin (for fetching all children)
    if (fetch_all === 'true') {
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (userData?.role !== 'teacher' && userData?.role !== 'leader' && userData?.role !== 'admin') {
        logger.authFailure('GET /api/children: forbidden', { userId: user.id, role: userData?.role });
        return NextResponse.json({ error: 'Forbidden - requires teacher, leader, or admin role' }, { status: 403 });
      }

      // Fetch all children for teachers/admins
      const { data: children, error } = await supabase
        .from('children')
        .select(`
          *,
          parent1:member_profiles!children_parent1_id_fkey(id, name, phone),
          parent2:member_profiles!children_parent2_id_fkey(id, name, phone)
        `)
        .order('name', { ascending: true });

      if (error) {
        logger.error('GET /api/children: fetch all failed', { error });
        return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
      }

      // Transform to include parent name and phone
      const transformedChildren = (children || []).map((child: any) => ({
        ...child,
        parent_name: child.parent1?.name || child.parent2?.name || '',
        parent_phone: child.parent1?.phone || child.parent2?.phone || ''
      }));

      return NextResponse.json(transformedChildren || []);
    }

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
      logger.error('GET /api/children: fetch by parent failed', { error });
      return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
    }

    return NextResponse.json({ data: children || [] });
  } catch (error) {
    logger.error('GET /api/children: unexpected error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/children - Create a new child
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.authFailure('POST /api/children: missing token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logger.authFailure('POST /api/children: invalid token');
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
      photo_permission,
      has_allergies,
      has_special_needs
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
        photo_permission: photo_permission !== undefined ? photo_permission : true,
        has_allergies: has_allergies !== undefined ? has_allergies : null,
        has_special_needs: has_special_needs !== undefined ? has_special_needs : null
      })
      .select()
      .single();

    if (error) {
      logger.error('POST /api/children: insert failed', { error });
      return NextResponse.json({ error: 'Failed to create child' }, { status: 500 });
    }

    logger.request('POST /api/children: child created', { childId: child.id });
    return NextResponse.json({ data: child }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/children: unexpected error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/children - Delete a child
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.authFailure('DELETE /api/children: missing token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logger.authFailure('DELETE /api/children: invalid token');
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
      logger.error('DELETE /api/children: delete failed', { error, childId: child_id });
      return NextResponse.json({ error: 'Failed to delete child' }, { status: 500 });
    }

    logger.request('DELETE /api/children: child deleted', { childId: child_id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/children: unexpected error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/children - Update a child
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.authFailure('PUT /api/children: missing token');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      logger.authFailure('PUT /api/children: invalid token');
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
      photo_permission,
      has_allergies,
      has_special_needs
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
        photo_permission: photo_permission !== undefined ? photo_permission : true,
        has_allergies: has_allergies !== undefined ? has_allergies : null,
        has_special_needs: has_special_needs !== undefined ? has_special_needs : null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('PUT /api/children: update failed', { error, childId: id });
      return NextResponse.json({ error: 'Failed to update child' }, { status: 500 });
    }

    logger.request('PUT /api/children: child updated', { childId: id });
    return NextResponse.json({ data: child });
  } catch (error) {
    logger.error('PUT /api/children: unexpected error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
