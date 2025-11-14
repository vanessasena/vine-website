// Enhanced sermon data structure for scalability
export interface SermonMetadata {
  id: string;
  title: {
    pt: string;
    en: string;
  };
  preacher: string;
  date: string; // YYYY-MM-DD format
  excerpt: {
    pt: string;
    en: string;
  };
  scripture?: string;
  series?: string; // Sermon series name
  tags?: string[]; // Topics/tags for filtering
  audioUrl?: string; // Optional audio link
  videoUrl?: string; // Optional video link
}

export interface SermonContent {
  content: {
    pt: string;
    en: string;
  };
}

export interface FullSermon extends SermonMetadata, SermonContent {}

// Pagination configuration
export const SERMONS_PER_PAGE = 12;
export const RECENT_SERMONS_COUNT = 6;

// Series configuration
export interface SermonSeries {
  id: string;
  name: {
    pt: string;
    en: string;
  };
  description: {
    pt: string;
    en: string;
  };
  imageUrl?: string;
  startDate: string;
  endDate?: string;
}

// Available sermon series
export const sermonSeries: SermonSeries[] = [
  {
    id: "fe-e-crescimento",
    name: {
      pt: "Fé e Crescimento",
      en: "Faith and Growth"
    },
    description: {
      pt: "Uma série sobre como desenvolver uma fé madura e crescer espiritualmente",
      en: "A series about developing mature faith and growing spiritually"
    },
    startDate: "2025-01-01"
  },
  {
    id: "familia-crista",
    name: {
      pt: "Família Cristã",
      en: "Christian Family"
    },
    description: {
      pt: "Princípios bíblicos para uma família forte e unida",
      en: "Biblical principles for a strong and united family"
    },
    startDate: "2024-09-01",
    endDate: "2024-12-31"
  }
];

// Helper function to get sermons with pagination
export const getPaginatedSermons = (page: number = 1): {
  sermons: SermonMetadata[];
  totalPages: number;
  currentPage: number;
  totalSermons: number;
} => {
  const allSermons = getAllSermonMetadata();
  const totalSermons = allSermons.length;
  const totalPages = Math.ceil(totalSermons / SERMONS_PER_PAGE);
  const startIndex = (page - 1) * SERMONS_PER_PAGE;
  const endIndex = startIndex + SERMONS_PER_PAGE;
  const sermons = allSermons.slice(startIndex, endIndex);

  return {
    sermons,
    totalPages,
    currentPage: page,
    totalSermons
  };
};

// Helper function to get recent sermons
export const getRecentSermons = (count: number = RECENT_SERMONS_COUNT): SermonMetadata[] => {
  const allSermons = getAllSermonMetadata();
  return allSermons.slice(0, count);
};

// Helper function to search sermons
export const searchSermons = (
  query: string,
  locale: 'pt' | 'en' = 'pt'
): SermonMetadata[] => {
  const allSermons = getAllSermonMetadata();
  const lowercaseQuery = query.toLowerCase();

  return allSermons.filter(sermon =>
    sermon.title[locale].toLowerCase().includes(lowercaseQuery) ||
    sermon.excerpt[locale].toLowerCase().includes(lowercaseQuery) ||
    sermon.preacher.toLowerCase().includes(lowercaseQuery) ||
    (sermon.scripture && sermon.scripture.toLowerCase().includes(lowercaseQuery)) ||
    (sermon.tags && sermon.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  );
};

// Helper function to filter sermons by series
export const getSermonsBySeries = (seriesId: string): SermonMetadata[] => {
  const allSermons = getAllSermonMetadata();
  return allSermons.filter(sermon => sermon.series === seriesId);
};

// Helper function to filter sermons by year
export const getSermonsByYear = (year: number): SermonMetadata[] => {
  const allSermons = getAllSermonMetadata();
  return allSermons.filter(sermon => {
    const sermonYear = new Date(sermon.date).getFullYear();
    return sermonYear === year;
  });
};

// Helper function to get all available years
export const getAvailableYears = (): number[] => {
  const allSermons = getAllSermonMetadata();
  const years = new Set(allSermons.map(sermon => new Date(sermon.date).getFullYear()));
  return Array.from(years).sort((a, b) => b - a);
};

// Helper function to get sermons by preacher
export const getSermonsByPreacher = (preacher: string): SermonMetadata[] => {
  const allSermons = getAllSermonMetadata();
  return allSermons.filter(sermon => sermon.preacher === preacher);
};

// Helper function to get all preachers
export const getAllPreachers = (): string[] => {
  const allSermons = getAllSermonMetadata();
  const preachers = new Set(allSermons.map(sermon => sermon.preacher));
  return Array.from(preachers).sort();
};

// For now, we'll keep the current sermon data but prepare for migration
import { sermons as currentSermons, Sermon } from './sermons-legacy';

// Helper function to get all sermon metadata (sorted by date, newest first)
const getAllSermonMetadata = (): SermonMetadata[] => {
  // This will be replaced with actual file-based loading when you have hundreds of sermons
  const metadata: SermonMetadata[] = currentSermons.map((sermon: Sermon) => ({
    id: sermon.id,
    title: sermon.title,
    preacher: sermon.preacher,
    date: sermon.date,
    excerpt: sermon.excerpt,
    scripture: sermon.scripture,
    series: undefined, // Add series info when available
    tags: undefined, // Add tags when available
  }));

  return metadata.sort((a: SermonMetadata, b: SermonMetadata) => {
    const [yearA, monthA, dayA] = a.date.split('-').map(Number);
    const [yearB, monthB, dayB] = b.date.split('-').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  });
};

// Helper function to get a sermon by ID (with full content)
export const getSermonById = (id: string): FullSermon | undefined => {
  // For now, use the legacy data
  const sermon = currentSermons.find((s: Sermon) => s.id === id);
  if (!sermon) return undefined;

  return {
    id: sermon.id,
    title: sermon.title,
    preacher: sermon.preacher,
    date: sermon.date,
    excerpt: sermon.excerpt,
    scripture: sermon.scripture,
    content: sermon.content,
  };
};

// Helper function to format date (fixed for timezone issues)
export const formatDate = (dateString: string, locale: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};