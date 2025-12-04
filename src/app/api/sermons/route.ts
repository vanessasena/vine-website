import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sermons as staticSermons, type Sermon } from '@/data/sermons';
import type { Database } from '@/lib/database.types';

// Create client inline to ensure proper type inference after null check
// This avoids TypeScript issues with imported nullable clients
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Create admin client with service role key (bypasses RLS)
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

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

// Helper function to get sorted static sermons
function getSortedStaticSermons(): Sermon[] {
  return [...staticSermons].sort((a, b) => {
    const [yearA, monthA, dayA] = a.date.split('-').map(Number);
    const [yearB, monthB, dayB] = b.date.split('-').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  });
}

// GET - Fetch all sermons
export async function GET() {
  const supabase = createSupabaseClient();

  // If supabase client is not available, use static data
  if (!supabase) {
    return NextResponse.json({ sermons: getSortedStaticSermons(), source: 'static' });
  }

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching sermons:', error);
      return NextResponse.json({ sermons: getSortedStaticSermons(), source: 'static' });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ sermons: getSortedStaticSermons(), source: 'static' });
    }

    return NextResponse.json({ sermons: data.map(transformDbSermon), source: 'database' });
  } catch (err) {
    console.error('Unexpected error fetching sermons:', err);
    return NextResponse.json({ sermons: getSortedStaticSermons(), source: 'static' });
  }
}

// POST - Create a new sermon
export async function POST(request: NextRequest) {
  // Use admin client for write operations to bypass RLS
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json(
      { error: 'Database not configured. Cannot create sermons.' },
      { status: 503 }
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
