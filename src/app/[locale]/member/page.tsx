import { Metadata } from 'next';
import MemberPortalClient from './MemberPortalClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';
  return {
    title: locale === 'pt' ? 'Portal do Membro - Vine Church KWC' : 'Member Portal - Vine Church KWC',
    description: locale === 'pt'
      ? 'Acesse seu portal de membro na Vine Church KWC.'
      : 'Access your member portal at Vine Church KWC.',
    alternates: {
      canonical: `${baseUrl}/${locale}/member`,
      languages: {
        'pt': `${baseUrl}/pt/member`,
        'en': `${baseUrl}/en/member`,
        'x-default': `${baseUrl}/pt/member`,
      },
    },
  };
}

export default function MemberPage({ params: { locale } }: PageProps) {
  return (
    <MemberPortalClient locale={locale} />
  );
}
