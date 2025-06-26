import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase/client';
import { groupService } from '@/services/messaging/groupService';
import { GroupMember } from '@/types/messaging';
import { toastService } from '@/services/toastService';

export function useGroupMembers(chatId: string) {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch group members
  const fetchMembers = useCallback(async () => {
    try {
      const fetchedMembers = await groupService.getGroupMembers(chatId);
      setMembers(fetchedMembers);
    } catch (error) {
      console.error('Failed to fetch group members:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  // Initial fetch
  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Real-time member updates
  useEffect(() => {
    const channel = supabase
      .channel(`group-members:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_members',
          filter: `chat_id=eq.${chatId}`,
        },
        (_payload) => {
          // Refetch members on any change
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [chatId, fetchMembers]);

  // Add a member to the group
  const addMember = useCallback(
    async (userId: string) => {
      // Check member limit
      if (members.length >= 50) {
        toastService.showError('Group has reached maximum capacity (50 members)');
        return false;
      }

      const success = await groupService.addGroupMember(chatId, userId);
      if (success) {
        await fetchMembers();
      }
      return success;
    },
    [chatId, members.length, fetchMembers]
  );

  // Remove a member from the group
  const removeMember = useCallback(
    async (userId: string) => {
      const success = await groupService.removeGroupMember(chatId, userId);
      if (success) {
        await fetchMembers();
      }
      return success;
    },
    [chatId, fetchMembers]
  );

  return {
    members,
    isLoading,
    addMember,
    removeMember,
  };
}
