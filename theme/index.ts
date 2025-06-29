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
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    true: 12,
    round: 999,
  },
  zIndex: {
    0: 0,
    1: 100,
    2: 200,
    3: 300,
    4: 400,
    5: 500,
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

// Export standardized color constants for direct use in components
export const Colors = {
  // Primary colors
  primary: '#10B981', // Main emerald green
  primaryDark: '#059669', // Darker emerald for pressed states
  primaryLight: '#34D399', // Lighter emerald for hover states

  // Background colors
  background: '#FAF9F5', // Warm off-white background
  surface: '#FFFFFF', // Pure white for cards/surfaces
  surfaceAlt: '#F5F3EE', // Subtle background for sections
  lightGreen: '#F0FDF4', // Light green background

  // Text colors
  text: {
    primary: '#1F2937', // Near black for primary text
    secondary: '#6B7280', // Medium gray for secondary text
    tertiary: '#9CA3AF', // Light gray for tertiary text
    inverse: '#FFFFFF', // White text on dark backgrounds
  },

  // Border colors
  border: {
    default: '#E5E7EB', // Light border
    medium: '#D1D5DB', // Medium border
    light: '#F3F4F6', // Very light border/divider
    focus: '#10B981', // Primary color for focus states
  },

  // Status colors
  error: '#EF4444', // Red for errors
  success: '#10B981', // Same as primary for consistency
  warning: '#FBBF24', // Amber for warnings
  info: '#60A5FA', // Blue for informational messages
  ai: '#8B5CF6', // Purple for AI features

  // Action colors (for betting)
  tail: '#3B82F6', // Bright blue for tail
  tailHover: '#2563EB', // Darker blue for tail hover
  fade: '#FB923C', // Orange for fade
  fadeHover: '#F97316', // Darker orange for fade hover

  // Outcome colors
  win: '#EAB308', // Gold for wins
  loss: '#EF4444', // Red for losses
  push: '#6B7280', // Gray for pushes

  // Utility colors
  overlay: 'rgba(0,0,0,0.5)', // Semi-transparent overlay
  shadow: 'rgba(0, 0, 0, 0.5)', // Shadow color
  transparent: 'transparent',

  // Camera-specific colors
  camera: {
    captureButton: '#FFFFFF', // White capture button
    captureButtonBorder: '#E5E7EB', // Light border for capture button
    recordingRed: '#EF4444', // Red for recording indicator
    controlsBackground: 'rgba(0,0,0,0.8)', // Semi-transparent background for controls
    flashActive: '#F59E0B', // Yellow for active flash
    flashInactive: '#FFFFFF', // White for inactive flash
    modeButtonActive: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white for active mode
  },

  // Legacy mappings (for easier migration)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

export { OpacityColors } from './colors/opacity';
