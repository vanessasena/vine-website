import ScheduleAdminClient from './ScheduleAdminClient';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function ScheduleAdminPage({ params: { locale } }: PageProps) {
  return <ScheduleAdminClient locale={locale} />;
}
