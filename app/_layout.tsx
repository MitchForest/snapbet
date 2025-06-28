import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { TamaguiProvider } from '@tamagui/core';
import { AuthProvider } from '@/components/auth/AuthProvider';
import { ToastProvider } from '@/components/common/ToastProvider';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { config } from '@/theme';

function RootLayoutNav() {
  console.log('RootLayoutNav rendering...');
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  console.log('RootLayout rendering...');
  return (
    <GestureHandlerRootView style={styles.container}>
      <ErrorBoundary level="root">
        <AuthProvider>
          <TamaguiProvider config={config}>
            <BottomSheetModalProvider>
              <ToastProvider>
                <StatusBar style="dark" />
                <RootLayoutNav />
              </ToastProvider>
            </BottomSheetModalProvider>
          </TamaguiProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
