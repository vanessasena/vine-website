import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Image from 'next/image';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function AboutPage({ params: { locale } }: PageProps) {
  const t = useTranslations('about');

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
          <h2 className="text-2xl md:text-3xl text-secondary-100 mb-8">
            {t('subtitle')}
          </h2>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* About Content */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('content')}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('content2')}
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('content3')}
              </p>
              <blockquote className="border-l-4 border-primary-500 pl-6 italic text-lg text-gray-700">
                {t('content4')}
              </blockquote>
            </div>

            <div className="space-y-6">
              <Image
                src="https://images.unsplash.com/photo-1507692049790-de58290a4334?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Church Community"
                width={800}
                height={500}
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Vision, Cell Church, and History Sections */}
          <div className="grid md:grid-cols-3 gap-8">

            {/* Vision */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-bold text-primary-700">
                  {t('vision')}
                </h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('visionText')}
              </p>
            </div>

            {/* Cell Church */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">🏠</div>
                <h3 className="text-2xl font-bold text-primary-700">
                  {t('cellChurch')}
                </h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('cellChurchText')}
              </p>
            </div>

            {/* History */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-2xl font-bold text-primary-700">
                  {t('history')}
                </h3>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {t('historyText')}
              </p>
            </div>

          </div>

          {/* Pastor Section */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
              <div className="mb-6">
                <Image
                  src="https://muoxstvqqsuhgsywddhr.supabase.co/storage/v1/object/public/website/boris.jpg"
                  alt="Pastor Boris Carvalho"
                  width={150}
                  height={150}
                  className="rounded-full mx-auto mb-4"
                />
                <h3 className="text-2xl font-bold text-primary-700 mb-2">
                  {t('pastor')}
                </h3>
                <p className="text-gray-600">Pastor Titular</p>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                Pastor Boris Carvalho lidera a Vine Church Cambridge com paixão pelo Reino de Deus e pelo crescimento espiritual de cada membro da igreja.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Faça Parte da Nossa Família
          </h2>
          <p className="text-xl mb-8">
            Venha conhecer nossa igreja e fazer parte desta família de vencedores!
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">📍 Localização</h3>
              <p>55 Dickson St, Cambridge, ON N1R 7A5</p>
            </div>
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">⏰ Horário do Culto</h3>
              <p>Domingo às 10 AM</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 Vine Church Cambridge. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}