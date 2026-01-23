import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface PortalFooterProps {
  locale: string;
}

export default function PortalFooter({ locale }: PortalFooterProps) {
  const t = useTranslations('portalFooter');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo and Copyright */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 bg-white rounded-lg p-2">
              <Image
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png"
                alt="Vine Church KWC Logo"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div>
              <p className="text-sm text-gray-300">
                © {currentYear} Vine Church KWC
              </p>
              <p className="text-xs text-gray-400">
                {t('rights')}
              </p>
            </div>
          </div>

          {/* Back to Website Link */}
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/40"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4" />
            <span className="font-medium">{t('backToWebsite')}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
