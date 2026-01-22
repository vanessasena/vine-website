'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@supabase/supabase-js';
import { formatLocalDate, getLocalISODate } from '@/lib/utils';

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
    try {
      const response = await fetch('/api/children?all=true', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('failed');
      const children = await response.json();
      setMemberChildren(Array.isArray(children) ? children : []);
    } catch (err) {
      console.error('Error fetching member children:', err);
      setMemberChildren([]);
    }
  };

  const fetchVisitorChildren = async (token: string) => {
    try {
      const response = await fetch('/api/visitor-children', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('failed');
      const children = await response.json();
      setVisitorChildren(Array.isArray(children) ? children : []);
    } catch (err) {
      console.error('Error fetching visitor children:', err);
      setVisitorChildren([]);
    }
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
  }, [t]);

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

      const checkInData = {
        ...(selectedChildType === 'member'
          ? { member_child_id: selectedChildId }
          : { visitor_child_id: selectedChildId }),
        checked_in_by_name: teacherName,
        checkin_notes: notes || null,
      };

      const response = await fetch('/api/check-ins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(checkInData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t('kidsCheckin.errors.checkInFailed'));
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Image
              src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/Vine-CHURCH-logo-transparent-2.png"
              alt="Vine Church KWC Logo"
              width={64}
              height={64}
              className="h-16 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold">{t('kidsCheckin.title')}</h1>
              <p className="text-white text-opacity-90">{t('kidsCheckin.form.sessionDescription')}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative" ref={dropdownRef}>
          <label htmlFor="childSearch" className="block text-sm font-medium text-gray-700">
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
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
            />
            {showDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
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
                        className="w-full text-left px-4 py-4 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b last:border-b-0 transition-colors duration-150"
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
                                {child.type === 'member' ? '👤' : '👥'} {child.type === 'member' ? 'Member' : 'Visitor'}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {age >= 0 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="text-lg">🎂</span>
                                  <span>{age} {t('kidsCheckin.form.yearsOld')}</span>
                                </div>
                              )}
                              {child.parent_name && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <span className="text-lg">👨‍👩‍👧</span>
                                  <span className="font-medium">{child.parent_name}</span>
                                </div>
                              )}
                              {child.parent_phone && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                  <span className="text-lg">📱</span>
                                  <span className="font-mono">{child.parent_phone}</span>
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
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            {t('kidsCheckin.form.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500"
            placeholder={t('kidsCheckin.form.notesPlaceholder')}
          />
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? t('kidsCheckin.buttons.submitting') : t('kidsCheckin.buttons.checkin')}
          </button>
        </div>
      </form>
    </div>
  </div>
  );
}
