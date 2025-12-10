import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';

// GET - Fetch all Vine Kids gallery images
export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('vine_kids_gallery')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching vine kids gallery:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gallery images' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new gallery image
export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // First verify the user is authenticated using anon client
    const anonClient = createSupabaseServerClient();
    if (!anonClient) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Now use admin client to bypass RLS after verifying user is authenticated
    const supabase = createSupabaseAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { image_url, alt_text_pt, alt_text_en, orientation, display_order } = body;

    // Validate required fields
    if (!image_url || !alt_text_pt || !alt_text_en || !orientation) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (orientation !== 'portrait' && orientation !== 'landscape') {
      return NextResponse.json(
        { error: 'Orientation must be either "portrait" or "landscape"' },
        { status: 400 }
      );
    }

    // Use the admin client for the insert (bypasses RLS)
    const { data, error } = await supabase
      .from('vine_kids_gallery')
      .insert({
        image_url,
        alt_text_pt,
        alt_text_en,
        orientation,
        display_order: display_order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating gallery image:', error);
      return NextResponse.json(
        { error: `Failed to create gallery image: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
