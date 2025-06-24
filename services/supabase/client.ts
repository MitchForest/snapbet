// Re-export the Supabase client from auth service
// This ensures we have a single client instance with proper auth storage
export { supabase } from '../auth/authService';
