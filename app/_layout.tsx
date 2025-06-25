import React from 'react';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TamaguiProvider } from '@tamagui/core';
import config from '@/theme';

function RootLayoutNav() {
  console.log('RootLayoutNav rendering...');
  return <Slot />;
}

export default function RootLayout() {
  console.log('RootLayout rendering...');
  return (
    <TamaguiProvider config={config}>
      <StatusBar style="dark" />
      <RootLayoutNav />
    </TamaguiProvider>
  );
}
