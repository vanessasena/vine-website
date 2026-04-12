'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faCalendar } from '@fortawesome/free-solid-svg-icons';

interface HeroProps {
  locale: string;
}

export default function Hero({ locale }: HeroProps) {
  const t = useTranslations('hero');
  const e = useTranslations('encontro');

  return (
    <section className="relative bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white">
      <div className="absolute inset-0 bg-black opacity-30"></div>
      <div
        className="relative min-h-screen bg-cover bg-center flex flex-col"
        style={{
          backgroundImage: "url('https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/vine-blue.jpg')"
        }}
      >
        {/* Encontro com Deus Banner */}
        <div className="relative z-10 bg-gradient-to-r from-accent-600/90 via-secondary-500/90 to-primary-600/90 backdrop-blur-sm text-white py-4">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href={`/${locale}/encontro-com-deus`}
              className="flex flex-col md:flex-row items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <FontAwesomeIcon icon={faCalendar} className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg md:text-2xl font-bold">{e('bannerTitle')}</h3>
                  <p className="text-white text-opacity-90 text-xs md:text-base">{e('bannerSubtitle')}</p>
                </div>
              </div>
              <span className="inline-flex items-center bg-white text-accent-700 font-semibold py-2 px-6 rounded-full text-sm md:text-base group-hover:bg-accent-50 transition-colors duration-200 shadow-lg whitespace-nowrap">
                {e('bannerCta')}
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex-1 flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('title')}
          </h1>
          <h2 className="text-2xl md:text-3xl mb-8 text-white text-opacity-90">
            {t('subtitle')}
          </h2>
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto font-semibold">
            {t('description')}
          </p>
          <p className="text-lg md:text-l mb-8 max-w-3xl mx-auto leading-relaxed text-white text-opacity-80">
            {t('mission')}
          </p>

          <div className="mb-8">
            <button
              onClick={() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  aboutSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="bg-white hover:bg-accent-50 text-accent-700 font-bold py-3 px-8 rounded-lg text-lg transition duration-300 shadow-lg"
            >
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