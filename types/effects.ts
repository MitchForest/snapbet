export interface Effect {
  id: string;
  name: string;
  category: EffectCategory;
  tier: 0 | 1 | 2 | 3;
  requirement?: {
    type: 'badge' | 'multiple_badges';
    badges: string[];
  };
  lottieSource: object; // Lottie JSON object
  preview: string; // Preview emoji/icon
  duration?: number; // Animation duration in ms
  loop?: boolean;
  position?: 'fullscreen' | 'top' | 'bottom' | 'center';
}

export enum EffectCategory {
  EMOTIONS = 'emotions',
  SPORTS = 'sports',
  WEATHER = 'weather',
  CELEBRATIONS = 'celebrations',
  TEXT = 'text',
}

export interface EffectWithUnlockStatus extends Effect {
  isUnlocked: boolean;
}
