import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase/client';
import { MessageReaction } from '@/types/messaging';
import { toastService } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';
import * as Haptics from 'expo-haptics';

// Helper to check if a string is a valid UUID
const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export function useMessageReactions(messageId: string) {
  const user = useAuthStore((state) => state.user);
  const [reactions, setReactions] = useState<MessageReaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Skip reactions for temporary messages
  const isTemporaryMessage = messageId.startsWith('temp_') || !isValidUUID(messageId);

  // Fetch reactions for the message
  const fetchReactions = useCallback(async () => {
    // Skip if temporary message
    if (isTemporaryMessage) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('message_reactions')
        .select(
          `
          *,
          user:users!message_reactions_user_id_fkey(
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('message_id', messageId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Map the data to match MessageReaction type
      const validReactions: MessageReaction[] = (data || [])
        .filter((reaction) => reaction.created_at !== null)
        .map((reaction) => ({
          id: reaction.id,
          message_id: reaction.message_id,
          user_id: reaction.user_id,
          emoji: reaction.emoji,
          created_at: reaction.created_at!,
          user: reaction.user
            ? {
                id: reaction.user.id,
                username: reaction.user.username,
                avatar_url: reaction.user.avatar_url,
              }
            : undefined,
        }));

      setReactions(validReactions);
    } catch (error) {
      console.error('Error fetching reactions:', error);
      toastService.showError('Failed to load reactions');
    } finally {
      setIsLoading(false);
    }
  }, [messageId, isTemporaryMessage]);

  // Add a reaction
  const addReaction = useCallback(
    async (emoji: string) => {
      if (!user || isTemporaryMessage) return;

      try {
        const { error } = await supabase.from('message_reactions').insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        });

        if (error) throw error;

        // Get user profile for optimistic update
        const { data: userProfile } = await supabase
          .from('users')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();

        // Optimistically update UI
        const newReaction: MessageReaction = {
          id: `temp_${Date.now()}`,
          message_id: messageId,
          user_id: user.id,
          emoji,
          created_at: new Date().toISOString(),
          user: {
            id: user.id,
            username: userProfile?.username || null,
            avatar_url: userProfile?.avatar_url || null,
          },
        };
        setReactions((prev) => [...prev, newReaction]);

        // Haptic feedback
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        // Refresh reactions
        fetchReactions();
      } catch (error: unknown) {
        console.error('Error adding reaction:', error);
        toastService.showError('Failed to add reaction');
      }
    },
    [messageId, user, fetchReactions, isTemporaryMessage]
  );

  // Remove a reaction
  const removeReaction = useCallback(
    async (emoji: string) => {
      if (!user || isTemporaryMessage) return;

      try {
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('message_id', messageId)
          .eq('user_id', user.id)
          .eq('emoji', emoji);

        if (error) throw error;

        // Optimistically update UI
        setReactions((prev) => prev.filter((r) => !(r.user_id === user.id && r.emoji === emoji)));

        // Refresh reactions
        fetchReactions();
      } catch (error: unknown) {
        console.error('Error removing reaction:', error);
        toastService.showError('Failed to remove reaction');
      }
    },
    [messageId, user, fetchReactions, isTemporaryMessage]
  );

  // Toggle reaction (add if not exists, remove if exists)
  const toggleReaction = useCallback(
    async (emoji: string) => {
      if (!user || isTemporaryMessage) return;

      const existingReaction = reactions.find((r) => r.user_id === user.id && r.emoji === emoji);

      if (existingReaction) {
        await removeReaction(emoji);
      } else {
        await addReaction(emoji);
      }
    },
    [user, reactions, addReaction, removeReaction, isTemporaryMessage]
  );

  // Get user's current reaction
  const userReaction = reactions.find((r) => r.user_id === user?.id)?.emoji || null;

  // Group reactions by emoji
  const reactionSummary = reactions.reduce(
    (
      acc: Array<{
        emoji: string;
        count: number;
        users: Array<{ id: string; username: string | null; avatar_url: string | null }>;
      }>,
      reaction
    ) => {
      const existing = acc.find((r) => r.emoji === reaction.emoji);
      if (existing) {
        existing.count++;
        if (reaction.user) {
          existing.users.push(reaction.user);
        }
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          users: reaction.user ? [reaction.user] : [],
        });
      }
      return acc;
    },
    []
  );

  // Initial load
  useEffect(() => {
    if (!isTemporaryMessage) {
      fetchReactions();
    }
  }, [fetchReactions, isTemporaryMessage]);

  return {
    reactions: reactionSummary,
    userReaction,
    toggleReaction,
    isLoading,
  };
}
