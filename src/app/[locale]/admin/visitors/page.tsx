import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import VisitorsAdminClient from './VisitorsAdminClient';

export default async function VisitorsAdminPage() {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <VisitorsAdminClient />
    </NextIntlClientProvider>
  );
}
