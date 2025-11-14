import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCalendarAlt,
  faUser,
  faBible
} from '@fortawesome/free-solid-svg-icons';
import { getSermonById, formatDate } from '@/data/sermons';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    locale: string;
    id: string;
  };
}

// Simple component to render markdown-like content
function SermonContent({ content }: { content: string }) {
  // Convert basic markdown to HTML-like structure
  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 border-b-2 border-primary-200 pb-2 mt-8">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl md:text-3xl font-bold text-gray-800 mt-8 mb-4">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl md:text-2xl font-semibold text-gray-800 mt-6 mb-3">{line.slice(4)}</h3>;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-primary-500 bg-primary-50 p-4 my-6 italic text-gray-800 text-lg">
              {line.slice(2)}
            </blockquote>
          );
        }

        // List items
        if (line.startsWith('- ')) {
          return <li key={index} className="text-lg leading-relaxed mb-2 ml-6 list-disc">{line.slice(2)}</li>;
        }
        if (/^\d+\. /.test(line)) {
          return <li key={index} className="text-lg leading-relaxed mb-2 ml-6 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        }

        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }

        // Horizontal rule
        if (line === '---') {
          return <hr key={index} className="my-8 border-gray-300" />;
        }

        // Regular paragraphs
        const processedLine = line
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary-700">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>');

        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4 text-lg" dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      });
  };

  return <div className="space-y-2">{formatContent(content)}</div>;
}

export default function SermonDetailPage({ params: { locale, id } }: PageProps) {
  const t = useTranslations('sermons');
  const sermon = getSermonById(id);

  if (!sermon) {
    notFound();
  }

  return (
    <main>
      <Navigation locale={locale} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}/sermons`}
            className="inline-flex items-center text-white text-opacity-80 hover:text-white mb-6 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            {t('backToSermons')}
          </Link>

          <div className="text-center">
            <div className="mb-6">
              <FontAwesomeIcon icon={faBible} className="text-5xl mb-4" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6">
              {sermon.title[locale as 'pt' | 'en']}
            </h1>
            {sermon.scripture && (
              <p className="text-xl md:text-2xl text-white text-opacity-90 mb-6">
                {sermon.scripture}
              </p>
            )}
            <div className="flex flex-wrap justify-center gap-6 text-sm md:text-base">
              <div className="flex items-center">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span className="font-medium">{t('preachedBy')}:</span>
                <span className="ml-1">{sermon.preacher}</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                <span className="font-medium">{t('preachedOn')}:</span>
                <span className="ml-1">{formatDate(sermon.date, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sermon Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none">
            <SermonContent content={sermon.content[locale as 'pt' | 'en']} />
          </article>

          {/* Back to Sermons Button */}
          <div className="mt-12 text-center">
            <Link
              href={`/${locale}/sermons`}
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              {t('backToSermons')}
            </Link>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}