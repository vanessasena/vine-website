import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Link from 'next/link';
import Footer from '@/components/Footer';
import GoogleMapEmbed from '@/components/GoogleMapEmbed';
import AddressChangeAlert from '@/components/AddressChangeAlert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faClock,
  faUserTie,
  faEnvelope,
  faHandshake
} from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp, faInstagram } from '@fortawesome/free-brands-svg-icons';
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
      canonical: `${baseUrl}/${locale}/contact`,
      languages: {
        'pt': `${baseUrl}/pt/contact`,
        'en': `${baseUrl}/en/contact`,
        'x-default': `${baseUrl}/pt/contact`,
      },
    },
  };
}

export default function ContactPage({ params: { locale } }: PageProps) {
  const t = useTranslations('contact');

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

      {/* Contact Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid md:grid-cols-2 gap-12">

            {/* Contact Information */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {t('getInTouch')}
              </h2>

              {/* Address */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl text-primary-600">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-primary-700 mb-2">
                      {t('address')}
                    </h3>
                    <p className="text-gray-700 text-lg">
                      {t('addressText')}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Cambridge, Ontario, Canada
                    </p>
                    <AddressChangeAlert className="mt-4" />
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl text-green-600">
                    <FontAwesomeIcon icon={faWhatsapp} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-700 mb-2">
                      {t('phone')}
                    </h3>
                    <Link
                      href={`https://wa.me/${t('phoneNumber').replace(/[\s-+()]/g, '')}`}
                      target="_blank"
                      className="text-green-600 hover:text-green-800 text-lg font-semibold"
                    >
                      {t('phoneNumber')}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      {locale === 'pt' ? 'Clique para enviar mensagem' : 'Click to send message'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl text-blue-600">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-700 mb-2">
                      {t('email')}
                    </h3>
                    <Link
                      href={`mailto:${t('emailAddress')}`}
                      className="text-blue-600 hover:text-blue-800 text-lg font-semibold"
                    >
                      {t('emailAddress')}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      {locale === 'pt' ? 'Clique para enviar e-mail' : 'Click to send email'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Instagram */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl text-pink-600">
                    <FontAwesomeIcon icon={faInstagram} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-700 mb-2">
                      {t('instagram')}
                    </h3>
                    <Link
                      href={t('instagramUrl')}
                      target="_blank"
                      className="text-pink-600 hover:text-pink-800 text-lg font-semibold"
                    >
                      {t('instagramHandle')}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">
                      {locale === 'pt' ? 'Siga-nos no Instagram' : 'Follow us on Instagram'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Times */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl text-primary-600">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-700 mb-2">
                      {t('service')}
                    </h3>
                    <p className="text-gray-700 text-lg">
                      {t('serviceText')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {locale === 'pt' ? 'Todos são bem-vindos!' : 'Everyone is welcome!'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pastor */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl text-primary-600">
                    <FontAwesomeIcon icon={faUserTie} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-primary-700 mb-2">
                      {t('pastor')}
                    </h3>
                    <p className="text-gray-700 text-lg">
                      {t('pastorText')}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Map and Visit Us */}
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                {t('visitUs')}
              </h2>

              {/* Google Map */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <GoogleMapEmbed className="w-full h-80" />
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-4">
                    55 Dickson Street, 8 Petty Pl, Cambridge, ON N1R 7A5
                  </p>
                  <AddressChangeAlert className="mb-4" />
                  <Link
                    href="https://maps.app.goo.gl/ZQ9P9QdjNfw31eCc7"
                    target="_blank"
                    className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition duration-300"
                  >
                    {locale === 'pt' ? 'Abrir no Google Maps' : 'Open in Google Maps'}
                  </Link>
                </div>
              </div>

              {/* First Visit Info */}
              <div className="bg-secondary-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-primary-700 mb-4 flex items-center">
                  <FontAwesomeIcon icon={faHandshake} className="mr-2" />
                  {locale === 'pt' ? 'Primeira Visita?' : 'First Visit?'}
                </h3>
                <p className="text-gray-700 mb-4">
                  {locale === 'pt'
                    ? 'Não se preocupe! Nossa equipe está pronta para te receber e ajudar. Venha como você está!'
                    : "Don't worry! Our team is ready to welcome you and help. Come as you are!"
                  }
                </p>
                <ul className="text-gray-600 space-y-2">
                  <li>• {locale === 'pt' ? 'Estacionamento gratuito de fácil acesso' : 'Free parking with easy access'}</li>
                  <li>• {locale === 'pt' ? 'Recepção calorosa' : 'Warm welcome'}</li>
                  <li>• {locale === 'pt' ? 'Ambiente familiar' : 'Family-friendly environment'}</li>
                  <li>• {locale === 'pt' ? 'Tradução disponível' : 'Translation available'}</li>
                </ul>
              </div>

            </div>

          </div>

        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}