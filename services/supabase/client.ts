import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (_key: string) => {
        // TODO: Implement secure storage for auth tokens
        return Promise.resolve(null);
      },
      setItem: (_key: string, _value: string) => {
        // TODO: Implement secure storage for auth tokens
        return Promise.resolve();
      },
      removeItem: (_key: string) => {
        // TODO: Implement secure storage for auth tokens
        return Promise.resolve();
      },
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
