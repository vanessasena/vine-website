import KidsCheckinClient from './KidsCheckinClient';

interface KidsCheckinPageProps {
  params: Promise<{ locale: string }>;
}

export default async function KidsCheckinPage({
  params,
}: KidsCheckinPageProps) {
  const { locale } = await params;

  return <KidsCheckinClient locale={locale} />;
}
