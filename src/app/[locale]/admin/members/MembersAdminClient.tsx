'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VOLUNTEER_AREA_OPTIONS } from '@/lib/constants';
import {
  faUsers,
  faFilter,
  faEnvelope,
  faPhone,
  faBirthdayCake,
  faCheckCircle,
  faChurch,
  faHandsHelping,
  faTimes,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  parent1_id: string;
  parent2_id: string | null;
}

interface MemberProfile {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string | null;
  phone: string;
  email: string;
  is_baptized: boolean;
  pays_tithe: boolean;
  volunteer_areas: string[];
  volunteer_outros_details: string | null;
  life_group: string | null;
  is_married: boolean;
  spouse_name: string | null;
  created_at: string;
  updated_at: string;
}

const ITEMS_PER_PAGE = 10;

interface MembersAdminClientProps {
  locale: string;
}

export default function MembersAdminClient({ locale }: MembersAdminClientProps) {
  const t = useTranslations('member');
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [memberChildren, setMemberChildren] = useState<{ [memberId: string]: Child[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedArea, setSelectedArea] = useState<string>('all');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);

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

      // Verify admin role
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role !== 'admin') {
        setError('Unauthorized');
        return;
      }

      // Fetch all member profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('member_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw profilesError;
      }

      setMembers(profiles || []);

      // Fetch children for all members
      if (profiles && profiles.length > 0) {
        const childrenByMember: { [memberId: string]: Child[] } = {};

        for (const profile of profiles) {
          const { data: children } = await supabase
            .from('children')
            .select('*')
            .or(`parent1_id.eq.${profile.id},parent2_id.eq.${profile.id}`)
            .order('date_of_birth', { ascending: true });

          if (children && children.length > 0) {
            childrenByMember[profile.id] = children;
          }
        }

        setMemberChildren(childrenByMember);
      }
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load member profiles');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Filter members by selected area
  const filteredMembers = useMemo(() => {
    if (selectedArea === 'all') {
      return members;
    }
    return members.filter(member => member.volunteer_areas.includes(selectedArea));
  }, [members, selectedArea]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, currentPage]);

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
        <div className="text-xl text-gray-600">
          {locale === 'pt' ? 'Carregando membros...' : 'Loading members...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
        <strong className="font-bold">{locale === 'pt' ? 'Erro: ' : 'Error: '}</strong>
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          <FontAwesomeIcon icon={faUsers} className="mr-2" />
          {locale === 'pt' ? 'Membros Cadastrados' : 'Registered Members'} ({filteredMembers.length}
          {selectedArea !== 'all' && ` ${locale === 'pt' ? 'de' : 'of'} ${members.length}`})
        </h2>

        {/* Area Filter */}
        <div className="flex items-center gap-2">
          <FontAwesomeIcon icon={faFilter} className="text-gray-600" />
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">{locale === 'pt' ? 'Todas as Áreas' : 'All Areas'}</option>
            {VOLUNTEER_AREA_OPTIONS.map((area) => (
              <option key={area} value={area}>
                {t(`volunteerOptions.${area}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredMembers.length === 0 ? (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            {selectedArea === 'all'
              ? locale === 'pt'
                ? 'Nenhum membro cadastrado ainda.'
                : 'No members registered yet.'
              : locale === 'pt'
              ? 'Nenhum membro encontrado para esta área.'
              : 'No members found for this area.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {paginatedMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">
                      {locale === 'pt' ? 'Cadastrado em' : 'Registered on'} {formatDate(member.created_at)}
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-gray-700">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600" />
                    {member.email}
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600" />
                    {member.phone}
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4">
                    {member.is_baptized && (
                  <span className={`flex items-center ${member.is_baptized ? 'text-green-600' : 'text-gray-400'}`}>
                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                    {locale === 'pt' ? 'Batizado' : 'Baptized'}
                  </span>)}
                        {member.pays_tithe && (
                  <span className={`flex items-center ${member.pays_tithe ? 'text-green-600' : 'text-gray-400'}`}>
                    <FontAwesomeIcon icon={faChurch} className="mr-1" />
                    {locale === 'pt' ? 'Dizimista' : 'Tither'}
                  </span>)}
                </div>

                {member.volunteer_areas.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <FontAwesomeIcon icon={faHandsHelping} className="text-gray-500 mt-1" />
                    {member.volunteer_areas.map((area) => (
                      <span
                        key={area}
                        className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                      >
                        {t(`volunteerOptions.${area}`)}
                      </span>
                    ))}
                  </div>
                )}
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
                {locale === 'pt' ? 'Anterior' : 'Previous'}
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;

                  const showEllipsis =
                    (page === 2 && currentPage > 3) ||
                    (page === totalPages - 1 && currentPage < totalPages - 2);

                  if (showEllipsis) {
                    return (
                      <span key={page} className="px-3 py-2 text-gray-500">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) {
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === currentPage
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
                {locale === 'pt' ? 'Próxima' : 'Next'}
                <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedMember.name}</h2>
                  <p className="text-sm text-gray-500">
                    {locale === 'pt' ? 'Cadastrado em' : 'Registered on'} {formatDate(selectedMember.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600" />
                      {t('email')}
                    </div>
                    <div className="text-lg text-gray-900">{selectedMember.email}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600" />
                      {t('phone')}
                    </div>
                    <div className="text-lg text-gray-900">{selectedMember.phone}</div>
                  </div>

                  {selectedMember.date_of_birth && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        <FontAwesomeIcon icon={faBirthdayCake} className="mr-2 text-primary-600" />
                        {t('dateOfBirth')}
                      </div>
                      <div className="text-lg text-gray-900">
                        {formatDate(selectedMember.date_of_birth)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faCheckCircle}
                        className={`mr-2 ${selectedMember.is_baptized ? 'text-green-600' : 'text-gray-400'}`}
                      />
                      <span className={selectedMember.is_baptized ? 'text-gray-900' : 'text-gray-500'}>
                        {t('isBaptized')}: {selectedMember.is_baptized ? t('yes') : t('no')}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <FontAwesomeIcon
                        icon={faChurch}
                        className={`mr-2 ${selectedMember.pays_tithe ? 'text-green-600' : 'text-gray-400'}`}
                      />
                      <span className={selectedMember.pays_tithe ? 'text-gray-900' : 'text-gray-500'}>
                        {t('paysTithe')}: {selectedMember.pays_tithe ? t('yes') : t('no')}
                      </span>
                    </div>
                  </div>

                  {selectedMember.life_group && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                        {t('lifeGroup')}
                      </div>
                      <div className="text-lg text-gray-900">{selectedMember.life_group}</div>
                    </div>
                  )}

                  {selectedMember.volunteer_areas.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        <FontAwesomeIcon icon={faHandsHelping} className="mr-2 text-primary-600" />
                        {t('volunteerAreas')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.volunteer_areas.map((area) => (
                          <span
                            key={area}
                            className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                          >
                            {t(`volunteerOptions.${area}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMember.volunteer_outros_details && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        {locale === 'pt' ? 'Detalhes Adicionais de Voluntariado' : 'Additional Volunteer Details'}
                      </div>
                      <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                        {selectedMember.volunteer_outros_details}
                      </div>
                    </div>
                  )}

                  {/* Family Information */}
                  {(selectedMember.is_married || memberChildren[selectedMember.id]?.length > 0) && (
                    <div className="mt-4 border-t pt-4">
                      <div className="text-sm font-medium text-gray-500 mb-3">
                        {locale === 'pt' ? 'Informações Familiares' : 'Family Information'}
                      </div>

                      {selectedMember.is_married && (
                        <div className="mb-3">
                          <div className="flex items-center text-gray-900 mb-1">
                            <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-600" />
                            <span className="font-medium">{t('married')}</span>
                          </div>
                          {selectedMember.spouse_name && (
                            <div className="ml-6 text-gray-700">
                              <span className="text-sm text-gray-500">{t('spouseName')}: </span>
                              {selectedMember.spouse_name}
                            </div>
                          )}
                        </div>
                      )}

                      {memberChildren[selectedMember.id] && memberChildren[selectedMember.id].length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-500 mb-2">
                            <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                            {t('children')}
                          </div>
                          <div className="space-y-2">
                            {memberChildren[selectedMember.id].map((child) => (
                              <div key={child.id} className="bg-gray-50 p-2 rounded-lg ml-6">
                                <span className="font-medium text-gray-900">{child.name}</span>
                                <span className="text-gray-600 ml-2">
                                  ({calculateAge(child.date_of_birth)} {locale === 'pt' ? (calculateAge(child.date_of_birth) === 1 ? 'ano' : 'anos') : (calculateAge(child.date_of_birth) === 1 ? 'year' : 'years')})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  {locale === 'pt' ? 'Fechar' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
