'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@supabase/supabase-js';
import { formatLocalDate } from '@/lib/utils';

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
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('kidsCheckin.currentCheckins')} ({children.length})
        </h2>
        <button
          onClick={fetchCurrentCheckins}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          {t('kidsCheckin.buttons.refresh')}
        </button>
      </div>

      <div className="grid gap-4">
        {children.map((child) => (
          <div
            key={child.checked_in_id}
            className="border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <button
              onClick={() =>
                setExpandedId(
                  expandedId === child.checked_in_id ? null : child.checked_in_id
                )
              }
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {child.child_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {t('kidsCheckin.checkedInBy')}: {child.checked_in_by_name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(child.checked_in_at).toLocaleTimeString()}
                </p>
              </div>
              <svg
                className={`w-5 h-5 text-gray-400 transition-transform ${
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
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </button>

            {expandedId === child.checked_in_id && (
              <div className="border-t px-6 py-4 bg-gray-50 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('kidsCheckin.form.dateOfBirth')}
                    </p>
                    <p className="text-sm text-gray-900">
                      {formatLocalDate(child.child_dob)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('kidsCheckin.form.childType')}
                    </p>
                    <p className="text-sm text-gray-900">
                      {child.is_member
                        ? t('kidsCheckin.form.memberChild')
                        : t('kidsCheckin.form.visitorChild')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('kidsCheckin.form.parent')}
                    </p>
                    <p className="text-sm text-gray-900">{child.parent_name}</p>
                  </div>
                  {child.parent_phone && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">
                        {t('kidsCheckin.form.parentPhone')}
                      </p>
                      <p className="text-sm text-gray-900">{child.parent_phone}</p>
                    </div>
                  )}
                </div>

                {child.allergies && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      {t('kidsCheckin.form.allergies')}
                    </p>
                    <p className="text-sm text-gray-900 bg-yellow-50 p-2 rounded mt-1">
                      {child.allergies}
                    </p>
                  </div>
                )}

                {child.special_needs && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      {t('kidsCheckin.form.specialNeeds')}
                    </p>
                    <p className="text-sm text-gray-900 bg-blue-50 p-2 rounded mt-1">
                      {child.special_needs}
                    </p>
                  </div>
                )}

                {child.emergency_contact_name && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      {t('kidsCheckin.form.emergencyContact')}
                    </p>
                    <p className="text-sm text-gray-900">
                      {child.emergency_contact_name}
                      {child.emergency_contact_phone && (
                        <span className="ml-2 text-gray-600">
                          ({child.emergency_contact_phone})
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {child.notes && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      {t('kidsCheckin.form.notes')}
                    </p>
                    <p className="text-sm text-gray-900">{child.notes}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => handleCheckOut(child.checked_in_id, child.child_name)}
                    disabled={checkingOutId === child.checked_in_id}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkingOutId === child.checked_in_id
                      ? t('kidsCheckin.buttons.checkingOut')
                      : t('kidsCheckin.buttons.checkout')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
