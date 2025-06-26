import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import {
  messagingPrivacyService,
  PrivacySettings,
} from '@/services/messaging/messagingPrivacyService';
import { toastService } from '@/services/toastService';

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  user_id: '',
  who_can_message: 'everyone',
  read_receipts_enabled: true,
  typing_indicators_enabled: true,
  online_status_visible: true,
  updated_at: null,
};

export const useMessagePrivacy = () => {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['message-privacy', user?.id],
    queryFn: async () => {
      if (!user?.id) return DEFAULT_PRIVACY_SETTINGS;
      return messagingPrivacyService.getPrivacySettings(user.id);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user?.id,
  });

  const updateSettings = useMutation({
    mutationFn: async (updates: Partial<PrivacySettings>) => {
      if (!user?.id) throw new Error('User not authenticated');
      const result = await messagingPrivacyService.updatePrivacySettings(user.id, updates);
      if (!result.success) {
        throw new Error(result.error || 'Failed to update settings');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['message-privacy', user?.id] });
      toastService.showSuccess('Privacy settings updated');
    },
    onError: (error: Error) => {
      toastService.showError(error.message || 'Failed to update settings');
    },
  });

  const canMessage = useCallback(
    async (recipientId: string) => {
      if (!user?.id) return false;
      return messagingPrivacyService.canMessage(user.id, recipientId);
    },
    [user?.id]
  );

  return {
    settings: settings || DEFAULT_PRIVACY_SETTINGS,
    isLoading,
    updateSettings: updateSettings.mutate,
    isUpdating: updateSettings.isPending,
    canMessage,
  };
};
