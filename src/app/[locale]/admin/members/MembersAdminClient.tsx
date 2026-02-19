'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { VOLUNTEER_AREA_OPTIONS, GENDER_OPTIONS, SPIRITUAL_COURSE_OPTIONS } from '@/lib/constants';
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
  faSearch,
  faHome,
  faCross,
  faArrowLeft,
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
  gender: string | null;
  phone: string;
  email: string;
  is_baptized: boolean;
  pays_tithe: boolean;
  spiritual_courses: string[];
  encounter_with_god: boolean;
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

  // Filter states
  const [searchName, setSearchName] = useState<string>('');
  const [selectedLifeGroup, setSelectedLifeGroup] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string>('all'); // all, married, single
  const [selectedTithe, setSelectedTithe] = useState<string>('all'); // all, yes, no
  const [selectedBaptized, setSelectedBaptized] = useState<string>('all'); // all, yes, no
  const [selectedEncounter, setSelectedEncounter] = useState<string>('all'); // all, yes, no
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
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

      // Fetch members via API (uses service role key for full access)
      const response = await fetch('/api/members', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError('Unauthorized: Only admins and leaders can view all members');
        } else {
          setError('Failed to load member profiles');
        }
        return;
      }

      const profiles = await response.json();
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
    const [year, month, day] = dateOfBirth.split('T')[0].split('-');
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthName = date.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US', { month: 'long' });
    if (locale === 'pt') {
      return `${parseInt(day)} de ${monthName}, ${year}`;
    }
    return `${monthName} ${parseInt(day)}, ${year}`;
  };

  // Enhanced filtering logic with multiple criteria
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // Name search filter
      if (searchName && !member.name.toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      // Life group filter
      if (selectedLifeGroup !== 'all' && member.life_group !== selectedLifeGroup) {
        return false;
      }

      // Gender filter
      if (selectedGender !== 'all' && member.gender !== selectedGender) {
        return false;
      }

      // Tithe filter
      if (selectedTithe === 'yes' && !member.pays_tithe) {
        return false;
      }
      if (selectedTithe === 'no' && member.pays_tithe) {
        return false;
      }

      // Baptized filter
      if (selectedBaptized === 'yes' && !member.is_baptized) {
        return false;
      }
      if (selectedBaptized === 'no' && member.is_baptized) {
        return false;
      }

      // Encounter with God filter
      if (selectedEncounter === 'yes' && !member.encounter_with_god) {
        return false;
      }
      if (selectedEncounter === 'no' && member.encounter_with_god) {
        return false;
      }

      // Spiritual course filter
      if (selectedCourse !== 'all' && !member.spiritual_courses.includes(selectedCourse)) {
        return false;
      }

      // Volunteer area filter
      if (selectedArea !== 'all' && !member.volunteer_areas.includes(selectedArea)) {
        return false;
      }

      // Marital status filter
      if (selectedMaritalStatus === 'married' && !member.is_married) {
        return false;
      }
      if (selectedMaritalStatus === 'single' && member.is_married) {
        return false;
      }

      return true;
    });
  }, [members, searchName, selectedLifeGroup, selectedGender, selectedMaritalStatus, selectedTithe, selectedBaptized, selectedEncounter, selectedCourse, selectedArea, memberChildren]);

  // Get unique life groups for filter dropdown
  const lifeGroups = useMemo(() => {
    const groups = members
      .filter((m) => m.life_group)
      .map((m) => m.life_group as string)
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
    return groups;
  }, [members]);

  // Paginate filtered results
  const totalPages = Math.ceil(filteredMembers.length / ITEMS_PER_PAGE);
  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredMembers.slice(startIndex, endIndex);
  }, [filteredMembers, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName, selectedLifeGroup, selectedGender, selectedMaritalStatus, selectedTithe, selectedBaptized, selectedEncounter, selectedCourse, selectedArea]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper function to get translation for boolean filter values
  const getBooleanLabel = (value: string): string => {
    if (locale === 'pt') {
      return value === 'yes' ? 'Sim' : value === 'no' ? 'Não' : 'Todos';
    }
    return value === 'yes' ? 'Yes' : value === 'no' ? 'No' : 'All';
  };

  // Helper function to get translation for gender
  const getGenderLabel = (gender: string): string => {
    const genderMap: Record<string, Record<string, string>> = {
      female: { pt: 'Feminino', en: 'Female' },
      male: { pt: 'Masculino', en: 'Male' },
    };
    return genderMap[gender]?.[locale === 'pt' ? 'pt' : 'en'] || gender;
  };

  // Helper function to get translation for courses
  const getCourseLabel = (course: string): string => {
    const courseMap: Record<string, Record<string, string>> = {
      maturidade_no_espirito: { pt: 'Maturidade no Espírito', en: 'Maturity in the Spirit' },
      treinamento_de_lideres: { pt: 'Treinamento de Líderes', en: 'Leadership Training' },
    };
    return courseMap[course]?.[locale === 'pt' ? 'pt' : 'en'] || course;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-3 text-primary-600" />
            {locale === 'pt' ? 'Gerenciamento de Membros' : 'Members Management'}
          </h1>
          <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold">
            {filteredMembers.length} / {members.length}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={locale === 'pt' ? 'Buscar por nome...' : 'Search by name...'}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={faFilter} className="mr-2 text-primary-600" />
            {locale === 'pt' ? 'Filtros' : 'Filters'}
          </h2>
          <button
            onClick={() => {
              setSearchName('');
              setSelectedLifeGroup('all');
              setSelectedGender('all');
              setSelectedMaritalStatus('all');
              setSelectedTithe('all');
              setSelectedBaptized('all');
              setSelectedEncounter('all');
              setSelectedCourse('all');
              setSelectedArea('all');
              setCurrentPage(1);
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            {locale === 'pt' ? 'Limpar Filtros' : 'Clear Filters'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Life Group Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'pt' ? 'Célula' : 'Life Group'}
            </label>
            <select
              value={selectedLifeGroup}
              onChange={(e) => setSelectedLifeGroup(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{locale === 'pt' ? 'Todas' : 'All'}</option>
              {lifeGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'pt' ? 'Gênero' : 'Gender'}
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{locale === 'pt' ? 'Todos' : 'All'}</option>
              {GENDER_OPTIONS.map((gender) => (
                <option key={gender} value={gender}>
                  {getGenderLabel(gender)}
                </option>
              ))}
            </select>
          </div>

          {/* Baptized Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'pt' ? 'Batizado' : 'Baptized'}
            </label>
            <select
              value={selectedBaptized}
              onChange={(e) => setSelectedBaptized(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{locale === 'pt' ? 'Todos' : 'All'}</option>
              <option value="yes">{getBooleanLabel('yes')}</option>
              <option value="no">{getBooleanLabel('no')}</option>
            </select>
          </div>

          {/* Tithe Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'pt' ? 'Dizimista' : 'Tither'}
            </label>
            <select
              value={selectedTithe}
              onChange={(e) => setSelectedTithe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{locale === 'pt' ? 'Todos' : 'All'}</option>
              <option value="yes">{getBooleanLabel('yes')}</option>
              <option value="no">{getBooleanLabel('no')}</option>
            </select>
          </div>

          {/* Encounter with God Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'pt' ? 'Encontro com Deus' : 'Encounter with God'}
            </label>
            <select
              value={selectedEncounter}
              onChange={(e) => setSelectedEncounter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{locale === 'pt' ? 'Todos' : 'All'}</option>
              <option value="yes">{getBooleanLabel('yes')}</option>
              <option value="no">{getBooleanLabel('no')}</option>
            </select>
          </div>

          {/* Spiritual Course Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'pt' ? 'Curso' : 'Course'}
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{locale === 'pt' ? 'Todos' : 'All'}</option>
              {SPIRITUAL_COURSE_OPTIONS.map((course) => (
                <option key={course} value={course}>
                  {getCourseLabel(course)}
                </option>
              ))}
            </select>
          </div>

          {/* Volunteer Area Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'pt' ? 'Área de Voluntário' : 'Volunteer Area'}
            </label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{locale === 'pt' ? 'Todas' : 'All'}</option>
              {VOLUNTEER_AREA_OPTIONS.map((area) => (
                <option key={area} value={area}>
                  {t(`volunteerOptions.${area}`)}
                </option>
              ))}
            </select>
          </div>

          {/* Marital Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {locale === 'pt' ? 'Estado Civil' : 'Marital Status'}
            </label>
            <select
              value={selectedMaritalStatus}
              onChange={(e) => setSelectedMaritalStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">{locale === 'pt' ? 'Todos' : 'All'}</option>
              <option value="married">{locale === 'pt' ? 'Casados' : 'Married'}</option>
              <option value="single">{locale === 'pt' ? 'Solteiros' : 'Single'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">
            {locale === 'pt' ? 'Nenhum membro encontrado com os filtros selecionados.' : 'No members found with the selected filters.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedMembers.map((member) => {
              const memberHasChildren = memberChildren[member.id]?.length ?? 0;
              return (
                <div
                  key={member.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-all cursor-pointer border-l-4 border-primary-500 overflow-hidden"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="p-5">
                    {/* Header with name and key info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {member.life_group || (locale === 'pt' ? 'Sem célula' : 'No life group')}
                          </span>
                          {member.gender && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {getGenderLabel(member.gender)}
                            </span>
                          )}
                          {memberHasChildren > 0 && (
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              <FontAwesomeIcon icon={faHome} className="mr-1" />
                              {memberHasChildren} {locale === 'pt' ? (memberHasChildren === 1 ? 'filho' : 'filhos') : (memberHasChildren === 1 ? 'child' : 'children')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Contact info */}
                    <div className="grid md:grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600 w-4" />
                        {member.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600 w-4" />
                        {member.phone}
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {member.is_baptized && (
                        <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                          {locale === 'pt' ? 'Batizado' : 'Baptized'}
                        </span>
                      )}
                      {member.pays_tithe && (
                        <span className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          <FontAwesomeIcon icon={faChurch} className="mr-1" />
                          {locale === 'pt' ? 'Dizimista' : 'Tither'}
                        </span>
                      )}
                      {member.encounter_with_god && (
                        <span className="flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          <FontAwesomeIcon icon={faCross} className="mr-1" />
                          {locale === 'pt' ? 'Encontro' : 'Encounter'}
                        </span>
                      )}
                      {member.spiritual_courses.length > 0 && (
                        <span className="flex items-center text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                          📚 {member.spiritual_courses.length} {locale === 'pt' ? 'curso(s)' : 'course(s)'}
                        </span>
                      )}
                    </div>

                    {/* Volunteer areas */}
                    {member.volunteer_areas.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <FontAwesomeIcon icon={faHandsHelping} className="text-gray-500 mt-0.5" />
                        {member.volunteer_areas.map((area) => (
                          <span key={area} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                            {t(`volunteerOptions.${area}`)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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
                  const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  const showEllipsis =
                    (page === 2 && currentPage > 3) || (page === totalPages - 1 && currentPage < totalPages - 2);

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
                        page === currentPage ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'
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
            className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold mb-1">{selectedMember.name}</h2>
                <p className="text-primary-100 text-sm">
                  {locale === 'pt' ? 'Cadastrado em' : 'Registered on'} {formatDate(selectedMember.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="text-white hover:text-primary-100 text-2xl"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                  {locale === 'pt' ? 'Informações de Contato' : 'Contact Information'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600" />
                      {locale === 'pt' ? 'Email' : 'Email'}
                    </label>
                    <p className="text-gray-900 mt-1">{selectedMember.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600" />
                      {locale === 'pt' ? 'Telefone' : 'Phone'}
                    </label>
                    <p className="text-gray-900 mt-1">{selectedMember.phone}</p>
                  </div>
                </div>
              </section>

              {/* Personal Information */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                  {locale === 'pt' ? 'Informações Pessoais' : 'Personal Information'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {selectedMember.date_of_birth && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        <FontAwesomeIcon icon={faBirthdayCake} className="mr-2 text-primary-600" />
                        {locale === 'pt' ? 'Data de Nascimento' : 'Date of Birth'}
                      </label>
                      <p className="text-gray-900 mt-1">
                        {formatDate(selectedMember.date_of_birth)} ({calculateAge(selectedMember.date_of_birth)} {locale === 'pt' ? 'anos' : 'years'})
                      </p>
                    </div>
                  )}
                  {selectedMember.gender && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        {locale === 'pt' ? 'Gênero' : 'Gender'}
                      </label>
                      <p className="text-gray-900 mt-1">{getGenderLabel(selectedMember.gender)}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Spiritual Status */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                  {locale === 'pt' ? 'Status Espiritual' : 'Spiritual Status'}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-primary-600" />
                      {locale === 'pt' ? 'Batizado' : 'Baptized'}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-semibold ${selectedMember.is_baptized ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {selectedMember.is_baptized ? (locale === 'pt' ? 'Sim' : 'Yes') : (locale === 'pt' ? 'Não' : 'No')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      <FontAwesomeIcon icon={faChurch} className="mr-2 text-primary-600" />
                      {locale === 'pt' ? 'Dizimista' : 'Tither'}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-semibold ${selectedMember.pays_tithe ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                      {selectedMember.pays_tithe ? (locale === 'pt' ? 'Sim' : 'Yes') : (locale === 'pt' ? 'Não' : 'No')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      <FontAwesomeIcon icon={faCross} className="mr-2 text-primary-600" />
                      {locale === 'pt' ? 'Encontro com Deus' : 'Encounter with God'}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-semibold ${selectedMember.encounter_with_god ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                      {selectedMember.encounter_with_god ? (locale === 'pt' ? 'Sim' : 'Yes') : (locale === 'pt' ? 'Não' : 'No')}
                    </span>
                  </div>
                </div>
              </section>

              {/* Spiritual Courses */}
              {selectedMember.spiritual_courses.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                    {locale === 'pt' ? 'Cursos Espirituais' : 'Spiritual Courses'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.spiritual_courses.map((course) => (
                      <span key={course} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium">
                        {getCourseLabel(course)}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Church Information */}
              <section>
                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                  {locale === 'pt' ? 'Informações da Igreja' : 'Church Information'}
                </h3>
                <div className="space-y-3">
                  {selectedMember.life_group && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-600">
                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                        {locale === 'pt' ? 'Célula' : 'Life Group'}
                      </label>
                      <p className="text-gray-900 mt-1 font-semibold">{selectedMember.life_group}</p>
                    </div>
                  )}

                  {selectedMember.volunteer_areas.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-600 block mb-2">
                        <FontAwesomeIcon icon={faHandsHelping} className="mr-2 text-primary-600" />
                        {locale === 'pt' ? 'Áreas de Voluntariado' : 'Volunteer Areas'}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.volunteer_areas.map((area) => (
                          <span key={area} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                            {t(`volunteerOptions.${area}`)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMember.volunteer_outros_details && (
                    <div className="p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                      <label className="text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Detalhes Adicionais' : 'Additional Details'}
                      </label>
                      <p className="text-gray-700 mt-1 whitespace-pre-wrap">{selectedMember.volunteer_outros_details}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Family Information */}
              {(selectedMember.is_married || memberChildren[selectedMember.id]?.length > 0) && (
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                    <FontAwesomeIcon icon={faHome} className="mr-2 text-primary-600" />
                    {locale === 'pt' ? 'Informações Familiares' : 'Family Information'}
                  </h3>

                  {selectedMember.is_married && (
                    <div className="p-3 bg-purple-50 rounded-lg mb-3">
                      <div className="flex items-center mb-2">
                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-purple-600" />
                        <span className="font-medium text-gray-900">{locale === 'pt' ? 'Casado(a)' : 'Married'}</span>
                      </div>
                      {selectedMember.spouse_name && (
                        <p className="text-gray-700 ml-6">
                          {locale === 'pt' ? 'Cônjuge: ' : 'Spouse: '} <span className="font-semibold">{selectedMember.spouse_name}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {memberChildren[selectedMember.id] && memberChildren[selectedMember.id].length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <label className="text-sm font-medium text-gray-700 block mb-3">
                        <FontAwesomeIcon icon={faUsers} className="mr-2 text-green-600" />
                        {locale === 'pt' ? 'Filhos' : 'Children'} ({memberChildren[selectedMember.id].length})
                      </label>
                      <div className="space-y-2">
                        {memberChildren[selectedMember.id].map((child) => (
                          <div key={child.id} className="bg-white p-3 rounded-lg border border-green-200">
                            <div className="font-semibold text-gray-900">{child.name}</div>
                            <div className="text-sm text-gray-600">
                              {locale === 'pt' ? 'Idade: ' : 'Age: '}
                              {calculateAge(child.date_of_birth)} {locale === 'pt' ? (calculateAge(child.date_of_birth) === 1 ? 'ano' : 'anos') : (calculateAge(child.date_of_birth) === 1 ? 'year' : 'years')}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {locale === 'pt' ? 'Nascido em: ' : 'Born: '}
                              {formatDate(child.date_of_birth)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 flex justify-end border-t">
              <button
                onClick={() => setSelectedMember(null)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                {locale === 'pt' ? 'Fechar' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
