'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClipboardCheck, faUsers, faHistory, faChild } from '@fortawesome/free-solid-svg-icons';
import CheckinForm from './CheckinForm';
import CurrentCheckins from './CurrentCheckins';
import CheckinHistory from './CheckinHistory';

type Tab = 'checkin' | 'current' | 'history';

interface KidsCheckinClientProps {
  locale: string;
}

export default function KidsCheckinClient({ locale }: KidsCheckinClientProps) {
  const t = useTranslations();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('checkin');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userName, setUserName] = useState('Teacher');
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Check auth and role on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push(`/${locale}/login`);
          return;
        }

        // Get user role
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (userData?.role !== 'teacher' && userData?.role !== 'admin') {
          router.push(`/${locale}`);
          return;
        }

        // Prefer member profile name; fallback to auth metadata, then email
        const { data: profile } = await supabase
          .from('member_profiles')
          .select('name')
          .eq('user_id', session.user.id)
          .single();

        setUserName(
          profile?.name ||
          session.user.user_metadata?.name ||
          session.user.email ||
          'Teacher'
        );
        setAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push(`/${locale}/login`);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [locale, router]);

  const handleCheckInSuccess = () => {
    // Trigger refresh of current check-ins
    setRefreshTrigger(prev => prev + 1);
    // Switch to current check-ins tab
    setActiveTab('current');
  };

  const handleCheckOutSuccess = () => {
    // Trigger refresh of current check-ins
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">{t('kidsCheckin.loading')}...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{t('kidsCheckin.noPermission')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/${locale}/admin`}
                className="flex items-center space-x-2 text-white hover:text-blue-100 transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4" />
                <span className="hidden sm:inline">{t('admin.backToAdmin')}</span>
              </Link>
              <div className="hidden sm:block w-px h-8 bg-white/30"></div>
              <FontAwesomeIcon icon={faChild} className="w-8 h-8" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {t('kidsCheckin.title')}
                </h1>
                <p className="text-blue-100 text-sm mt-1">
                  {t('kidsCheckin.welcome')} {userName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation with modern design */}
        <div className="bg-white rounded-xl shadow-md mb-6 overflow-hidden">
          <nav className="flex" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'checkin'}
              onClick={() => setActiveTab('checkin')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-sm transition-all ${
                activeTab === 'checkin'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FontAwesomeIcon icon={faClipboardCheck} className="w-5 h-5" />
              <span>{t('kidsCheckin.tabs.checkin')}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'current'}
              onClick={() => setActiveTab('current')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-sm transition-all ${
                activeTab === 'current'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FontAwesomeIcon icon={faUsers} className="w-5 h-5" />
              <span>{t('kidsCheckin.tabs.currentCheckins')}</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              className={`flex-1 flex items-center justify-center space-x-2 py-4 px-6 font-medium text-sm transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <FontAwesomeIcon icon={faHistory} className="w-5 h-5" />
              <span>{t('kidsCheckin.tabs.history')}</span>
            </button>
          </nav>
        </div>

        {/* Tab Content with better styling */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {activeTab === 'checkin' && (
            <div className="p-6 sm:p-8">
              <CheckinForm
                teacherName={userName}
                onCheckInSuccess={handleCheckInSuccess}
              />
            </div>
          )}

          {activeTab === 'current' && (
            <div className="p-6 sm:p-8">
              <CurrentCheckins
                refreshTrigger={refreshTrigger}
                onCheckOutSuccess={handleCheckOutSuccess}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6 sm:p-8">
              <CheckinHistory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
