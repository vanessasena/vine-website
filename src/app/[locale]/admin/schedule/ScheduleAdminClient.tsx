'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faChurch,
  faHome,
  faUsers,
  faTint,
  faMusic,
  faGuitar,
  faHandshake,
  faCalendar,
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faToggleOn,
  faToggleOff,
} from '@fortawesome/free-solid-svg-icons';
import { getSession } from '@/lib/auth';
import { isAdminOrTrainee } from '@/lib/roles';
import { useApiCall } from '@/lib/hooks/useApiCall';
import { Database } from '@/lib/database.types';

type ScheduleEvent = Database['public']['Tables']['schedule_events']['Row'];
type ScheduleEventInsert = Database['public']['Tables']['schedule_events']['Insert'];

// Available icons for schedule events
const SCHEDULE_ICONS = [
  { name: 'faBook', icon: faBook, label: 'Book' },
  { name: 'faChurch', icon: faChurch, label: 'Church' },
  { name: 'faHome', icon: faHome, label: 'Home' },
  { name: 'faUsers', icon: faUsers, label: 'Users/Group' },
  { name: 'faMusic', icon: faMusic, label: 'Music' },
  { name: 'faGuitar', icon: faGuitar, label: 'Guitar' },
  { name: 'faHandshake', icon: faHandshake, label: 'Handshake' },
  { name: 'faTint', icon: faTint, label: 'Water/Baptism' },
  { name: 'faCalendar', icon: faCalendar, label: 'Calendar' },
];

const ICON_MAP: Record<string, any> = {
  faBook,
  faChurch,
  faHome,
  faUsers,
  faMusic,
  faGuitar,
  faHandshake,
  faTint,
  faCalendar,
};

const DAYS_OF_WEEK = [
  { value: 0, label_pt: 'Domingo', label_en: 'Sunday' },
  { value: 1, label_pt: 'Segunda-feira', label_en: 'Monday' },
  { value: 2, label_pt: 'Terça-feira', label_en: 'Tuesday' },
  { value: 3, label_pt: 'Quarta-feira', label_en: 'Wednesday' },
  { value: 4, label_pt: 'Quinta-feira', label_en: 'Thursday' },
  { value: 5, label_pt: 'Sexta-feira', label_en: 'Friday' },
  { value: 6, label_pt: 'Sábado', label_en: 'Saturday' },
];

interface Props {
  locale: string;
}

