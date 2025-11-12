import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import {
  faHandshake,
  faBook,
  faPrayingHands,
  faHeart,
  faUsers,
  faChalkboardTeacher,
  faChild,
  faSeedling,
  faMapMarkerAlt,
  faClock,
  faUserTie,
  faEnvelope,
  faHandsHelping
} from '@fortawesome/free-solid-svg-icons';
import '@/lib/fontawesome';

interface PageProps {
  params: {
    locale: string;
  };
}

export default function HomePage({ params: { locale } }: PageProps) {
  const t = useTranslations('about');

  return (
    <main className="min-h-screen">
      <Navigation locale={locale} />
      <Hero />

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h2>
            <h3 className="text-xl md:text-2xl text-primary-600 mb-8">
              {t('subtitle')}
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
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
              <p className="text-gray-700 text-lg leading-relaxed italic border-l-4 border-primary-500 pl-4">
                {t('content4')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-8">
              <h4 className="text-2xl font-bold text-primary-700 mb-4">
                {t('vision')}
              </h4>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {t('visionText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que nós valorizamos
            </h2>
            <p className="text-xl text-gray-600">
              Com base na Igreja Primitiva de Atos dos Apóstolos
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Unity */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faHandshake} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Unidade</h3>
              <p className="text-gray-700">
                Percebemos que uma das características da Igreja Primitiva era unidade. A Bíblia diz que eles eram unânimes em tudo o que faziam.
              </p>
            </div>

            {/* Teaching */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faBook} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ensino</h3>
              <p className="text-gray-700">
                Cremos que a Bíblia é a Palavra de Deus. Por isso, prezamos sempre pelo ensino fiel das Escrituras desde os mais novos até os mais velhos.
              </p>
            </div>

            {/* Prayer */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faPrayingHands} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Oração</h3>
              <p className="text-gray-700">
                Fomos criados para termos um relacionamento de intimidade com Deus. Uma das maneiras de obtermos esta intimidade é através da oração.
              </p>
            </div>

            {/* Service */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faHandsHelping} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Serviço</h3>
              <p className="text-gray-700">
                De acordo com a Palavra de Deus devemos fazer o bem a todos principalmente aos da família de fé. Amamos ser abençoadores.
              </p>
            </div>

            {/* Fellowship */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Comunhão</h3>
              <p className="text-gray-700">
                Mais do que uma igreja, os discípulos de Cristo viviam uma vida compartilhada, de uns pelos outros. Era a Comunidade dos Discípulos.
              </p>
            </div>

            {/* Discipleship */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faChalkboardTeacher} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Discipulado</h3>
              <p className="text-gray-700">
                Ide e fazei discípulos. Essa é a Grande Comissão. Mais do que pregarmos o Evangelho, queremos fazer discípulos de Cristo Jesus.
              </p>
            </div>

            {/* Love */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faHeart} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Amor</h3>
              <p className="text-gray-700">
                Amar a Deus acima de todas as coisas e amar ao próximo como a nós mesmos. Dois mandamentos que procuramos viver de maneira prática.
              </p>
            </div>

            {/* Children */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faChild} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Crianças</h3>
              <p className="text-gray-700">
                Cremos que devemos ensinar as crianças a andarem no caminho do Senhor. O nosso lema é: criança não dá trabalho, criança dá frutos.
              </p>
            </div>

            {/* Multiplication */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4 text-primary-600">
                <FontAwesomeIcon icon={faSeedling} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multiplicação</h3>
              <p className="text-gray-700">
                A vontade de Deus é que todos sejam salvos e cheguem ao pleno conhecimento da Verdade. Queremos fazer a diferença na nossa geração.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">Contato</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-4xl mb-4 text-white">
                <FontAwesomeIcon icon={faMapMarkerAlt} />
              </div>
              <h3 className="text-xl font-bold mb-2">Endereço</h3>
              <p className="text-lg">55 Dickson St, Cambridge, ON N1R 7A5</p>
            </div>

            <div>
              <div className="text-4xl mb-4 text-white">
                <FontAwesomeIcon icon={faClock} />
              </div>
              <h3 className="text-xl font-bold mb-2">Culto</h3>
              <p className="text-lg">Domingo às 10 AM</p>
            </div>

            <div>
              <div className="text-4xl mb-4 text-white">
                <FontAwesomeIcon icon={faUserTie} />
              </div>
              <h3 className="text-xl font-bold mb-2">Pastor</h3>
              <p className="text-lg">Pr Boris Carvalho</p>
            </div>

            <div>
              <div className="text-4xl mb-4 text-white">
                <FontAwesomeIcon icon={faWhatsapp} />
              </div>
              <h3 className="text-xl font-bold mb-2">WhatsApp</h3>
              <a href="https://wa.me/13652282980" target="_blank" className="text-lg hover:text-secondary-200">
                +1 365 228 2980
              </a>
            </div>

            <div>
              <div className="text-4xl mb-4 text-white">
                <FontAwesomeIcon icon={faEnvelope} />
              </div>
              <h3 className="text-xl font-bold mb-2">E-mail</h3>
              <a href="mailto:videiracanada@gmail.com" className="text-lg hover:text-secondary-200">
                videiracanada@gmail.com
              </a>
            </div>

            <div>
              <div className="text-4xl mb-4 text-white">
                <FontAwesomeIcon icon={faInstagram} />
              </div>
              <h3 className="text-xl font-bold mb-2">Instagram</h3>
              <a href="https://www.instagram.com/vine_cambridge/" target="_blank" className="text-lg hover:text-secondary-200">
                @vine_cambridge
              </a>
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