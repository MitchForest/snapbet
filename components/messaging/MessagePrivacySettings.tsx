import React from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { Switch, StyleSheet } from 'react-native';
import { Pressable } from 'react-native';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { useMessagePrivacy } from '@/hooks/useMessagePrivacy';
import { WhoCanMessage } from '@/services/messaging/messagingPrivacyService';
import { Colors } from '@/theme';

export const MessagePrivacySettings = () => {
  const { settings, updateSettings, isUpdating } = useMessagePrivacy();

  const handleWhoCanMessageChange = (value: WhoCanMessage) => {
    updateSettings({ who_can_message: value });
  };

  const handleToggle = (
    key: 'read_receipts_enabled' | 'typing_indicators_enabled' | 'online_status_visible'
  ) => {
    updateSettings({ [key]: !settings[key] });
  };

  const RadioButton = ({ selected }: { selected: boolean }) => (
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  );

  return (
    <Stack gap="$4">
      <Stack gap="$2">
        <Text fontSize="$5" fontWeight="bold">
          Who can message me
        </Text>
        <Stack gap="$2">
          <Pressable onPress={() => handleWhoCanMessageChange('everyone')} disabled={isUpdating}>
            <Stack
              flexDirection="row"
              gap="$2"
              alignItems="center"
              paddingVertical="$2"
              opacity={isUpdating ? 0.5 : 1}
            >
              <RadioButton selected={settings.who_can_message === 'everyone'} />
              <Stack flex={1}>
                <Text fontSize="$4">Everyone</Text>
                <Text fontSize="$3" color="$gray11">
                  Anyone on SnapBet can message you
                </Text>
              </Stack>
            </Stack>
          </Pressable>

          <Pressable onPress={() => handleWhoCanMessageChange('following')} disabled={isUpdating}>
            <Stack
              flexDirection="row"
              gap="$2"
              alignItems="center"
              paddingVertical="$2"
              opacity={isUpdating ? 0.5 : 1}
            >
              <RadioButton selected={settings.who_can_message === 'following'} />
              <Stack flex={1}>
                <Text fontSize="$4">Only people I follow</Text>
                <Text fontSize="$3" color="$gray11">
                  Limit messages to people you follow
                </Text>
              </Stack>
            </Stack>
          </Pressable>

          <Pressable onPress={() => handleWhoCanMessageChange('nobody')} disabled={isUpdating}>
            <Stack
              flexDirection="row"
              gap="$2"
              alignItems="center"
              paddingVertical="$2"
              opacity={isUpdating ? 0.5 : 1}
            >
              <RadioButton selected={settings.who_can_message === 'nobody'} />
              <Stack flex={1}>
                <Text fontSize="$4">Nobody</Text>
                <Text fontSize="$3" color="$gray11">
                  Turn off all messaging
                </Text>
              </Stack>
            </Stack>
          </Pressable>
        </Stack>
      </Stack>

      <View height={1} backgroundColor="$borderColor" marginVertical="$2" />

      <Stack gap="$3">
        <Text fontSize="$5" fontWeight="bold">
          Message Settings
        </Text>

        <SettingsRow
          label="Read Receipts"
          subtitle="Show when you've read messages"
          disabled={isUpdating}
          customRight={
            <Switch
              value={settings.read_receipts_enabled}
              onValueChange={() => handleToggle('read_receipts_enabled')}
              disabled={isUpdating}
              trackColor={{ false: Colors.border.default, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          }
        />

        <SettingsRow
          label="Typing Indicators"
          subtitle="Show when you're typing"
          disabled={isUpdating}
          customRight={
            <Switch
              value={settings.typing_indicators_enabled}
              onValueChange={() => handleToggle('typing_indicators_enabled')}
              disabled={isUpdating}
              trackColor={{ false: Colors.border.default, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          }
        />

        <SettingsRow
          label="Online Status"
          subtitle="Show when you're online"
          disabled={isUpdating}
          customRight={
            <Switch
              value={settings.online_status_visible}
              onValueChange={() => handleToggle('online_status_visible')}
              disabled={isUpdating}
              trackColor={{ false: Colors.border.default, true: Colors.primary }}
              thumbColor={Colors.white}
            />
          }
        />
      </Stack>
    </Stack>
  );
};

const styles = StyleSheet.create({
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
