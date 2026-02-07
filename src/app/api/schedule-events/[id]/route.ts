import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { createErrorResponse, generateRequestId } from '@/lib/utils';

// GET /api/schedule-events/[id] - Fetch single schedule event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  const { id } = params;

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

    const { data: event, error } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[schedule-events] Fetch error:', error);
      return NextResponse.json(
        createErrorResponse(
          'not_found',
          'Schedule event not found',
          'NOT_FOUND',
          { eventId: id },
          requestId
        ),
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: event,
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

// PUT /api/schedule-events/[id] - Update schedule event (admin/trainee only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  const { id } = params;

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

    // Update event using admin client
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

    const { data: updatedEvent, error: updateError } = await adminClient
      .from('schedule_events')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[schedule-events] Update error:', updateError);

      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          createErrorResponse(
            'not_found',
            'Schedule event not found',
            'NOT_FOUND',
            { eventId: id },
            requestId
          ),
          { status: 404 }
        );
      }

      return NextResponse.json(
        createErrorResponse(
          'server_error',
          'Failed to update schedule event',
          'UPDATE_ERROR',
          { dbError: updateError.message },
          requestId
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updatedEvent,
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

// DELETE /api/schedule-events/[id] - Delete schedule event (admin/trainee only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  const { id } = params;

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

    // Delete event using admin client
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

    const { error: deleteError } = await adminClient
      .from('schedule_events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[schedule-events] Delete error:', deleteError);
      return NextResponse.json(
        createErrorResponse(
          'server_error',
          'Failed to delete schedule event',
          'DELETE_ERROR',
          { dbError: deleteError.message },
          requestId
        ),
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: { id },
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
