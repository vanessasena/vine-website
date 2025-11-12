'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
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

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-3">
              <Image
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/logotipo-videira-small-1.png"
                alt="Vine Church Cambridge Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href={`/${locale}`} className="text-gray-700 hover:text-primary-600">
              {t('home')}
            </Link>
            <Link href={`/${locale}/about`} className="text-gray-700 hover:text-primary-600">
              {t('about')}
            </Link>
            <Link href={`/${locale}/schedule`} className="text-gray-700 hover:text-primary-600">
              {t('schedule')}
            </Link>
            <Link href={`/${locale}/vine-kids`} className="text-gray-700 hover:text-primary-600">
              {t('vineKids')}
            </Link>
            <Link href={`/${locale}/sermons`} className="text-gray-700 hover:text-primary-600">
              {t('words')}
            </Link>
            <Link href={`/${locale}/cells`} className="text-gray-700 hover:text-primary-600">
              {t('cells')}
            </Link>
            <Link href={`/${locale}/contact`} className="text-gray-700 hover:text-primary-600">
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
          <div className="md:hidden">
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
              <Link href={`/${locale}`} className="text-gray-700 hover:text-primary-600 py-2">
                {t('home')}
              </Link>
              <Link href={`/${locale}/about`} className="text-gray-700 hover:text-primary-600 py-2">
                {t('about')}
              </Link>
              <Link href={`/${locale}/schedule`} className="text-gray-700 hover:text-primary-600 py-2">
                {t('schedule')}
              </Link>
              <Link href={`/${locale}/vine-kids`} className="text-gray-700 hover:text-primary-600 py-2">
                {t('vineKids')}
              </Link>
              <Link href={`/${locale}/sermons`} className="text-gray-700 hover:text-primary-600 py-2">
                {t('words')}
              </Link>
              <Link href={`/${locale}/cells`} className="text-gray-700 hover:text-primary-600 py-2">
                {t('cells')}
              </Link>
              <Link href={`/${locale}/contact`} className="text-gray-700 hover:text-primary-600 py-2">
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