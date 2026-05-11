import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { logger } from '@/lib/logger';

// DELETE - Delete a gallery image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      logger.authFailure('DELETE /api/vine-kids-gallery/[id]: missing auth header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify user is authenticated
    const anonClient = await createSupabaseServerClient();
    if (!anonClient) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      logger.authFailure('DELETE /api/vine-kids-gallery/[id]: invalid token');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client for database operations
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { id } = params;

    // First, get the image URL to delete from storage
    const { data: imageData, error: fetchError } = await supabase
      .from('vine_kids_gallery')
      .select('image_url')
      .eq('id', id)
      .single();

    if (fetchError || !imageData) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('vine_kids_gallery')
      .delete()
      .eq('id', id);

    if (deleteError) {
      logger.error('DELETE /api/vine-kids-gallery/[id]: delete failed', { error: deleteError, imageId: id });
      return NextResponse.json(
        { error: 'Failed to delete gallery image' },
        { status: 500 }
      );
    }

    // Optionally delete from storage if it's a Supabase storage URL
    if (imageData.image_url.includes('supabase.co/storage')) {
      try {
        const urlParts = imageData.image_url.split('/storage/v1/object/public/');
        if (urlParts.length > 1) {
          const [bucket, ...pathParts] = urlParts[1].split('/');
          const filePath = pathParts.join('/');

          await supabase.storage
            .from(bucket)
            .remove([decodeURIComponent(filePath)]);
        }
      } catch (storageError) {
        logger.error('DELETE /api/vine-kids-gallery/[id]: storage deletion failed', { error: storageError, imageId: id });
        // Continue even if storage deletion fails
      }
    }

    logger.request('DELETE /api/vine-kids-gallery/[id]: image deleted', { imageId: id });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/vine-kids-gallery/[id]: unexpected error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update display order or other fields
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      logger.authFailure('PATCH /api/vine-kids-gallery/[id]: missing auth header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify user is authenticated
    const anonClient = await createSupabaseServerClient();
    if (!anonClient) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      logger.authFailure('PATCH /api/vine-kids-gallery/[id]: invalid token', { imageId: params.id });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use admin client for database operations
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('vine_kids_gallery')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('PATCH /api/vine-kids-gallery/[id]: update failed', { error, imageId: id });
      return NextResponse.json(
        { error: 'Failed to update gallery image' },
        { status: 500 }
      );
    }

    logger.request('PATCH /api/vine-kids-gallery/[id]: image updated', { imageId: id });
    return NextResponse.json(data);
  } catch (error) {
    logger.error('PATCH /api/vine-kids-gallery/[id]: unexpected error', { error: error instanceof Error ? error.message : error });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update display order or other fields (alias for PATCH)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return PATCH(request, { params });
}
