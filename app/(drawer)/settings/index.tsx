import React from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { useAuthStore } from '@/stores/authStore';
import { toastService } from '@/services/toastService';

// Admin check utility
const isAdmin = (userId: string): boolean => {
  const adminIds = process.env.EXPO_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
};

export default function SettingsScreen() {
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/(auth)/welcome');
    } catch (error) {
      console.error('Error signing out:', error);
      toastService.showError('Failed to sign out');
    }
  };

  const showAdminOptions = user && isAdmin(user.id);

  return (
    <View flex={1} backgroundColor="$background">
      <ScreenHeader title="Settings" />

      <ScrollView>
        {/* Account Section */}
        <View paddingTop="$4">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            ACCOUNT
          </Text>

          <SettingsRow
            icon="👤"
            label="Edit Profile"
            onPress={() => router.push('/settings/profile')}
            showArrow
          />

          <SettingsRow
            icon="🔒"
            label="Privacy"
            onPress={() => router.push('/settings/privacy')}
            showArrow
          />

          <SettingsRow
            icon="🔔"
            label="Notifications"
            onPress={() => router.push('/settings/notifications')}
            showArrow
          />

          <SettingsRow
            icon="📊"
            label="Stats Display"
            onPress={() => router.push('/settings/stats-display')}
            showArrow
          />

          <SettingsRow
            icon="🚫"
            label="Blocked Users"
            onPress={() => router.push('/settings/blocked')}
            showArrow
          />
        </View>

        {/* Admin Section */}
        {showAdminOptions && (
          <View paddingTop="$6">
            <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
              ADMIN
            </Text>

            <SettingsRow
              icon="🛡️"
              label="Moderation Panel"
              onPress={() => router.push('/admin/moderation')}
              showArrow
            />
          </View>
        )}

        {/* Support Section */}
        <View paddingTop="$6">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            SUPPORT
          </Text>

          <SettingsRow
            icon="❓"
            label="How to Play"
            onPress={() => router.push('/how-to-play')}
            showArrow
          />

          <SettingsRow
            icon="📧"
            label="Contact Support"
            onPress={() => toastService.showComingSoon('Contact Support')}
            showArrow
          />
        </View>

        {/* Legal Section */}
        <View paddingTop="$6">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            LEGAL
          </Text>

          <SettingsRow
            icon="📄"
            label="Terms of Service"
            onPress={() => router.push('/legal/terms')}
            showArrow
          />

          <SettingsRow
            icon="🔐"
            label="Privacy Policy"
            onPress={() => router.push('/legal/privacy')}
            showArrow
          />
        </View>

        {/* Logout */}
        <View paddingTop="$6" paddingBottom="$8">
          <SettingsRow icon="🚪" label="Log Out" onPress={handleLogout} />
        </View>
      </ScrollView>
    </View>
  );
}
