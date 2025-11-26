'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

interface NavigationProps {
  locale: string;
}

export default function Navigation({ locale }: NavigationProps) {
  const t = useTranslations('navigation');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Function to check if a link is active
  const isActive = (path: string): boolean => {
    if (path === `/${locale}`) {
      // For home page, check exact match
      return pathname === `/${locale}` || pathname === '/pt' || pathname === '/en';
    }
    // For other pages, check if pathname starts with the path
    return pathname.startsWith(path);
  };

  // Function to get link classes based on active state
  const getLinkClasses = (path: string, isMobile: boolean = false): string => {
    const baseClasses = isMobile ? 'py-2 px-3 rounded-md transition-colors duration-200' : 'px-3 py-2 rounded-md transition-colors duration-200';
    const activeClasses = 'bg-primary-600 text-white font-medium';
    const inactiveClasses = 'text-gray-700 hover:text-primary-600 hover:bg-primary-50';

    return `${baseClasses} ${isActive(path) ? activeClasses : inactiveClasses}`;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-3">
              <Image
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png"
                alt="Vine Church KWC Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href={`/${locale}`} className={getLinkClasses(`/${locale}`)}>
              {t('home')}
            </Link>
            <Link href={`/${locale}/about`} className={getLinkClasses(`/${locale}/about`)}>
              {t('about')}
            </Link>
            <Link href={`/${locale}/schedule`} className={getLinkClasses(`/${locale}/schedule`)}>
              {t('schedule')}
            </Link>
            <Link href={`/${locale}/vine-kids`} className={getLinkClasses(`/${locale}/vine-kids`)}>
              {t('vineKids')}
            </Link>
            <Link href={`/${locale}/sermons`} className={getLinkClasses(`/${locale}/sermons`)}>
              {t('words')}
            </Link>
            <Link href={`/${locale}/cells`} className={getLinkClasses(`/${locale}/cells`)}>
              {t('cells')}
            </Link>
            <Link href={`/${locale}/contact`} className={getLinkClasses(`/${locale}/contact`)}>
              {t('contact')}
            </Link>

            {/* Language Switcher */}
            <div className="flex space-x-2">
              <Link
                href="/pt"
                className={`px-2 py-1 rounded ${locale === 'pt' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:text-primary-600'}`}
              >
                PT
              </Link>
              <Link
                href="/en"
                className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-primary-600 text-white' : 'text-gray-600 hover:text-primary-600'}`}
              >
                EN
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              <FontAwesomeIcon
                icon={isMenuOpen ? faTimes : faBars}
                className="h-6 w-6"
              />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              <Link href={`/${locale}`} className={getLinkClasses(`/${locale}`, true)}>
                {t('home')}
              </Link>
              <Link href={`/${locale}/about`} className={getLinkClasses(`/${locale}/about`, true)}>
                {t('about')}
              </Link>
              <Link href={`/${locale}/schedule`} className={getLinkClasses(`/${locale}/schedule`, true)}>
                {t('schedule')}
              </Link>
              <Link href={`/${locale}/vine-kids`} className={getLinkClasses(`/${locale}/vine-kids`, true)}>
                {t('vineKids')}
              </Link>
              <Link href={`/${locale}/sermons`} className={getLinkClasses(`/${locale}/sermons`, true)}>
                {t('words')}
              </Link>
              <Link href={`/${locale}/cells`} className={getLinkClasses(`/${locale}/cells`, true)}>
                {t('cells')}
              </Link>
              <Link href={`/${locale}/contact`} className={getLinkClasses(`/${locale}/contact`, true)}>
                {t('contact')}
              </Link>
              <div className="flex space-x-2 pt-2">
                <Link
                  href={`/pt`}
                  className={`px-2 py-1 rounded ${locale === 'pt' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                >
                  PT
                </Link>
                <Link
                  href={`/en`}
                  className={`px-2 py-1 rounded ${locale === 'en' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                >
                  EN
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}