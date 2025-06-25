import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';
import { privacyService } from '@/services/privacy/privacyService';
import { toastService } from '@/services/toastService';

interface PrivacySettings {
  is_private: boolean;
  show_bankroll: boolean;
  show_stats: boolean;
  show_picks: boolean;
}

export default function PrivacySettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState<PrivacySettings>({
    is_private: false,
    show_bankroll: true,
    show_stats: true,
    show_picks: true,
  });

  useEffect(() => {
    const loadSettings = async () => {
      if (!user?.id) return;

      try {
        const privacySettings = await privacyService.getPrivacySettings(user.id);
        setSettings(privacySettings);
      } catch (error) {
        console.error('Error loading privacy settings:', error);
        toastService.show({
          message: 'Failed to load privacy settings',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user?.id]);

  const handleToggle = async (key: keyof PrivacySettings) => {
    if (!user?.id || isSaving) return;

    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setIsSaving(true);

    try {
      const result = await privacyService.updatePrivacySettings(user.id, {
        [key]: newSettings[key],
      });

      if (!result.success) {
        // Revert on error
        setSettings(settings);
        toastService.show({
          message: result.error || 'Failed to update privacy settings',
          type: 'error',
        });
      } else {
        toastService.show({
          message: 'Privacy settings updated',
          type: 'success',
        });
      }
    } catch {
      // Revert on error
      setSettings(settings);
      toastService.show({
        message: 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
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
        disabled={isSaving}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader title="Privacy Settings" />
        <View flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Privacy Settings" />

      <ScrollView>
        <View padding="$4">
          <Text fontSize={12} color="$textSecondary" marginBottom="$3">
            PROFILE VISIBILITY
          </Text>

          <SettingRow
            label="Private Account"
            description="Only approved followers can see your content"
            settingKey="is_private"
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
            description="Display your win percentage and record"
            settingKey="show_stats"
          />

          <SettingRow
            label="Show Picks History"
            description="Allow others to see your past picks"
            settingKey="show_picks"
          />

          {settings.is_private && (
            <View marginTop="$4" padding="$3" backgroundColor="$surfaceAlt" borderRadius="$2">
              <Text fontSize={14} color="$textSecondary">
                <Text fontWeight="600">Note:</Text> Making your account private will not affect
                existing followers. They will continue to see your content.
              </Text>
            </View>
          )}
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
