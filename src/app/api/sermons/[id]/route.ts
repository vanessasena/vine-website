import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { type Sermon } from '@/data/sermons';
import type { Database } from '@/lib/database.types';

type SermonUpdate = Database['public']['Tables']['sermons']['Update'];

// Transform database sermon to app sermon format
function transformDbSermon(dbSermon: any): Sermon {
  return {
    id: dbSermon.id,
    title: {
      pt: dbSermon.title_pt,
      en: dbSermon.title_en,
    },
    preacher: dbSermon.preacher,
    date: dbSermon.date,
    excerpt: {
      pt: dbSermon.excerpt_pt,
      en: dbSermon.excerpt_en,
    },
    content: {
      pt: dbSermon.content_pt,
      en: dbSermon.content_en,
    },
    scripture: dbSermon.scripture,
  };
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch a single sermon by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const supabase = await createSupabaseServerClient();

  // If supabase client is not available, return server error
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sermon from database:', error);
      return NextResponse.json({ error: 'Failed to fetch sermon' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    return NextResponse.json({ sermon: transformDbSermon(data) });
  } catch (err) {
    console.error('Unexpected error fetching sermon:', err);
    return NextResponse.json({ error: 'Failed to fetch sermon' }, { status: 500 });
  }
}

// PUT - Update a sermon
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  // Use admin client for write operations to bypass RLS
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Cannot update sermons.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();

    const updateData: SermonUpdate = {
      title_pt: body.title_pt,
      title_en: body.title_en,
      preacher: body.preacher,
      date: body.date,
      excerpt_pt: body.excerpt_pt,
      excerpt_en: body.excerpt_en,
      content_pt: body.content_pt,
      content_en: body.content_en,
      scripture: body.scripture || null,
    };

    const { data, error } = await supabase
      .from('sermons')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating sermon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    return NextResponse.json({ sermon: transformDbSermon(data) });
  } catch (err) {
    console.error('Unexpected error updating sermon:', err);
    return NextResponse.json({ error: 'Failed to update sermon' }, { status: 500 });
  }
}

// DELETE - Delete a sermon
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  // Use admin client for write operations to bypass RLS
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Cannot delete sermons.' },
      { status: 503 }
    );
  }

  try {
    const { error } = await supabase
      .from('sermons')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting sermon:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sermon deleted successfully' });
  } catch (err) {
    console.error('Unexpected error deleting sermon:', err);
    return NextResponse.json({ error: 'Failed to delete sermon' }, { status: 500 });
  }
}
