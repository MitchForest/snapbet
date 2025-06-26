import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/services/supabase/client';
import { MessageReaction } from '@/types/messaging';
import { toastService } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';
import * as Haptics from 'expo-haptics';

export function useMessageReactions(messageId: string) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch reactions for a message
  const { data: reactions = [], isLoading } = useQuery({
    queryKey: ['message-reactions', messageId],
    queryFn: async () => {
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
      return data as MessageReaction[];
    },
    enabled: !!messageId,
  });

  // Add reaction mutation
  const addReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', messageId] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onError: (error) => {
      console.error('Failed to add reaction:', error);
      toastService.showError('Failed to add reaction');
    },
  });

  // Remove reaction mutation
  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', messageId] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    onError: (error) => {
      console.error('Failed to remove reaction:', error);
      toastService.showError('Failed to remove reaction');
    },
  });

  // Get user's current reaction
  const userReaction = reactions.find((r) => r.user_id === user?.id)?.emoji || null;

  // Group reactions by emoji
  const reactionSummary = reactions.reduce(
    (acc, reaction) => {
      const existing = acc.find((r) => r.emoji === reaction.emoji);
      if (existing) {
        existing.count++;
        existing.users.push(reaction.user);
      } else {
        acc.push({
          emoji: reaction.emoji,
          count: 1,
          users: [reaction.user],
        });
      }
      return acc;
    },
    [] as Array<{
      emoji: string;
      count: number;
      users: Array<{ id: string; username: string | null; avatar_url: string | null }>;
    }>
  );

  const toggleReaction = useCallback(
    (emoji: string) => {
      if (userReaction === emoji) {
        removeReactionMutation.mutate();
      } else {
        addReactionMutation.mutate(emoji);
      }
    },
    [userReaction, addReactionMutation, removeReactionMutation]
  );

  return {
    reactions: reactionSummary,
    userReaction,
    toggleReaction,
    isLoading: isLoading || addReactionMutation.isLoading || removeReactionMutation.isLoading,
  };
}
