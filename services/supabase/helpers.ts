import { PostgrestError } from '@supabase/supabase-js';

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: PostgrestError | null }>
): Promise<T> {
  const { data, error } = await promise;

  if (error) {
    throw new SupabaseError(error.message, error.code);
  }

  if (!data) {
    throw new SupabaseError('No data returned');
  }

  return data;
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  return error instanceof SupabaseError;
}

export function getErrorMessage(error: unknown): string {
  if (isSupabaseError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}
