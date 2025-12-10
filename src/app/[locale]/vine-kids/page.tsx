'use client';

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
  faUsers,
  faChevronLeft,
  faChevronRight,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

interface GalleryImage {
  id: string;
  image_url: string;
  alt_text_pt: string;
  alt_text_en: string;
  orientation: 'portrait' | 'landscape';
  display_order: number;
}

interface PageProps {
  params: {
    locale: string;
  };
}

export default function VineKidsPage({ params: { locale } }: PageProps) {
  const t = useTranslations('vineKids');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/vine-kids-gallery');
      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = images[currentSlide];
  const isPortrait = currentImage?.orientation === 'portrait';

  return (
    <main>
      <Navigation locale={locale} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-100 via-secondary-100 to-accent-100 py-12">
        <div className="absolute inset-0 bg-white opacity-60"></div>
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
          <h2 className="text-xl md:text-2xl text-accent-700 mb-6 font-semibold">
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

          {/* Media Carousel */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <FontAwesomeIcon icon={faSpinner} spin className="text-4xl text-primary-600" />
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                {locale === 'pt' ? 'Nenhuma imagem disponível no momento.' : 'No images available at the moment.'}
              </p>
            </div>
          ) : (
            <div className="relative mx-auto mb-16" style={{ maxWidth: isPortrait ? '400px' : '800px' }}>
              <div
                className="relative rounded-lg overflow-hidden shadow-lg bg-gray-900"
                style={{
                  height: isPortrait ? '600px' : '450px',
                  minHeight: '300px'
                }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentImage.image_url}
                    alt={locale === 'pt' ? currentImage.alt_text_pt : currentImage.alt_text_en}
                    width={isPortrait ? 600 : 1200}
                    height={isPortrait ? 800 : 675}
                    className={`transition-all duration-500 ${
                      isPortrait
                        ? 'h-full w-auto max-w-full object-contain'
                        : 'w-full h-auto max-h-full object-contain'
                    }`}
                    style={{
                      objectFit: 'contain',
                      maxWidth: '100%',
                      maxHeight: '100%'
                    }}
                  />
                </div>

                {/* Navigation buttons */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-200 z-10"
                  aria-label="Previous slide"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="text-gray-800 text-lg sm:text-xl" />
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 sm:p-3 shadow-lg transition-all duration-200 z-10"
                  aria-label="Next slide"
                >
                  <FontAwesomeIcon icon={faChevronRight} className="text-gray-800 text-lg sm:text-xl" />
                </button>
              </div>

              {/* Dots indicator */}
              <div className="flex justify-center mt-6 space-x-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`transition-all duration-200 rounded-full ${
                      index === currentSlide
                        ? 'bg-primary-600 scale-125 w-3 h-3 sm:w-4 sm:h-4'
                        : 'bg-gray-300 hover:bg-gray-400 w-2 h-2 sm:w-3 sm:h-3'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                    title={locale === 'pt' ? image.alt_text_pt : image.alt_text_en}
                  />
                ))}
              </div>

              {/* Current slide counter */}
              <div className="text-center mt-3 text-sm text-gray-600">
                {currentSlide + 1} / {images.length}
              </div>
            </div>
          )}
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
      <section className="py-16 bg-gradient-to-r from-accent-600 via-secondary-600 to-primary-600 text-white">
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