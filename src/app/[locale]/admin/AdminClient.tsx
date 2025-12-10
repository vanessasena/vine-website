'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faArrowLeft,
  faEye,
  faSave,
  faTimes,
  faSpinner,
  faDatabase,
  faFile,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons';
import { getSession, signOut } from '@/lib/auth';

interface Sermon {
  id: string;
  title: {
    pt: string;
    en: string;
  };
  preacher: string;
  date: string;
  excerpt: {
    pt: string;
    en: string;
  };
  content: {
    pt: string;
    en: string;
  };
  scripture?: string;
}

interface SermonFormData {
  id: string;
  title_pt: string;
  title_en: string;
  preacher: string;
  date: string;
  excerpt_pt: string;
  excerpt_en: string;
  content_pt: string;
  content_en: string;
  scripture: string;
}

const emptyFormData: SermonFormData = {
  id: '',
  title_pt: '',
  title_en: '',
  preacher: '',
  date: '',
  excerpt_pt: '',
  excerpt_en: '',
  content_pt: '',
  content_en: '',
  scripture: '',
};

// Helper function to escape HTML entities to prevent XSS
function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

// Simple component to render markdown-like content for preview
function MarkdownPreview({ content }: { content: string }) {
  const formatContent = (text: string) => {
    return text
      .split('\n')
      .map((line, index) => {
        // Headers
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2 mt-6">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-bold text-gray-800 mt-6 mb-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-semibold text-gray-800 mt-4 mb-2">{line.slice(4)}</h3>;
        }

        // Blockquotes
        if (line.startsWith('> ')) {
          return (
            <blockquote key={index} className="border-l-4 border-primary-500 bg-primary-50 p-3 my-4 italic text-gray-700">
              {line.slice(2)}
            </blockquote>
          );
        }

        // List items
        if (line.startsWith('- ')) {
          return <li key={index} className="text-gray-700 mb-1 ml-4 list-disc">{line.slice(2)}</li>;
        }
        if (/^\d+\. /.test(line)) {
          return <li key={index} className="text-gray-700 mb-1 ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        }

        // Empty lines
        if (line.trim() === '') {
          return <br key={index} />;
        }

        // Horizontal rule
        if (line === '---') {
          return <hr key={index} className="my-6 border-gray-300" />;
        }

        // Regular paragraphs - escape HTML first, then apply markdown formatting
        const escapedLine = escapeHtml(line);
        const processedLine = escapedLine
          .replace(/\*\*\*(.*?)\*\*\*/g, '<strong class="font-bold italic">$1</strong>')
          .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-primary-700">$1</strong>')
          .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>');

        return (
          <p key={index} className="text-gray-700 mb-3" dangerouslySetInnerHTML={{ __html: processedLine }} />
        );
      });
  };

  return <div className="prose prose-sm max-w-none">{formatContent(content)}</div>;
}

