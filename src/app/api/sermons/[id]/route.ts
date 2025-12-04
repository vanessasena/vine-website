import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sermons as staticSermons, type Sermon } from '@/data/sermons';
import type { Database } from '@/lib/database.types';

type SermonUpdate = Database['public']['Tables']['sermons']['Update'];

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

interface RouteParams {
  params: {
    id: string;
  };
}

// GET - Fetch a single sermon by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = params;
  const supabase = createSupabaseClient();

  // If supabase client is not available, use static data
  if (!supabase) {
    const sermon = staticSermons.find(s => s.id === id);
    if (!sermon) {
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }
    return NextResponse.json({ sermon, source: 'static' });
  }

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      // Try static data as fallback
      const staticSermon = staticSermons.find(s => s.id === id);
      if (staticSermon) {
        return NextResponse.json({ sermon: staticSermon, source: 'static' });
      }
      return NextResponse.json({ error: 'Sermon not found' }, { status: 404 });
    }

    return NextResponse.json({ sermon: transformDbSermon(data), source: 'database' });
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
