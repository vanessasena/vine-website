import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { createErrorResponse, generateRequestId } from '@/lib/utils';
import { isAdminOrTrainee } from '@/lib/roles';

// GET /api/schedule-events/[id] - Fetch single schedule event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();
  const { id } = params;

  try {
    const supabase = createSupabaseServerClient();
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
    // Check authentication and authorization
    const supabase = createSupabaseServerClient();
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse(
          'unauthorized',
          'Authentication required',
          'UNAUTHORIZED',
          {},
          requestId
        ),
        { status: 401 }
      );
    }

    // Check if user is admin or trainee
    const hasPermission = await isAdminOrTrainee(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        createErrorResponse(
          'forbidden',
          'Insufficient permissions. Admin or trainee role required.',
          'FORBIDDEN',
          {},
          requestId
        ),
        { status: 403 }
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
    // Check authentication and authorization
    const supabase = createSupabaseServerClient();
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

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse(
          'unauthorized',
          'Authentication required',
          'UNAUTHORIZED',
          {},
          requestId
        ),
        { status: 401 }
      );
    }

    // Check if user is admin or trainee
    const hasPermission = await isAdminOrTrainee(user.id);
    if (!hasPermission) {
      return NextResponse.json(
        createErrorResponse(
          'forbidden',
          'Insufficient permissions. Admin or trainee role required.',
          'FORBIDDEN',
          {},
          requestId
        ),
        { status: 403 }
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
