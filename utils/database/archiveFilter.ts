/**
 * Archive filtering utilities for Supabase queries
 * Ensures users only see active content while preserving archived data for AI/RAG features
 */

/**
 * Tables that support archiving functionality
 */
export const ARCHIVABLE_TABLES = [
  'posts',
  'bets',
  'stories',
  'messages',
  'reactions',
  'pick_actions',
] as const;

export type ArchivableTable = (typeof ARCHIVABLE_TABLES)[number];

/**
 * Filter query to show only active (non-archived, non-deleted) content
 * Use this for all user-facing queries
 *
 * @example
 * const query = withActiveContent(
 *   supabase.from('posts').select('*')
 * ).eq('user_id', userId);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withActiveContent<T extends { eq: any; is: any }>(query: T): T {
  return query.eq('archived', false).is('deleted_at', null);
}

/**
 * Filter query to show only archived (but not deleted) content
 * Use this for AI/RAG queries that need historical data
 *
 * @example
 * const query = withArchivedContent(
 *   supabase.from('posts').select('*')
 * ).not('embedding', 'is', null);
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withArchivedContent<T extends { eq: any; is: any }>(query: T): T {
  return query.eq('archived', true).is('deleted_at', null);
}

/**
 * Check if a table supports archiving
 */
export function isArchivableTable(table: string): table is ArchivableTable {
  return ARCHIVABLE_TABLES.includes(table as ArchivableTable);
}

/**
 * Helper to create a filter string for raw SQL queries
 * Use when you can't use the query builder functions
 */
export function getActiveContentFilter(tableAlias?: string): string {
  const prefix = tableAlias ? `${tableAlias}.` : '';
  return `${prefix}archived = false AND ${prefix}deleted_at IS NULL`;
}

/**
 * Helper to create a filter string for archived content in raw SQL
 */
export function getArchivedContentFilter(tableAlias?: string): string {
  const prefix = tableAlias ? `${tableAlias}.` : '';
  return `${prefix}archived = true AND ${prefix}deleted_at IS NULL`;
}
