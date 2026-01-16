import { supabase } from './supabase';
import { Sermon, formatDate } from '@/data/sermons';


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

// Get all sermons from database
export async function getSortedSermons(): Promise<Sermon[]> {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw new Error('Error fetching sermons: ' + error.message);

    if (!data || data.length === 0) {
      console.log('No sermons in database');
      return [];
    }

    return data.map(transformDbSermon);
  } catch (err) {
    console.error('Unexpected error fetching sermons:', err);
    return [];
  }
}

// Get a sermon by ID from database
export async function getSermonById(id: string): Promise<Sermon | undefined> {
  try {
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }

    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sermon from database:', error);
      return undefined;
    }

    if (!data) {
      console.log('Sermon not found in database');
      return undefined;
    }

    return transformDbSermon(data);
  } catch (err) {
    console.error('Unexpected error fetching sermon:', err);
    return undefined;
  }
}

// Re-export formatDate and Sermon type for convenience
export { formatDate };
export type { Sermon };
