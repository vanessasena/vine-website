'use client';

import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

interface AddressChangeAlertProps {
  className?: string;
}

export default function AddressChangeAlert({ className = '' }: AddressChangeAlertProps) {
  const t = useTranslations('addressChange');

  return (
    <div className={`bg-blue-50 border-l-4 border-blue-500 p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <FontAwesomeIcon
            icon={faInfoCircle}
            className="h-5 w-5 text-blue-500"
          />
        </div>
        <div className="ml-3">
          <p className="text-sm text-white-700">
            <span className="font-semibold">{t('title')}</span> {t('message')}
          </p>
        </div>
      </div>
    </div>
  );
}
