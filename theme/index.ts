import { createTamagui, createTokens } from '@tamagui/core';
import { config as configBase } from '@tamagui/config';
import { createInterFont } from '@tamagui/font-inter';
import { createAnimations } from '@tamagui/animations-react-native';
import { createMedia } from '@tamagui/react-native-media-driver';

// Create animations for smooth 60fps performance
const animations = createAnimations({
  bouncy: {
    type: 'spring',
    damping: 10,
    mass: 0.9,
    stiffness: 100,
  },
  lazy: {
    type: 'spring',
    damping: 20,
    stiffness: 60,
  },
  quick: {
    type: 'spring',
    damping: 20,
    mass: 1.2,
    stiffness: 250,
  },
  medium: {
    type: 'spring',
    damping: 15,
    stiffness: 120,
  },
  slow: {
    type: 'spring',
    damping: 15,
    stiffness: 40,
  },
});

// Font configuration
const headingFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 20,
    5: 24,
    6: 32,
  },
  weight: {
    1: '400',
    2: '500',
    3: '600',
  },
  letterSpacing: {
    1: 0,
    2: -0.5,
    3: -1,
  },
  face: {
    400: { normal: 'Inter' },
    500: { normal: 'InterMedium' },
    600: { normal: 'InterSemiBold' },
  },
});

const bodyFont = createInterFont({
  size: {
    1: 12,
    2: 14,
    3: 16,
    4: 18,
  },
  weight: {
    1: '400',
    2: '500',
  },
  letterSpacing: {
    1: 0,
    2: -0.1,
  },
  face: {
    400: { normal: 'Inter' },
    500: { normal: 'InterMedium' },
  },
});

// Create custom tokens based on SnapBet design system
const tokens = createTokens({
  ...configBase.tokens,
  color: {
    // Primary Colors
    background: '#FAF9F5', // Warm off-white
    surface: '#FFFFFF', // Cards, sheets
    surfaceAlt: '#F5F3EE', // Subtle sections
    primary: '#059669', // Emerald - CTAs
    primaryHover: '#047857', // Darker emerald

    // Action Colors
    tail: '#3B82F6', // Bright blue
    tailHover: '#2563EB', // Darker blue
    fade: '#FB923C', // Orange
    fadeHover: '#F97316', // Darker orange

    // Outcome Colors
    win: '#EAB308', // Gold
    loss: '#EF4444', // Red
    push: '#6B7280', // Gray

    // Text Colors
    textPrimary: '#1F2937', // Near black
    textSecondary: '#6B7280', // Gray
    textTertiary: '#9CA3AF', // Light gray
    textInverse: '#FFFFFF', // On dark

    // Utility Colors
    border: '#E5E7EB', // Light
    borderStrong: '#D1D5DB', // Medium
    divider: '#F3F4F6', // Very light
    overlay: 'rgba(0,0,0,0.5)',

    // Status Colors
    success: '#059669',
    error: '#EF4444',
    warning: '#EAB308',
    info: '#3B82F6',
  },
  space: {
    0: 0,
    0.5: 2,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
    10: 56,
    11: 64,
    12: 72,
    true: 4,
  },
  size: {
    0: 0,
    0.5: 2,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 32,
    8: 40,
    9: 48,
    10: 56,
    11: 64,
    12: 72,
    true: 4,
  },
  radius: {
    $0: 0,
    $1: 4,
    $2: 8,
    $3: 12,
    $4: 16,
    $5: 20,
    $6: 24,
    $true: 12,
    $round: 999,
  },
  zIndex: {
    $0: 0,
    $1: 100,
    $2: 200,
    $3: 300,
    $4: 400,
    $5: 500,
  },
});

// Media queries
const media = createMedia({
  xs: { maxWidth: 660 },
  sm: { maxWidth: 800 },
  md: { maxWidth: 1020 },
  lg: { maxWidth: 1280 },
  xl: { maxWidth: 1420 },
  xxl: { maxWidth: 1600 },
  gtXs: { minWidth: 660 + 1 },
  gtSm: { minWidth: 800 + 1 },
  gtMd: { minWidth: 1020 + 1 },
  gtLg: { minWidth: 1280 + 1 },
  short: { maxHeight: 820 },
  tall: { minHeight: 820 },
  hoverNone: { hover: 'none' },
  pointerCoarse: { pointer: 'coarse' },
});

// Create themes
const lightTheme = {
  background: tokens.color.background,
  backgroundHover: tokens.color.surfaceAlt,
  backgroundPress: tokens.color.surfaceAlt,
  backgroundFocus: tokens.color.surface,
  color: tokens.color.textPrimary,
  colorHover: tokens.color.textPrimary,
  colorPress: tokens.color.textPrimary,
  colorFocus: tokens.color.textPrimary,
  borderColor: tokens.color.border,
  borderColorHover: tokens.color.borderStrong,
  borderColorPress: tokens.color.borderStrong,
  borderColorFocus: tokens.color.primary,
  placeholderColor: tokens.color.textTertiary,
};

// Create and export the config
export const config = createTamagui({
  animations,
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: false,
  themeClassNameOnRoot: true,
  fonts: {
    heading: headingFont,
    body: bodyFont,
  },
  themes: {
    light: lightTheme,
  },
  tokens,
  media,
});

export type AppConfig = typeof config;

declare module '@tamagui/core' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
