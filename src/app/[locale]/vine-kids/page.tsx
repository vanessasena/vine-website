import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Image from 'next/image';
import Footer from '@/components/Footer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChild,
  faHeart,
  faHome,
  faBook,
  faPray,
  faHandsHelping,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function VineKidsPage({ params: { locale } }: PageProps) {
  const t = useTranslations('vineKids');

  return (
    <main>
      <Navigation locale={locale} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-green-700 text-white py-12">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="bg-white rounded-full p-4 inline-block shadow-2xl mb-4">
              <Image
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Radicais-Kids-P-300x300-resized.jpg"
                alt="Vine Kids Logo"
                width={150}
                height={150}
                className="mx-auto rounded-full"
              />
            </div>
          </div>
          <h2 className="text-xl md:text-2xl text-secondary-100 mb-6">
            {t('subtitle')}
          </h2>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-lg md:text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto">
              {t('intro')}
            </p>
          </div>

          {/* Image Gallery */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Kids playing and learning"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Children in worship"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Kids learning Bible stories"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">

            {/* Sunday Kids */}
            <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-lg p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4 text-secondary-600">
                  <FontAwesomeIcon icon={faChild} />
                </div>
                <h3 className="text-2xl font-bold text-secondary-800 mb-4">
                  {t('sundayKids')}
                </h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                {t('sundayKidsDescription')}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('sundayKidsContent')}
              </p>
            </div>

            {/* Cells Kids */}
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg p-8">
              <div className="text-center mb-6">
                <div className="text-5xl mb-4 text-primary-600">
                  <FontAwesomeIcon icon={faHome} />
                </div>
                <h3 className="text-2xl font-bold text-primary-800 mb-4">
                  {t('cellsKids')}
                </h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('cellsKidsDescription')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Spiritual Process Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {t('spiritualProcess')}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              {t('spiritualProcessDescription')}
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-8">

            {/* Evangelism */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4 text-red-500">
                  <FontAwesomeIcon icon={faHeart} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {t('evangelism')}
                </h3>
              </div>
              <blockquote className="border-l-4 border-red-500 pl-4 italic text-gray-600 mb-4">
                {t('evangelismVerse')}
              </blockquote>
              <p className="text-gray-700 leading-relaxed">
                {t('evangelismDescription')}
              </p>
            </div>

            {/* Teaching */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4 text-blue-500">
                  <FontAwesomeIcon icon={faBook} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {t('teaching')}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {t('teachingDescription')}
              </p>
            </div>

            {/* Training */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4 text-green-500">
                  <FontAwesomeIcon icon={faHandsHelping} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {t('training')}
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('trainingDescription')}
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                {t('trainingMethod')}
              </p>
              <p className="text-gray-700 leading-relaxed">
                {t('projects')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <FontAwesomeIcon icon={faUsers} className="text-6xl mb-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'pt'
              ? 'Tragam suas crianças!'
              : 'Bring your children!'
            }
          </h2>
          <p className="text-xl mb-8">
            {locale === 'pt'
              ? 'Venha participar do nosso ministério infantil. Suas crianças são muito importantes para nós!'
              : 'Come participate in our children\'s ministry. Your children are very important to us!'
            }
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'pt' ? 'Domingo às 10:00' : 'Sunday at 10:00 AM'}
              </h3>
              <p>{locale === 'pt' ? 'Culto das Crianças' : 'Children\'s Service'}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'pt' ? 'Durante a semana' : 'During the week'}
              </h3>
              <p>{locale === 'pt' ? 'Células nas casas' : 'Life groups in homes'}</p>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}