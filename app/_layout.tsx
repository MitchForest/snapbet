import React, { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from '@tamagui/core';
import config from '@/theme';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';
import { View, Text } from '@tamagui/core';
import { ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { user, isAuthenticated, isLoading, checkSession } = useAuthStore();
  const [hasUsername, setHasUsername] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Check if user has username when authenticated
  useEffect(() => {
    async function checkUserProfile() {
      console.log('checkUserProfile - user:', user?.id);
      if (!user) {
        setHasUsername(null);
        return;
      }

      setCheckingProfile(true);
      try {
        const { data: profile } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        console.log('Profile check result:', profile);
        setHasUsername(!!profile?.username);
      } catch (error) {
        console.error('Error checking user profile:', error);
        setHasUsername(false);
      } finally {
        setCheckingProfile(false);
      }
    }

    checkUserProfile();
  }, [user]);

  // Handle navigation based on auth state
  useEffect(() => {
    console.log(
      'Navigation effect - isLoading:',
      isLoading,
      'checkingProfile:',
      checkingProfile,
      'isAuthenticated:',
      isAuthenticated,
      'hasUsername:',
      hasUsername
    );
    if (isLoading || checkingProfile) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inDrawerGroup = segments[0] === '(drawer)';

    // Add a small delay to ensure routes are mounted
    const navigationTimer = setTimeout(() => {
      if (!isAuthenticated) {
        // Not authenticated, redirect to welcome
        if (!inAuthGroup) {
          router.replace('/(auth)/welcome');
        }
      } else if (hasUsername === false) {
        // Authenticated but no username, redirect to onboarding
        if (segments.join('/') !== '(auth)/onboarding/username') {
          router.replace('/(auth)/onboarding/username');
        }
      } else if (hasUsername === true) {
        // Authenticated with username, redirect to main app
        if (!inDrawerGroup) {
          router.replace({
            pathname: '/(drawer)/(tabs)/index',
          });
        }
      }
    }, 100);

    return () => clearTimeout(navigationTimer);
  }, [isAuthenticated, hasUsername, isLoading, checkingProfile, segments, router]);

  // Show loading screen while checking auth
  if (isLoading || (isAuthenticated && checkingProfile)) {
    return (
      <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
        <ActivityIndicator size="large" color="#059669" />
        <Text marginTop="$4" color="$textSecondary">
          Loading...
        </Text>
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <AuthProvider>
        <StatusBar style="dark" />
        <RootLayoutNav />
      </AuthProvider>
    </TamaguiProvider>
  );
}
