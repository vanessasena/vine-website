'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCakeCandles,
  faHouseUser,
  faUsers,
  faUserGroup,
  faPhone,
  faCheckCircle,
  faCircleXmark,
  faCircleInfo
} from '@fortawesome/free-solid-svg-icons';
import { formatLocalDate, getLocalISODate, formatPhoneNumber } from '@/lib/utils';
import { useApiCall } from '@/lib/hooks/useApiCall';

interface Child {
  id: string;
  name: string;
  date_of_birth: string;
  parent_name?: string;
  parent_phone?: string;
}

interface VisitorChild {
  id: string;
  name: string;
  date_of_birth: string;
  parent_name: string;
  parent_phone: string;
  parent_email?: string;
  allergies?: string;
  special_needs?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface CombinedChild {
  id: string;
  name: string;
  date_of_birth: string;
  parent_name: string;
  parent_phone: string;
  type: 'member' | 'visitor';
}

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

interface CheckinFormProps {
  teacherName: string;
  onCheckInSuccess: () => void;
}

export default function CheckinForm({
  teacherName,
  onCheckInSuccess,
}: CheckinFormProps) {
  const t = useTranslations();
  const { call: apiCall } = useApiCall();
  const [memberChildren, setMemberChildren] = useState<Child[]>([]);
  const [visitorChildren, setVisitorChildren] = useState<VisitorChild[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedChildType, setSelectedChildType] = useState<'member' | 'visitor' | null>(null);
  const [notes, setNotes] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMemberChildren = async (token: string) => {
    const { data, error: apiError } = await apiCall('/api/children?all=true', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (apiError) {
      console.error('Error fetching member children:', apiError);
      return;
    }
    setMemberChildren(Array.isArray(data) ? data : []);
  };

  const fetchVisitorChildren = async (token: string) => {
    const { data, error: apiError } = await apiCall('/api/visitor-children', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (apiError) {
      console.error('Error fetching visitor children:', apiError);
      return;
    }
    setVisitorChildren(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token || !session?.user?.id) return;

        setAuthToken(session.access_token);
        setLoadingChildren(true);
        setError(null);
        await Promise.all([
          fetchMemberChildren(session.access_token),
          fetchVisitorChildren(session.access_token),
        ]);
      } catch (err) {
        console.error('Error loading children:', err);
        setError(t('kidsCheckin.errors.fetchFailed'));
      } finally {
        setLoadingChildren(false);
      }
    };

    load();
  }, [t, apiCall]);

