import { useMemo } from 'react';

interface EngagementData {
  comments: Array<{
    id: string;
    user: {
      username: string;
      avatar_url?: string;
    };
    content: string;
    created_at: string;
  }>;
  reactions: Array<{
    emoji: string;
    count: number;
  }>;
  tailCount: number;
  fadeCount: number;
  animatedCounts: {
    tail: number;
    fade: number;
  };
  userReaction: string | null;
  userAction: 'tail' | 'fade' | null;
}

const REACTIONS = ['🔥', '💰', '😂', '😭', '💯', '🎯'];

function generateReactions(hash: number): Array<{ emoji: string; count: number }> {
  // Generate 2-4 reactions based on hash
  const numReactions = 2 + (hash % 3);
  const reactions: Array<{ emoji: string; count: number }> = [];

  for (let i = 0; i < numReactions && i < REACTIONS.length; i++) {
    const reactionIndex = (hash + i * 7) % REACTIONS.length;
    const count = Math.max(1, (hash * (i + 1)) % 50);

    reactions.push({
      emoji: REACTIONS[reactionIndex],
      count,
    });
  }

  // Sort by count descending
  return reactions.sort((a, b) => b.count - a.count);
}

export function useEngagement(postId: string): EngagementData {
  return useMemo(() => {
    // Generate deterministic hash from postId
    const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

    // Generate base counts
    const baseTailCount = (hash % 50) + 5;
    const baseFadeCount = (hash % 30) + 2;

    return {
      comments: [], // Empty for MVP
      reactions: generateReactions(hash),
      tailCount: baseTailCount,
      fadeCount: baseFadeCount,
      // Add slight randomness for realism (will change on re-renders)
      animatedCounts: {
        tail: baseTailCount + Math.floor(Math.random() * 3),
        fade: baseFadeCount + Math.floor(Math.random() * 2),
      },
      userReaction: null,
      userAction: null,
    };
  }, [postId]);
}

// Mock comment data generator for future use
export function generateMockComments(postId: string, count: number = 5) {
  const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const usernames = ['sportsfan22', 'betmaster', 'luckycharm', 'thegoat', 'rookie2024'];
  const comments = [
    'Great pick! 🔥',
    'Tailing this one for sure',
    'Not so sure about this...',
    "Let's gooo! 💰",
    'Solid analysis',
    'Fade city 😂',
    "I'm with you on this",
    'BOL everyone!',
    'This is the way',
    'Trust the process',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `${postId}-comment-${i}`,
    user: {
      username: usernames[(hash + i) % usernames.length],
      avatar_url: undefined,
    },
    content: comments[(hash + i * 3) % comments.length],
    created_at: new Date(Date.now() - i * 60000).toISOString(), // Each comment 1 min older
  }));
}
