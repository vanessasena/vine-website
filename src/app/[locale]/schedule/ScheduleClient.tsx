'use client';

import { useState, useEffect } from 'react';
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
} from '@fortawesome/free-solid-svg-icons';
import { Database } from '@/lib/database.types';
import { formatLocalDate } from '@/lib/utils';

type ScheduleEvent = Database['public']['Tables']['schedule_events']['Row'];

// Icon mapping
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

export default function ScheduleClient({ locale }: Props) {
  const [weeklyEvents, setWeeklyEvents] = useState<ScheduleEvent[]>([]);
  const [specialEvents, setSpecialEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/schedule-events');
        const result = await response.json();

        if (result.success && result.data) {
          const weekly = result.data
            .filter((e: ScheduleEvent) => e.event_type === 'weekly_recurring')
            .sort((a: ScheduleEvent, b: ScheduleEvent) => {
              if (a.day_of_week !== b.day_of_week) {
                return (a.day_of_week || 0) - (b.day_of_week || 0);
              }
              return a.display_order - b.display_order;
            });

          const special = result.data
            .filter((e: ScheduleEvent) => e.event_type === 'special')
            .sort((a: ScheduleEvent, b: ScheduleEvent) => {
              if (a.special_date && b.special_date) {
                return a.special_date.localeCompare(b.special_date);
              }
              return a.display_order - b.display_order;
            });

          setWeeklyEvents(weekly);
          setSpecialEvents(special);
        }
      } catch (error) {
        console.error('Error fetching schedule events:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-600">
            {locale === 'pt' ? 'Carregando...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Weekly Schedule */}
      {weeklyEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {weeklyEvents.map((event) => {
                const icon = ICON_MAP[event.icon_name] || faCalendar;
                const dayLabel = DAYS_OF_WEEK.find(d => d.value === event.day_of_week);

                return (
                  <div key={event.id} className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="text-4xl mb-4 text-primary-600">
                      <FontAwesomeIcon icon={icon} />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-700 mb-4">
                      {locale === 'pt' ? event.title_pt : event.title_en}
                    </h3>
                    <div className="text-3xl font-bold text-secondary-600 mb-2">
                      {event.time}
                    </div>
                    {event.description_pt && (
                      <p className="text-lg text-gray-700 font-semibold">
                        {locale === 'pt' ? event.description_pt : event.description_en}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Special Events */}
      {specialEvents.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              {locale === 'pt' ? 'Eventos Especiais' : 'Special Events'}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {specialEvents.map((event) => {
                const icon = ICON_MAP[event.icon_name] || faCalendar;

                return (
                  <div
                    key={event.id}
                    className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg shadow-lg p-8 text-center"
                  >
                    <div className="text-4xl mb-4 text-primary-600">
                      <FontAwesomeIcon icon={icon} />
                    </div>
                    <h3 className="text-2xl font-bold text-primary-700 mb-4">
                      {locale === 'pt' ? event.title_pt : event.title_en}
                    </h3>
                    {event.frequency_pt && (
                      <div className="text-xl font-bold text-secondary-700 mb-2">
                        {locale === 'pt' ? event.frequency_pt : event.frequency_en}
                      </div>
                    )}
                    {event.special_date && (
                      <div className="text-xl font-bold text-secondary-700 mb-2">
                        {formatLocalDate(event.special_date)}
                      </div>
                    )}
                    <div className="text-lg text-gray-700">
                      {event.time}
                    </div>
                    {event.description_pt && (
                      <p className="text-sm text-gray-600 italic mt-2">
                        {locale === 'pt' ? event.description_pt : event.description_en}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
