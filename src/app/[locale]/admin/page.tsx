import AdminClient from './AdminClient';
import Breadcrumb from '@/components/Breadcrumb';
import PortalFooter from '@/components/PortalFooter';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminPage({ params: { locale } }: PageProps) {
  return (
    <main className="min-h-screen flex flex-col">
      <Breadcrumb
        locale={locale}
        items={[
          { label: locale === 'pt' ? 'Portal' : 'Portal', href: `/${locale}/member` },
          { label: 'Admin' }
        ]}
      />

      <div className="flex-grow">
        <AdminClient locale={locale} />
      </div>

      <PortalFooter locale={locale} />
    </main>
  );
}
