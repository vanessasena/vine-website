'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { supabase } from '@/lib/supabase';

interface UpdatePasswordClientProps {
  locale: string;
}

export default function UpdatePasswordClient({ locale }: UpdatePasswordClientProps) {
  const t = useTranslations('auth');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if we have a valid recovery session
    const checkSession = async () => {
      if (!supabase) return;

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setIsValidSession(true);
      } else {
        setError(t('invalidResetLink'));
      }
    };

    checkSession();
  }, [t]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!supabase) {
      setError(t('databaseError'));
      setLoading(false);
      return;
    }

    // Validate password
    if (password.length < 6) {
      setError(t('passwordTooShort'));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      setLoading(false);
      return;
    }

    try {
      // Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        // Display the actual error message from the API
        if (updateError.message) {
          setError(updateError.message);
        } else {
          setError(t('passwordUpdateError'));
        }
        setLoading(false);
        return;
      }

      setSuccessMessage(t('passwordUpdated'));
      setPassword('');
      setConfirmPassword('');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(`/${locale}/login`);
      }, 2000);
    } catch (err) {
      console.error('Password update error:', err);
      setError(t('passwordUpdateError'));
      setLoading(false);
    }
  };

  if (!isValidSession && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
          <div className="text-center">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin h-12 w-12 text-primary-600 mx-auto" />
            <p className="mt-4 text-gray-600">{t('loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <FontAwesomeIcon icon={faLock} className="h-6 w-6 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('updatePasswordTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('updatePasswordSubtitle')}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{successMessage}</h3>
                </div>
              </div>
            </div>
          )}

          {isValidSession && (
            <>
              <div className="rounded-md shadow-sm space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('newPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder={t('newPasswordPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      />
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('confirmNewPassword')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FontAwesomeIcon icon={faLock} className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="appearance-none relative block w-full pl-10 pr-10 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                      placeholder={t('confirmNewPasswordPlaceholder')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="animate-spin h-5 w-5 mr-2" />
                      {t('updatingPassword')}
                    </>
                  ) : (
                    t('updatePassword')
                  )}
                </button>
              </div>
            </>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/login`)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <span className="underline">{t('backToLoginLink')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
