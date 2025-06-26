/**
 * Standard animation durations for consistency across the app
 */
export const ANIMATION_DURATION = {
  /** Standard animation duration (300ms) - Use for most animations */
  standard: 300,
  /** Fast animation duration (200ms) - Use for quick feedback */
  fast: 200,
  /** Slow animation duration (400ms) - Use for complex transitions */
  slow: 400,
  /** Extra fast (100ms) - Use for micro-interactions */
  instant: 100,
  /** Extra slow (600ms) - Use for dramatic effects */
  dramatic: 600,
} as const;

/**
 * Standard easing functions
 */
export const ANIMATION_EASING = {
  /** Default easing for most animations */
  standard: 'ease-in-out',
  /** For elements entering the screen */
  enter: 'ease-out',
  /** For elements leaving the screen */
  exit: 'ease-in',
  /** For bounce effects */
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

/**
 * Skeleton shimmer animation config
 */
export const SKELETON_CONFIG = {
  duration: 1500,
  minOpacity: 0.3,
  maxOpacity: 0.6,
} as const;
