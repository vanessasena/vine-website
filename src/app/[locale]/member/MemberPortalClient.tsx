'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faUsers,
  faUserGroup,
  faChildren,
  faGear,
  faSignOutAlt,
  faChevronDown,
  faSpinner,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { getRolePermissions, getRoleLabel, type UserRole } from '@/lib/roles';
import PortalFooter from '@/components/PortalFooter';

interface MemberPortalClientProps {
  locale: string;
}

export default function MemberPortalClient({ locale }: MemberPortalClientProps) {
  const t = useTranslations('memberPortal');
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push(`/${locale}/login?redirect=/${locale}/member`);
          return;
        }

        // Get user role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userData?.role) {
          setUserRole(userData.role as UserRole);
        }

        // Get user name from member_profiles
        const { data: profileData } = await supabase
          .from('member_profiles')
          .select('name')
          .eq('user_id', session.user.id)
          .single();

        if (profileData?.name) {
          setUserName(profileData.name);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error checking auth:', err);
        router.push(`/${locale}/login?redirect=/${locale}/member`);
      }
    }

    checkAuth();
  }, [locale, router]);

  const handleSignOut = async () => {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    );
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin h-12 w-12 text-primary-600 mb-4" />
          <p className="text-gray-600">{locale === 'pt' ? 'Carregando...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return null;
  }

  const permissions = getRolePermissions(userRole);
  const roleLabel = getRoleLabel(userRole, locale);

  // Define role badge colors
  const roleBadgeColors = {
    admin: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white',
    leader: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white',
    teacher: 'bg-gradient-to-r from-green-600 to-emerald-600 text-white',
    member: 'bg-gradient-to-r from-gray-600 to-slate-600 text-white',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <Image
                src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png"
                alt="Vine Church KWC"
                width={120}
                height={40}
                className="h-14 w-auto"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {t('title')}
                </h1>
                {userName && (
                  <p className="text-sm text-gray-600 mt-1">
                    {t('welcome')}, {userName}
                  </p>
                )}
              </div>
            </div>

            {/* Role Badge and Quick Access Dropdown */}
            <div className="flex items-center gap-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${roleBadgeColors[userRole]}`}>
                {roleLabel}
              </span>

              {/* Quick Access Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 text-gray-700 font-medium"
                >
                  <span className="hidden sm:inline">{t('quickAccess')}</span>
                  <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4" />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    {permissions.canAccessProfile && (
                      <Link
                        href={`/${locale}/member/profile`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FontAwesomeIcon icon={faUser} className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">{t('dropdown.myProfile')}</span>
                      </Link>
                    )}
                    {permissions.canAccessKidsCheckin && (
                      <Link
                        href={`/${locale}/kids-checkin`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FontAwesomeIcon icon={faChildren} className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">{t('cards.kidsCheckin.title')}</span>
                      </Link>
                    )}
                    {permissions.canManageMembers && (
                      <Link
                        href={`/${locale}/admin/members`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FontAwesomeIcon icon={faUsers} className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">{t('cards.members.title')}</span>
                      </Link>
                    )}
                    {permissions.canManageVisitors && (
                      <Link
                        href={`/${locale}/admin/visitors`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FontAwesomeIcon icon={faUserGroup} className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">{t('cards.visitors.title')}</span>
                      </Link>
                    )}
                    {permissions.canAccessAdmin && (
                      <Link
                        href={`/${locale}/admin`}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                        onClick={() => setShowDropdown(false)}
                      >
                        <FontAwesomeIcon icon={faGear} className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-700">{t('cards.admin.title')}</span>
                      </Link>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link
                      href={`/${locale}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-150"
                      onClick={() => setShowDropdown(false)}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">{t('backToWebsite')}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors duration-150 w-full text-left"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 text-red-600" />
                      <span className="text-red-600 font-medium">{t('dropdown.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('subtitle')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {locale === 'pt'
              ? 'Acesse rapidamente as áreas e funcionalidades disponíveis para você.'
              : 'Quickly access the areas and features available to you.'}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          {permissions.canAccessProfile && (
            <Link
              href={`/${locale}/member/profile`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-br from-primary-600 to-secondary-600 p-6">
                <FontAwesomeIcon icon={faUser} className="h-12 w-12 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.profile.title')}</h3>
                <p className="text-gray-600">{t('cards.profile.description')}</p>
              </div>
            </Link>
          )}

          {/* Kids Check-in Card */}
          {permissions.canAccessKidsCheckin && (
            <Link
              href={`/${locale}/kids-checkin`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-6">
                <FontAwesomeIcon icon={faChildren} className="h-12 w-12 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.kidsCheckin.title')}</h3>
                <p className="text-gray-600">{t('cards.kidsCheckin.description')}</p>
              </div>
            </Link>
          )}

          {/* Members Management Card */}
          {permissions.canManageMembers && (
            <Link
              href={`/${locale}/admin/members`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-6">
                <FontAwesomeIcon icon={faUsers} className="h-12 w-12 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.members.title')}</h3>
                <p className="text-gray-600">{t('cards.members.description')}</p>
              </div>
            </Link>
          )}

          {/* Visitors Management Card */}
          {permissions.canManageVisitors && (
            <Link
              href={`/${locale}/admin/visitors`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6">
                <FontAwesomeIcon icon={faUserGroup} className="h-12 w-12 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.visitors.title')}</h3>
                <p className="text-gray-600">{t('cards.visitors.description')}</p>
              </div>
            </Link>
          )}

          {/* Admin Panel Card */}
          {permissions.canAccessAdmin && (
            <Link
              href={`/${locale}/admin`}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
            >
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-6">
                <FontAwesomeIcon icon={faGear} className="h-12 w-12 text-white" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cards.admin.title')}</h3>
                <p className="text-gray-600">{t('cards.admin.description')}</p>
              </div>
            </Link>
          )}
        </div>
      </main>

      <PortalFooter locale={locale} />
    </div>
  );
}
