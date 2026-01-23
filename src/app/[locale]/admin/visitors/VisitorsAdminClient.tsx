'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getSession } from '@/lib/auth';

interface Visitor {
  id: string;
  visit_date: string;
  name: string;
  phone: string;
  how_found: string;
  how_found_details: string | null;
  created_at: string;
}

interface VisitorStats {
  totalVisitors: number;
  byDay: Record<string, number>;
  byMonth: Record<string, number>;
}

export default function VisitorsAdminClient() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'pt';
  const t = useTranslations('adminVisitors');

  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [filteredVisitors, setFilteredVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filterType, setFilterType] = useState<'all' | 'day' | 'month'>('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Check authentication on mount
  useEffect(() => {
    async function checkAuthentication() {
      const session = await getSession();
      if (!session) {
        router.push(`/${locale}/login`);
      } else {
        setAuthenticated(true);
        setCheckingAuth(false);
      }
    }
    checkAuthentication();
  }, [locale, router]);

  useEffect(() => {
    if (authenticated) {
      fetchVisitors();
    }
  }, [authenticated]);

  useEffect(() => {
    applyFilters();
  }, [visitors, filterType, selectedDate, selectedMonth]);

  const fetchVisitors = async () => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Unauthorized');
        setLoading(false);
        return;
      }

      // Check if user is leader or admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (userData?.role !== 'admin' && userData?.role !== 'leader') {
        setError('Forbidden - Requires leader or admin role');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/visitors', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch visitors');
      }

      const data = await response.json();
      setVisitors(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching visitors:', err);
      setError(t('fetchError'));
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...visitors];

    if (filterType === 'day') {
      filtered = filtered.filter(v => v.visit_date === selectedDate);
    } else if (filterType === 'month') {
      filtered = filtered.filter(v => v.visit_date.startsWith(selectedMonth));
    }

    setFilteredVisitors(filtered);
  };

  const calculateStats = (): VisitorStats => {
    const stats: VisitorStats = {
      totalVisitors: filteredVisitors.length,
      byDay: {},
      byMonth: {},
    };

    filteredVisitors.forEach(visitor => {
      const date = visitor.visit_date;
      const month = date.slice(0, 7);

      // Count by day
      stats.byDay[date] = (stats.byDay[date] || 0) + 1;

      // Count by month
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    return stats;
  };

  const stats = calculateStats();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMonth = (monthString: string) => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Name', 'Phone', 'How Found', 'Details', 'Registered At'];
    const rows = filteredVisitors.map(v => [
      v.visit_date,
      v.name,
      v.phone,
      v.how_found,
      v.how_found_details || '',
      new Date(v.created_at).toLocaleString(),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `visitors-${filterType}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">
          {locale === 'pt' ? 'Verificando autenticação...' : 'Checking authentication...'}
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('filters')}</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Filter Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filterType')}
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'day' | 'month')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{t('filterAll')}</option>
                <option value="day">{t('filterByDay')}</option>
                <option value="month">{t('filterByMonth')}</option>
              </select>
            </div>

            {/* Date Picker (for day filter) */}
            {filterType === 'day' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('selectDate')}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Month Picker (for month filter) */}
            {filterType === 'month' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('selectMonth')}
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Export Button */}
            <div className="flex items-end">
              <button
                onClick={exportToCSV}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {t('exportCSV')}
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('totalVisitors')}</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.totalVisitors}</p>
          </div>

          {filterType === 'all' && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('uniqueDays')}</h3>
                <p className="text-3xl font-bold text-blue-600">{Object.keys(stats.byDay).length}</p>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">{t('uniqueMonths')}</h3>
                <p className="text-3xl font-bold text-green-600">{Object.keys(stats.byMonth).length}</p>
              </div>
            </>
          )}

          {filterType === 'day' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('visitorsOnDay')}</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.byDay[selectedDate] || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{formatDate(selectedDate)}</p>
            </div>
          )}

          {filterType === 'month' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">{t('visitorsInMonth')}</h3>
              <p className="text-3xl font-bold text-green-600">{stats.byMonth[selectedMonth] || 0}</p>
              <p className="text-sm text-gray-500 mt-1">{formatMonth(selectedMonth)}</p>
            </div>
          )}
        </div>

        {/* Breakdown by Day/Month */}
        {filterType === 'all' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* By Day */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('byDay')}</h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('date')}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('count')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(stats.byDay)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([date, count]) => (
                        <tr key={date} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{formatDate(date)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right font-semibold">{count}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Month */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('byMonth')}</h3>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('month')}
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                        {t('count')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(stats.byMonth)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([month, count]) => (
                        <tr key={month} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{formatMonth(month)}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right font-semibold">{count}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Visitors Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('visitorsList')} ({filteredVisitors.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('visitDate')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('phone')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('howFound')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('details')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredVisitors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {t('noVisitors')}
                    </td>
                  </tr>
                ) : (
                  filteredVisitors.map((visitor) => (
                    <tr key={visitor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(visitor.visit_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {visitor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {visitor.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {visitor.how_found}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {visitor.how_found_details || '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
