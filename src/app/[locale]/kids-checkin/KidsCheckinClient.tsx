'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('kidsCheckin.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('kidsCheckin.welcome')} {userName}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8" role="tablist">
            <button
              role="tab"
              aria-selected={activeTab === 'checkin'}
              onClick={() => setActiveTab('checkin')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'checkin'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('kidsCheckin.tabs.checkin')}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'current'}
              onClick={() => setActiveTab('current')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'current'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('kidsCheckin.tabs.currentCheckins')}
            </button>
            <button
              role="tab"
              aria-selected={activeTab === 'history'}
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t('kidsCheckin.tabs.history')}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'checkin' && (
            <div className="p-6">
              <CheckinForm
                teacherName={userName}
                onCheckInSuccess={handleCheckInSuccess}
              />
            </div>
          )}

          {activeTab === 'current' && (
            <div className="p-6">
              <CurrentCheckins
                refreshTrigger={refreshTrigger}
                onCheckOutSuccess={handleCheckOutSuccess}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6">
              <CheckinHistory />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
