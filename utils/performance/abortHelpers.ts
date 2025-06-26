import { useEffect, useRef } from 'react';

/**
 * Hook to manage abort controllers for cancellable requests
 * Automatically cleans up on unmount
 */
export function useAbortController() {
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create new abort controller
  const createController = () => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  };

  // Get current signal
  const getSignal = () => {
    if (!abortControllerRef.current) {
      createController();
    }
    return abortControllerRef.current!.signal;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    createController,
    getSignal,
    abort: () => abortControllerRef.current?.abort(),
  };
}

/**
 * Wrapper for fetch that includes abort signal
 */
export async function fetchWithAbort(
  url: string,
  options: RequestInit & { signal?: AbortSignal }
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Request was cancelled');
    }
    throw error;
  }
}
