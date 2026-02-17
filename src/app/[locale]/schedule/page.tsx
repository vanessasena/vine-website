import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPhone,
  faHandshake,
} from '@fortawesome/free-solid-svg-icons';
import type { Metadata } from 'next';
import ScheduleClient from './ScheduleClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';

  const titles = {
    pt: 'Agenda - Igreja Brasileira em Kitchener | Vine Church KWC',
    en: 'Schedule - Brazilian Church in Kitchener | Vine Church KWC',
  };
  const descriptions = {
    pt: 'Confira a agenda da Vine Church KWC, igreja brasileira em Kitchener. Culto dominical, células, curso de maturidade, aulas de música e mais atividades.',
    en: 'Check the schedule at Vine Church KWC, Brazilian church in Kitchener. Sunday service, life groups, maturity course, music classes and more activities.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.pt,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.pt,
    alternates: {
      canonical: `${baseUrl}/${locale}/schedule`,
      languages: {
        'pt': `${baseUrl}/pt/schedule`,
        'en': `${baseUrl}/en/schedule`,
        'x-default': `${baseUrl}/pt/schedule`,
      },
    },
  };
}

export default function SchedulePage({ params: { locale } }: PageProps) {
  const t = useTranslations('schedule');

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

      {/* Dynamic Schedule Events from Database */}
      <ScheduleClient locale={locale} />

      {/* Additional Info - Hardcoded */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-12 grid md:grid-cols-3 gap-8">

            <div className="bg-primary-50 rounded-lg p-6">
              <h4 className="text-xl font-bold text-primary-700 mb-4">
                {locale === 'pt' ? 'Curso de Maturidade e CTL' : 'Maturity Course and CTL'}
              </h4>
              <p className="text-gray-700">
                {locale === 'pt'
                  ? 'Curso fundamental para o crescimento espiritual e formação de líderes. Essencial para quem deseja se aprofundar na Palavra e servir no Reino.'
                  : 'Fundamental course for spiritual growth and leader formation. Essential for those who want to deepen their understanding of the Word and serve in the Kingdom.'
                }
              </p>
            </div>

            <div className="bg-secondary-50 rounded-lg p-6">
              <h4 className="text-xl font-bold text-primary-700 mb-4">
                {locale === 'pt' ? 'Células nas Casas' : 'Life Groups'}
              </h4>
              <p className="text-gray-700">
                {locale === 'pt'
                  ? 'Encontros semanais em casas para comunhão, oração e estudo da Palavra. É onde vivemos a vida cristã em comunidade de forma prática.'
                  : 'Weekly home gatherings for fellowship, prayer, and Bible study. This is where we live the Christian life in community in a practical way.'
                }
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <h4 className="text-xl font-bold text-primary-700 mb-4">
                {locale === 'pt' ? 'Culto da Família' : 'Family Service'}
              </h4>
              <p className="text-gray-700">
                {locale === 'pt'
                  ? 'Uma celebração especial no primeiro domingo de cada mês, focada na família e na comunhão. Um momento especial para toda a família de Deus. Neste dia não temos o Domingo Kids.'
                  : 'A special celebration on the first Sunday of each month, focused on family and fellowship. A special time for the whole family of God. In this day, we don\'t have the Sunday Kids.'
                }
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-accent-600 via-secondary-600 to-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'pt' ? 'Venha Participar!' : 'Come Join Us!'}
          </h2>
          <p className="text-xl mb-8">
            {locale === 'pt'
              ? 'Todos são bem-vindos em nossos encontros. Venha fazer parte desta família!'
              : 'Everyone is welcome at our gatherings. Come be part of this family!'
            }
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <Link
              href={`/${locale}/contact`}
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 hover:bg-opacity-20 transition-all duration-200 block"
            >
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faPhone} className="mr-2" />
                {locale === 'pt' ? 'Contato' : 'Contact'}
              </h3>
              <p className="mb-2">{locale === 'pt' ? 'Entre em contato conosco' : 'Get in touch with us'}</p>
              <div className="flex items-center justify-center text-sm text-secondary-200">
                {locale === 'pt' ? 'Clique para mais informações' : 'Click for more information'}
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faHandshake} className="mr-2" />
                {locale === 'pt' ? 'Primeira Visita' : 'First Visit'}
              </h3>
              <p>{locale === 'pt' ? 'Não se preocupe, te ajudaremos' : "Don't worry, we'll help you"}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}