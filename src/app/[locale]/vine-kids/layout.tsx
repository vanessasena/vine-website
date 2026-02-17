import type { Metadata } from 'next';

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';

  const titles = {
    pt: 'Vine Kids - Ministério Infantil | Vine Church KWC',
    en: 'Vine Kids - Children\'s Ministry | Vine Church KWC',
  };
  const descriptions = {
    pt: 'Vine Kids - ministério infantil da Vine Church KWC, igreja brasileira em Kitchener. Cultos e células especiais para crianças.',
    en: 'Vine Kids - children\'s ministry at Vine Church KWC, Brazilian church in Kitchener. Special services and groups for kids.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.pt,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.pt,
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
