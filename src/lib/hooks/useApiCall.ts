'use client';

import { useState, useCallback } from 'react';
import { extractErrorMessage, ErrorType } from '@/lib/utils';

interface ApiError {
  message: string;
  type: ErrorType;
  requestId?: string;
  details?: Record<string, any>;
  retryCount?: number;
}

interface UseApiCallOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeoutMs?: number;
}

export function useApiCall<T = any>(options: UseApiCallOptions = {}) {
  const { maxRetries = 3, retryDelay = 1000, timeoutMs = 30000 } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const fetchWithTimeout = useCallback(
    async (url: string, init?: RequestInit): Promise<Response> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...init,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    },
    [timeoutMs]
  );

  const call = useCallback(
    async (
      url: string,
      init?: RequestInit,
      retryCount = 0
    ): Promise<{ data: T | null; error: ApiError | null }> => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await fetchWithTimeout(url, init);

        if (!response.ok) {
          const errorInfo = await extractErrorMessage(response);
          const apiError: ApiError = {
            ...errorInfo,
            retryCount,
          };

          // Retry on transient errors (429 Too Many Requests, 503 Service Unavailable)
          if (
            (response.status === 429 || response.status === 503) &&
            retryCount < maxRetries
          ) {
            const delayMs = retryDelay * Math.pow(2, retryCount);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return call(url, init, retryCount + 1);
          }

          setError(apiError);
          setLoading(false);
          return { data: null, error: apiError };
        }

        const responseData = await response.json();

        // Check for our structured success response
        if ('success' in responseData && !responseData.success) {
          // This is an error response
          const apiError: ApiError = {
            message: responseData.error?.message || 'An error occurred',
            type: responseData.error?.type || 'server_error',
            requestId: responseData.error?.requestId,
            details: responseData.error?.details,
            retryCount,
          };
          setError(apiError);
          setLoading(false);
          return { data: null, error: apiError };
        }

        setData(responseData);
        setLoading(false);
        return { data: responseData, error: null };
      } catch (err) {
        let apiError: ApiError;

        if (err instanceof TypeError && err.name === 'AbortError') {
          apiError = {
            message: 'Request timeout. Please check your connection.',
            type: 'timeout',
            retryCount,
          };

          if (retryCount < maxRetries) {
            const delayMs = retryDelay * Math.pow(2, retryCount);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return call(url, init, retryCount + 1);
          }
        } else if (err instanceof TypeError) {
          apiError = {
            message: 'Network error. Please check your connection.',
            type: 'network',
            retryCount,
          };

          if (retryCount < maxRetries) {
            const delayMs = retryDelay * Math.pow(2, retryCount);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return call(url, init, retryCount + 1);
          }
        } else {
          apiError = {
            message: 'An unexpected error occurred.',
            type: 'server_error',
            retryCount,
          };
        }

        setError(apiError);
        setLoading(false);
        return { data: null, error: apiError };
      }
    },
    [fetchWithTimeout, maxRetries, retryDelay]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    call,
    loading,
    error,
    data,
    reset,
    isError: error !== null,
    isSuccess: data !== null && error === null,
  };
}
