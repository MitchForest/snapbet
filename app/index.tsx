import { Redirect } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useEffect, useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme';

export default function App() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [hasUsername, setHasUsername] = useState(false);

  console.log(`[${new Date().toISOString()}] App index.tsx - RENDER`, {
    isAuthenticated,
    isLoading,
    userId: user?.id,
    checkingUsername,
    hasUsername,
  });

  useEffect(() => {
    const checkUsername = async () => {
      if (isAuthenticated && user && !isLoading) {
        setCheckingUsername(true);
        console.log(`[${new Date().toISOString()}] App index.tsx - Checking username for user:`, user.id);
        const { data, error } = await supabase.from('users').select('username').eq('id', user.id).single();
        
        if (error) {
          console.error(`[${new Date().toISOString()}] App index.tsx - Error checking username:`, error);
          setHasUsername(false);
        } else {
          console.log(`[${new Date().toISOString()}] App index.tsx - Username check result:`, data?.username);
          setHasUsername(!!data?.username);
        }
        setCheckingUsername(false);
      }
    };

    if (!isLoading) {
      checkUsername();
    }
  }, [isAuthenticated, isLoading, user]);

  // Show loading while checking auth status or username
  if (isLoading || checkingUsername) {
    console.log(`[${new Date().toISOString()}] App index.tsx - Showing loading state`);
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // If not authenticated, go to welcome screen
  if (!isAuthenticated) {
    console.log(`[${new Date().toISOString()}] App index.tsx - Not authenticated, redirecting to welcome`);
    return <Redirect href="/(auth)/welcome" />;
  }

  // If authenticated but no username, go to onboarding
  if (!hasUsername) {
    console.log(`[${new Date().toISOString()}] App index.tsx - No username, redirecting to onboarding`);
    return <Redirect href="/(auth)/onboarding/username" />;
  }

  // Otherwise, go to main app
  console.log(`[${new Date().toISOString()}] App index.tsx - Authenticated with username, redirecting to main app`);
  return <Redirect href="/(drawer)/(tabs)" />;
}
