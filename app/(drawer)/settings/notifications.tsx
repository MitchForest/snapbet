import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Switch, Alert } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { SettingsRow } from '@/components/settings/SettingsRow';

export default function NotificationSettingsScreen() {
  const { user, updateNotificationSettings } = useAuthStore();
  const [settings, setSettings] = useState({
    tails: true,
    fades: true,
    bet_results: true,
    messages: true,
    milestones: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Load current settings
    if (user?.user_metadata?.notification_settings) {
      setSettings(user.user_metadata.notification_settings);
    }
  }, [user]);

  const handleToggle = async (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    // Auto-save on toggle
    setIsSaving(true);
    try {
      const { error } = await updateNotificationSettings(newSettings);
      if (error) {
        // Revert on error
        setSettings(settings);
        Alert.alert('Error', 'Failed to update notification settings');
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
            ACTIVITY
          </Text>

          <SettingsRow
            icon="👆"
            label="Tails"
            subtitle="When someone tails your pick"
            customRight={
              <Switch
                value={settings.tails}
                onValueChange={(value) => handleToggle('tails', value)}
                disabled={isSaving}
              />
            }
          />

          <SettingsRow
            icon="👎"
            label="Fades"
            subtitle="When someone fades your pick"
            customRight={
              <Switch
                value={settings.fades}
                onValueChange={(value) => handleToggle('fades', value)}
                disabled={isSaving}
              />
            }
          />

          <SettingsRow
            icon="🎯"
            label="Bet Results"
            subtitle="When your bets settle"
            customRight={
              <Switch
                value={settings.bet_results}
                onValueChange={(value) => handleToggle('bet_results', value)}
                disabled={isSaving}
              />
            }
          />
        </View>

        <View marginTop="$6">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            SOCIAL
          </Text>

          <SettingsRow
            icon="💬"
            label="Messages"
            subtitle="New messages in chats"
            customRight={
              <Switch
                value={settings.messages}
                onValueChange={(value) => handleToggle('messages', value)}
                disabled={isSaving}
              />
            }
          />
        </View>

        <View marginTop="$6" marginBottom="$6">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            ACHIEVEMENTS
          </Text>

          <SettingsRow
            icon="🏆"
            label="Milestones"
            subtitle="New badges and achievements"
            customRight={
              <Switch
                value={settings.milestones}
                onValueChange={(value) => handleToggle('milestones', value)}
                disabled={isSaving}
              />
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}
