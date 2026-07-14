import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendarDay,
  faClock,
  faMapMarkerAlt,
  faDollarSign,
  faGraduationCap,
  faBookOpen,
  faUsers,
  faHandsHelping,
  faSeedling,
  faCross,
  faChalkboardTeacher,
  faArrowRight,
  faExclamationCircle,
  faFileInvoiceDollar,
} from '@fortawesome/free-solid-svg-icons';
import '@/lib/fontawesome';
import type { Metadata } from 'next';

const CTL_FORMS_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScct63ak6_WDeNSs-AYcz3rZU68AggL1fOYvOGLPp0DjveCHA/viewform';

const MATURIDADE_FORMS_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScOCK9fOWvNCT4XPI0txJvOfx-7DIkILIK15KqU03-X18aJlA/viewform';

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
    pt: 'Cursos - Vine Church KWC',
    en: 'Courses - Vine Church KWC',
  };
  const descriptions = {
    pt: 'Cursos da Vine Church KWC: Maturidade no Espírito e Treinamento de Líderes. Aulas às terças-feiras às 7:15pm. Inscreva-se!',
    en: 'Vine Church KWC Courses: Maturity in the Spirit and Leadership Training. Classes on Tuesdays at 7:15pm. Register now!',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.pt,
    description:
      descriptions[locale as keyof typeof descriptions] || descriptions.pt,
    alternates: {
      canonical: `${baseUrl}/${locale}/cursos`,
      languages: {
        pt: `${baseUrl}/pt/cursos`,
        en: `${baseUrl}/en/cursos`,
        'x-default': `${baseUrl}/pt/cursos`,
      },
    },
  };
}

export default function CursosPage({ params: { locale } }: PageProps) {
  const t = useTranslations('cursos');

  const maturidadeTopics = [
    { title: t('maturidadeTopic1'), icon: faBookOpen },
    { title: t('maturidadeTopic2'), icon: faSeedling },
    { title: t('maturidadeTopic3'), icon: faCross },
  ];

  const ctlTopics = [
    { title: t('ctlTopic1'), icon: faUsers },
    { title: t('ctlTopic2'), icon: faChalkboardTeacher },
    { title: t('ctlTopic3'), icon: faHandsHelping },
  ];

  return (
    <main className="min-h-screen">
      <Navigation locale={locale} />

      {/* Hero Section */}
      <section className="relative text-white pt-32 pb-20 min-h-[500px] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://cdn.pixabay.com/photo/2024/04/18/15/19/ai-generated-8704527_1280.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {t('heroTitle')}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white text-opacity-90 drop-shadow">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Event Info Cards */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Start Date */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-3 text-primary-600">
                <FontAwesomeIcon icon={faCalendarDay} />
              </div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                {t('startDateLabel')}
              </h3>
              <p className="text-gray-900 font-medium">{t('startDate')}</p>
            </div>
            {/* Schedule */}
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl mb-3 text-secondary-600">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">
                {t('scheduleLabel')}
              </h3>
              <p className="text-gray-900 font-medium">{t('schedule')}</p>
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

      {/* Courses Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('coursesTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t('coursesSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Maturidade no Espírito */}
            <div className="bg-gray-50 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full w-14 h-14 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faSeedling}
                      className="text-white text-2xl"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {t('maturidadeTitle')}
                  </h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('maturidadeDesc1')}
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('maturidadeDesc2')}
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {t('maturidadeDesc3')}
                </p>
                <h4 className="font-semibold text-gray-900 mb-3">
                  {t('topicsLabel')}
                </h4>
                <ul className="space-y-3">
                  {maturidadeTopics.map((topic, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <div className="bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon
                          icon={topic.icon}
                          className="text-primary-600 text-sm"
                        />
                      </div>
                      <span className="text-gray-700">{topic.title}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <a
                    href={MATURIDADE_FORMS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-accent-600 text-white font-semibold py-2 px-6 rounded-lg text-sm transition duration-300 hover:bg-accent-700"
                  >
                    {t('ctaButton')}
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </a>
                </div>
              </div>
            </div>

            {/* CTL */}
            <div className="bg-gray-50 rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-accent-600 to-accent-700 p-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-full w-14 h-14 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      className="text-white text-2xl"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {t('ctlTitle')}
                  </h3>
                </div>
              </div>
              <div className="p-8">
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('ctlDesc1')}
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('ctlDesc2')}
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  {t('ctlDesc3')}
                </p>
                <p className="text-sm font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-md px-4 py-2 mb-6">
                  {t('ctlPrerequisite')}
                </p>
                <h4 className="font-semibold text-gray-900 mb-3">
                  {t('topicsLabel')}
                </h4>
                <ul className="space-y-3">
                  {ctlTopics.map((topic, i) => (
                    <li key={i} className="flex items-center space-x-3">
                      <div className="bg-accent-100 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <FontAwesomeIcon
                          icon={topic.icon}
                          className="text-accent-600 text-sm"
                        />
                      </div>
                      <span className="text-gray-700">{topic.title}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <a
                    href={CTL_FORMS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-accent-600 text-white font-semibold py-2 px-6 rounded-lg text-sm transition duration-300 hover:bg-accent-700"
                  >
                    {t('ctaButton')}
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Info Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <FontAwesomeIcon
                icon={faFileInvoiceDollar}
                className="mr-3 text-primary-600"
              />
              {t('paymentTitle')}
            </h2>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 md:p-10">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-700 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('paymentStep1Title')}
                  </h4>
                  <p className="text-gray-600">{t('paymentStep1Desc')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-700 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('paymentStep2Title')}
                  </h4>
                  <p className="text-gray-600">{t('paymentStep2Desc')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-700 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('paymentStep3Title')}
                  </h4>
                  <p className="text-gray-600">{t('paymentStep3Desc')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-700 font-bold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {t('paymentStep4Title')}
                  </h4>
                  <p className="text-gray-600">{t('paymentStep4Desc')}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <FontAwesomeIcon
                  icon={faExclamationCircle}
                  className="text-amber-600 mt-1"
                />
                <p className="text-amber-800 text-sm">
                  {t('paymentNote')}
                </p>
              </div>
            </div>
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
          {/* <a
            href={CTL_FORMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center bg-white text-accent-700 font-bold py-4 px-10 rounded-lg text-xl transition duration-300 shadow-lg hover:bg-accent-50 hover:scale-105 transform"
          >
            {t('ctaButton')}
            <FontAwesomeIcon icon={faArrowRight} className="ml-3" />
          </a> */}
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}
