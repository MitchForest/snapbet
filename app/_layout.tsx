import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
    <ErrorBoundary level="root">
      <AuthProvider>
        <TamaguiProvider config={config}>
          <ToastProvider>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </ToastProvider>
        </TamaguiProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
