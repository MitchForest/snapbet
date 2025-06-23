import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from '@tamagui/core';
import config from '@/theme';

export default function RootLayout() {
  return (
    <TamaguiProvider config={config}>
      <StatusBar style="dark" />
      <Slot />
    </TamaguiProvider>
  );
}
