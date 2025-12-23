import { Metadata } from 'next';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import VolunteersAdminClient from './VolunteersAdminClient';

export const metadata: Metadata = {
  title: 'Voluntários - Admin | Vine Church KWC',
  description: 'Gerenciar voluntários cadastrados',
};

interface PageProps {
  params: {
    locale: string;
  };
}

export default function VolunteersAdminPage({ params: { locale } }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/${locale}/admin`}
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Voltar ao Admin
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gerenciar Voluntários
          </h1>
          <p className="text-gray-600 mb-6">
            Visualize todos os voluntários cadastrados através do formulário do site.
          </p>

          <VolunteersAdminClient />
        </div>
      </div>
    </div>
  );
}
