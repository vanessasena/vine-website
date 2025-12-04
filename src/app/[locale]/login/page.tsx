import LoginClient from './LoginClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function LoginPage({ params: { locale } }: PageProps) {
  return <LoginClient locale={locale} />;
}
