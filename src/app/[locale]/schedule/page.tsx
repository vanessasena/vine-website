import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function SchedulePage({ params: { locale } }: PageProps) {
  const t = useTranslations('schedule');

  return (
    <main>
      <Navigation locale={locale} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t('title')}
          </h1>
          <p className="text-xl md:text-2xl text-secondary-100">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Schedule Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Weekly Schedule */}
          <div className="grid md:grid-cols-3 gap-8">

            {/* Tuesday */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('tuesday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('tuesdayTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('tuesdayEvent')}
              </p>
            </div>

            {/* Friday */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('friday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('fridayTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('fridayEvent')}
              </p>
            </div>

            {/* Sunday */}
            <div className="bg-white rounded-lg shadow-lg p-8 text-center border-2 border-primary-500">
              <div className="text-4xl mb-4">⛪</div>
              <h3 className="text-2xl font-bold text-primary-700 mb-4">
                {t('sunday')}
              </h3>
              <div className="text-3xl font-bold text-secondary-600 mb-2">
                {t('sundayTime')}
              </div>
              <p className="text-lg text-gray-700 font-semibold">
                {t('sundayEvent')}
              </p>
            </div>

          </div>

          {/* Special Events */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              {t('specialEvents')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">

              {/* Monthly Family Service */}
              <div className="bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-lg shadow-lg p-8 text-center">
                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">
                  {t('familyService')}
                </h3>
                <div className="text-xl font-bold text-secondary-700 mb-2">
                  {t('familyServiceDesc')}
                </div>
                <div className="text-lg text-gray-700">
                  {t('sundayTime')}
                </div>
              </div>

              {/* Baptism */}
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-lg p-8 text-center border-2 border-blue-400">
                <div className="text-4xl mb-4">💧</div>
                <h3 className="text-2xl font-bold text-primary-700 mb-4">
                  {t('baptism')}
                </h3>
                <div className="text-xl font-bold text-blue-700 mb-2">
                  {t('baptismDate')}
                </div>
                <div className="text-lg text-gray-700">
                  {t('baptismTime')}
                </div>
              </div>

            </div>
          </div>

          {/* Location Info */}
          <div className="mt-12 bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-4xl mb-4">📍</div>
            <h3 className="text-2xl font-bold text-primary-700 mb-4">
              {t('location')}
            </h3>
            <p className="text-xl text-gray-700 mb-6">
              {t('allEventsLocation')}
            </p>

            {/* Map Embed - You can replace this with actual Google Maps embed */}
            <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-gray-600">
                  {locale === 'pt' ? 'Mapa em breve' : 'Map coming soon'}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 grid md:grid-cols-3 gap-8">

            <div className="bg-primary-50 rounded-lg p-6">
              <h4 className="text-xl font-bold text-primary-700 mb-4">
                {locale === 'pt' ? 'Curso de Maturidade e CTL' : 'Maturity Course and CTL'}
              </h4>
              <p className="text-gray-700">
                {locale === 'pt'
                  ? 'Curso fundamental para o crescimento espiritual e formação de líderes. Essencial para quem deseja se aprofundar na Palavra e servir no Reino.'
                  : 'Fundamental course for spiritual growth and leader formation. Essential for those who want to deepen their understanding of the Word and serve in the Kingdom.'
                }
              </p>
            </div>

            <div className="bg-secondary-50 rounded-lg p-6">
              <h4 className="text-xl font-bold text-primary-700 mb-4">
                {locale === 'pt' ? 'Células nas Casas' : 'Home Life Groups'}
              </h4>
              <p className="text-gray-700">
                {locale === 'pt'
                  ? 'Encontros semanais em casas para comunhão, oração e estudo da Palavra. É onde vivemos a vida cristã em comunidade de forma prática.'
                  : 'Weekly home gatherings for fellowship, prayer, and Bible study. This is where we live the Christian life in community in a practical way.'
                }
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6">
              <h4 className="text-xl font-bold text-primary-700 mb-4">
                {locale === 'pt' ? 'Culto da Família' : 'Family Service'}
              </h4>
              <p className="text-gray-700">
                {locale === 'pt'
                  ? 'Uma celebração especial no primeiro domingo de cada mês, focada na família e na comunhão. Um momento especial para toda a família de Deus.'
                  : 'A special celebration on the first Sunday of each month, focused on family and fellowship. A special time for the whole family of God.'
                }
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {locale === 'pt' ? 'Venha Participar!' : 'Come Join Us!'}
          </h2>
          <p className="text-xl mb-8">
            {locale === 'pt'
              ? 'Todos são bem-vindos em nossos encontros. Venha fazer parte desta família!'
              : 'Everyone is welcome at our gatherings. Come be part of this family!'
            }
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'pt' ? '📞 Contato' : '📞 Contact'}
              </h3>
              <p>{locale === 'pt' ? 'Entre em contato conosco' : 'Get in touch with us'}</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">
                {locale === 'pt' ? '🤝 Primeira Visita' : '🤝 First Visit'}
              </h3>
              <p>{locale === 'pt' ? 'Não se preocupe, te ajudaremos' : "Don't worry, we'll help you"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Vine Church Cambridge. {locale === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}</p>
        </div>
      </footer>
    </main>
  );
}