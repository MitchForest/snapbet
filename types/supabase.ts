// This file re-exports all types from the generated Supabase types
// The generated types are created by running: bunx supabase gen types typescript
export * from './supabase-generated';

// Import for type aliasing
import type { Database } from './supabase-generated';

// Export convenient type aliases
export type WeeklyStatsRow = Database['public']['Functions']['get_user_weekly_stats']['Returns'][0];
