import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';

interface PrivacySettings {
  public_profile: boolean;
  show_bankroll: boolean;
  show_win_rate: boolean;
  show_picks: boolean;
}

export default function PrivacySettingsScreen() {
  const user = useAuthStore((state) => state.user);

  const [settings, setSettings] = useState<PrivacySettings>({
    public_profile: user?.user_metadata?.privacy_settings?.public_profile ?? true,
    show_bankroll: user?.user_metadata?.privacy_settings?.show_bankroll ?? true,
    show_win_rate: user?.user_metadata?.privacy_settings?.show_win_rate ?? true,
    show_picks: user?.user_metadata?.privacy_settings?.show_picks ?? true,
  });

  const handleToggle = async (key: keyof PrivacySettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);

    try {
      // For now, just save locally - in a real app, this would be saved to the database
      // TODO: Create a proper API endpoint for updating privacy settings
      console.log('Privacy settings updated:', newSettings);
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
    settingKey: keyof PrivacySettings;
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
      <ScreenHeader title="Privacy Settings" />

      <ScrollView>
        <View padding="$4">
          <Text fontSize={12} color="$textSecondary" marginBottom="$3">
            PROFILE VISIBILITY
          </Text>

          <SettingRow
            label="Public Profile"
            description="Allow anyone to view your profile"
            settingKey="public_profile"
          />

          <Text fontSize={12} color="$textSecondary" marginTop="$6" marginBottom="$3">
            STATS VISIBILITY
          </Text>

          <SettingRow
            label="Show Bankroll"
            description="Display your current bankroll on your profile"
            settingKey="show_bankroll"
          />

          <SettingRow
            label="Show Win Rate"
            description="Display your win percentage"
            settingKey="show_win_rate"
          />

          <SettingRow
            label="Show Picks History"
            description="Allow others to see your past picks"
            settingKey="show_picks"
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
