import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  locale: string;
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ locale, items }: BreadcrumbProps) {
  return (
    <nav className="bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    className="h-3 w-3 text-gray-400 mx-2"
                  />
                )}
                {isLast ? (
                  <span className="font-semibold text-gray-900">
                    {item.label}
                  </span>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-gray-600">{item.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
