'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

interface BannerProps {
  locale: string;
}

export default function Banner({ locale }: BannerProps) {
  const e = useTranslations('encontro');
  const pathname = usePathname();

  // Hide banner on the Encontro com Deus page itself
  if (pathname.includes('/encontro-com-deus')) {
    return null;
  }

  return (
    <div className="relative z-40 bg-gradient-to-r from-accent-600 via-secondary-500 to-primary-600 text-white py-3 md:py-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href={`/${locale}/encontro-com-deus`}
          className="flex flex-col md:flex-row items-center justify-between gap-3 group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full w-10 h-10 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faCalendar} className="text-lg md:text-xl" />
            </div>
            <div>
              <h3 className="text-base md:text-2xl font-bold leading-tight">{e('bannerTitle')}</h3>
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
  );
}
