import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import MemberProfileClient from './MemberProfileClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';
  return {
    title: locale === 'pt' ? 'Área do Membro - Vine Church KWC' : 'Member Area - Vine Church KWC',
    description: locale === 'pt'
      ? 'Gerencie seu perfil de membro na Vine Church KWC.'
      : 'Manage your member profile at Vine Church KWC.',
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
  const t = useTranslations('member');

  return (
    <main>
      <Navigation locale={locale} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-secondary-100">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Member Profile Content */}
      <MemberProfileClient locale={locale} />

      <Footer locale={locale} />
    </main>
  );
}
