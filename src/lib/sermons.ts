import { supabase } from './supabase';
import { sermons as staticSermons, type Sermon, formatDate as staticFormatDate } from '@/data/sermons';

// Helper function to get sorted static sermons
function getSortedStaticSermons(): Sermon[] {
  return staticSermons.sort((a, b) => {
    const [yearA, monthA, dayA] = a.date.split('-').map(Number);
    const [yearB, monthB, dayB] = b.date.split('-').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
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

// Get all sermons from database with fallback to static data
export async function getSortedSermons(): Promise<Sermon[]> {
  // If supabase client is not available, use static data
  if (!supabase) {
    console.log('Supabase not configured, using static sermons data');
    return getSortedStaticSermons();
  }

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching sermons from database:', error);
      console.log('Falling back to static sermons data');
      return getSortedStaticSermons();
    }

    if (!data || data.length === 0) {
      console.log('No sermons in database, using static sermons data');
      return getSortedStaticSermons();
    }

    return data.map(transformDbSermon);
  } catch (err) {
    console.error('Unexpected error fetching sermons:', err);
    console.log('Falling back to static sermons data');
    return getSortedStaticSermons();
  }
}

// Get a sermon by ID from database with fallback to static data
export async function getSermonById(id: string): Promise<Sermon | undefined> {
  // If supabase client is not available, use static data
  if (!supabase) {
    console.log('Supabase not configured, using static sermons data');
    return staticSermons.find(sermon => sermon.id === id);
  }

  try {
    const { data, error } = await supabase
      .from('sermons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching sermon from database:', error);
      console.log('Falling back to static sermons data');
      return staticSermons.find(sermon => sermon.id === id);
    }

    if (!data) {
      console.log('Sermon not found in database, checking static data');
      return staticSermons.find(sermon => sermon.id === id);
    }

    return transformDbSermon(data);
  } catch (err) {
    console.error('Unexpected error fetching sermon:', err);
    console.log('Falling back to static sermons data');
    return staticSermons.find(sermon => sermon.id === id);
  }
}

// Helper function to format date
export const formatDate = staticFormatDate;
