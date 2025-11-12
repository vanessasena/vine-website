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
      <section className="relative bg-gradient-to-r from-yellow-50 to-yellow-100 text-white py-12">
        <div className="absolute inset-0 bg-gray-200 opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">

              <Image
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/new%20vine%20kids.png"
                alt="Vine Kids Logo"
                width={150}
                height={150}
                className="mx-auto"
              />
          </div>
          <h2 className="text-xl md:text-2xl text-cyan-600 mb-6">
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
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/IMG-20250406-WA0008.jpg"
                alt="Kids playing and learning"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/domingo%20kids.jpg"
                alt="Domingo Kids"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <Image
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/IMG-20250930-WA0048.jpg"
                alt="Evento Royal Kids"
                width={400}
                height={300}
                className="w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {locale === 'pt' ? 'Nosso Material Lúdico' : 'Our Exclusive Material'}
            </h2>
            <p className="text-lg text-gray-600">
              {locale === 'pt'
                ? 'Conheça nosso desenho animado especial, criado exclusivamente para educar e ensinar as nossas crianças'
                : 'Meet our special cartoon, created exclusively to educate and teach the children of our church'
              }
            </p>
          </div>
          <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 aspect ratio */ }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
              src="https://www.youtube.com/embed/VUnUSpZwRA8"
              title="Vine Kids Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
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

          {/* Bible Verse */}
          <div className="mb-10">
            <blockquote className="text-lg md:text-xl italic font-medium mb-4 text-yellow-100">
              {locale === 'pt'
                ? '"Mas Jesus disse: \'Deixem as crianças virem a mim, e não as impeçam; pois o Reino dos Céus pertence aos que são como estas crianças\'."'
                : '"But Jesus said, \'Let the little children come to me, and do not hinder them, for the kingdom of heaven belongs to such as these.\'"'
              }
            </blockquote>
            <cite className="text-sm font-semibold text-yellow-200">
              {locale === 'pt' ? 'Mateus 19:14' : 'Matthew 19:14'}
            </cite>
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