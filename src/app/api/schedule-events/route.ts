import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { createErrorResponse, generateRequestId } from '@/lib/utils';

// GET /api/schedule-events - Fetch all active schedule events
export async function GET(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        createErrorResponse(
          'server_error',
          'Failed to initialize database connection',
          'DB_CONNECTION_ERROR',
          {},
          requestId
        ),
        { status: 500 }
      );
    }

    // Fetch all active events, ordered by type, day, and display order
    const { data: events, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('is_active', true)
      .order('event_type', { ascending: true })
      .order('day_of_week', { ascending: true, nullsFirst: false })
      .order('display_order', { ascending: true });

    if (error) {
      console.error('[schedule-events] Database error:', error);
      return NextResponse.json(
        createErrorResponse(
          'server_error',
          'Failed to fetch schedule events',
          'DATABASE_ERROR',
          { dbError: error.message },
          requestId
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: events || [],
        requestId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[schedule-events] Unexpected error:', error);
    return NextResponse.json(
      createErrorResponse(
        'server_error',
        'An unexpected error occurred',
        'UNEXPECTED_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        requestId
      ),
      { status: 500 }
    );
  }
}

// POST /api/schedule-events - Create new schedule event (admin/trainee only)
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        createErrorResponse(
          'unauthorized',
          'No authorization token provided',
          'NO_TOKEN',
          {},
          requestId
        ),
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify user is authenticated
    const anonClient = await createSupabaseServerClient();
    if (!anonClient) {
      return NextResponse.json(
        createErrorResponse(
          'server_error',
          'Failed to initialize database connection',
          'DB_CONNECTION_ERROR',
          {},
          requestId
        ),
        { status: 500 }
      );
    }

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse(
          'unauthorized',
          'Invalid or expired token',
          'INVALID_TOKEN',
          {},
          requestId
        ),
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      title_pt,
      title_en,
      description_pt,
      description_en,
      event_type,
      day_of_week,
      time,
      icon_name,
      display_order,
      special_date,
      frequency_pt,
      frequency_en,
      is_active,
    } = body;

    // Validate required fields
    if (!title_pt || !title_en || !event_type || !icon_name) {
      return NextResponse.json(
        createErrorResponse(
          'validation',
          'Missing required fields',
          'VALIDATION_ERROR',
          {
            missingFields: [
              !title_pt && 'title_pt',
              !title_en && 'title_en',
              !event_type && 'event_type',
              !icon_name && 'icon_name',
            ].filter(Boolean),
          },
          requestId
        ),
        { status: 400 }
      );
    }

    // Validate event_type
    if (!['weekly_recurring', 'special'].includes(event_type)) {
      return NextResponse.json(
        createErrorResponse(
          'validation',
          'Invalid event_type. Must be "weekly_recurring" or "special"',
          'INVALID_EVENT_TYPE',
          { receivedType: event_type },
          requestId
        ),
        { status: 400 }
      );
    }

    // Validate day_of_week for weekly events
    if (event_type === 'weekly_recurring' && (day_of_week === null || day_of_week === undefined)) {
      return NextResponse.json(
        createErrorResponse(
          'validation',
          'day_of_week is required for weekly recurring events',
          'MISSING_DAY_OF_WEEK',
          {},
          requestId
        ),
        { status: 400 }
      );
    }

    // Validate time for weekly events (optional for special events)
    if (event_type === 'weekly_recurring' && !time) {
      return NextResponse.json(
        createErrorResponse(
          'validation',
          'time is required for weekly recurring events',
          'MISSING_TIME',
          {},
          requestId
        ),
        { status: 400 }
      );
    }

    // Create event using admin client
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json(
        createErrorResponse(
          'server_error',
          'Failed to initialize admin client',
          'ADMIN_CLIENT_ERROR',
          {},
          requestId
        ),
        { status: 500 }
      );
    }

    const { data: newEvent, error: insertError } = await adminClient
      .from('schedule_events')
      .insert({
        title_pt,
        title_en,
        description_pt: description_pt || null,
        description_en: description_en || null,
        event_type,
        day_of_week: day_of_week !== undefined ? day_of_week : null,
        time,
        icon_name,
        display_order: display_order !== undefined ? display_order : 0,
        special_date: special_date || null,
        frequency_pt: frequency_pt || null,
        frequency_en: frequency_en || null,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[schedule-events] Insert error:', insertError);
      return NextResponse.json(
        createErrorResponse(
          'server_error',
          'Failed to create schedule event',
          'INSERT_ERROR',
          { dbError: insertError.message },
          requestId
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: newEvent,
        requestId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[schedule-events] Unexpected error:', error);
    return NextResponse.json(
      createErrorResponse(
        'server_error',
        'An unexpected error occurred',
        'UNEXPECTED_ERROR',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        requestId
      ),
      { status: 500 }
    );
  }
}
