import { useMemo, useState, useEffect } from 'react';
import { useComments } from './useComments';
import { useReactions } from './useReactions';
import { supabase } from '@/services/supabase/client';
import { PostType } from '@/types/content';
import { AVAILABLE_REACTIONS } from '@/utils/constants/reactions';

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
  userReactions: string[];
  userAction: 'tail' | 'fade' | null;
}

// Keep the mock data generator for posts that don't have real data yet
function generateMockReactions(hash: number): Array<{ emoji: string; count: number }> {
  // Generate 2-4 reactions based on hash
  const numReactions = 2 + (hash % 3);
  const reactions: Array<{ emoji: string; count: number }> = [];

  for (let i = 0; i < numReactions && i < AVAILABLE_REACTIONS.length; i++) {
    const reactionIndex = (hash + i * 7) % AVAILABLE_REACTIONS.length;
    const count = Math.max(1, (hash * (i + 1)) % 50);

    reactions.push({
      emoji: AVAILABLE_REACTIONS[reactionIndex],
      count,
    });
  }

  // Sort by count descending
  return reactions.sort((a, b) => b.count - a.count);
}

export function useEngagement(postId: string, postType?: PostType): EngagementData {
  // Use real hooks for comments and reactions
  const { comments } = useComments(postId);
  const { reactions, userReactions } = useReactions(postId);

  // State for tail/fade counts
  const [tailCount, setTailCount] = useState(0);
  const [fadeCount, setFadeCount] = useState(0);
  const [userAction, setUserAction] = useState<'tail' | 'fade' | null>(null);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  // Load tail/fade counts for pick posts
  useEffect(() => {
    if (postType !== PostType.PICK) {
      setIsLoadingCounts(false);
      return;
    }

    const loadPickActionCounts = async () => {
      try {
        // Get all pick actions for this post
        const { data: pickActions, error } = await supabase
          .from('pick_actions')
          .select('action_type, user_id')
          .eq('post_id', postId);

        if (error) throw error;

        // Count tails and fades
        const counts = pickActions?.reduce(
          (acc, action) => {
            if (action.action_type === 'tail') {
              acc.tail++;
            } else if (action.action_type === 'fade') {
              acc.fade++;
            }
            return acc;
          },
          { tail: 0, fade: 0 }
        ) || { tail: 0, fade: 0 };

        setTailCount(counts.tail);
        setFadeCount(counts.fade);

        // Check if current user has tailed or faded
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const userPickAction = pickActions?.find((action) => action.user_id === user.id);
          if (userPickAction) {
            setUserAction(userPickAction.action_type as 'tail' | 'fade');
          }
        }
      } catch (error) {
        console.error('Failed to load pick action counts:', error);
        // Use fallback mock data on error
        const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        setTailCount((hash % 50) + 5);
        setFadeCount((hash % 30) + 2);
      } finally {
        setIsLoadingCounts(false);
      }
    };

    loadPickActionCounts();
  }, [postId, postType]);

  // Add slight animation variation to counts
  const animatedCounts = useMemo(() => {
    if (isLoadingCounts) {
      return { tail: 0, fade: 0 };
    }

    // Add slight randomness for realism (will change on re-renders)
    return {
      tail: tailCount + Math.floor(Math.random() * 3),
      fade: fadeCount + Math.floor(Math.random() * 2),
    };
  }, [tailCount, fadeCount, isLoadingCounts]);

  // If no real reactions data yet, use mock data as fallback
  const displayReactions = useMemo(() => {
    if (reactions.length > 0) {
      return reactions;
    }

    // Fallback to mock data
    const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return generateMockReactions(hash);
  }, [reactions, postId]);

  return {
    comments: comments.slice(0, 5).map((c) => ({
      id: c.id,
      user: {
        username: c.user.username,
        avatar_url: c.user.avatar_url || undefined,
      },
      content: c.content,
      created_at: c.created_at || '',
    })), // Return only first 5 for preview
    reactions: displayReactions,
    tailCount,
    fadeCount,
    animatedCounts,
    userReactions,
    userAction,
  };
}

// Keep the mock comment generator for components that might need it
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
