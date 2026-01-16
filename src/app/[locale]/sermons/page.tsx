import { getTranslations } from 'next-intl/server';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faCalendarAlt,
  faUser,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { getSortedSermons, formatDate } from '@/lib/sermons';
import type { Metadata } from 'next';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';
  return {
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

          {sermons.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faBook} className="text-4xl text-gray-400 mb-4" />
              <p className="text-lg text-gray-600">{t('noSermons')}</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8">
              {sermons.map((sermon) => (
                <div key={sermon.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  {/* Header with Bible icon */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
                    <div className="flex items-center justify-center mb-4">
                      <FontAwesomeIcon icon={faBook} className="text-3xl text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">
                      {sermon.title[locale as 'pt' | 'en']}
                    </h3>
                    {sermon.scripture && (
                      <p className="text-center text-secondary-100 font-medium">
                        {sermon.scripture}
                      </p>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Meta information */}
                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                        <span className="font-medium">{t('preachedBy')}:</span>
                        <span className="ml-1">{sermon.preacher}</span>
                      </div>
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-primary-600" />
                        <span className="font-medium">{t('preachedOn')}:</span>
                        <span className="ml-1">{formatDate(sermon.date, locale)}</span>
                      </div>
                    </div>

                    {/* Excerpt */}
                    <p className="text-gray-700 leading-relaxed mb-6">
                      {sermon.excerpt[locale as 'pt' | 'en']}
                    </p>

                    {/* Read More Button */}
                    <Link
                      href={`/${locale}/sermons/${sermon.id}`}
                      className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      {t('readMore')}
                      <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
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