export default function AdminClient({ locale }: { locale: string }) {
  const t = useTranslations('admin');
  const router = useRouter();

  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'database' | 'static'>('static');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);
  const [formData, setFormData] = useState<SermonFormData>(emptyFormData);
  const [saving, setSaving] = useState(false);

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewLanguage, setPreviewLanguage] = useState<'pt' | 'en'>('pt');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuthentication() {
      const session = await getSession();
      if (!session) {
        router.push(`/${locale}/login`);
      } else {
        setAuthenticated(true);
        setCheckingAuth(false);
      }
    }
    checkAuthentication();
  }, [locale, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push(`/${locale}/login`);
  };

  const fetchSermons = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sermons');
      const data = await response.json();
      setSermons(data.sermons || []);
      setDataSource(data.source || 'static');
    } catch (err) {
      setError(t('messages.loadError'));
      console.error('Error fetching sermons:', err);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Fetch sermons on component mount
  useEffect(() => {
    fetchSermons();
  }, [fetchSermons]);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddNew = () => {
    setEditingSermon(null);
    setFormData(emptyFormData);
    setShowForm(true);
    setShowPreview(false);
  };

  const handleEdit = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setFormData({
      id: sermon.id,
      title_pt: sermon.title.pt,
      title_en: sermon.title.en,
      preacher: sermon.preacher,
      date: sermon.date,
      excerpt_pt: sermon.excerpt.pt,
      excerpt_en: sermon.excerpt.en,
      content_pt: sermon.content.pt,
      content_en: sermon.content.en,
      scripture: sermon.scripture || '',
    });
    setShowForm(true);
    setShowPreview(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSermon(null);
    setFormData(emptyFormData);
    setShowPreview(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = editingSermon
        ? `/api/sermons/${editingSermon.id}`
        : '/api/sermons';
      const method = editingSermon ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save sermon');
      }

      setSuccessMessage(editingSermon ? t('messages.updated') : t('messages.created'));
      handleCancel();
      fetchSermons();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.error'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/sermons/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete sermon');
      }

      setSuccessMessage(t('messages.deleted'));
      setDeleteConfirm(null);
      fetchSermons();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('messages.error'));
    }
  };

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString(locale === 'pt' ? 'pt-BR' : 'en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin h-12 w-12 text-primary-600 mb-4" />
          <p className="text-gray-600">{t('checkingAuth')}</p>
        </div>
      </div>
    );
  }

  // Don't render the admin panel if not authenticated
  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="mt-2 text-white text-opacity-90">{t('subtitle')}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                {t('signOut')}
              </button>
              <Link
                href={`/${locale}`}
                className="inline-flex items-center bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                {t('backToSite')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Links Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`/${locale}/admin/vine-kids-gallery`}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-accent-600"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {locale === 'pt' ? 'Galeria Vine Kids' : 'Vine Kids Gallery'}
            </h3>
            <p className="text-gray-600 text-sm">
              {locale === 'pt' ? 'Gerenciar imagens da galeria Vine Kids' : 'Manage Vine Kids gallery images'}
            </p>
          </Link>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-primary-600">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {locale === 'pt' ? 'Gerenciar Palavras' : 'Manage Sermons'}
            </h3>
            <p className="text-gray-600 text-sm">
              {locale === 'pt' ? 'Adicionar, editar ou remover palavras' : 'Add, edit, or remove sermons'}
            </p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Data Source Indicator */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <FontAwesomeIcon
              icon={dataSource === 'database' ? faDatabase : faFile}
              className={`mr-2 ${dataSource === 'database' ? 'text-green-600' : 'text-yellow-600'}`}
            />
            <span>{t('source')}: </span>
            <span className="font-medium ml-1">
              {dataSource === 'database' ? t('database') : t('static')}
            </span>
          </div>

          {!showForm && (
            <button
              onClick={handleAddNew}
              className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              {t('addSermon')}
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingSermon ? t('editSermon') : t('addSermon')}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={showPreview ? faEdit : faEye} className="mr-2" />
                  {showPreview ? t('edit') : t('preview')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  {t('cancel')}
                </button>
              </div>
            </div>

            {showPreview ? (
              // Preview Mode
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="mb-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewLanguage('pt')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      previewLanguage === 'pt'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Português
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLanguage('en')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      previewLanguage === 'en'
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    English
                  </button>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {previewLanguage === 'pt' ? formData.title_pt : formData.title_en}
                  </h3>
                  {formData.scripture && (
                    <p className="text-primary-600 font-medium mb-4">{formData.scripture}</p>
                  )}
                  <div className="flex gap-4 text-sm text-gray-600 mb-6">
                    <span>{formData.preacher}</span>
                    {formData.date && <span>{formatDate(formData.date)}</span>}
                  </div>
                  <div className="border-t pt-4">
                    <MarkdownPreview
                      content={previewLanguage === 'pt' ? formData.content_pt : formData.content_en}
                    />
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ID Field */}
                <div>
                  <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('form.id')} *
                  </label>
                  <input
                    type="text"
                    id="id"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    disabled={!!editingSermon}
                    required
                    pattern="[a-z0-9-]+"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100"
                    placeholder="sermon-title-2025-01-01"
                  />
                  <p className="mt-1 text-sm text-gray-500">{t('form.idHelp')}</p>
                </div>

                {/* Titles */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title_pt" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.titlePt')} *
                    </label>
                    <input
                      type="text"
                      id="title_pt"
                      name="title_pt"
                      value={formData.title_pt}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="title_en" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.titleEn')} *
                    </label>
                    <input
                      type="text"
                      id="title_en"
                      name="title_en"
                      value={formData.title_en}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Preacher, Date, Scripture */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="preacher" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.preacher')} *
                    </label>
                    <input
                      type="text"
                      id="preacher"
                      name="preacher"
                      value={formData.preacher}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Pr Boris Carvalho"
                    />
                  </div>
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.date')} *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="scripture" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.scripture')}
                    </label>
                    <input
                      type="text"
                      id="scripture"
                      name="scripture"
                      value={formData.scripture}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="John 3:16"
                    />
                    <p className="mt-1 text-sm text-gray-500">{t('form.scriptureHelp')}</p>
                  </div>
                </div>

                {/* Excerpts */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="excerpt_pt" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.excerptPt')} *
                    </label>
                    <textarea
                      id="excerpt_pt"
                      name="excerpt_pt"
                      value={formData.excerpt_pt}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="excerpt_en" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.excerptEn')} *
                    </label>
                    <textarea
                      id="excerpt_en"
                      name="excerpt_en"
                      value={formData.excerpt_en}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="content_pt" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.contentPt')} *
                    </label>
                    <textarea
                      id="content_pt"
                      name="content_pt"
                      value={formData.content_pt}
                      onChange={handleInputChange}
                      required
                      rows={15}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">{t('form.contentHelp')}</p>
                  </div>
                  <div>
                    <label htmlFor="content_en" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.contentEn')} *
                    </label>
                    <textarea
                      id="content_en"
                      name="content_en"
                      value={formData.content_en}
                      onChange={handleInputChange}
                      required
                      rows={15}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                    />
                    <p className="mt-1 text-sm text-gray-500">{t('form.contentHelp')}</p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors duration-200"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                        {t('saving')}
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faSave} className="mr-2" />
                        {t('save')}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Sermons List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FontAwesomeIcon icon={faSpinner} className="text-4xl text-primary-600 animate-spin" />
          </div>
        ) : sermons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">{t('noSermons')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Título' : 'Title'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Pregador' : 'Preacher'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Data' : 'Date'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {locale === 'pt' ? 'Ações' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sermons.map((sermon) => (
                  <tr key={sermon.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {sermon.title[locale as 'pt' | 'en']}
                      </div>
                      {sermon.scripture && (
                        <div className="text-sm text-gray-500">{sermon.scripture}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{sermon.preacher}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(sermon.date)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/${locale}/sermons/${sermon.id}`}
                          className="text-gray-600 hover:text-primary-600 p-2"
                          title={t('preview')}
                        >
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                        <button
                          onClick={() => handleEdit(sermon)}
                          className="text-gray-600 hover:text-primary-600 p-2"
                          title={t('edit')}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        {deleteConfirm === sermon.id ? (
                          <div className="flex items-center gap-2 bg-red-50 rounded-lg px-2">
                            <span className="text-xs text-red-600">{t('confirmDelete')}</span>
                            <button
                              onClick={() => handleDelete(sermon.id)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-gray-600 hover:text-gray-800 p-1"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(sermon.id)}
                            className="text-gray-600 hover:text-red-600 p-2"
                            title={t('deleteSermon')}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
