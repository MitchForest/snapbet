import React from 'react';
import { PostCard } from '@/components/content/PostCard';
import { PostWithType } from '@/types/content';

// Comparison function for PostCard memoization
// Only re-render if key engagement props change
const arePostsEqual = (
  prevProps: { post: PostWithType },
  nextProps: { post: PostWithType }
): boolean => {
  const prev = prevProps.post;
  const next = nextProps.post;

  // Always re-render if different post
  if (prev.id !== next.id) return false;

  // Check if key engagement metrics changed
  return (
    prev.tail_count === next.tail_count &&
    prev.fade_count === next.fade_count &&
    prev.reaction_count === next.reaction_count &&
    prev.comment_count === next.comment_count &&
    prev.report_count === next.report_count &&
    prev.deleted_at === next.deleted_at
  );
};

// Memoized PostCard component
export const MemoizedPostCard = React.memo(PostCard, arePostsEqual);

// Helper to create memoized list item renderers
export function createMemoizedRenderer<T>(
  Component: React.ComponentType<{ item: T }>,
  areEqual?: (prev: { item: T }, next: { item: T }) => boolean
) {
  const MemoizedComponent = React.memo(Component, areEqual);
  MemoizedComponent.displayName = `Memoized(${Component.displayName || Component.name || 'Component'})`;

  // Return a function that creates the memoized component
  const renderer = ({ item }: { item: T }) => React.createElement(MemoizedComponent, { item });
  renderer.displayName = `MemoizedRenderer(${Component.displayName || Component.name || 'Component'})`;

  return renderer;
}
