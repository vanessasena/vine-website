'use client';

import { useState, useEffect } from 'react';
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
  const [creatingVisitor, setCreatingVisitor] = useState(false);
  const [isNewVisitor, setIsNewVisitor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Session info (applies to all check-ins)
  const [serviceDate, setServiceDate] = useState(getLocalISODate());
  const [serviceTime, setServiceTime] = useState('10:00');

  // Form state for member child check-in
  const [selectedChildId, setSelectedChildId] = useState('');
  const [notes, setNotes] = useState('');

  // Search/filter states
  const [memberSearchTerm, setMemberSearchTerm] = useState('');
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [showVisitorDropdown, setShowVisitorDropdown] = useState(false);

  // Form state for visitor child
  const [visitorName, setVisitorName] = useState('');
  const [visitorDob, setVisitorDob] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [allergies, setAllergies] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [photoPermission, setPhotoPermission] = useState(true);

  // Get auth token and fetch data on mount
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token && session?.user?.id) {
          setAuthToken(session.access_token);
          // Fetch data after getting token - call the functions after they're defined
          setLoadingChildren(true);
          try {
            // Fetch all member children (teachers/admins can see all)
            const memberResponse = await fetch(`/api/children?all=true`, {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            if (memberResponse.ok) {
              const children = await memberResponse.json();
              setMemberChildren(Array.isArray(children) ? children : []);
            } else {
              console.error('Failed to fetch member children:', await memberResponse.text());
              setMemberChildren([]);
            }
          } catch (err) {
            console.error('Error fetching member children:', err);
            setMemberChildren([]);
          }

          try {
            // Fetch visitor children
            const visitorResponse = await fetch('/api/visitor-children', {
              headers: {
                Authorization: `Bearer ${session.access_token}`,
              },
            });
            if (visitorResponse.ok) {
              const children = await visitorResponse.json();
              setVisitorChildren(Array.isArray(children) ? children : []);
            } else {
              setVisitorChildren([]);
            }
          } catch (err) {
            console.error('Error fetching visitor children:', err);
            setVisitorChildren([]);
          }
          setLoadingChildren(false);
        }
      } catch (err) {
        console.error('Error getting auth token:', err);
        setLoadingChildren(false);
      }
    };

    getAuthToken();
  }, [t]);

  const fetchMemberChildren = async (token: string) => {
    try {
      setLoadingChildren(true);
      const response = await fetch('/api/children', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(t('kidsCheckin.errors.fetchFailed'));
      const children = await response.json();
      setMemberChildren(children);
    } catch (err) {
      console.error('Error fetching member children:', err);
      setError(t('kidsCheckin.errors.fetchFailed'));
    } finally {
      setLoadingChildren(false);
    }
  };

  // Filter member children based on search term
  const filteredMemberChildren = memberChildren.filter((child) =>
    child.name.toLowerCase().includes(memberSearchTerm.toLowerCase())
  );

  // Filter visitor children based on search term
  const filteredVisitorChildren = visitorChildren.filter((child) =>
    child.name.toLowerCase().includes(visitorSearchTerm.toLowerCase()) ||
    child.parent_name.toLowerCase().includes(visitorSearchTerm.toLowerCase())
  );

  // Get selected child object
  const selectedMemberChild = memberChildren.find((child) => child.id === selectedChildId);
  const selectedVisitorChild = visitorChildren.find((child) => child.id === selectedChildId);

  const createVisitorChild = async () => {
    if (!visitorName || !visitorDob || !parentName || !parentPhone) {
      setError(t('kidsCheckin.errors.requiredFields'));
      return null;
    }

    if (!authToken) {
      setError(t('kidsCheckin.errors.authenticationFailed'));
      return null;
    }

    try {
      setCreatingVisitor(true);
      const response = await fetch('/api/visitor-children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: visitorName,
          date_of_birth: visitorDob,
          parent_name: parentName,
          parent_phone: parentPhone,
          parent_email: parentEmail || null,
          allergies: allergies || null,
          special_needs: specialNeeds || null,
          emergency_contact_name: emergencyName || null,
          emergency_contact_phone: emergencyPhone || null,
          photo_permission: photoPermission,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Visitor creation failed:', errorData);
        throw new Error(t('kidsCheckin.errors.creationFailed'));
      }

      const newChild = await response.json();
      console.log('Created visitor child:', newChild);

      if (!newChild || !newChild.id) {
        console.error('Invalid response from visitor creation:', newChild);
        throw new Error(t('kidsCheckin.errors.creationFailed'));
      }

      setVisitorChildren([...visitorChildren, newChild]);
      setSelectedChildId(newChild.id);
      setIsNewVisitor(false);

      return newChild.id; // Return the child ID to continue with check-in
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('kidsCheckin.errors.creationFailed')
      );
      return null;
    } finally {
      setCreatingVisitor(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (childType === 'member' && !selectedChildId) {
      setError(t('kidsCheckin.errors.selectChild'));
      return;
    }

    // If creating a new visitor, create them first then continue with check-in
    let childIdToCheckIn = selectedChildId;
    if (childType === 'visitor' && isNewVisitor) {
      const newChildId = await createVisitorChild();
      if (!newChildId) {
        // Error already set by createVisitorChild
        return;
      }
      childIdToCheckIn = newChildId;
    }

    if (childType === 'visitor' && !childIdToCheckIn) {
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
          ? { member_child_id: childIdToCheckIn }
          : { visitor_child_id: childIdToCheckIn }),
        checked_in_by_name: teacherName,
        notes: notes || null,
      };

      console.log('Submitting check-in:', checkInData);
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
        console.error('Check-in failed:', errorData);
        throw new Error(t('kidsCheckin.errors.checkInFailed'));
      }

      const checkInResult = await response.json();
      console.log('Check-in successful:', checkInResult);

      setSuccess(t('kidsCheckin.success.checkedIn'));
      // Reset form
      setSelectedChildId('');
      setNotes('');
      setVisitorName('');
      setVisitorDob('');
      setParentName('');
      setParentPhone('');
      setParentEmail('');
      setAllergies('');
      setSpecialNeeds('');
      setEmergencyName('');
      setEmergencyPhone('');
      setIsNewVisitor(false);

      setTimeout(() => {
        setSuccess(null);
        onCheckInSuccess();
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('kidsCheckin.errors.checkInFailed')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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
      {/* Session Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          {t('kidsCheckin.form.sessionInfo')}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sessionDate" className="block text-sm font-medium text-blue-900">
              {t('kidsCheckin.form.serviceDate')}
            </label>
            <input
              type="date"
              id="sessionDate"
              value={serviceDate}
              onChange={(e) => setServiceDate(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-blue-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="sessionTime" className="block text-sm font-medium text-blue-900">
              {t('kidsCheckin.form.serviceTime')}
            </label>
            <input
              type="time"
              id="sessionTime"
              value={serviceTime}
              onChange={(e) => setServiceTime(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-blue-300 px-3 py-2 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <p className="mt-3 text-sm text-blue-700">
          {t('kidsCheckin.form.sessionDescription')}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Child Type Selection */}
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
                  setIsNewVisitor(false);
                  setSelectedChildId('');
                }}
                className="h-4 w-4 text-blue-600"
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
                onChange={() => setChildType('visitor')}
                className="h-4 w-4 text-blue-600"
              />
              <span className="ml-3 text-gray-700">
                {t('kidsCheckin.form.visitorChild')}
              </span>
            </label>
          </div>
        </div>

        {/* Member Child Selection with Search */}
        {childType === 'member' && (
          <div className="relative">
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
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
              />
              {showMemberDropdown && memberSearchTerm && !selectedChildId && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredMemberChildren.length > 0 ? (
                    filteredMemberChildren.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => {
                          setSelectedChildId(child.id);
                          setMemberSearchTerm('');
                          setShowMemberDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
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
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                {t('kidsCheckin.form.clearSelection')}
              </button>
            )}
          </div>
        )}

        {/* Visitor Child Selection */}
        {childType === 'visitor' && (
          <div className="space-y-4">
            {!isNewVisitor ? (
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <label htmlFor="visitorChild" className="block text-sm font-medium text-gray-700">
                    {t('kidsCheckin.form.selectVisitorChild')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsNewVisitor(true)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {t('kidsCheckin.form.addNewVisitor')}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    id="visitorChild"
                    value={selectedVisitorChild ? `${selectedVisitorChild.name} - ${t('kidsCheckin.form.parent')}: ${selectedVisitorChild.parent_name}` : visitorSearchTerm}
                    onChange={(e) => {
                      setVisitorSearchTerm(e.target.value);
                      setSelectedChildId('');
                      setShowVisitorDropdown(true);
                    }}
                    onFocus={() => setShowVisitorDropdown(true)}
                    placeholder={t('kidsCheckin.form.searchChildPlaceholder')}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {showVisitorDropdown && visitorSearchTerm && !selectedChildId && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredVisitorChildren.length > 0 ? (
                        filteredVisitorChildren.map((child) => (
                          <button
                            key={child.id}
                            type="button"
                            onClick={() => {
                              setSelectedChildId(child.id);
                              setVisitorSearchTerm('');
                              setShowVisitorDropdown(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
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
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    {t('kidsCheckin.form.clearSelection')}
                  </button>
                )}
              </div>
            ) : (
              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewVisitor(false)}
                  className="mb-4 text-sm text-gray-600 hover:text-gray-900"
                >
                  ← {t('kidsCheckin.form.backToList')}
                </button>

                <div className="space-y-4">
                  {/* Child Information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="visitorName" className="block text-sm font-medium text-gray-700">
                        {t('kidsCheckin.form.childName')} *
                      </label>
                      <input
                        type="text"
                        id="visitorName"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder={t('kidsCheckin.form.childNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="visitorDob" className="block text-sm font-medium text-gray-700">
                        {t('kidsCheckin.form.dateOfBirth')} *
                      </label>
                      <input
                        type="date"
                        id="visitorDob"
                        value={visitorDob}
                        onChange={(e) => setVisitorDob(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Parent Information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">
                        {t('kidsCheckin.form.parentName')} *
                      </label>
                      <input
                        type="text"
                        id="parentName"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder={t('kidsCheckin.form.parentNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">
                        {t('kidsCheckin.form.parentPhone')} *
                      </label>
                      <input
                        type="tel"
                        id="parentPhone"
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder={t('kidsCheckin.form.parentPhonePlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="parentEmail" className="block text-sm font-medium text-gray-700">
                      {t('kidsCheckin.form.parentEmail')}
                    </label>
                    <input
                      type="email"
                      id="parentEmail"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder={t('kidsCheckin.form.parentEmailPlaceholder')}
                    />
                  </div>

                  {/* Health Information */}
                  <div>
                    <label htmlFor="allergies" className="block text-sm font-medium text-gray-700">
                      {t('kidsCheckin.form.allergies')}
                    </label>
                    <textarea
                      id="allergies"
                      value={allergies}
                      onChange={(e) => setAllergies(e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder={t('kidsCheckin.form.allergiesPlaceholder')}
                    />
                  </div>

                  <div>
                    <label htmlFor="specialNeeds" className="block text-sm font-medium text-gray-700">
                      {t('kidsCheckin.form.specialNeeds')}
                    </label>
                    <textarea
                      id="specialNeeds"
                      value={specialNeeds}
                      onChange={(e) => setSpecialNeeds(e.target.value)}
                      rows={2}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      placeholder={t('kidsCheckin.form.specialNeedsPlaceholder')}
                    />
                  </div>

                  {/* Emergency Contact */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="emergencyName" className="block text-sm font-medium text-gray-700">
                        {t('kidsCheckin.form.emergencyContactName')}
                      </label>
                      <input
                        type="text"
                        id="emergencyName"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder={t('kidsCheckin.form.emergencyContactNamePlaceholder')}
                      />
                    </div>
                    <div>
                      <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700">
                        {t('kidsCheckin.form.emergencyContactPhone')}
                      </label>
                      <input
                        type="tel"
                        id="emergencyPhone"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
                        placeholder={t('kidsCheckin.form.emergencyContactPhonePlaceholder')}
                      />
                    </div>
                  </div>

                  {/* Photo Permission */}
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={photoPermission}
                      onChange={(e) => setPhotoPermission(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {t('kidsCheckin.form.photoPermission')}
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notes Section */}
        <div className="border-t pt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            {t('kidsCheckin.form.notes')}
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            placeholder={t('kidsCheckin.form.notesPlaceholder')}
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={submitting || creatingVisitor}
            className="inline-flex items-center px-6 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting || creatingVisitor
              ? t('kidsCheckin.buttons.submitting')
              : isNewVisitor
              ? t('kidsCheckin.buttons.createAndCheckin')
              : t('kidsCheckin.buttons.checkin')}
          </button>
        </div>
      </form>
    </div>
  );
}
