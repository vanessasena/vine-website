'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMagnifyingGlass,
  faArrowRotateLeft,
  faCircleXmark,
  faCheck,
  faHandshake,
  faCakeCandles,
  faUserGroup,
  faClock,
  faHouseUser,
  faUsers,
  faNoteSticky
} from '@fortawesome/free-solid-svg-icons';
import { formatWrittenDate } from '@/lib/utils';

// Helper function to calculate age from date string
function calculateAge(dateStr: string): number {
  if (!dateStr) return -1;
  const [year, month, day] = dateStr.split('-').map(Number);
  const dob = new Date(year, (month || 1) - 1, day || 1);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

interface CheckInRecord {
  checked_in_id: string;
  child_name: string;
  child_dob: string;
  is_member: boolean;
  parent_name: string;
  checked_in_at: string;
  checked_in_by_name: string;
  checked_out_at?: string;
  checked_out_by_name?: string;
  status: 'checked_in' | 'checked_out';
  notes?: string;
}

export default function CheckinHistory() {
  const t = useTranslations();
  const locale = useLocale();
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7); // Default to last 7 days
    return date.toISOString().split('T')[0];
  });
  const [toDate, setToDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked_in' | 'checked_out'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          setAuthToken(session.access_token);
        }
      } catch (err) {
        console.error('Error getting auth token:', err);
      }
    };

    getAuthToken();
  }, []);

  useEffect(() => {
    if (!authToken) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (fromDate) params.append('from_date', fromDate);
        if (toDate) params.append('to_date', toDate);
        if (statusFilter !== 'all') params.append('status', statusFilter);

        const response = await fetch(`/api/check-ins?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(t('kidsCheckin.errors.fetchFailed'));
        }
        const data = await response.json();
        setRecords(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(
          err instanceof Error ? err.message : t('kidsCheckin.errors.fetchFailed')
        );
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [authToken, t, fromDate, toDate, statusFilter]);

  // No need for handleFilter - the effect will re-fetch when filters change
  // But we can keep a manual refresh button

  const getStatusBadge = (status: string) => {
    if (status === 'checked_in') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
          <FontAwesomeIcon icon={faCheck} className="h-3.5 w-3.5" />
          {t('kidsCheckin.status.checkedIn')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
        <FontAwesomeIcon icon={faHandshake} className="h-3.5 w-3.5" />
        {t('kidsCheckin.status.checkedOut')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl shadow-md border-2 border-gray-200 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="h-4 w-4 text-blue-600" />
          {t('kidsCheckin.filters')}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-semibold text-gray-900 mb-2">
              {t('kidsCheckin.form.fromDate')}
            </label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-semibold text-gray-900 mb-2">
              {t('kidsCheckin.form.toDate')}
            </label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-semibold text-gray-900 mb-2">
              {t('kidsCheckin.form.status')}
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'checked_in' | 'checked_out')
              }
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200"
            >
              <option value="all">{t('kidsCheckin.filtersall')}</option>
              <option value="checked_in">{t('kidsCheckin.status.checkedIn')}</option>
              <option value="checked_out">{t('kidsCheckin.status.checkedOut')}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => {
              const date = new Date();
              date.setDate(date.getDate() - 7);
              setFromDate(date.toISOString().split('T')[0]);
              setToDate(new Date().toISOString().split('T')[0]);
              setStatusFilter('all');
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 shadow-sm hover:shadow transition-all duration-200"
          >
            <FontAwesomeIcon icon={faArrowRotateLeft} className="h-4 w-4" />
            {t('kidsCheckin.buttons.reset')}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 p-4 border-l-4 border-red-500 shadow-sm">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faCircleXmark} className="text-red-600 h-5 w-5" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex justify-center">
          <div className="inline-flex items-center px-4 py-3 text-gray-700">
            {t('kidsCheckin.loading')}...
          </div>
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {t('kidsCheckin.noRecords')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {t('kidsCheckin.history')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {records.length} {records.length === 1 ? 'registro' : 'registros'}
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            {records.map((record) => {
              const age = calculateAge(record.child_dob);
              return (
                <div
                  key={record.checked_in_id}
                  className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(
                        expandedId === record.checked_in_id ? null : record.checked_in_id
                      );
                    }}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 rounded-t-xl transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">
                          {record.child_name}
                        </h3>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          record.is_member
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          <FontAwesomeIcon icon={record.is_member ? faHouseUser : faUsers} className="h-3.5 w-3.5 mr-1" />
                          {record.is_member ? 'Membro' : 'Visitante'}
                        </span>
                        {getStatusBadge(record.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        {age >= 0 && (
                          <div className="flex items-center gap-1.5">
                            <FontAwesomeIcon icon={faCakeCandles} className="h-4 w-4 text-gray-500" />
                            <span>{age} {age === 1 ? 'ano' : 'anos'}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faUserGroup} className="h-4 w-4 text-gray-500" />
                          <span>{record.parent_name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-gray-500" />
                          <span>{new Date(record.checked_in_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <svg
                      className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                        expandedId === record.checked_in_id ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

              {expandedId === record.checked_in_id && (
                    <div className="border-t-2 border-gray-100 px-6 py-5 bg-gradient-to-br from-gray-50 to-white space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            {t('kidsCheckin.form.dateOfBirth')}
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {formatWrittenDate(record.child_dob, locale)}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                            <FontAwesomeIcon icon={faUserGroup} className="h-4 w-4 mr-1 text-gray-500" /> {t('kidsCheckin.form.parent')}
                          </p>
                          <p className="text-sm text-gray-900 font-medium">
                            {record.parent_name}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                          <p className="text-xs font-bold text-green-800 uppercase mb-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faCheck} className="h-4 w-4" /> {t('kidsCheckin.checkedInBy')}
                          </p>
                          <p className="text-sm text-green-900 font-medium">
                            {record.checked_in_by_name}
                          </p>
                          <p className="text-xs text-green-700 mt-1">
                            {new Date(record.checked_in_at).toLocaleString()}
                          </p>
                        </div>
                        {record.checked_out_by_name && (
                          <div className="bg-gray-100 border-l-4 border-gray-400 p-4 rounded-lg">
                            <p className="text-xs font-bold text-gray-800 uppercase mb-1 flex items-center gap-2">
                              <FontAwesomeIcon icon={faHandshake} className="h-4 w-4" /> {t('kidsCheckin.checkedOutBy')}
                            </p>
                            <p className="text-sm text-gray-900 font-medium">
                              {record.checked_out_by_name}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">
                              {record.checked_out_at
                                ? new Date(record.checked_out_at).toLocaleString()
                                : '-'}
                            </p>
                          </div>
                        )}
                      </div>

                      {record.notes && (
                        <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg">
                          <p className="text-xs font-bold text-purple-800 uppercase mb-1 flex items-center gap-2">
                            <FontAwesomeIcon icon={faNoteSticky} className="h-4 w-4" /> {t('kidsCheckin.form.notes')}
                          </p>
                          <p className="text-sm text-purple-900">
                            {record.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
