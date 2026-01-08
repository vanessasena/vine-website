import UpdatePasswordClient from './UpdatePasswordClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function UpdatePasswordPage({ params: { locale } }: PageProps) {
  return <UpdatePasswordClient locale={locale} />;
}
