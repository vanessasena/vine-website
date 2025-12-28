'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faPhone,
  faBirthdayCake,
  faChurch,
  faHandsHelping,
  faUsers,
  faCheckCircle,
  faEdit,
  faSave,
  faTimes,
  faArrowLeft,
} from '@fortawesome/free-solid-svg-icons';
import { VOLUNTEER_AREA_OPTIONS } from '@/lib/constants';

interface MemberProfile {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string | null;
  phone: string;
  email: string;
  is_baptized: boolean;
  pays_tithe: boolean;
  volunteer_areas: string[];
  volunteer_outros_details: string | null;
  life_group: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberProfileClientProps {
  locale: string;
}

export default function MemberProfileClient({ locale }: MemberProfileClientProps) {
  const t = useTranslations('member');
  const tCells = useTranslations('cells');
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [dateError, setDateError] = useState(false);
  const [userRole, setUserRole] = useState<'member' | 'admin' | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    is_baptized: false,
    pays_tithe: false,
    volunteer_areas: [] as string[],
    volunteer_outros_details: '',
    life_group: '',
  });

  const checkAuthAndLoadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      // Refresh the session to ensure we have the latest user data
      const { data: { session } } = await supabase.auth.refreshSession();

      if (!session) {
        router.push(`/${locale}/login?redirect=/${locale}/member`);
        return;
      }

      // Store the current user ID to detect user changes
      setCurrentUserId(session.user.id);

      // Check if user is admin trying to access member area
      const response = await fetch('/api/member-profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      // Handle response - even errors should be parsed as JSON
      const result = await response.json();

      // Store user role
      setUserRole(result.role || 'member');

      if (result.data) {
        setProfile(result.data);
        setFormData({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          date_of_birth: result.data.date_of_birth || '',
          is_baptized: result.data.is_baptized,
          pays_tithe: result.data.pays_tithe,
          volunteer_areas: result.data.volunteer_areas || [],
          volunteer_outros_details: result.data.volunteer_outros_details || '',
          life_group: result.data.life_group || '',
        });
      } else {
        // No profile yet, set editing mode
        setIsEditing(true);
        setFormData({
          name: '',
          email: session.user.email || '',
          phone: '',
          date_of_birth: '',
          is_baptized: false,
          pays_tithe: false,
          volunteer_areas: [],
          volunteer_outros_details: '',
          life_group: '',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [locale, router]);

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, [checkAuthAndLoadProfile]);

  // Reset form when user changes (new login)
  useEffect(() => {
    if (currentUserId) {
      // Form will be populated by checkAuthAndLoadProfile
      // This ensures fresh data when user ID changes
    }
  }, [currentUserId]);

  const formatPhoneInput = (value: string): string => {
    // Remove all characters except digits, spaces, hyphens, parentheses, and plus
    let cleaned = value.replace(/[^\d\s\-()+ ]/g, '');

    // Remove multiple consecutive spaces
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Remove invalid parentheses patterns (empty parentheses, mismatched, etc.)
    // Only allow ( before digits and ) after digits
    cleaned = cleaned.replace(/\(\s*\)/g, ''); // Remove empty parentheses
    cleaned = cleaned.replace(/\){2,}/g, ')'); // Remove multiple closing parentheses
    cleaned = cleaned.replace(/\({2,}/g, '('); // Remove multiple opening parentheses

    // Ensure plus sign is only at the beginning
    if (cleaned.includes('+')) {
      cleaned = '+' + cleaned.replace(/\+/g, '');
    }

    return cleaned;
  };

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');

    // Must have exactly 10 or 11 digits
    if (digitsOnly.length !== 10 && digitsOnly.length !== 11) {
      return false;
    }

    // Check for valid format patterns
    // Patterns: (519) 123-4567, 519-123-4567, 5191234567, +1-519-123-4567, +1 519 123 4567, etc.
    const validPatterns = [
      /^\d{10}$/, // 5191234567
      /^\d{11}$/, // 15191234567
      /^\d{3}[-\s]\d{3}[-\s]\d{4}$/, // 519-123-4567 or 519 123 4567
      /^\(\d{3}\)\s?\d{3}[-\s]?\d{4}$/, // (519) 123-4567 or (519)123-4567
      /^\+1[-\s]?\d{3}[-\s]?\d{3}[-\s]?\d{4}$/, // +1-519-123-4567
      /^\+1[-\s]?\(\d{3}\)\s?\d{3}[-\s]?\d{4}$/, // +1-(519) 123-4567
    ];

    return validPatterns.some(pattern => pattern.test(phone.trim()));
  };

  const validateDateOfBirth = (dateString: string): boolean => {
    if (!dateString || dateString.trim() === '') {
      return true; // Allow empty dates
    }

    const selectedDate = new Date(dateString);
    const today = new Date();

    // Check if date is valid
    if (isNaN(selectedDate.getTime())) {
      return false;
    }

    // Date cannot be in the future
    if (selectedDate > today) {
      return false;
    }

    // Calculate age
    const age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    const dayDiff = today.getDate() - selectedDate.getDate();
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

    // Age must be between 0 and 120 years
    if (actualAge < 0 || actualAge > 120) {
      return false;
    }

    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      let processedValue = value;

      // For phone input, format and validate
      if (name === 'phone') {
        processedValue = formatPhoneInput(value);

        if (processedValue && !validatePhone(processedValue)) {
          setPhoneError(t('phoneError'));
        } else {
          setPhoneError(null);
        }
      }

      // Validate date of birth on change
      if (name === 'date_of_birth') {
        if (value && !validateDateOfBirth(value)) {
          setDateError(true);
        } else {
          setDateError(false);
        }
      }

      setFormData(prev => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleVolunteerAreaChange = (area: string) => {
    setFormData(prev => ({
      ...prev,
      volunteer_areas: prev.volunteer_areas.includes(area)
        ? prev.volunteer_areas.filter(a => a !== area)
        : [...prev.volunteer_areas, area]
    }));
  };

  const handleSave = async () => {
    try {
      // Validate phone before saving
      if (!validatePhone(formData.phone)) {
        setPhoneError(t('phoneError'));
        setError(t('fixErrors'));
        return;
      }

      // Validate date of birth before saving
      if (!validateDateOfBirth(formData.date_of_birth)) {
        setDateError(true);
        setError(t('fixErrors'));
        return;
      }

      setIsSaving(true);
      setError(null);
      setPhoneError(null);
      setDateError(false);

      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push(`/${locale}/login?redirect=/${locale}/member`);
        return;
      }

      const method = profile ? 'PUT' : 'POST';
      const response = await fetch('/api/member-profile', {
        method,
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      const result = await response.json();
      setProfile(result.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth || '',
        is_baptized: profile.is_baptized,
        pays_tithe: profile.pays_tithe,
        volunteer_areas: profile.volunteer_areas || [],
        volunteer_outros_details: profile.volunteer_outros_details || '',
        life_group: profile.life_group || '',
      });
      setIsEditing(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-xl text-gray-600">{t('loading')}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Admin Navigation */}
        {userRole === 'admin' && (
          <div className="mb-6">
            <Link
              href={`/${locale}/admin`}
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              {locale === 'pt' ? 'Voltar para Administração' : 'Back to Admin'}
            </Link>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">{t('error')}: </strong>
            <span>{error}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-primary-700">
              {profile ? t('profileTitle') : t('createProfileTitle')}
            </h2>
            {profile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                {t('editProfile')}
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                  {t('name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600" />
                  {t('email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {locale === 'pt' ? 'Email vinculado à sua conta' : 'Email linked to your account'}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600" />
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder={t('phonePlaceholder')}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    phoneError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faBirthdayCake} className="mr-2 text-primary-600" />
                  {t('dateOfBirth')}
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    dateError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {dateError && (
                  <p className="mt-1 text-sm text-red-600">{t('dateOfBirthError')}</p>
                )}
                {!dateError && formData.date_of_birth && (
                  <p className="mt-1 text-xs text-gray-500">{t('dateOfBirthHint')}</p>
                )}
              </div>

              {/* Baptized */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_baptized"
                  name="is_baptized"
                  checked={formData.is_baptized}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_baptized" className="ml-3 text-sm font-medium text-gray-700">
                  <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-primary-600" />
                  {t('isBaptized')}
                </label>
              </div>

              {/* Pays Tithe */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="pays_tithe"
                  name="pays_tithe"
                  checked={formData.pays_tithe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="pays_tithe" className="ml-3 text-sm font-medium text-gray-700">
                  <FontAwesomeIcon icon={faChurch} className="mr-2 text-primary-600" />
                  {t('paysTithe')}
                </label>
              </div>

              {/* Life Group */}
              <div>
                <label htmlFor="life_group" className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                  {t('lifeGroup')}
                </label>
                <select
                  id="life_group"
                  name="life_group"
                  value={formData.life_group}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">{t('lifeGroupPlaceholder')}</option>
                  {['roots', 'kitchener', 'cambridge', 'waterloo', 'youth'].map((groupKey) => {
                    const groupName = tCells(`groups.${groupKey}.name`);
                    return (
                      <option key={groupKey} value={groupName}>
                        {groupName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Volunteer Areas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <FontAwesomeIcon icon={faHandsHelping} className="mr-2 text-primary-600" />
                  {t('volunteerAreas')}
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {VOLUNTEER_AREA_OPTIONS.map((area) => (
                    <div key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        checked={formData.volunteer_areas.includes(area)}
                        onChange={() => handleVolunteerAreaChange(area)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`area-${area}`} className="ml-2 text-sm text-gray-700">
                        {t(`volunteerOptions.${area}`)}
                      </label>
                    </div>
                  ))}
                </div>

                {/* Show text field when "outros" is selected */}
                {formData.volunteer_areas.includes('outros') && (
                  <div className="mt-4">
                    <label htmlFor="outros_details" className="block text-sm font-medium text-gray-700 mb-2">
                      {t('outrosDetailsLabel')}
                    </label>
                    <textarea
                      id="outros_details"
                      name="volunteer_outros_details"
                      value={formData.volunteer_outros_details}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder={t('outrosDetailsPlaceholder')}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {isSaving ? t('saving') : t('save')}
                </button>
                {profile && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    {t('cancel')}
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Display Profile Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                    {t('name')}
                  </div>
                  <div className="text-lg text-gray-900">{profile?.name}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-primary-600" />
                    {t('email')}
                  </div>
                  <div className="text-lg text-gray-900">{profile?.email}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    <FontAwesomeIcon icon={faPhone} className="mr-2 text-primary-600" />
                    {t('phone')}
                  </div>
                  <div className="text-lg text-gray-900">{profile?.phone}</div>
                </div>

                {profile?.date_of_birth && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      <FontAwesomeIcon icon={faBirthdayCake} className="mr-2 text-primary-600" />
                      {t('dateOfBirth')}
                    </div>
                    <div className="text-lg text-gray-900">
                      {new Date(profile.date_of_birth).toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-US')}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t pt-6">
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faCheckCircle}
                      className={`mr-2 ${profile?.is_baptized ? 'text-green-600' : 'text-gray-400'}`}
                    />
                    <span className={profile?.is_baptized ? 'text-gray-900' : 'text-gray-500'}>
                      {t('isBaptized')}: {profile?.is_baptized ? t('yes') : t('no')}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faChurch}
                      className={`mr-2 ${profile?.pays_tithe ? 'text-green-600' : 'text-gray-400'}`}
                    />
                    <span className={profile?.pays_tithe ? 'text-gray-900' : 'text-gray-500'}>
                      {t('paysTithe')}: {profile?.pays_tithe ? t('yes') : t('no')}
                    </span>
                  </div>
                </div>

                {profile?.life_group && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      <FontAwesomeIcon icon={faUsers} className="mr-2 text-primary-600" />
                      {t('lifeGroup')}
                    </div>
                    <div className="text-lg text-gray-900">{profile.life_group}</div>
                  </div>
                )}

                {profile?.volunteer_areas && profile.volunteer_areas.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-2">
                      <FontAwesomeIcon icon={faHandsHelping} className="mr-2 text-primary-600" />
                      {t('volunteerAreas')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {profile.volunteer_areas.map((area) => (
                        <span
                          key={area}
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm"
                        >
                          {t(`volunteerOptions.${area}`)}
                        </span>
                      ))}
                    </div>
                    {profile.volunteer_areas.includes('outros') && profile.volunteer_outros_details && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {t('outrosDetailsLabel')}:
                        </div>
                        <div className="text-sm text-gray-600">{profile.volunteer_outros_details}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        {!isEditing && (
          <div className="bg-primary-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-primary-700 mb-3">{t('infoTitle')}</h3>
            <p className="text-gray-700">{t('infoText')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
