import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Link from 'next/link';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUsers,
  faMapMarkerAlt,
  faUserFriends,
  faHandsHelping,
  faPray,
  faBook,
  faExternalLinkAlt
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
      canonical: `${baseUrl}/${locale}/cells`,
      languages: {
        'pt': `${baseUrl}/pt/cells`,
        'en': `${baseUrl}/en/cells`,
        'x-default': `${baseUrl}/pt/cells`,
      },
    },
  };
}

interface LifeGroup {
  id: string;
  image: string;
  altText: string;
}

export default function CellsPage({ params: { locale } }: PageProps) {
  const t = useTranslations('cells');

  const lifeGroups: LifeGroup[] = [
    {
      id: 'roots',
      image: 'https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/lifegroups/celularoots.jpeg',
      altText: 'Kitchener Roots Life Group'
    },
    {
      id: 'kitchener',
      image: 'https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/lifegroups/kitchener.jpg',
      altText: 'Kitchener Life Group'
    },
    {
      id: 'cambridge',
      image: 'https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/lifegroups/Cambridge.jpg',
      altText: 'Cambridge Life Group'
    },
    {
      id: 'waterloo',
      image: 'https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/lifegroups/sinai.jpg',
      altText: 'Waterloo Life Group'
    },
    {
      id: 'youth',
      image: 'https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/lifegroups/teens.jpg',
      altText: 'Youth Life Group'
    }
  ];

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

      {/* Life Groups Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t('findGroup')}
            </h2>
          </div>

          {/* Groups Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {lifeGroups.map((group) => (
              <div key={group.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-48">
                  <Image
                    src={group.image}
                    alt={group.altText}
                    width={600}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {t(`groups.${group.id}.name`)}
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <FontAwesomeIcon
                        icon={faUserFriends}
                        className="text-primary-600 mt-1 mr-3 flex-shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">{t('leaders')}:</p>
                        <p className="text-gray-600">{t(`groups.${group.id}.leaders`)}</p>
                      </div>
                    </div>

                    {t(`groups.${group.id}.address`) && (
                      <div className="flex items-start">
                        <FontAwesomeIcon
                          icon={faMapMarkerAlt}
                          className="text-primary-600 mt-1 mr-3 flex-shrink-0"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-700 mb-1">{t('address')}:</p>
                          <p className="text-gray-600 mb-2">{t(`groups.${group.id}.address`)}</p>
                          <Link
                            href={`https://maps.google.com/?q=${encodeURIComponent(t(`groups.${group.id}.address`))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 font-medium"
                          >
                            <FontAwesomeIcon icon={faExternalLinkAlt} className="mr-1" />
                            {locale === 'pt' ? 'Abrir no Google Maps' : 'Open in Google Maps'}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {locale === 'pt' ? 'O que fazemos nas Células' : 'What We Do in Life Groups'}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faUsers} className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'pt' ? 'Comunhão' : 'Fellowship'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'pt'
                  ? 'Relacionamentos genuínos e vida compartilhada'
                  : 'Genuine relationships and shared life'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faBook} className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'pt' ? 'Estudo' : 'Bible Study'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'pt'
                  ? 'Crescimento através da Palavra de Deus'
                  : 'Growth through God\'s Word'
                }
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <FontAwesomeIcon icon={faPray} className="text-3xl text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {locale === 'pt' ? 'Oração' : 'Prayer'}
              </h3>
              <p className="text-gray-600 text-sm">
                {locale === 'pt'
                  ? 'Intercedendo uns pelos outros'
                  : 'Interceding for one another'
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
            {t('joinUs')}
          </h2>
          <p className="text-xl mb-8">
            {locale === 'pt'
              ? 'Venha fazer parte desta família! Entre em contato para encontrar uma célula perto de você.'
              : 'Come be part of this family! Get in touch to find a life group near you.'
            }
          </p>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <p className="text-lg mb-4">
              {locale === 'pt' ? 'Entre em contato conosco' : 'Get in touch with us'}
            </p>
            <div className="space-y-2">
              <p className="font-semibold">WhatsApp: +1 365 228 2980</p>
              <p className="font-semibold">Email: videiracanada@gmail.com</p>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}