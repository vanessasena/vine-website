'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock } from '@fortawesome/free-solid-svg-icons';

export default function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white">
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div
        className="relative h-screen bg-cover bg-center flex items-center"
        style={{
          backgroundImage: "url('https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/vine-blue.jpg')"
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('title')}
          </h1>
          <h2 className="text-2xl md:text-3xl mb-8 text-secondary-100">
            {t('subtitle')}
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('description')}
          </p>

          <div className="mb-8">
            <button className="bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg">
              {t('cta')}
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12 text-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2" />
                {t('address')}
              </h3>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center justify-center">
                <FontAwesomeIcon icon={faClock} className="mr-2" />
                {t('serviceTime')}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}