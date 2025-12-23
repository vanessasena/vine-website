'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHandsHelping, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

interface VolunteerFormData {
  name: string;
  email: string;
  phone: string;
  description: string;
  areas: string[];
}

interface VolunteerFormErrors {
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  areas?: string;
}

interface VolunteersClientProps {
  locale: string;
}

export default function VolunteersClient({ locale }: VolunteersClientProps) {
  const t = useTranslations('volunteers');
  const [formData, setFormData] = useState<VolunteerFormData>({
    name: '',
    email: '',
    phone: '',
    description: '',
    areas: [],
  });
  const [errors, setErrors] = useState<VolunteerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const successMessageRef = useRef<HTMLDivElement>(null);
  const errorMessageRef = useRef<HTMLDivElement>(null);

  const areaKeys = [
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

  // Focus on success/error message when status changes
  useEffect(() => {
    if (submitStatus === 'success' && successMessageRef.current) {
      successMessageRef.current.focus();
    } else if (submitStatus === 'error' && errorMessageRef.current) {
      errorMessageRef.current.focus();
    }
  }, [submitStatus]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof VolunteerFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAreaChange = (area: string) => {
    setFormData((prev) => {
      const isSelected = prev.areas.includes(area);
      return {
        ...prev,
        areas: isSelected
          ? prev.areas.filter((a) => a !== area)
          : [...prev.areas, area],
      };
    });
    // Clear areas error
    if (errors.areas) {
      setErrors((prev) => ({ ...prev, areas: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: VolunteerFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('requiredField');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('requiredField');
    } else {
      // Validate phone format (must have at least 10 digits)
      const digitsOnly = formData.phone.replace(/\D/g, '');
      if (digitsOnly.length < 10) {
        newErrors.phone = t('invalidPhone');
      }
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = t('invalidEmail');
      }
    }

    if (!formData.description.trim()) {
      newErrors.description = t('requiredField');
    }

    if (formData.areas.length === 0) {
      newErrors.areas = t('selectAtLeastOne');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          description: '',
          areas: [],
        });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="text-5xl text-primary-600 mb-4">
              <FontAwesomeIcon icon={faHandsHelping} />
            </div>
            <p className="text-lg text-gray-700">
              {t('description')}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-primary-700 mb-6 text-center">
            {t('formTitle')}
          </h2>

          {submitStatus === 'success' && (
            <div
              ref={successMessageRef}
              tabIndex={-1}
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-green-500">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                <div>
                  <strong className="font-bold">{t('successTitle')}</strong>
                  <p>{t('successMessage')}</p>
                </div>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div
              ref={errorMessageRef}
              tabIndex={-1}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 focus:outline-none focus:ring-2 focus:ring-red-500">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
                <div>
                  <strong className="font-bold">{t('errorTitle')}</strong>
                  <p>{t('errorMessage')}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                {t('name')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t('namePlaceholder')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone */}
            <div className="mb-6">
              <label htmlFor="phone" className="block text-gray-700 font-semibold mb-2">
                {t('phone')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder={t('phonePlaceholder')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Email */}
            <div className="mb-6">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('emailPlaceholder')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-gray-700 font-semibold mb-2">
                {t('descriptionLabel')} <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('descriptionPlaceholder')}
                rows={5}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Areas */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                {t('selectAreas')} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {areaKeys.map((area) => (
                  <label
                    key={area}
                    className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.areas.includes(area)}
                      onChange={() => handleAreaChange(area)}
                      className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">
                      {t(`areaOptions.${area}`)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.areas && (
                <p className="text-red-500 text-sm mt-1">{errors.areas}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </button>
            </div>
          </form>
        </div>

        {/* Why Volunteer */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-primary-700 mb-4">
              {t('whyVolunteer')}
            </h3>
            <p className="text-gray-700">
              {t('whyVolunteerText')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-primary-700 mb-4">
              {t('commitment')}
            </h3>
            <p className="text-gray-700">
              {t('commitmentText')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-primary-700 mb-4">
              {t('training')}
            </h3>
            <p className="text-gray-700">
              {t('trainingText')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
