import { useCallback, useEffect, useState } from 'react';
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
  const [settings, setSettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const privacySettings = await messagingPrivacyService.getPrivacySettings(user.id);
        setSettings(privacySettings);
      } catch (error) {
        console.error('Error loading privacy settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  const updateSettings = useCallback(
    async (updates: Partial<PrivacySettings>) => {
      if (!user?.id) {
        toastService.showError('User not authenticated');
        return;
      }

      setIsUpdating(true);
      try {
        const result = await messagingPrivacyService.updatePrivacySettings(user.id, updates);
        if (result.success) {
          setSettings((prev: PrivacySettings) => ({ ...prev, ...updates }));
          toastService.showSuccess('Privacy settings updated');
        } else {
          toastService.showError(result.error || 'Failed to update settings');
        }
      } catch (error) {
        console.error('Error updating settings:', error);
        toastService.showError('Failed to update settings');
      } finally {
        setIsUpdating(false);
      }
    },
    [user?.id]
  );

  const canMessage = useCallback(
    async (recipientId: string) => {
      if (!user?.id) return false;
      return messagingPrivacyService.canMessage(user.id, recipientId);
    },
    [user?.id]
  );

  return {
    settings,
    isLoading,
    updateSettings,
    isUpdating,
    canMessage,
  };
};
