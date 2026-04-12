import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Banner from '@/components/Banner';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay,
  faClock,
  faMapMarkerAlt,
  faDollarSign,
  faHeartBroken,
  faBrain,
  faQuestion,
  faHome,
  faStar,
  faLightbulb,
  faUsers,
  faPray,
  faSyncAlt,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import '@/lib/fontawesome';
import type { Metadata } from 'next';

const GOOGLE_FORMS_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSdQF1B1O2opOFXAkM1UZZt0oOl-gd6hpODVV0RYKfV228viLg/viewform';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({
  params: { locale },
}: PageProps): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';

  const titles = {
    pt: 'Encontro com Deus - Vine Church KWC',
    en: 'Encounter with God - Vine Church KWC',
  };
  const descriptions = {
    pt: 'Encontro com Deus - 23 de Maio de 2026. Um evento transformador na Vine Church KWC em Kitchener, Ontario. Inscreva-se!',
    en: 'Encounter with God - May 23rd, 2026. A transformative event at Vine Church KWC in Kitchener, Ontario. Register now!',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.pt,
    description:
      descriptions[locale as keyof typeof descriptions] || descriptions.pt,
    alternates: {
      canonical: `${baseUrl}/${locale}/encontro-com-deus`,
      languages: {
        pt: `${baseUrl}/pt/encontro-com-deus`,
        en: `${baseUrl}/en/encontro-com-deus`,
        'x-default': `${baseUrl}/pt/encontro-com-deus`,
      },
    },
  };
}

export default function EncontroComDeusPage({
  params: { locale },
}: PageProps) {
  const t = useTranslations('encontro');

  const painPoints = [
    { title: t('painTitle1'), desc: t('painDesc1'), icon: faHeartBroken },
    { title: t('painTitle2'), desc: t('painDesc2'), icon: faBrain },
    { title: t('painTitle3'), desc: t('painDesc3'), icon: faQuestion },
    { title: t('painTitle4'), desc: t('painDesc4'), icon: faHome },
  ];

  const reasons = [
    { title: t('reason1Title'), desc: t('reason1Desc'), icon: faStar },
    { title: t('reason2Title'), desc: t('reason2Desc'), icon: faLightbulb },
    { title: t('reason3Title'), desc: t('reason3Desc'), icon: faUsers },
    { title: t('reason4Title'), desc: t('reason4Desc'), icon: faPray },
    { title: t('reason5Title'), desc: t('reason5Desc'), icon: faSyncAlt },
  ];

  return (
    <main className="min-h-screen">
      <Navigation locale={locale} />
      <Banner locale={locale} />

      {/* Hero Section */}
      <section className="relative text-white pt-32 pb-20 min-h-[500px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://static.wixstatic.com/media/450325_8a5f3afaa5814c9a875a90d882f9616b~mv2.png/v1/fill/w_1521,h_770,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/450325_8a5f3afaa5814c9a875a90d882f9616b~mv2.png')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white text-opacity-90 drop-shadow">
            {t('heroSubtitle')}
          </p>
          <a
            href={GOOGLE_FORMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white text-accent-700 font-bold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg hover:bg-accent-50"
          >
            {t('ctaButton')}
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </a>
        </div>
      </section>

      {/* Event Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Date */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-3 text-primary-600">
                <FontAwesomeIcon icon={faCalendarDay} />
              </div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                {t('dateLabel')}
              </h3>
              <p className="text-gray-900 font-medium">{t('date')}</p>
            </div>
            {/* Time */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-3 text-secondary-600">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                {t('timeLabel')}
              </h3>
              <p className="text-gray-900 font-medium">{t('time')}</p>
            </div>
            {/* Location */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-3 text-accent-600">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                {t('locationLabel')}
              </h3>
              <p className="text-gray-900 font-medium">{t('location')}</p>
            </div>
            {/* Price */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-3 text-primary-600">
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                {t('priceLabel')}
              </h3>
              <p className="text-gray-900 font-medium">{t('price')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Description Section */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {painPoints.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-lg p-8 flex items-start space-x-5 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex-shrink-0 bg-accent-100 rounded-full w-14 h-14 flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="text-accent-600 text-xl"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Participate Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t('whyTitle')}
            </h2>
            <blockquote className="max-w-2xl mx-auto">
              <p className="text-xl italic text-gray-600 mb-2">
                &ldquo;{t('whyVerse')}&rdquo;
              </p>
              <cite className="text-primary-600 font-semibold not-italic">
                {t('whyVerseRef')}
              </cite>
            </blockquote>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reasons.map((item, i) => (
              <div
                key={i}
                className="text-center p-8 bg-gray-50 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={item.icon}
                    className="text-primary-600 text-2xl"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-accent-600 via-secondary-600 to-primary-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-white text-opacity-90 mb-8">
            {t('ctaDescription')}
          </p>
          <a
            href={GOOGLE_FORMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white text-accent-700 font-bold py-4 px-10 rounded-lg text-xl transition duration-300 shadow-lg hover:bg-accent-50 hover:scale-105 transform"
          >
            {t('ctaButton')}
            <FontAwesomeIcon icon={faArrowRight} className="ml-3" />
          </a>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}