  const memberOptions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return memberChildren.filter((child) =>
      child.name.toLowerCase().includes(term)
    );
  }, [memberChildren, searchTerm]);

  const visitorOptions = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return visitorChildren.filter((child) =>
      child.name.toLowerCase().includes(term) ||
      (child.parent_name || '').toLowerCase().includes(term)
    );
  }, [visitorChildren, searchTerm]);

  const combinedOptions = useMemo(() => {
    const combined: CombinedChild[] = [
      ...memberOptions.map(child => ({
        id: child.id,
        name: child.name,
        date_of_birth: child.date_of_birth,
        parent_name: child.parent_name || '',
        parent_phone: child.parent_phone || '',
        type: 'member' as const
      })),
      ...visitorOptions.map(child => ({
        id: child.id,
        name: child.name,
        date_of_birth: child.date_of_birth,
        parent_name: child.parent_name,
        parent_phone: child.parent_phone,
        type: 'visitor' as const
      }))
    ];
    return combined;
  }, [memberOptions, visitorOptions]);

  const selectedChild = useMemo(() => {
    if (!selectedChildId || !selectedChildType) return null;
    if (selectedChildType === 'member') {
      return memberChildren.find((child) => child.id === selectedChildId);
    } else {
      return visitorChildren.find((child) => child.id === selectedChildId);
    }
  }, [memberChildren, visitorChildren, selectedChildId, selectedChildType]);

  const handleRefreshChildren = async () => {
    if (!authToken) {
      setError(t('kidsCheckin.errors.authenticationFailed'));
      return;
    }

    try {
      setError(null);
      setLoadingChildren(true);
      await Promise.all([
        fetchMemberChildren(authToken),
        fetchVisitorChildren(authToken),
      ]);
    } catch (err) {
      console.error('Error refreshing children:', err);
      setError(t('kidsCheckin.errors.fetchFailed'));
    } finally {
      setLoadingChildren(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedChildId) {
      setError(t('kidsCheckin.errors.selectChild'));
      return;
    }

    try {
      setSubmitting(true);

      if (!authToken) {
        throw new Error(t('kidsCheckin.errors.authenticationFailed'));
      }

      // Check if child is already checked in
      const checkParams = new URLSearchParams({
        status: 'checked_in',
        use_view: 'true'
      });

      const { data: existingCheckins, error: checkError } = await apiCall(
        `/api/check-ins?${checkParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (checkError) {
        console.error('Error checking existing check-ins:', checkError);
        // Continue anyway, user might still want to check in
      } else if (existingCheckins) {
        const isAlreadyCheckedIn = existingCheckins.some((checkin: any) => {
          if (selectedChildType === 'member') {
            return checkin.member_child_id === selectedChildId;
          } else {
            return checkin.visitor_child_id === selectedChildId;
          }
        });

        if (isAlreadyCheckedIn) {
          setError(t('kidsCheckin.errors.alreadyCheckedIn'));
          setSubmitting(false);
          return;
        }
      }

      const checkInData = {
        ...(selectedChildType === 'member'
          ? { member_child_id: selectedChildId }
          : { visitor_child_id: selectedChildId }),
        checked_in_by_name: teacherName,
        checkin_notes: notes || null,
      };

      const { data, error: submitError } = await apiCall('/api/check-ins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(checkInData),
      });

      if (submitError) {
        if (submitError.type === 'partial_failure') {
          setError(`${t('kidsCheckin.errors.checkInFailed')} (ID: ${submitError.requestId})`);
        } else if (submitError.type === 'network') {
          setError(t('kidsCheckin.errors.networkError') || submitError.message);
        } else if (submitError.type === 'timeout') {
          setError(t('kidsCheckin.errors.timeoutError') || submitError.message);
        } else {
          setError(`${submitError.message} (ID: ${submitError.requestId})`);
        }
        return;
      }

      setSuccess(t('kidsCheckin.success.checkedIn'));
      setSelectedChildId('');
      setSelectedChildType(null);
      setSearchTerm('');
      setNotes('');

      setTimeout(() => {
        setSuccess(null);
        onCheckInSuccess();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('kidsCheckin.errors.checkInFailed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 border-l-4 border-red-500 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faCircleXmark} className="text-red-600 h-5 w-5" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-green-50 p-4 border-l-4 border-green-500 shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon icon={faCheckCircle} className="text-green-600 h-5 w-5" />
              <p className="text-sm font-medium text-green-700">{success}</p>
            </div>
          </div>
        )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="inline-flex items-start gap-2 rounded-lg bg-blue-50 text-blue-800 text-sm px-3 py-2 border border-blue-100">
              <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4 mt-0.5 text-blue-500" />
              <span>{t('kidsCheckin.form.phoneReminder')}</span>
            </div>
            <button
              type="button"
              onClick={handleRefreshChildren}
              disabled={loadingChildren}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:text-primary-700 hover:border-primary-200 bg-white shadow-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FontAwesomeIcon icon={faCircleInfo} className="h-4 w-4 text-gray-500" />
              {loadingChildren ? t('kidsCheckin.form.refreshing') : t('kidsCheckin.form.refreshChildren')}
            </button>
          </div>
          <label htmlFor="childSearch" className="block text-sm font-semibold text-gray-900 mb-2">
            {t('kidsCheckin.form.selectChild')}
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="childSearch"
              value={selectedChild ? `${selectedChild.name}` : searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedChildId('');
                setSelectedChildType(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              disabled={loadingChildren}
              placeholder={t('kidsCheckin.form.searchChildPlaceholder')}
              className="block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 disabled:bg-gray-100"
            />
            {showDropdown && (
              <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-auto">
                {combinedOptions.length > 0 ? (
                  combinedOptions.map((child) => {
                    const age = calculateAge(child.date_of_birth);
                    const typeLabel = child.type === 'member'
                      ? t('kidsCheckin.form.memberChild')
                      : t('kidsCheckin.form.visitorChild');
                    return (
                      <button
                        key={`${child.type}-${child.id}`}
                        type="button"
                        onClick={() => {
                          setSelectedChildId(child.id);
                          setSelectedChildType(child.type);
                          setSearchTerm('');
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-5 py-4 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b last:border-b-0 transition-colors duration-150 hover:shadow-md"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="font-semibold text-gray-900 text-base">{child.name}</div>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                child.type === 'member'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>
                                <FontAwesomeIcon icon={child.type === 'member' ? faHouseUser : faUsers} className="h-3.5 w-3.5 mr-1" />
                                {child.type === 'member' ? 'Member' : 'Visitor'}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {age >= 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FontAwesomeIcon icon={faCakeCandles} className="h-4 w-4 text-gray-500" />
                                  <span>{age} {t('kidsCheckin.form.yearsOld')}</span>
                                </div>
                              )}
                              {child.parent_name && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <FontAwesomeIcon icon={faUserGroup} className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium">{child.parent_name}</span>
                                </div>
                              )}
                              {child.parent_phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <FontAwesomeIcon icon={faPhone} className="h-4 w-4 text-gray-500" />
                                  <span className="font-mono">{formatPhoneNumber(child.parent_phone)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    {t('kidsCheckin.form.noChildrenFound')}
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedChild && (
            <button
              type="button"
              onClick={() => {
                setSelectedChildId('');
                setSelectedChildType(null);
                setSearchTerm('');
                setShowDropdown(false);
              }}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              {t('kidsCheckin.form.clearSelection')}
            </button>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
            {t('kidsCheckin.form.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 resize-none"
            placeholder={t('kidsCheckin.form.notesPlaceholder')}
          />
        </div>

        <div className="flex justify-end pt-6 border-t-2 border-gray-100">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-semibold rounded-xl shadow-lg text-white bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-xl"
          >
            {submitting ? t('kidsCheckin.buttons.submitting') : t('kidsCheckin.buttons.checkin')}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
