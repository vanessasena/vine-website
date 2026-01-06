import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import RegisterVisitorClient from './RegisterVisitorClient';

export default async function RegisterVisitorPage() {
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <RegisterVisitorClient />
    </NextIntlClientProvider>
  );
}
