import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import {
  faHandshake,
  faBook,
  faPrayingHands,
  faHeart,
  faUsers,
  faChalkboardTeacher,
  faChild,
  faSeedling,
  faMapMarkerAlt,
  faClock,
  faHandsHelping
} from '@fortawesome/free-solid-svg-icons';
import '@/lib/fontawesome';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params: { locale } }: PageProps) {
  const t = useTranslations('about');
  const v = useTranslations('values');
  const c = useTranslations('contact');

  return (
    <main className="min-h-screen">
      <Navigation locale={locale} />
      <Hero />

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h2>
            <h3 className="text-xl md:text-2xl text-primary-600 mb-8">
              {t('subtitle')}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('content')}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('content2')}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('content3')}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed italic border-l-4 border-primary-500 pl-4">
                {t('content4')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-2xl font-bold text-primary-700 mb-4">
                {t('vision')}
              </h4>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {t('visionText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {v('title')}
            </h2>
            <p className="text-xl text-gray-600">
              {v('subtitle')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Unity */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('unity')}</h3>
              <p className="text-gray-700">
                {v('unityDesc')}
              </p>
            </div>

            {/* Teaching */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faBook} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('teaching')}</h3>
              <p className="text-gray-700">
                {v('teachingDesc')}
              </p>
            </div>

            {/* Prayer */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faPrayingHands} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('prayer')}</h3>
              <p className="text-gray-700">
                {v('prayerDesc')}
              </p>
            </div>

            {/* Service */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faHandsHelping} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('service')}</h3>
              <p className="text-gray-700">
                {v('serviceDesc')}
              </p>
            </div>

            {/* Fellowship */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('fellowship')}</h3>
              <p className="text-gray-700">
                {v('fellowshipDesc')}
              </p>
            </div>

            {/* Discipleship */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faChalkboardTeacher} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('discipleship')}</h3>
              <p className="text-gray-700">
                {v('discipleshipDesc')}
              </p>
            </div>

            {/* Love */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('love')}</h3>
              <p className="text-gray-700">
                {v('loveDesc')}
              </p>
            </div>

            {/* Children */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faChild} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('children')}</h3>
              <p className="text-gray-700">
                {v('childrenDesc')}
              </p>
            </div>

            {/* Multiplication */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faSeedling} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{v('multiplication')}</h3>
              <p className="text-gray-700">
                {v('multiplicationDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Address */}
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-3 text-secondary-200">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h3 className="text-lg font-semibold mb-1">{c('address')}</h3>
              <p className="text-secondary-100 text-sm">{c('addressText')}</p>
            </div>

            {/* Service Time */}
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-3 text-secondary-200">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3 className="text-lg font-semibold mb-1">{c('service')}</h3>
              <p className="text-secondary-100 text-sm">{c('serviceText')}</p>
            </div>

            {/* Instagram */}
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-3 text-secondary-200">
                <FontAwesomeIcon icon={faInstagram} />
              </div>
              <h3 className="text-lg font-semibold mb-1">{c('instagram')}</h3>
              <a
                href={c('instagramUrl')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary-100 text-sm hover:text-white transition-colors duration-200"
              >
                {c('instagramHandle')}
              </a>
            </div>
          </div>

          {/* Call to Action */}
          <div className="pt-8 border-t border-white border-opacity-20">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center bg-white text-primary-600 px-8 py-3 rounded-full font-semibold hover:bg-secondary-100 transition-colors duration-200 shadow-lg"
            >
              {c('title')}
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}