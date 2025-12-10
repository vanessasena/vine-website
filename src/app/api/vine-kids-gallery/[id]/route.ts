import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';

// DELETE - Delete a gallery image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify user is authenticated
    const anonClient = createSupabaseServerClient();
    if (!anonClient) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
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
      console.error('Error deleting gallery image:', deleteError);
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
        console.error('Error deleting from storage:', storageError);
        // Continue even if storage deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error:', error);
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify user is authenticated
    const anonClient = createSupabaseServerClient();
    if (!anonClient) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
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
      console.error('Error updating gallery image:', error);
      return NextResponse.json(
        { error: 'Failed to update gallery image' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
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
