import KidsCheckinClient from './KidsCheckinClient';
import Breadcrumb from '@/components/Breadcrumb';
import PortalFooter from '@/components/PortalFooter';

interface KidsCheckinPageProps {
  params: Promise<{ locale: string }>;
}

export default async function KidsCheckinPage({
  params,
}: KidsCheckinPageProps) {
  const { locale } = await params;

  return (
    <main className="min-h-screen flex flex-col">
      <Breadcrumb
        locale={locale}
        items={[
          { label: locale === 'pt' ? 'Portal' : 'Portal', href: `/${locale}/member` },
          { label: 'Kids Check-in' }
        ]}
      />

      <div className="flex-grow">
        <KidsCheckinClient locale={locale} />
      </div>

      <PortalFooter locale={locale} />
    </main>
  );
}
