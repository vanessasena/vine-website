import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const { visit_date, name, phone, how_found, how_found_details, children } = body;

    // Validate required fields
    if (!visit_date || !name || !phone || !how_found) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Insert visitor record
    const { data: visitorData, error: visitorError } = await supabase
      .from('visitors')
      .insert([
        {
          visit_date,
          name,
          phone,
          how_found,
          how_found_details: how_found_details || null,
        },
      ])
      .select()
      .single();

    if (visitorError) {
      console.error('Error inserting visitor:', visitorError);
      return NextResponse.json(
        { error: 'Failed to register visitor' },
        { status: 500 }
      );
    }

    // If children are provided, insert them with visitor_id reference
    if (Array.isArray(children) && children.length > 0) {
      const childrenWithVisitorId = children.map(child => ({
        name: child.name,
        date_of_birth: child.date_of_birth,
        parent_name: name,
        parent_phone: phone,
        parent_email: null,
        allergies: child.has_allergies ? child.allergies : null,
        special_needs: child.has_special_needs ? child.special_needs : null,
        emergency_contact_name: child.emergency_contact_name || null,
        emergency_contact_phone: child.emergency_contact_phone || null,
        photo_permission: child.photo_permission || false,
        visitor_id: visitorData.id,
      }));

      const { error: childrenError } = await supabase
        .from('visitor_children')
        .insert(childrenWithVisitorId);

      if (childrenError) {
        console.error('Error inserting visitor children:', childrenError);
        // Still return success for visitor, but log the error
        return NextResponse.json(
          {
            success: true,
            data: visitorData,
            warning: 'Visitor registered but some children could not be registered',
          },
          { status: 201 }
        );
      }
    }

    return NextResponse.json(
      { success: true, data: visitorData },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/visitors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user session
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is leader or admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin' && userData?.role !== 'leader') {
      return NextResponse.json(
        { error: 'Forbidden - Requires leader or admin role' },
        { status: 403 }
      );
    }

    // Get all visitors ordered by visit date (most recent first)
    const { data, error } = await supabase
      .from('visitors')
      .select('*')
      .order('visit_date', { ascending: false });

    if (error) {
      console.error('Error fetching visitors:', error);
      return NextResponse.json(
        { error: 'Failed to fetch visitors' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/visitors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
