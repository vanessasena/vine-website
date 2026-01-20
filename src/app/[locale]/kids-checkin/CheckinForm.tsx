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

interface CheckinFormProps {
  teacherName: string;
  onCheckInSuccess: () => void;
}

export default function CheckinForm({
  teacherName,
  onCheckInSuccess,
}: CheckinFormProps) {
  const t = useTranslations();
  const [childType, setChildType] = useState<'member' | 'visitor'>('member');
  const [memberChildren, setMemberChildren] = useState<Child[]>([]);
  const [visitorChildren, setVisitorChildren] = useState<VisitorChild[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [serviceDate, setServiceDate] = useState(getLocalISODate());
  const [serviceTime, setServiceTime] = useState('10:00');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [notes, setNotes] = useState('');

  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showVisitorDropdown, setShowVisitorDropdown] = useState(false);

  const memberDropdownRef = useRef<HTMLDivElement>(null);
  const visitorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        memberDropdownRef.current &&
        !memberDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMemberDropdown(false);
      }

      if (
        visitorDropdownRef.current &&
        !visitorDropdownRef.current.contains(event.target as Node)
      ) {
        setShowVisitorDropdown(false);
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
    const term = memberSearchTerm.toLowerCase();
    return memberChildren.filter((child) =>
      child.name.toLowerCase().includes(term)
    );
  }, [memberChildren, memberSearchTerm]);

  const visitorOptions = useMemo(() => {
    const term = visitorSearchTerm.toLowerCase();
    return visitorChildren.filter((child) =>
      child.name.toLowerCase().includes(term) ||
      (child.parent_name || '').toLowerCase().includes(term) ||
      (child.parent_phone || '').toLowerCase().includes(term)
    );
  }, [visitorChildren, visitorSearchTerm]);

  const selectedMemberChild = useMemo(
    () => memberChildren.find((child) => child.id === selectedChildId),
    [memberChildren, selectedChildId]
  );

  const selectedVisitorChild = useMemo(
    () => visitorChildren.find((child) => child.id === selectedChildId),
    [visitorChildren, selectedChildId]
  );

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
        service_date: serviceDate,
        service_time: serviceTime,
        ...(childType === 'member'
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

        <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-primary-900 mb-4">
          {t('kidsCheckin.form.sessionInfo')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sessionDate" className="block text-sm font-medium text-primary-900">
              {t('kidsCheckin.form.serviceDate')}
            </label>
            <input
              type="date"
              id="sessionDate"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-primary-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="sessionTime" className="block text-sm font-medium text-primary-900">
              {t('kidsCheckin.form.serviceTime')}
            </label>
            <input
              type="time"
              id="sessionTime"
              value={serviceTime}
              onChange={(e) => setServiceTime(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-primary-300 px-3 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-primary-700">
          {t('kidsCheckin.form.sessionDescription')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-base font-medium text-gray-900">
            {t('kidsCheckin.form.childType')}
          </label>
          <div className="mt-4 space-y-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="childType"
                value="member"
                checked={childType === 'member'}
                onChange={() => {
                  setChildType('member');
                  setSelectedChildId('');
                }}
                className="h-4 w-4 text-primary-600"
              />
              <span className="ml-3 text-gray-700">
                {t('kidsCheckin.form.memberChild')}
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="childType"
                value="visitor"
                checked={childType === 'visitor'}
                onChange={() => {
                  setChildType('visitor');
                  setSelectedChildId('');
                }}
                className="h-4 w-4 text-primary-600"
              />
              <span className="ml-3 text-gray-700">
                {t('kidsCheckin.form.visitorChild')}
              </span>
            </label>
          </div>
        </div>

        {childType === 'member' && (
          <div className="relative" ref={memberDropdownRef}>
            <label htmlFor="memberChild" className="block text-sm font-medium text-gray-700">
              {t('kidsCheckin.form.selectChild')}
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="memberChild"
                value={selectedMemberChild ? `${selectedMemberChild.name} (${formatLocalDate(selectedMemberChild.date_of_birth)})` : memberSearchTerm}
                onChange={(e) => {
                  setMemberSearchTerm(e.target.value);
                  setSelectedChildId('');
                  setShowMemberDropdown(true);
                }}
                onFocus={() => setShowMemberDropdown(true)}
                disabled={loadingChildren}
                placeholder={t('kidsCheckin.form.searchChildPlaceholder')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
              />
              {showMemberDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {memberOptions.length > 0 ? (
                    memberOptions.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          setSelectedChildId(child.id);
                          setMemberSearchTerm('');
                          setShowMemberDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900">{child.name}</div>
                        <div className="text-sm text-gray-500">{formatLocalDate(child.date_of_birth)}</div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {t('kidsCheckin.form.noChildrenFound')}
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedMemberChild && (
              <button
                type="button"
                onClick={() => {
                  setSelectedChildId('');
                  setMemberSearchTerm('');
                  setShowMemberDropdown(false);
                }}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                {t('kidsCheckin.form.clearSelection')}
              </button>
            )}
          </div>
        )}

        {childType === 'visitor' && (
          <div className="relative" ref={visitorDropdownRef}>
            <label htmlFor="visitorChild" className="block text-sm font-medium text-gray-700">
              {t('kidsCheckin.form.selectVisitorChild')}
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="visitorChild"
                value={selectedVisitorChild ? `${selectedVisitorChild.name} (${selectedVisitorChild.parent_name})` : visitorSearchTerm}
                onChange={(e) => {
                  setVisitorSearchTerm(e.target.value);
                  setSelectedChildId('');
                  setShowVisitorDropdown(true);
                }}
                onFocus={() => setShowVisitorDropdown(true)}
                disabled={loadingChildren}
                placeholder={t('kidsCheckin.form.searchChildPlaceholder')}
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100"
              />
              {showVisitorDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {visitorOptions.length > 0 ? (
                    visitorOptions.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          setSelectedChildId(child.id);
                          setVisitorSearchTerm('');
                          setShowVisitorDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-primary-50 focus:bg-primary-50 focus:outline-none"
                      >
                        <div className="font-medium text-gray-900">{child.name}</div>
                        <div className="text-sm text-gray-500">
                          {t('kidsCheckin.form.parent')}: {child.parent_name}
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      {t('kidsCheckin.form.noChildrenFound')}
                    </div>
                  )}
                </div>
              )}
            </div>
            {selectedVisitorChild && (
              <button
                type="button"
                onClick={() => {
                  setSelectedChildId('');
                  setVisitorSearchTerm('');
                  setShowVisitorDropdown(false);
                }}
                className="mt-2 text-sm text-primary-600 hover:text-primary-700"
              >
                {t('kidsCheckin.form.clearSelection')}
              </button>
            )}
          </div>
        )}

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
