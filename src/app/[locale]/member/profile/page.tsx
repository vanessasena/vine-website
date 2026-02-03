import { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import Breadcrumb from '@/components/Breadcrumb';
import PortalFooter from '@/components/PortalFooter';
import MemberProfileClient from '../MemberProfileClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
  const baseUrl = 'https://vinechurch.ca';
  return {
    title: locale === 'pt' ? 'Meu Perfil - Vine Church KWC' : 'My Profile - Vine Church KWC',
    description: locale === 'pt'
      ? 'Gerencie seu perfil de membro na Vine Church KWC.'
      : 'Manage your member profile at Vine Church KWC.',
    alternates: {
      canonical: `${baseUrl}/${locale}/member/profile`,
      languages: {
        'pt': `${baseUrl}/pt/member/profile`,
        'en': `${baseUrl}/en/member/profile`,
        'x-default': `${baseUrl}/pt/member/profile`,
      },
    },
  };
}

export default function MemberProfilePage({ params: { locale } }: PageProps) {
  const t = useTranslations('breadcrumb');

  return (
    <main>
      <Breadcrumb
        locale={locale}
        items={[
          { label: t('portal'), href: `/${locale}/member` },
          { label: t('myProfile') }
        ]}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {t('myProfile')}
          </h1>
        </div>
      </section>

      {/* Member Profile Content */}
      <MemberProfileClient locale={locale} />

      <PortalFooter locale={locale} />
    </main>
  );
}
