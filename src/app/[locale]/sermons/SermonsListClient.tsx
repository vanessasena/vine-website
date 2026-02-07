'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faCalendarAlt,
  faUser,
  faArrowRight,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '@/lib/sermons';
import type { Sermon } from '@/lib/sermons';

interface SermonsListClientProps {
  sermons: Sermon[];
  locale: string;
  translations: {
    preachedBy: string;
    preachedOn: string;
    readMore: string;
    noSermons: string;
    page: string;
    of: string;
    previous: string;
    next: string;
  };
}

const SERMONS_PER_PAGE = 6;

export default function SermonsListClient({ sermons, locale, translations }: SermonsListClientProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(sermons.length / SERMONS_PER_PAGE);
  const startIndex = (currentPage - 1) * SERMONS_PER_PAGE;
  const endIndex = startIndex + SERMONS_PER_PAGE;
  const currentSermons = sermons.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of sermons list
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust range if at the beginning
      if (currentPage <= 2) {
        endPage = 4;
      }

      // Adjust range if at the end
      if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (sermons.length === 0) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faBook} className="text-4xl text-gray-400 mb-4" />
        <p className="text-lg text-gray-600">{translations.noSermons}</p>
      </div>
    );
  }

  return (
    <>
      {/* Sermons Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {currentSermons.map((sermon) => (
          <div key={sermon.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Header with Bible icon */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6">
              <div className="flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={faBook} className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">
                {sermon.title[locale as 'pt' | 'en']}
              </h3>
              {sermon.scripture && (
                <p className="text-center text-secondary-100 font-medium">
                  {sermon.scripture}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Meta information */}
              <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUser} className="mr-2 text-primary-600" />
                  <span className="font-medium">{translations.preachedBy}:</span>
                  <span className="ml-1">{sermon.preacher}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-2 text-primary-600" />
                  <span className="font-medium">{translations.preachedOn}:</span>
                  <span className="ml-1">{formatDate(sermon.date, locale)}</span>
                </div>
              </div>

              {/* Excerpt */}
              <p className="text-gray-700 leading-relaxed mb-6">
                {sermon.excerpt[locale as 'pt' | 'en']}
              </p>

              {/* Read More Button */}
              <Link
                href={`/${locale}/sermons/${sermon.id}`}
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                {translations.readMore}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4">
          {/* Page info */}
          <p className="text-sm text-gray-600">
            {translations.page} {currentPage} {translations.of} {totalPages}
          </p>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            {/* Previous button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-600'
              }`}
              aria-label={translations.previous}
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-sm" />
              <span className="hidden sm:inline">{translations.previous}</span>
            </button>

            {/* Page numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => (
                typeof page === 'number' ? (
                  <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors duration-200 ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-primary-50 border border-gray-300'
                    }`}
                    aria-label={`${translations.page} ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ) : (
                  <span key={index} className="px-2 text-gray-400">
                    {page}
                  </span>
                )
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-primary-600 hover:bg-primary-50 border border-primary-600'
              }`}
              aria-label={translations.next}
            >
              <span className="hidden sm:inline">{translations.next}</span>
              <FontAwesomeIcon icon={faChevronRight} className="text-sm" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
