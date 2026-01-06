'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faEnvelope, faPhone, faCalendar, faTag, faFilter, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface Volunteer {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  description: string;
  areas: string[];
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const AREA_OPTIONS = [
  'worship',
  'vine_web',
  'kids',
  'store',
  'vine_media',
  'vine_clean',
  'cozinha',
  'vine_welcome',
  'vine_care'
];

export default function VolunteersAdminClient() {
  const t = useTranslations('volunteers');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArea, setSelectedArea] = useState<string>('all');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get auth session
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Unauthorized');
        return;
      }

      const response = await fetch('/api/volunteers', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch volunteers');
      }

      const result = await response.json();
      setVolunteers(result.data || []);
    } catch (err) {
      console.error('Error fetching volunteers:', err);
      setError('Failed to load volunteers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter volunteers by selected area
  const filteredVolunteers = useMemo(() => {
    if (selectedArea === 'all') {
      return volunteers;
    }
    return volunteers.filter(volunteer => volunteer.areas.includes(selectedArea));
  }, [volunteers, selectedArea]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredVolunteers.length / ITEMS_PER_PAGE);
  const paginatedVolunteers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredVolunteers.slice(startIndex, endIndex);
  }, [filteredVolunteers, currentPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedArea]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-xl text-gray-600">Carregando voluntários...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <strong className="font-bold">Erro: </strong>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          <FontAwesomeIcon icon={faUsers} className="mr-2" />
          Voluntários Cadastrados ({filteredVolunteers.length}{selectedArea !== 'all' && ` de ${volunteers.length}`})
        </h2>

        {/* Area Filter */}
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">Todas as Áreas</option>
            {AREA_OPTIONS.map((area) => (
              <option key={area} value={area}>
                {t(`areaOptions.${area}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredVolunteers.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {selectedArea === 'all'
              ? 'Nenhum voluntário cadastrado ainda.'
              : 'Nenhum voluntário encontrado para esta área.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {paginatedVolunteers.map((volunteer) => (
            <div
              key={volunteer.id}
              className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() => setSelectedVolunteer(volunteer)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-primary-700">{volunteer.name}</h3>
                <span className="text-sm text-gray-500">
                  <FontAwesomeIcon icon={faCalendar} className="mr-1" />
                  {formatDate(volunteer.created_at)}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center text-gray-700">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600" />
                  <a href={`tel:${volunteer.phone}`} className="hover:text-primary-600">
                    {volunteer.phone}
                  </a>
                </div>
                {volunteer.email && (
                  <div className="flex items-center text-gray-700">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600" />
                    <a href={`mailto:${volunteer.email}`} className="hover:text-primary-600">
                      {volunteer.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-gray-700 line-clamp-2">{volunteer.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <FontAwesomeIcon icon={faTag} className="text-gray-500 mt-1" />
                {volunteer.areas.map((area) => (
                  <span
                    key={area}
                    className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {t(`areaOptions.${area}`)}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
              Anterior
            </button>

            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;

                const showEllipsis =
                  (page === 2 && currentPage > 3) ||
                  (page === totalPages - 1 && currentPage < totalPages - 2);

                if (showEllipsis) {
                  return <span key={page} className="px-3 py-2 text-gray-500">...</span>;
                }

                if (!showPage) {
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Próxima
              <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
            </button>
          </div>
        )}
      </>
      )}

      {/* Volunteer Detail Modal */}
      {selectedVolunteer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedVolunteer(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-primary-700">{selectedVolunteer.name}</h2>
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faPhone} className="mr-2" />
                    Telefone:
                  </label>
                  <a href={`tel:${selectedVolunteer.phone}`} className="text-primary-600 hover:underline">
                    {selectedVolunteer.phone}
                  </a>
                </div>

                {selectedVolunteer.email && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
                      E-mail:
                    </label>
                    <a href={`mailto:${selectedVolunteer.email}`} className="text-primary-600 hover:underline">
                      {selectedVolunteer.email}
                    </a>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Como pode ajudar:
                  </label>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedVolunteer.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Áreas de interesse:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedVolunteer.areas.map((area) => (
                      <span
                        key={area}
                        className="bg-primary-100 text-primary-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {t(`areaOptions.${area}`)}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <FontAwesomeIcon icon={faCalendar} className="mr-2" />
                    Cadastrado em:
                  </label>
                  <p className="text-gray-600">{formatDate(selectedVolunteer.created_at)}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedVolunteer(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
