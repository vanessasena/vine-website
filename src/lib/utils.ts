/**
 * Utility functions for the application
 */

/**
 * Formats a date string as local date (not UTC) to avoid timezone offset issues.
 *
 * When dates come from the database as ISO strings (e.g., "2020-01-15"),
 * using `new Date(dateString)` treats them as UTC, which can cause a 1-day
 * offset when converting to local time in certain timezones.
 *
 * This function parses the date components and creates a Date object
 * with local timezone, ensuring the date displays correctly.
 *
 * @param dateString - ISO date string (e.g., "2020-01-15" or "2020-01-15T00:00:00Z")
 * @returns Formatted local date string
 *
 * @example
 * formatLocalDate("2020-01-15") // "1/15/2020" (in en-US locale)
 * formatLocalDate("2020-01-15T00:00:00Z") // "1/15/2020" (in en-US locale)
 */
export function formatLocalDate(dateString: string): string {
  const [year, month, day] = dateString.split('T')[0].split('-');
  return new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day)
  ).toLocaleDateString();
}

/**
 * Returns the local date in YYYY-MM-DD format for use in HTML date inputs.
 * Avoids using `toISOString()` which is UTC-based and can shift the date.
 */
export function getLocalISODate(date?: Date): string {
  const d = date ?? new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Error types for structured error handling
 */
export type ErrorType =
  | 'validation'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'server_error'
  | 'network'
  | 'timeout'
  | 'partial_failure';

/**
 * Structured error object with tracking and categorization
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    type: ErrorType;
    message: string;
    details?: Record<string, any>;
    requestId: string;
    timestamp: string;
  };
}

/**
 * Generates a unique request ID for error tracking
 */
export function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Creates a structured error response for API routes
 */
export function createErrorResponse(
  type: ErrorType,
  message: string,
  code: string = type.toUpperCase(),
  details?: Record<string, any>,
  requestId: string = generateRequestId()
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      type,
      message,
      details,
      requestId,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Maps HTTP status code to error type
 */
export function statusToErrorType(status: number): ErrorType {
  if (status === 400) return 'validation';
  if (status === 404) return 'not_found';
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 409) return 'conflict';
  if (status >= 500) return 'server_error';
  return 'server_error';
}

/**
 * Extracts error message from API response
 * Handles different error formats from our API and external APIs
 */
export async function extractErrorMessage(response: Response): Promise<{
  message: string;
  type: ErrorType;
  requestId?: string;
  details?: Record<string, any>;
}> {
  const type = statusToErrorType(response.status);

  try {
    const data = await response.json();

    // Our structured error format
    if (data.error?.message) {
      return {
        message: data.error.message,
        type: data.error.type || type,
        requestId: data.error.requestId,
        details: data.error.details,
      };
    }

    // Fallback to generic error field
    if (data.error && typeof data.error === 'string') {
      return {
        message: data.error,
        type,
      };
    }

    // Supabase auth error format
    if (data.error?.message || data.message) {
      return {
        message: data.error?.message || data.message,
        type,
      };
    }
  } catch {
    // Response body is not JSON
  }

  // Fallback to status text
  return {
    message: response.statusText || 'An error occurred',
    type,
  };
}
