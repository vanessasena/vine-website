'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWifi } from '@fortawesome/free-solid-svg-icons';

export default function OfflineOverlay() {
  const t = useTranslations('offline');
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initialize with the current connection state
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      role="alertdialog"
      aria-live="assertive"
      aria-modal="true"
      aria-labelledby="offline-title"
      aria-describedby="offline-message"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/95 px-4 text-center"
    >
      <div className="max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/20">
          <FontAwesomeIcon icon={faWifi} className="h-10 w-10 text-red-400" />
        </div>
        <h1 id="offline-title" className="text-3xl font-bold text-white">
          {t('title')}
        </h1>
        <p id="offline-message" className="mt-4 text-lg text-gray-200">
          {t('message')}
        </p>
        <p className="mt-2 text-sm text-gray-400">{t('hint')}</p>
      </div>
    </div>
  );
}
