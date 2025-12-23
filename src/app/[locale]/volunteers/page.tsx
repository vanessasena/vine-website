import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import VolunteersClient from './VolunteersClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';
  return {
    title: locale === 'pt' ? 'Voluntários - Vine Church KWC' : 'Volunteers - Vine Church KWC',
    description: locale === 'pt'
      ? 'Cadastre-se para ser voluntário na Vine Church KWC. Faça parte da nossa equipe e sirva ao Senhor.'
      : 'Register to be a volunteer at Vine Church KWC. Be part of our team and serve the Lord.',
    alternates: {
      canonical: `${baseUrl}/${locale}/volunteers`,
      languages: {
        'pt': `${baseUrl}/pt/volunteers`,
        'en': `${baseUrl}/en/volunteers`,
        'x-default': `${baseUrl}/pt/volunteers`,
      },
    },
  };
}

export default function VolunteersPage({ params: { locale } }: PageProps) {
  const t = useTranslations('volunteers');

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

      {/* Volunteers Content */}
      <VolunteersClient locale={locale} />

      <Footer locale={locale} />
    </main>
  );
}
