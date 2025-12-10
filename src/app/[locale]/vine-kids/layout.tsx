import type { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';

  return {
    alternates: {
      canonical: `${baseUrl}/${locale}/vine-kids`,
      languages: {
        'pt': `${baseUrl}/pt/vine-kids`,
        'en': `${baseUrl}/en/vine-kids`,
        'x-default': `${baseUrl}/pt/vine-kids`,
      },
    },
  };
}

export default function VineKidsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
