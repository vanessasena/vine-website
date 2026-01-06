'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

// Helper function to get today's date in local timezone
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to validate phone number
const isValidPhoneNumber = (phone: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Accept 10 digits (local) or 11 digits (with country code 1)
  // Examples: (519) 123-4567, 519-123-4567, +1 519 123 4567, etc.
  return digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith('1'));
};

export default function RegisterVisitorClient() {
  const t = useTranslations('visitorRegistration');

  const [formData, setFormData] = useState({
    visit_date: getTodayDate(), // Default to today
    name: '',
    phone: '',
    how_found: '',
    how_found_details: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate required fields
    if (!formData.visit_date || !formData.name || !formData.phone || !formData.how_found) {
      setError(t('requiredField'));
      setIsSubmitting(false);
      return;
    }

    // Validate phone number format
    if (!isValidPhoneNumber(formData.phone)) {
      setError(t('invalidPhone'));
      setIsSubmitting(false);
      return;
    }

    // Validate that if "friend" or "other" is selected, details are provided
    if ((formData.how_found === 'friend' || formData.how_found === 'other') && !formData.how_found_details.trim()) {
      const errorKey = formData.how_found === 'friend' ? 'friendDetailsRequired' : 'otherDetailsRequired';
      setError(t(errorKey));
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/visitors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit registration');
      }

      setShowSuccess(true);
      setFormData({
        visit_date: getTodayDate(),
        name: '',
        phone: '',
        how_found: '',
        how_found_details: '',
      });

      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    } catch (err) {
      setError(t('errorMessage'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <h2 className="text-xl text-purple-600 mb-4">
            {t('subtitle')}
          </h2>
          <p className="text-gray-600">
            {t('description')}
          </p>
        </div>

        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-1">
              {t('successTitle')}
            </h3>
            <p className="text-green-700">
              {t('successMessage')}
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-1">
              {t('errorTitle')}
            </h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg p-8 space-y-6">
          {/* Visit Date */}
          <div>
            <label htmlFor="visit_date" className="block text-sm font-medium text-gray-700 mb-2">
              {t('visitDate')}
            </label>
            <input
              type="date"
              id="visit_date"
              name="visit_date"
              value={formData.visit_date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              {t('name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              {t('phone')}
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="(519) 123-4567"
            />
          </div>

          {/* How Found */}
          <div>
            <label htmlFor="how_found" className="block text-sm font-medium text-gray-700 mb-2">
              {t('howFound')}
            </label>
            <select
              id="how_found"
              name="how_found"
              value={formData.how_found}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">{t('requiredField')}</option>
              <option value="friend">{t('howFoundOptions.friend')}</option>
              <option value="google">{t('howFoundOptions.google')}</option>
              <option value="social">{t('howFoundOptions.social')}</option>
              <option value="passing">{t('howFoundOptions.passing')}</option>
              <option value="other">{t('howFoundOptions.other')}</option>
            </select>
          </div>

          {/* Friend/Other Details - Show if "friend" or "other" is selected */}
          {(formData.how_found === 'friend' || formData.how_found === 'other') && (
            <div>
              <label htmlFor="how_found_details" className="block text-sm font-medium text-gray-700 mb-2">
                {formData.how_found === 'friend' ? t('friendDetails') : t('otherDetails')}
              </label>
              <input
                type="text"
                id="how_found_details"
                name="how_found_details"
                value={formData.how_found_details}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={formData.how_found === 'friend' ? t('friendDetailsPlaceholder') : t('otherDetailsPlaceholder')}
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isSubmitting ? t('submitting') : t('submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
