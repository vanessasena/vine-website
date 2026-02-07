import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase';
import { type Sermon } from '@/data/sermons';
import type { Database } from '@/lib/database.types';

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

// GET - Fetch all sermons
export async function GET() {
  const supabase = await createSupabaseServerClient();

  // If supabase client is not available, return server error
  if (!supabase) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 500 });
  }

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching sermons:', error);
      return NextResponse.json({ error: 'Failed to fetch sermons' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ sermons: [] });
    }

    return NextResponse.json({ sermons: data.map(transformDbSermon) });
  } catch (err) {
    console.error('Unexpected error fetching sermons:', err);
    return NextResponse.json({ error: 'Failed to fetch sermons' }, { status: 500 });
  }
}

// POST - Create a new sermon
export async function POST(request: NextRequest) {
  // Use admin client for write operations to bypass RLS
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Cannot create sermons.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['id', 'title_pt', 'title_en', 'preacher', 'date', 'excerpt_pt', 'excerpt_en', 'content_pt', 'content_en'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('sermons')
      .insert([{
        id: body.id,
        title_pt: body.title_pt,
        title_en: body.title_en,
        preacher: body.preacher,
        date: body.date,
        excerpt_pt: body.excerpt_pt,
        excerpt_en: body.excerpt_en,
        content_pt: body.content_pt,
        content_en: body.content_en,
        scripture: body.scripture || null,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating sermon:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ sermon: transformDbSermon(data) }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error creating sermon:', err);
    return NextResponse.json(
      { error: 'Failed to create sermon' },
      { status: 500 }
    );
  }
}
