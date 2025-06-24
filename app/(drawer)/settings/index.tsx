import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { SettingsRow } from '@/components/settings/SettingsRow';

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView>
        {/* Profile Settings */}
        <View marginTop="$3">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            PROFILE
          </Text>
          <SettingsRow
            icon="✏️"
            label="Edit Profile"
            onPress={() => router.push('/settings/profile')}
            showArrow
          />
          <SettingsRow
            icon="📊"
            label="Stats Display"
            subtitle="Choose your primary stat"
            onPress={() => router.push('/settings/stats-display')}
            showArrow
          />
        </View>

        {/* Notifications */}
        <View marginTop="$6">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            NOTIFICATIONS
          </Text>
          <SettingsRow
            icon="🔔"
            label="Notification Preferences"
            onPress={() => router.push('/settings/notifications')}
            showArrow
          />
        </View>

        {/* Privacy */}
        <View marginTop="$6">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            PRIVACY
          </Text>
          <SettingsRow
            icon="🔒"
            label="Privacy Settings"
            onPress={() => router.push('/settings/privacy')}
            showArrow
          />
        </View>

        {/* Account */}
        <View marginTop="$6">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            ACCOUNT
          </Text>
          <SettingsRow
            icon="🏈"
            label="Favorite Team"
            subtitle={user?.user_metadata?.favorite_team || 'Not set'}
            onPress={() => {
              // TODO: Show team selection modal
            }}
            showArrow
          />
          <SettingsRow icon="📧" label="Email" subtitle={user?.email || ''} disabled />
        </View>

        {/* About */}
        <View marginTop="$6" marginBottom="$6">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            ABOUT
          </Text>
          <SettingsRow icon="📱" label="Version" subtitle="1.0.0" disabled />
          <SettingsRow
            icon="📄"
            label="Terms of Service"
            onPress={() => {
              // TODO: Open terms
            }}
            showArrow
          />
          <SettingsRow
            icon="🔐"
            label="Privacy Policy"
            onPress={() => {
              // TODO: Open privacy policy
            }}
            showArrow
          />
        </View>
      </ScrollView>
    </View>
  );
}
