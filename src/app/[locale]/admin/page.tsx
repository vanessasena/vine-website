import AdminClient from './AdminClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AdminPage({ params: { locale } }: PageProps) {
  return <AdminClient locale={locale} />;
}
