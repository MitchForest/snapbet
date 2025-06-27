import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Switch } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { Colors } from '@/theme';
import { Storage } from '@/services/storage/storageService';

interface GlobalNotificationSettings {
  push_enabled: boolean;
  messages_enabled: boolean;
  social_enabled: boolean;
  betting_enabled: boolean;
}

const DEFAULT_SETTINGS: GlobalNotificationSettings = {
  push_enabled: true,
  messages_enabled: true,
  social_enabled: true,
  betting_enabled: true,
};

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<GlobalNotificationSettings>(() => {
    const saved = Storage.general.get<GlobalNotificationSettings>('notification_settings');
    return saved || DEFAULT_SETTINGS;
  });

  const handleToggle = (key: keyof GlobalNotificationSettings) => {
    const newSettings = { ...settings, [key]: !settings[key] };

    // If turning off master switch, turn off all categories
    if (key === 'push_enabled' && !newSettings.push_enabled) {
      newSettings.messages_enabled = false;
      newSettings.social_enabled = false;
      newSettings.betting_enabled = false;
    }

    setSettings(newSettings);
    Storage.general.set('notification_settings', newSettings);
  };

  return (
    <View flex={1} backgroundColor="$background">
      <ScreenHeader title="Notifications" />

      <ScrollView>
        <View padding="$4">
          <Text fontSize="$6" fontWeight="bold" marginBottom="$4">
            Push Notifications
          </Text>

          <SettingsRow
            label="All Notifications"
            subtitle="Master toggle for all push notifications"
            customRight={
              <Switch
                value={settings.push_enabled}
                onValueChange={() => handleToggle('push_enabled')}
                trackColor={{ false: Colors.border.default, true: Colors.primary }}
                thumbColor={Colors.white}
              />
            }
          />

          {settings.push_enabled && (
            <View marginTop="$4">
              <Text fontSize="$5" fontWeight="600" marginBottom="$3" color="$gray11">
                Notification Categories
              </Text>

              <SettingsRow
                label="Messages"
                subtitle="New messages and reactions"
                customRight={
                  <Switch
                    value={settings.messages_enabled}
                    onValueChange={() => handleToggle('messages_enabled')}
                    trackColor={{ false: Colors.border.default, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                }
              />

              <SettingsRow
                label="Social"
                subtitle="Follows, comments, and tails/fades"
                customRight={
                  <Switch
                    value={settings.social_enabled}
                    onValueChange={() => handleToggle('social_enabled')}
                    trackColor={{ false: Colors.border.default, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                }
              />

              <SettingsRow
                label="Betting"
                subtitle="Bet outcomes and bankroll updates"
                customRight={
                  <Switch
                    value={settings.betting_enabled}
                    onValueChange={() => handleToggle('betting_enabled')}
                    trackColor={{ false: Colors.border.default, true: Colors.primary }}
                    thumbColor={Colors.white}
                  />
                }
              />
            </View>
          )}

          <View marginTop="$6">
            <Text fontSize="$3" color="$textSecondary" textAlign="center">
              You can manage notification permissions for Snapbet in your device&apos;s Settings
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
