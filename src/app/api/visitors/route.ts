import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createErrorResponse, generateRequestId } from '@/lib/utils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const body = await request.json();

    const { visit_date, name, phone, how_found, how_found_details, children } = body;

    // Validate required fields
    if (!visit_date || !name || !phone || !how_found) {
      return NextResponse.json(
        createErrorResponse(
          'validation',
          'All fields are required',
          'MISSING_FIELDS',
          { missingFields: ['visit_date', 'name', 'phone', 'how_found'].filter(
            f => !body[f]
          )},
          requestId
        ),
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
        createErrorResponse(
          'server_error',
          'Failed to register visitor',
          'VISITOR_INSERT_FAILED',
          { supabaseError: visitorError.message },
          requestId
        ),
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
        // This is now a PARTIAL FAILURE - visitor was saved but children weren't
        return NextResponse.json(
          createErrorResponse(
            'partial_failure',
            'Visitor was registered, but children information could not be saved',
            'CHILDREN_INSERT_FAILED',
            {
              visitorSaved: true,
              visitorId: visitorData.id,
              childrenFailed: true,
              supabaseError: childrenError.message,
              childrenCount: childrenWithVisitorId.length,
            },
            requestId
          ),
          { status: 207 } // 207 Multi-Status
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: visitorData,
        requestId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/visitors:', error);
    return NextResponse.json(
      createErrorResponse(
        'server_error',
        'An unexpected error occurred',
        'INTERNAL_ERROR',
        { errorMessage: error instanceof Error ? error.message : 'Unknown error' },
        requestId
      ),
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        createErrorResponse(
          'unauthorized',
          'Authorization header is required',
          'MISSING_AUTH',
          undefined,
          requestId
        ),
        { status: 401 }
      );
    }

    // Verify user session
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse(
          'unauthorized',
          'Invalid or expired token',
          'INVALID_TOKEN',
          { authError: authError?.message },
          requestId
        ),
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
        createErrorResponse(
          'forbidden',
          'Requires leader or admin role',
          'INSUFFICIENT_PERMISSIONS',
          { userRole: userData?.role },
          requestId
        ),
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
        createErrorResponse(
          'server_error',
          'Failed to fetch visitors',
          'FETCH_FAILED',
          { supabaseError: error.message },
          requestId
        ),
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      requestId,
    });
  } catch (error) {
    console.error('Error in GET /api/visitors:', error);
    return NextResponse.json(
      createErrorResponse(
        'server_error',
        'An unexpected error occurred',
        'INTERNAL_ERROR',
        { errorMessage: error instanceof Error ? error.message : 'Unknown error' },
        requestId
      ),
      { status: 500 }
    );
  }
}