export default function ScheduleAdminClient({ locale }: Props) {
  const router = useRouter();
  const t = useTranslations('adminSchedule');
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'weekly' | 'special'>('weekly');
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isDatabaseSetup, setIsDatabaseSetup] = useState(true);
  const { call: apiCall } = useApiCall();

  // Form state
  const [formData, setFormData] = useState<Partial<ScheduleEventInsert>>({
    title_pt: '',
    title_en: '',
    description_pt: '',
    description_en: '',
    event_type: 'weekly_recurring',
    day_of_week: 0,
    time: '',
    icon_name: 'faChurch',
    display_order: 0,
    special_date: null,
    frequency_pt: '',
    frequency_en: '',
    is_active: true,
  });

  // Fetch events
  const fetchEvents = useCallback(async () => {
    const { data: response, error } = await apiCall('/api/schedule-events', {
      method: 'GET',
    });

    if (error) {
      // Check if it's a database table error
      const errorCode = error.details?.code || '';
      const errorDbMessage = error.details?.dbError || '';
      const isTableError =
        error.type === 'server_error' &&
        (errorCode === 'DATABASE_ERROR' ||
         error.message?.includes('relation') ||
         error.message?.includes('does not exist') ||
         errorDbMessage?.includes('relation') ||
         errorDbMessage?.includes('does not exist'));

      if (isTableError) {
        setIsDatabaseSetup(false);
        setErrorMessage(
          locale === 'pt'
            ? 'Tabela não encontrada. Execute os scripts SQL no Supabase primeiro.'
            : 'Table not found. Please run the SQL scripts in Supabase first.'
        );
      } else {
        setErrorMessage(t('messages.fetchError'));
      }
      setEvents([]); // Ensure events is always an array even on error
      return;
    }

    setIsDatabaseSetup(true);
    // Extract the actual events array from the response object
    const eventsData = (response as any)?.data || [];
    setEvents(eventsData);
  }, [apiCall, t, locale]);

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      const session = await getSession();
      if (!session) {
        router.push(`/${locale}/login`);
        return;
      }

      const hasPermission = await isAdminOrTrainee(session.user.id);
      if (!hasPermission) {
        router.push(`/${locale}`);
        return;
      }

      setLoading(false);
      fetchEvents();
    }
    checkAuth();
  }, [locale, router, fetchEvents]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title_pt || !formData.title_en || !formData.time || !formData.icon_name) {
      setErrorMessage(t('messages.validationError'));
      return;
    }

    if (formData.event_type === 'weekly_recurring' && formData.day_of_week === null) {
      setErrorMessage(t('messages.dayOfWeekRequired'));
      return;
    }

    const isEditing = !!editingEvent;
    const url = isEditing ? `/api/schedule-events/${editingEvent.id}` : '/api/schedule-events';
    const method = isEditing ? 'PUT' : 'POST';

    const { data, error } = await apiCall(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (error) {
      setErrorMessage(isEditing ? t('messages.updateError') : t('messages.createError'));
      return;
    }

    setSuccessMessage(isEditing ? t('messages.updated') : t('messages.created'));
    setTimeout(() => setSuccessMessage(''), 3000);

    resetForm();
    fetchEvents();
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm(t('messages.deleteConfirm'))) return;

    const { error } = await apiCall(`/api/schedule-events/${id}`, {
      method: 'DELETE',
    });

    if (error) {
      setErrorMessage(t('messages.deleteError'));
      return;
    }

    setSuccessMessage(t('messages.deleted'));
    setTimeout(() => setSuccessMessage(''), 3000);
    fetchEvents();
  };

  // Reset form
  const resetForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title_pt: '',
      title_en: '',
      description_pt: '',
      description_en: '',
      event_type: activeTab === 'weekly' ? 'weekly_recurring' : 'special',
      day_of_week: 0,
      time: '',
      icon_name: 'faChurch',
      display_order: 0,
      special_date: null,
      frequency_pt: '',
      frequency_en: '',
      is_active: true,
    });
  };

  // Start editing
  const startEdit = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setFormData(event);
    setShowForm(true);
  };

  // Filter events by type
  const weeklyEvents = events.filter(e => e.event_type === 'weekly_recurring');
  const specialEvents = events.filter(e => e.event_type === 'special');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        {/* Database Setup Warning */}
        {!isDatabaseSetup && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">
                  {locale === 'pt' ? 'Configuração Necessária' : 'Setup Required'}
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p className="mb-2">
                    {locale === 'pt'
                      ? 'A tabela de eventos da agenda ainda não foi criada no banco de dados.'
                      : 'The schedule events table has not been created in the database yet.'
                    }
                  </p>
                  <p className="font-semibold mb-2">
                    {locale === 'pt' ? 'Para configurar:' : 'To set up:'}
                  </p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>
                      {locale === 'pt'
                        ? 'Abra o Supabase SQL Editor'
                        : 'Open Supabase SQL Editor'
                      }
                    </li>
                    <li>
                      {locale === 'pt'
                        ? 'Execute o arquivo: database/schedule-events-schema.sql'
                        : 'Run the file: database/schedule-events-schema.sql'
                      }
                    </li>
                    <li>
                      {locale === 'pt'
                        ? 'Execute o arquivo: database/schedule-events-migration.sql'
                        : 'Run the file: database/schedule-events-migration.sql'
                      }
                    </li>
                    <li>
                      {locale === 'pt'
                        ? 'Recarregue esta página'
                        : 'Reload this page'
                      }
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => {
                setActiveTab('weekly');
                setFormData({ ...formData, event_type: 'weekly_recurring' });
              }}
              className={`${
                activeTab === 'weekly'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {t('weeklyEvents')} ({weeklyEvents.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('special');
                setFormData({ ...formData, event_type: 'special' });
              }}
              className={`${
                activeTab === 'special'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              {t('specialEvents')} ({specialEvents.length})
            </button>
          </nav>
        </div>

        {/* Add Event Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {t('addEvent')}
            </button>
          </div>
        )}

        {/* Event Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingEvent ? t('editEvent') : t('addEvent')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Title PT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.titlePt')} *
                  </label>
                  <input
                    type="text"
                    value={formData.title_pt || ''}
                    onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                {/* Title EN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.titleEn')} *
                  </label>
                  <input
                    type="text"
                    value={formData.title_en || ''}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                {/* Description PT */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.descriptionPt')}
                  </label>
                  <input
                    type="text"
                    value={formData.description_pt || ''}
                    onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Description EN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.descriptionEn')}
                  </label>
                  <input
                    type="text"
                    value={formData.description_en || ''}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Day of Week (for weekly events) */}
                {formData.event_type === 'weekly_recurring' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.dayOfWeek')} *
                    </label>
                    <select
                      value={formData.day_of_week ?? 0}
                      onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      required
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day.value} value={day.value}>
                          {locale === 'pt' ? day.label_pt : day.label_en}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Special Date (for special events) */}
                {formData.event_type === 'special' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.specialDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.special_date || ''}
                      onChange={(e) => setFormData({ ...formData, special_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                )}

                {/* Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.time')} *
                  </label>
                  <input
                    type="text"
                    value={formData.time || ''}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="19:30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.icon')} *
                  </label>
                  <select
                    value={formData.icon_name || 'faChurch'}
                    onChange={(e) => setFormData({ ...formData, icon_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    {SCHEDULE_ICONS.map(iconOption => (
                      <option key={iconOption.name} value={iconOption.name}>
                        {iconOption.label}
                      </option>
                    ))}
                  </select>
                  {/* Icon Preview */}
                  <div className="mt-2 text-3xl text-primary-600">
                    <FontAwesomeIcon icon={ICON_MAP[formData.icon_name || 'faChurch'] || faCalendar} />
                  </div>
                </div>

                {/* Display Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.displayOrder')}
                  </label>
                  <input
                    type="number"
                    value={formData.display_order ?? 0}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                {/* Frequency PT (for special events) */}
                {formData.event_type === 'special' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('form.frequencyPt')}
                      </label>
                      <input
                        type="text"
                        value={formData.frequency_pt || ''}
                        onChange={(e) => setFormData({ ...formData, frequency_pt: e.target.value })}
                        placeholder="Primeiro domingo de cada mês"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Frequency EN */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('form.frequencyEn')}
                      </label>
                      <input
                        type="text"
                        value={formData.frequency_en || ''}
                        onChange={(e) => setFormData({ ...formData, frequency_en: e.target.value })}
                        placeholder="First Sunday of each month"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </>
                )}

                {/* Is Active */}
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mr-4">
                    {t('form.isActive')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`text-2xl ${formData.is_active ? 'text-green-600' : 'text-gray-400'}`}
                  >
                    <FontAwesomeIcon icon={formData.is_active ? faToggleOn : faToggleOff} />
                  </button>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  <FontAwesomeIcon icon={faSave} className="mr-2" />
                  {editingEvent ? t('form.save') : t('form.create')}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  {t('form.cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.icon')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.time')}
                </th>
                {activeTab === 'weekly' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('table.day')}
                  </th>
                )}
                {activeTab === 'special' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('table.date')}
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(activeTab === 'weekly' ? weeklyEvents : specialEvents).map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-2xl text-primary-600">
                      <FontAwesomeIcon icon={ICON_MAP[event.icon_name] || faCalendar} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {locale === 'pt' ? event.title_pt : event.title_en}
                    </div>
                    {event.description_pt && (
                      <div className="text-sm text-gray-500">
                        {locale === 'pt' ? event.description_pt : event.description_en}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.time}
                  </td>
                  {activeTab === 'weekly' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {DAYS_OF_WEEK.find(d => d.value === event.day_of_week)?.[locale === 'pt' ? 'label_pt' : 'label_en']}
                    </td>
                  )}
                  {activeTab === 'special' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.special_date || event.frequency_pt}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {event.is_active ? t('table.active') : t('table.inactive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => startEdit(event)}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(activeTab === 'weekly' ? weeklyEvents : specialEvents).length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {t('table.noEvents')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
