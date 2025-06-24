import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Switch, Alert } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { SettingsRow } from '@/components/settings/SettingsRow';

export default function PrivacySettingsScreen() {
  const { user, updatePrivacySettings } = useAuthStore();
  const [settings, setSettings] = useState({
    show_bankroll: true,
    show_win_rate: true,
    public_picks: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load current settings
    if (user?.user_metadata?.privacy_settings) {
      setSettings(user.user_metadata.privacy_settings);
    }
  }, [user]);

  const handleToggle = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Auto-save on toggle
    setIsSaving(true);
    try {
      const { error } = await updatePrivacySettings(newSettings);
      if (error) {
        // Revert on error
        setSettings(settings);
        Alert.alert('Error', 'Failed to update privacy settings');
      }
    } catch {
      setSettings(settings);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView>
        <View marginTop="$3">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            PROFILE VISIBILITY
          </Text>

          <SettingsRow
            icon="💰"
            label="Show Bankroll"
            subtitle="Others can see your current bankroll"
            customRight={
              <Switch
                value={settings.show_bankroll}
                onValueChange={(value) => handleToggle('show_bankroll', value)}
                disabled={isSaving}
              />
            }
          />

          <SettingsRow
            icon="📊"
            label="Show Win Rate"
            subtitle="Display your win percentage"
            customRight={
              <Switch
                value={settings.show_win_rate}
                onValueChange={(value) => handleToggle('show_win_rate', value)}
                disabled={isSaving}
              />
            }
          />

          <SettingsRow
            icon="🎯"
            label="Public Picks"
            subtitle="Your picks appear in the public feed"
            customRight={
              <Switch
                value={settings.public_picks}
                onValueChange={(value) => handleToggle('public_picks', value)}
                disabled={isSaving}
              />
            }
          />
        </View>

        <View marginTop="$6" paddingHorizontal="$4" marginBottom="$6">
          <Text fontSize={14} color="$textSecondary" lineHeight={20}>
            When privacy settings are disabled, that information will only be visible to you. Your
            followers will still be able to see your posts and betting activity.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
