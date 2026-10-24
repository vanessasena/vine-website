import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import RegisterVisitorClient from './RegisterVisitorClient';
import OfflineOverlay from '@/components/OfflineOverlay';

export default async function RegisterVisitorPage() {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <OfflineOverlay />
      <RegisterVisitorClient />
    </NextIntlClientProvider>
  );
}
