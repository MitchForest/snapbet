import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';

interface NotificationSettings {
  tails_fades: boolean;
  bet_results: boolean;
  direct_messages: boolean;
  group_mentions: boolean;
  new_followers: boolean;
  promotions: boolean;
}

export default function NotificationSettingsScreen() {
  const user = useAuthStore((state) => state.user);

  const [settings, setSettings] = useState<NotificationSettings>({
    tails_fades: user?.user_metadata?.notification_settings?.tails_fades ?? true,
    bet_results: user?.user_metadata?.notification_settings?.bet_results ?? true,
    direct_messages: user?.user_metadata?.notification_settings?.direct_messages ?? true,
    group_mentions: user?.user_metadata?.notification_settings?.group_mentions ?? true,
    new_followers: user?.user_metadata?.notification_settings?.new_followers ?? true,
    promotions: user?.user_metadata?.notification_settings?.promotions ?? false,
  });

  const handleToggle = async (key: keyof NotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      // For now, just save locally - in a real app, this would be saved to the database
      // TODO: Create a proper API endpoint for updating notification settings
      console.log('Notification settings updated:', newSettings);
    } catch {
      // Revert on error
      setSettings(settings);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  const SettingRow = ({
    label,
    description,
    settingKey,
  }: {
    label: string;
    description?: string;
    settingKey: keyof NotificationSettings;
  }) => (
    <View style={styles.settingRow}>
      <View flex={1}>
        <Text fontSize={16} color="$textPrimary">
          {label}
        </Text>
        {description && (
          <Text fontSize={14} color="$textSecondary" marginTop="$1">
            {description}
          </Text>
        )}
      </View>
      <Switch
        value={settings[settingKey]}
        onValueChange={() => handleToggle(settingKey)}
        trackColor={{ false: Colors.border.default, true: Colors.primary }}
        thumbColor={Colors.white}
      />
    </View>
  );

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Notification Settings" />

      <ScrollView>
        <View padding="$4">
          <Text fontSize={12} color="$textSecondary" marginBottom="$3">
            ACTIVITY
          </Text>

          <SettingRow
            label="Tails & Fades"
            description="When someone tails or fades your picks"
            settingKey="tails_fades"
          />

          <SettingRow
            label="Bet Results"
            description="When your bets win or lose"
            settingKey="bet_results"
          />

          <SettingRow
            label="New Followers"
            description="When someone follows you"
            settingKey="new_followers"
          />

          <Text fontSize={12} color="$textSecondary" marginTop="$6" marginBottom="$3">
            MESSAGES
          </Text>

          <SettingRow
            label="Direct Messages"
            description="New messages from other users"
            settingKey="direct_messages"
          />

          <SettingRow
            label="Group Mentions"
            description="When you're mentioned in a group"
            settingKey="group_mentions"
          />

          <Text fontSize={12} color="$textSecondary" marginTop="$6" marginBottom="$3">
            OTHER
          </Text>

          <SettingRow
            label="Promotions & Updates"
            description="News and special offers from SnapBet"
            settingKey="promotions"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
});
