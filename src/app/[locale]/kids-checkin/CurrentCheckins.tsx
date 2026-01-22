'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@supabase/supabase-js';
import { formatLocalDate } from '@/lib/utils';

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

interface CheckedInChild {
  id: string;
  checked_in_id: string;
  child_name: string;
  child_dob: string;
  is_member: boolean;
  parent_name: string;
  parent_phone?: string;
  allergies?: string;
  special_needs?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  checked_in_at: string;
  checked_in_by_name: string;
  notes?: string;
}

interface CurrentCheckinsProps {
  refreshTrigger: number;
  onCheckOutSuccess: () => void;
}

export default function CurrentCheckins({
  refreshTrigger,
  onCheckOutSuccess,
}: CurrentCheckinsProps) {
  const t = useTranslations();
  const [children, setChildren] = useState<CheckedInChild[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingOutId, setCheckingOutId] = useState<string | null>(null);
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

  const fetchCurrentCheckins = useCallback(async () => {
    if (!authToken) return;

    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/check-ins?status=checked_in', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(t('kidsCheckin.errors.fetchFailed'));
      }
      const data = await response.json();
      setChildren(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching current check-ins:', err);
      setError(
        err instanceof Error ? err.message : t('kidsCheckin.errors.fetchFailed')
      );
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [authToken, t]);

  useEffect(() => {
    if (authToken) {
      fetchCurrentCheckins();
    }
  }, [refreshTrigger, authToken, t, fetchCurrentCheckins]);

  const handleCheckOut = async (checkInId: string, childName: string) => {
    if (!confirm(t('kidsCheckin.confirmations.checkOut', { name: childName }))) {
      return;
    }

    if (!authToken) {
      setError(t('kidsCheckin.errors.authenticationFailed'));
      return;
    }

    try {
      setCheckingOutId(checkInId);
      setError(null);

      const response = await fetch('/api/check-ins', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          id: checkInId,
          checked_out_by_name: 'Teacher', // In real app, would use actual teacher name
        }),
      });

      if (!response.ok) {
        throw new Error(t('kidsCheckin.errors.checkOutFailed'));
      }

      // Remove from list
      setChildren(children.filter((c) => c.checked_in_id !== checkInId));
      onCheckOutSuccess();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('kidsCheckin.errors.checkOutFailed')
      );
    } finally {
      setCheckingOutId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center">
        <div className="inline-flex items-center px-4 py-3 text-gray-700">
          {t('kidsCheckin.loading')}...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
        <button
          onClick={fetchCurrentCheckins}
          className="mt-2 text-sm text-red-600 hover:text-red-700"
        >
          {t('kidsCheckin.buttons.retry')}
        </button>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          {t('kidsCheckin.noCurrentCheckins')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t('kidsCheckin.currentCheckins')}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {children.length} {children.length === 1 ? 'criança' : 'crianças'} no check-in
          </p>
        </div>
        <button
          onClick={fetchCurrentCheckins}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('kidsCheckin.buttons.refresh')}
        </button>
      </div>

      <div className="grid gap-4">
        {children.map((child) => {
          const age = calculateAge(child.child_dob);
          return (
            <div
              key={child.checked_in_id}
              className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
            >
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === child.checked_in_id ? null : child.checked_in_id
                  )
                }
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 rounded-t-xl transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {child.child_name}
                    </h3>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      child.is_member
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {child.is_member ? '👤 Membro' : '👥 Visitante'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {age >= 0 && (
                      <div className="flex items-center gap-1.5">
                        <span>🎂</span>
                        <span>{age} {age === 1 ? 'ano' : 'anos'}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span>👨‍👩‍👧</span>
                      <span>{child.parent_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span>🕐</span>
                      <span>{new Date(child.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  {(child.allergies || child.special_needs) && (
                    <div className="flex items-center gap-2 mt-2">
                      {child.allergies && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium">
                          ⚠️ Alergia
                        </span>
                      )}
                      {child.special_needs && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                          ℹ️ Nec. Especiais
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Check-in por: {child.checked_in_by_name}
                  </p>
                </div>
                <svg
                  className={`w-6 h-6 text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                    expandedId === child.checked_in_id ? 'rotate-180' : ''
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

              {expandedId === child.checked_in_id && (
                <div className="border-t-2 border-gray-100 px-6 py-5 bg-gradient-to-br from-gray-50 to-white space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                        {t('kidsCheckin.form.dateOfBirth')}
                      </p>
                      <p className="text-sm text-gray-900 font-medium">
                        {formatLocalDate(child.child_dob)}
                      </p>
                    </div>
                    {child.parent_phone && (
                      <div className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                          📱 {t('kidsCheckin.form.parentPhone')}
                        </p>
                        <p className="text-sm text-gray-900 font-medium font-mono">
                          {child.parent_phone}
                        </p>
                      </div>
                    )}
                  </div>

                  {child.allergies && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                      <p className="text-xs font-bold text-yellow-800 uppercase mb-1 flex items-center gap-2">
                        ⚠️ {t('kidsCheckin.form.allergies')}
                      </p>
                      <p className="text-sm text-yellow-900 font-medium">
                        {child.allergies}
                      </p>
                    </div>
                  )}

                  {child.special_needs && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                      <p className="text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-2">
                        ℹ️ {t('kidsCheckin.form.specialNeeds')}
                      </p>
                      <p className="text-sm text-blue-900 font-medium">
                        {child.special_needs}
                      </p>
                    </div>
                  )}

                  {child.emergency_contact_name && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                      <p className="text-xs font-bold text-red-800 uppercase mb-1 flex items-center gap-2">
                        🚨 {t('kidsCheckin.form.emergencyContact')}
                      </p>
                      <p className="text-sm text-red-900 font-medium">
                        {child.emergency_contact_name}
                        {child.emergency_contact_phone && (
                          <span className="ml-2 font-mono">
                            ({child.emergency_contact_phone})
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {child.notes && (
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg">
                      <p className="text-xs font-bold text-purple-800 uppercase mb-1 flex items-center gap-2">
                        📝 {t('kidsCheckin.form.notes')}
                      </p>
                      <p className="text-sm text-purple-900">
                        {child.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                    <button
                      onClick={() => handleCheckOut(child.checked_in_id, child.child_name)}
                      disabled={checkingOutId === child.checked_in_id}
                      className="flex-1 inline-flex justify-center items-center gap-2 px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {checkingOutId === child.checked_in_id ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('kidsCheckin.buttons.checkingOut')}
                        </>
                      ) : (
                        <>
                          <span>✅</span>
                          {t('kidsCheckin.buttons.checkout')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
