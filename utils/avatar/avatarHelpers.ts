/**
 * Avatar URL validation and normalization utilities
 */

// Known avatar providers
const AVATAR_PROVIDERS = {
  DICEBEAR: 'dicebear',
  GOOGLE: 'google',
  TWITTER: 'twitter',
  UI_AVATARS: 'ui-avatars',
  SUPABASE: 'supabase',
} as const;

type AvatarProvider = (typeof AVATAR_PROVIDERS)[keyof typeof AVATAR_PROVIDERS];

/**
 * Detect the provider of an avatar URL
 */
export function detectAvatarProvider(url: string | null | undefined): AvatarProvider | null {
  if (!url) return null;

  if (url.includes('dicebear.com')) return AVATAR_PROVIDERS.DICEBEAR;
  if (url.includes('googleusercontent.com')) return AVATAR_PROVIDERS.GOOGLE;
  if (url.includes('pbs.twimg.com')) return AVATAR_PROVIDERS.TWITTER;
  if (url.includes('ui-avatars.com')) return AVATAR_PROVIDERS.UI_AVATARS;
  if (!url.startsWith('http')) return AVATAR_PROVIDERS.SUPABASE;

  return null;
}

/**
 * Validate if an avatar URL is likely to be accessible
 */
export function isValidAvatarUrl(url: string | null | undefined): boolean {
  if (!url) return false;

  // Check for valid URL format
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // For Supabase storage paths, just check if it's not empty
  return url.length > 0;
}

/**
 * Generate a consistent dicebear avatar URL
 */
export function generateDicebearUrl(
  seed: string,
  size: number = 128,
  style: string = 'lorelei'
): string {
  const backgroundColor = 'b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf';
  return `https://api.dicebear.com/7.x/${style}/png?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=${backgroundColor}&size=${size}`;
}

/**
 * Get a fallback avatar URL
 */
export function getFallbackAvatarUrl(username?: string | null, size: number = 128): string | null {
  if (!username) return null;
  return generateDicebearUrl(username, size);
}

/**
 * Normalize an avatar URL to ensure consistency
 */
export function normalizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  // Trim whitespace
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Handle Google avatar URLs - ensure they use HTTPS
  if (trimmed.includes('googleusercontent.com') && trimmed.startsWith('http://')) {
    return trimmed.replace('http://', 'https://');
  }

  return trimmed;
}

/**
 * Extract initials from a name or username
 */
export function getInitials(name?: string | null, maxChars: number = 2): string {
  if (!name) return '';

  // Remove emojis and special characters
  const cleaned = name
    .replace(
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu,
      ''
    )
    .trim();

  if (!cleaned) return '';

  // Split by spaces and get first letter of each word
  const words = cleaned.split(/\s+/);
  const initials = words
    .map((word) => word[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, maxChars)
    .join('');

  return initials || cleaned[0]?.toUpperCase() || '';
}
