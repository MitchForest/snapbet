import { PostType, POST_TYPE_CONFIGS } from '@/types/content';

export function calculateExpiration(postType: PostType, gameTime?: Date): Date {
  const now = new Date();

  switch (postType) {
    case PostType.PICK:
      // If we have game time, expire then
      // Otherwise default to 24 hours
      return gameTime || new Date(now.getTime() + 24 * 60 * 60 * 1000);

    case PostType.CONTENT:
    case PostType.OUTCOME:
    default:
      // 24 hours from now
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
}

export function getExpirationDisplay(postType: PostType): string {
  switch (postType) {
    case PostType.PICK:
      return 'Expires at game time';
    case PostType.CONTENT:
    case PostType.OUTCOME:
    default:
      return 'Expires in 24 hours';
  }
}

export function getPostTypeConfig(postType: PostType) {
  return POST_TYPE_CONFIGS[postType];
}

export function canCreatePostType(postType: PostType, hasBet: boolean = false): boolean {
  const config = POST_TYPE_CONFIGS[postType];
  return !config.requiresBet || hasBet;
}

export function getTimeUntilExpiration(expiresAt: string | Date): string {
  const expiration = new Date(expiresAt);
  const now = new Date();
  const diff = expiration.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${minutes}m`;
  }
}

export function isPostExpired(expiresAt: string | Date): boolean {
  const expiration = new Date(expiresAt);
  return expiration.getTime() <= Date.now();
}

export function getDefaultPostType(): PostType {
  return PostType.CONTENT;
}
