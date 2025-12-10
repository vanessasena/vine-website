import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import AddressChangeAlert from '@/components/AddressChangeAlert';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faHome,
  faChurch,
  faUsers,
  faTint,
  faMapMarkerAlt,
  faMap,
  faPhone,
  faHandshake,
  faMusic,
  faGuitar
} from '@fortawesome/free-solid-svg-icons';
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

      {/* Schedule Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Weekly Schedule */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Tuesday */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faBook} />
              </div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('tuesday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('tuesdayTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('tuesdayEvent')}
              </p>
            </div>

            {/* Thursday */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faBook} />
              </div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('thursday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('thursdayTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('thursdayEvent')}
              </p>
            </div>

            {/* Friday */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faHome} />
              </div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('friday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('fridayTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('fridayEvent')}
              </p>
            </div>

            {/* Saturday - Music Classes */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faMusic} />
              </div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('saturday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('saturdayMusicTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('saturdayMusicEvent')}
              </p>
            </div>

            {/* Saturday - Jiu-Jitsu */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('saturday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('saturdayTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('saturdayEvent')}
              </p>
            </div>

            {/* Saturday - Teens Service */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('saturday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('saturdayTeensTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('saturdayTeensEvent')}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                ({t('saturdayTeensFrequency')})
              </p>
            </div>

            {/* Sunday */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faChurch} />
              </div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('sunday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('sundayTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('sundayEvent')}
              </p>
            </div>

          </div>

          {/* Special Events */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              {t('specialEvents')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">

              {/* Monthly Family Service */}
              <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl mb-4 text-primary-600">
                  <FontAwesomeIcon icon={faUsers} />
                </div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">
                  {t('familyService')}
                </h3>
                <div className="text-xl font-bold text-secondary-700 mb-2">
                  {t('familyServiceDesc')}
                </div>
                <div className="text-lg text-gray-700">
                  {t('sundayTime')}
                </div>
              </div>

              {/* Baptism */}
              {/* <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl mb-4 text-blue-600">
                  <FontAwesomeIcon icon={faTint} />
                </div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">
                  {t('baptism')}
                </h3>
                <div className="text-xl font-bold text-blue-700 mb-2">
                  {t('baptismDate')}
                </div>
                <div className="text-lg text-gray-700">
                  {t('baptismTime')}
                </div>
              </div> */}

            </div>
          </div>

          {/* Location Notice */}
          <div className="mt-12">
            <AddressChangeAlert />
          </div>

          {/* Additional Info */}
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