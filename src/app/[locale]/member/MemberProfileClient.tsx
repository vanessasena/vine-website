'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
} from '@fortawesome/free-solid-svg-icons';

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
  life_group: string | null;
  created_at: string;
  updated_at: string;
}

interface MemberProfileClientProps {
  locale: string;
}

const VOLUNTEER_AREA_OPTIONS = [
  'louvor',
  'tecnologia',
  'recepcao',
  'kids',
  'teens',
  'celulas',
  'intercedao',
  'midia',
  'limpeza',
  'cozinha',
  'eventos',
  'transporte',
  'outros',
];

export default function MemberProfileClient({ locale }: MemberProfileClientProps) {
  const t = useTranslations('member');
  const router = useRouter();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    is_baptized: false,
    pays_tithe: false,
    volunteer_areas: [] as string[],
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

      // If user has admin role, redirect to admin area
      if (result.role === 'admin') {
        router.push(`/${locale}/admin`);
        return;
      }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
      setIsSaving(true);
      setError(null);

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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
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
                <input
                  type="text"
                  id="life_group"
                  name="life_group"
                  value={formData.life_group}
                  onChange={handleInputChange}
                  placeholder={t('lifeGroupPlaceholder')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
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
