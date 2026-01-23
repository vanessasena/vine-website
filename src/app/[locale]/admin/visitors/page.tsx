import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import Breadcrumb from '@/components/Breadcrumb';
import PortalFooter from '@/components/PortalFooter';
import VisitorsAdminClient from './VisitorsAdminClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export default async function VisitorsAdminPage({ params: { locale } }: PageProps) {
  const messages = await getMessages();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Breadcrumb
        locale={locale}
        items={[
          { label: locale === 'pt' ? 'Portal' : 'Portal', href: `/${locale}/member` },
          { label: locale === 'pt' ? 'Gerenciar Visitantes' : 'Manage Visitors' }
        ]}
      />

      <div className="flex-grow">
        <NextIntlClientProvider messages={messages}>
          <VisitorsAdminClient />
        </NextIntlClientProvider>
      </div>

      <PortalFooter locale={locale} />
    </main>
  );
}
