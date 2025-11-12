'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';

interface FooterProps {
  locale: string;
}

export default function Footer({ locale }: FooterProps) {
  const f = useTranslations('footer');
  const n = useTranslations('navigation');
  const c = useTranslations('contact');

  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 mb-6">
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{f('quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href={`/${locale}`} className="text-gray-300 hover:text-white transition-colors">
                  {n('home')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-gray-300 hover:text-white transition-colors">
                  {n('about')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/schedule`} className="text-gray-300 hover:text-white transition-colors">
                  {n('schedule')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/vine-kids`} className="text-gray-300 hover:text-white transition-colors">
                  {n('vineKids')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/sermons`} className="text-gray-300 hover:text-white transition-colors">
                  {n('words')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/cells`} className="text-gray-300 hover:text-white transition-colors">
                  {n('cells')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-gray-300 hover:text-white transition-colors">
                  {n('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-semibold mb-4">{f('followUs')}</h3>
            <a
              href={c('instagramUrl')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-gray-300 hover:text-white transition-colors"
            >
              <FontAwesomeIcon icon={faInstagram} className="h-5 w-5 mr-2" />
              {c('instagramHandle')}
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 pt-6 text-center text-gray-400">
          <p>{f('copyright')}</p>
        </div>
      </div>
    </footer>
  );
}