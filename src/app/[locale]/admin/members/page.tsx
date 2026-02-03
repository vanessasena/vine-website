import { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';
import PortalFooter from '@/components/PortalFooter';
import MembersAdminClient from './MembersAdminClient';

export const metadata: Metadata = {
  title: 'Member Profiles - Admin | Vine Church KWC',
  description: 'View and manage member profiles',
};

interface PageProps {
  params: {
    locale: string;
  };
}

export default function MembersAdminPage({ params: { locale } }: PageProps) {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Breadcrumb
        locale={locale}
        items={[
          { label: locale === 'pt' ? 'Portal' : 'Portal', href: `/${locale}/member` },
          { label: locale === 'pt' ? 'Gerenciar Membros' : 'Manage Members' }
        ]}
      />

      <div className="flex-grow">
        <MembersAdminClient locale={locale} />
      </div>

      <PortalFooter locale={locale} />
    </main>
  );
}
