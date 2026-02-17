import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { getSortedSermons } from '@/lib/sermons';
import SermonsListClient from './SermonsListClient';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';

  const titles = {
    pt: 'Palavras - Igreja Brasileira em Kitchener | Vine Church KWC',
    en: 'Sermons - Brazilian Church in Kitchener | Vine Church KWC',
  };
  const descriptions = {
    pt: 'Confira as mensagens pregadas na Vine Church KWC, igreja brasileira em Kitchener. Palavras para edificar, ensinar e fortalecer sua fé.',
    en: 'Watch sermons from Vine Church KWC, Brazilian church in Kitchener. Messages to edify, teach and strengthen your faith.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.pt,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.pt,
    alternates: {
      canonical: `${baseUrl}/${locale}/sermons`,
      languages: {
        'pt': `${baseUrl}/pt/sermons`,
        'en': `${baseUrl}/en/sermons`,
        'x-default': `${baseUrl}/pt/sermons`,
      },
    },
  };
}

export default async function SermonsPage({ params: { locale } }: PageProps) {
  const t = await getTranslations('sermons');
  const sermons = await getSortedSermons();

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
          <p className="text-lg md:text-xl max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Sermons List Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t('latestSermons')}
            </h2>
          </div>

          <SermonsListClient
            sermons={sermons}
            locale={locale}
            translations={{
              preachedBy: t('preachedBy'),
              preachedOn: t('preachedOn'),
              readMore: t('readMore'),
              noSermons: t('noSermons'),
              page: t('page'),
              of: t('of'),
              previous: t('previous'),
              next: t('next'),
            }}
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-accent-600 via-secondary-600 to-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'pt'
              ? 'Venha ouvir a Palavra conosco!'
              : 'Come hear the Word with us!'
            }
          </h2>
          <p className="text-xl mb-8">
            {locale === 'pt'
              ? 'Junte-se a nós todos os domingos às 10:00 para receber uma palavra que transforma vidas.'
              : 'Join us every Sunday at 10:00 AM to receive a word that transforms lives.'
            }
          </p>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <div className="space-y-2">
              <p className="font-semibold text-lg">
                {locale === 'pt' ? 'Culto de Domingo' : 'Sunday Service'}
              </p>
              <p>417 King St W, Kitchener, ON N2G 1C2</p>
              <p className="text-secondary-200">
                {locale === 'pt' ? 'Domingo às 10:00' : 'Sunday at 10:00 AM'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}