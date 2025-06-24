import React, { useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/services/supabase/client';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Get the session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Callback error:', error);
          router.replace('/(auth)/welcome');
          return;
        }

        if (session) {
          // Check if user has username
          const { data: profile } = await supabase
            .from('users')
            .select('username')
            .eq('id', session.user.id)
            .single();

          if (profile?.username) {
            router.replace('/(drawer)/(tabs)');
          } else {
            router.replace('/(auth)/onboarding/username');
          }
        } else {
          router.replace('/(auth)/welcome');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.replace('/(auth)/welcome');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <View flex={1} backgroundColor="$background" justifyContent="center" alignItems="center">
      <ActivityIndicator size="large" color="#059669" />
      <Text marginTop="$4" color="$textSecondary">
        Completing sign in...
      </Text>
    </View>
  );
}
