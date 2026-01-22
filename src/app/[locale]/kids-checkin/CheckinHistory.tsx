'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@supabase/supabase-js';
import { formatLocalDate } from '@/lib/utils';

interface CheckInRecord {
  id: string;
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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {t('kidsCheckin.status.checkedIn')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        {t('kidsCheckin.status.checkedOut')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h3 className="text-sm font-medium text-gray-900">
          {t('kidsCheckin.filters')}
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="fromDate" className="block text-sm font-medium text-gray-700">
              {t('kidsCheckin.form.fromDate')}
            </label>
            <input
              type="date"
              id="fromDate"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="toDate" className="block text-sm font-medium text-gray-700">
              {t('kidsCheckin.form.toDate')}
            </label>
            <input
              type="date"
              id="toDate"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              {t('kidsCheckin.form.status')}
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as 'all' | 'checked_in' | 'checked_out')
              }
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">{t('kidsCheckin.filtersall')}</option>
              <option value="checked_in">{t('kidsCheckin.status.checkedIn')}</option>
              <option value="checked_out">{t('kidsCheckin.status.checkedOut')}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              const date = new Date();
              date.setDate(date.getDate() - 7);
              setFromDate(date.toISOString().split('T')[0]);
              setToDate(new Date().toISOString().split('T')[0]);
              setStatusFilter('all');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('kidsCheckin.buttons.reset')}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
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
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('kidsCheckin.history')} ({records.length})
            </h3>
          </div>

          <div className="grid gap-4">
            {records.map((record) => (
              <div
                key={record.id}
                className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() =>
                    setExpandedId(expandedId === record.id ? null : record.id)
                  }
                  className="w-full px-6 py-4 flex items-center justify-between text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        {record.child_name}
                      </h3>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(record.checked_in_at).toLocaleString()}
                    </p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                      expandedId === record.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {expandedId === record.id && (
                  <div className="border-t px-6 py-4 bg-gray-50 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">
                          {t('kidsCheckin.form.dateOfBirth')}
                        </p>
                        <p className="text-sm text-gray-900">
                          {formatLocalDate(record.child_dob)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase">
                          {t('kidsCheckin.form.childType')}
                        </p>
                        <p className="text-sm text-gray-900">
                          {record.is_member
                            ? t('kidsCheckin.form.memberChild')
                            : t('kidsCheckin.form.visitorChild')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        {t('kidsCheckin.form.parent')}
                      </p>
                      <p className="text-sm text-gray-900">{record.parent_name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">
                          {t('kidsCheckin.checkedInBy')}
                        </p>
                        <p className="text-sm text-gray-900">
                          {record.checked_in_by_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(record.checked_in_at).toLocaleString()}
                        </p>
                      </div>
                      {record.checked_out_by_name && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">
                            {t('kidsCheckin.checkedOutBy')}
                          </p>
                          <p className="text-sm text-gray-900">
                            {record.checked_out_by_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {record.checked_out_at
                              ? new Date(record.checked_out_at).toLocaleString()
                              : '-'}
                          </p>
                        </div>
                      )}
                    </div>

                    {record.notes && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase">
                          {t('kidsCheckin.form.notes')}
                        </p>
                        <p className="text-sm text-gray-900">{record.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
