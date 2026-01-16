
export interface Sermon {
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
  content: {
    pt: string;
    en: string;
  };
  scripture?: string; // Optional Bible reference
}

// Helper function to format date
export const formatDate = (dateString: string, locale: string): string => {
  // Parse the date string manually to avoid timezone issues
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed

  return date.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};