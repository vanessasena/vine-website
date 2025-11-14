import React from 'react';
import { useTranslations } from 'next-intl';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBible,
  faCalendarAlt,
  faUser,
  faSearch,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import {
  getPaginatedSermons,
  formatDate,
  searchSermons,
  getSermonsByYear,
  getAvailableYears,
  getAllPreachers,
  getSermonsByPreacher,
  sermonSeries,
  getSermonsBySeries
} from '@/data/sermons-enhanced';

interface PageProps {
  params: {
    locale: string;
  };
  searchParams: {
    page?: string;
    search?: string;
    year?: string;
    preacher?: string;
    series?: string;
  };
}

export default function SermonsPage({
  params: { locale },
  searchParams
}: PageProps) {
  const t = useTranslations('sermons');
  const currentPage = parseInt(searchParams.page || '1');
  const searchQuery = searchParams.search;
  const selectedYear = searchParams.year ? parseInt(searchParams.year) : undefined;
  const selectedPreacher = searchParams.preacher;
  const selectedSeries = searchParams.series;

  // Get sermon data based on filters
  let sermons;
  let totalPages = 1;
  let totalSermons = 0;

  if (searchQuery) {
    const allResults = searchSermons(searchQuery, locale as 'pt' | 'en');
    sermons = allResults.slice((currentPage - 1) * 12, currentPage * 12);
    totalPages = Math.ceil(allResults.length / 12);
    totalSermons = allResults.length;
  } else if (selectedYear) {
    const allResults = getSermonsByYear(selectedYear);
    sermons = allResults.slice((currentPage - 1) * 12, currentPage * 12);
    totalPages = Math.ceil(allResults.length / 12);
    totalSermons = allResults.length;
  } else if (selectedPreacher) {
    const allResults = getSermonsByPreacher(selectedPreacher);
    sermons = allResults.slice((currentPage - 1) * 12, currentPage * 12);
    totalPages = Math.ceil(allResults.length / 12);
    totalSermons = allResults.length;
  } else if (selectedSeries) {
    const allResults = getSermonsBySeries(selectedSeries);
    sermons = allResults.slice((currentPage - 1) * 12, currentPage * 12);
    totalPages = Math.ceil(allResults.length / 12);
    totalSermons = allResults.length;
  } else {
    const result = getPaginatedSermons(currentPage);
    sermons = result.sermons;
    totalPages = result.totalPages;
    totalSermons = result.totalSermons;
  }

  const availableYears = getAvailableYears();
  const allPreachers = getAllPreachers();

  const buildURL = (params: Record<string, string | number | undefined>) => {
    const url = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.set(key, String(value));
      }
    });
    const queryString = url.toString();
    return `/${locale}/sermons${queryString ? `?${queryString}` : ''}`;
  };

  return (
    <main>
      <Navigation locale={locale} />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <FontAwesomeIcon icon={faBible} className="text-5xl mb-4" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            {t('title')}
          </h1>
          <p className="text-lg md:text-xl text-secondary-100 max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <form className="relative">
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  defaultValue={searchQuery || ''}
                  name="search"
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </form>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              {/* Year Filter */}
              <select
                value={selectedYear || ''}
                onChange={(e) => window.location.href = buildURL({
                  year: e.target.value || undefined,
                  preacher: selectedPreacher,
                  series: selectedSeries,
                  search: searchQuery
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('allYears')}</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Preacher Filter */}
              <select
                value={selectedPreacher || ''}
                onChange={(e) => window.location.href = buildURL({
                  preacher: e.target.value || undefined,
                  year: selectedYear,
                  series: selectedSeries,
                  search: searchQuery
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('allPreachers')}</option>
                {allPreachers.map(preacher => (
                  <option key={preacher} value={preacher}>{preacher}</option>
                ))}
              </select>

              {/* Series Filter */}
              <select
                value={selectedSeries || ''}
                onChange={(e) => window.location.href = buildURL({
                  series: e.target.value || undefined,
                  year: selectedYear,
                  preacher: selectedPreacher,
                  search: searchQuery
                })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">{t('allSeries')}</option>
                {sermonSeries.map(series => (
                  <option key={series.id} value={series.id}>
                    {series.name[locale as 'pt' | 'en']}
                  </option>
                ))}
              </select>

              {/* Clear Filters */}
              {(searchQuery || selectedYear || selectedPreacher || selectedSeries) && (
                <Link
                  href={`/${locale}/sermons`}
                  className="px-4 py-2 text-primary-600 hover:text-primary-800 font-medium"
                >
                  {t('clearFilters')}
                </Link>
              )}
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 text-sm text-gray-600">
            {totalSermons === 0 ? (
              t('noResults')
            ) : (
              t('showingResults', {
                count: sermons.length,
                total: totalSermons,
                page: currentPage
              })
            )}
          </div>
        </div>
      </section>

      {/* Sermons Grid */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {sermons.length === 0 ? (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faBible} className="text-6xl text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {t('noSermons')}
              </h3>
              <p className="text-gray-500">
                {searchQuery
                  ? t('noSearchResults', { query: searchQuery })
                  : t('noSermonsDesc')
                }
              </p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sermons.map((sermon) => (
                  <article
                    key={sermon.id}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                          <span>{formatDate(sermon.date, locale)}</span>
                        </div>
                        {sermon.scripture && (
                          <span className="text-sm font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
                            {sermon.scripture}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors duration-200 line-clamp-2">
                        {sermon.title[locale as 'pt' | 'en']}
                      </h3>

                      <div className="flex items-center mb-4 text-sm text-gray-600">
                        <FontAwesomeIcon icon={faUser} className="mr-2" />
                        <span>{sermon.preacher}</span>
                      </div>

                      <p className="text-gray-700 mb-6 line-clamp-3">
                        {sermon.excerpt[locale as 'pt' | 'en']}
                      </p>

                      <Link
                        href={`/${locale}/sermons/${sermon.id}`}
                        className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        {t('readMore')}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-12">
                  {/* Previous Page */}
                  {currentPage > 1 && (
                    <Link
                      href={buildURL({
                        page: currentPage - 1,
                        search: searchQuery,
                        year: selectedYear,
                        preacher: selectedPreacher,
                        series: selectedSeries
                      })}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
                      {t('previous')}
                    </Link>
                  )}

                  {/* Page Numbers */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const distance = Math.abs(page - currentPage);
                      return distance <= 2 || page === 1 || page === totalPages;
                    })
                    .map((page, index, array) => {
                      const prev = array[index - 1];
                      const showEllipsis = prev && page - prev > 1;

                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-3 py-2 text-gray-400">...</span>
                          )}
                          <Link
                            href={buildURL({
                              page,
                              search: searchQuery,
                              year: selectedYear,
                              preacher: selectedPreacher,
                              series: selectedSeries
                            })}
                            className={`px-3 py-2 text-sm font-medium border rounded-lg ${
                              currentPage === page
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </Link>
                        </React.Fragment>
                      );
                    })}

                  {/* Next Page */}
                  {currentPage < totalPages && (
                    <Link
                      href={buildURL({
                        page: currentPage + 1,
                        search: searchQuery,
                        year: selectedYear,
                        preacher: selectedPreacher,
                        series: selectedSeries
                      })}
                      className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      {t('next')}
                      <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}