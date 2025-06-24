// ========================================
// BATCH 4: WILD CARDS & BETTING-SPECIFIC CATEGORIES
// ========================================
// This batch implements 14 Tier 0 effects:
//
// WILD CARDS (7 effects):
// - good_vibes: 🌈 Good Vibes
// - side_eye: 👀 Side Eye
// - chefs_kiss: 👨‍🍳 Chef's Kiss
// - this_you: 🤔📸 This You?
// - npc_mode: 🤖 NPC Mode
// - sparkle: ✨ Sparkle
// - diamond_hands_preview: 💎🙌 Diamond Hands (preview mode)
//
// BETTING-SPECIFIC (7 effects):
// - sweating_bullets: 😅💦 Sweating Bullets
// - down_bad: 📉😩 Down Bad
// - bet_slip_drop: 📋💵 Bet Slip Drop
// - boosted: ⚡📈 Boosted
// - to_the_moon: 🚀🌙 To The Moon (moved from Batch 1 rocket)
// - bag_alert: 💼🚨 Bag Alert (preview mode)
// - buzzer_beater: ⏰💥 Buzzer Beater (preview mode)
// ========================================

// ========================================
// File: components/effects/constants/batch4Effects.ts
// ========================================

import { EffectConfig } from '../types';

export const BATCH4_EFFECTS: Record<string, EffectConfig> = {
  // ==================== WILD CARDS CATEGORY ====================
  
  // 🌈 GOOD VIBES
  good_vibes: {
    id: 'good_vibes',
    name: 'Good Vibes',
    tier: 0,
    category: 'wildcards',
    particles: [
      { emoji: '🌈', count: 1, size: { min: 120, max: 120 } },
      { emoji: '☁️', count: 6, size: { min: 30, max: 50 } },
      { emoji: '✨', count: 15, size: { min: 15, max: 25 } }
    ],
    physics: 'rainbowArc',
    duration: 'continuous'
  },

  // 👀 SIDE EYE
  side_eye: {
    id: 'side_eye',
    name: 'Side Eye',
    tier: 0,
    category: 'wildcards',
    particles: [
      { emoji: '👀', count: 20, size: { min: 25, max: 40 } }
    ],
    physics: 'slideInLook',
    duration: 'continuous'
  },

  // 👨‍🍳 CHEF'S KISS
  chefs_kiss: {
    id: 'chefs_kiss',
    name: "Chef's Kiss",
    tier: 0,
    category: 'wildcards',
    particles: [
      { emoji: '👨‍🍳', count: 1, size: { min: 60, max: 60 } },
      { emoji: '💋', count: 5, size: { min: 25, max: 35 } },
      { emoji: '✨', count: 10, size: { min: 15, max: 20 } }
    ],
    physics: 'kissMotion',
    duration: 1500
  },

  // 🤔📸 THIS YOU?
  this_you: {
    id: 'this_you',
    name: 'This You?',
    tier: 0,
    category: 'wildcards',
    particles: [
      { emoji: '🤔', count: 1, size: { min: 60, max: 60 } },
      { emoji: '📸', count: 1, size: { min: 50, max: 50 } }
    ],
    physics: 'cameraFlash',
    duration: 1000
  },

  // 🤖 NPC MODE
  npc_mode: {
    id: 'npc_mode',
    name: 'NPC Mode',
    tier: 0,
    category: 'wildcards',
    particles: [
      { emoji: '🤖', count: 15, size: { min: 30, max: 40 } }
    ],
    physics: 'roboticMarch',
    duration: 'continuous'
  },

  // ✨ SPARKLE
  sparkle: {
    id: 'sparkle',
    name: 'Sparkle',
    tier: 0,
    category: 'wildcards',
    particles: [
      { emoji: '✨', count: 30, size: { min: 15, max: 35 } }
    ],
    physics: 'twinkle',
    duration: 'continuous'
  },

  // 💎🙌 DIAMOND HANDS (Preview Mode)
  diamond_hands_preview: {
    id: 'diamond_hands_preview',
    name: 'Diamond Hands (Preview)',
    tier: 0,
    category: 'wildcards',
    particles: [
      { emoji: '💎', count: 10, size: { min: 30, max: 40 } },
      { emoji: '🙌', count: 2, size: { min: 50, max: 50 } }
    ],
    physics: 'holdStrong',
    duration: 5000 // Preview lasts 5 seconds
  },

  // ==================== BETTING-SPECIFIC CATEGORY ====================

  // 😅💦 SWEATING BULLETS
  sweating_bullets: {
    id: 'sweating_bullets',
    name: 'Sweating Bullets',
    tier: 0,
    category: 'betting',
    particles: [
      { emoji: '😅', count: 1, size: { min: 80, max: 80 } },
      { emoji: '💦', count: 20, size: { min: 15, max: 25 } },
      { emoji: '💧', count: 15, size: { min: 10, max: 20 } }
    ],
    physics: 'intensifySweat',
    duration: 'continuous'
  },

  // 📉😩 DOWN BAD
  down_bad: {
    id: 'down_bad',
    name: 'Down Bad',
    tier: 0,
    category: 'betting',
    particles: [
      { emoji: '📉', count: 1, size: { min: 70, max: 70 } },
      { emoji: '😩', count: 1, size: { min: 60, max: 60 } },
      { emoji: '💸', count: 15, size: { min: 20, max: 30 } }
    ],
    physics: 'spiralDown',
    duration: 2000
  },

  // 📋💵 BET SLIP DROP
  bet_slip_drop: {
    id: 'bet_slip_drop',
    name: 'Bet Slip Drop',
    tier: 0,
    category: 'betting',
    particles: [
      { emoji: '📋', count: 1, size: { min: 60, max: 60 } },
      { emoji: '💵', count: 20, size: { min: 25, max: 35 } }
    ],
    physics: 'formAmount',
    duration: 2000
  },

  // ⚡📈 BOOSTED
  boosted: {
    id: 'boosted',
    name: 'Boosted',
    tier: 0,
    category: 'betting',
    particles: [
      { emoji: '⚡', count: 5, size: { min: 30, max: 40 } },
      { emoji: '📈', count: 1, size: { min: 60, max: 60 } },
      { emoji: '🔥', count: 8, size: { min: 20, max: 30 } }
    ],
    physics: 'lightningStrike',
    duration: 1500
  },

  // 🚀🌙 TO THE MOON (Enhanced from Batch 1)
  to_the_moon: {
    id: 'to_the_moon',
    name: 'To The Moon',
    tier: 0,
    category: 'betting',
    particles: [
      { emoji: '🚀', count: 1, size: { min: 60, max: 60 } },
      { emoji: '🌙', count: 1, size: { min: 80, max: 80 } },
      { emoji: '⭐', count: 15, size: { min: 15, max: 25 } },
      { emoji: '💰', count: 10, size: { min: 20, max: 30 } }
    ],
    physics: 'moonLaunch',
    duration: 3000
  },

  // 💼🚨 BAG ALERT (Preview Mode)
  bag_alert_preview: {
    id: 'bag_alert_preview',
    name: 'Bag Alert (Preview)',
    tier: 0,
    category: 'betting',
    particles: [
      { emoji: '💼', count: 1, size: { min: 70, max: 70 } },
      { emoji: '🚨', count: 4, size: { min: 30, max: 40 } },
      { emoji: '💰', count: 15, size: { min: 25, max: 35 } }
    ],
    physics: 'alertOpen',
    duration: 5000 // Preview
  },

  // ⏰💥 BUZZER BEATER (Preview Mode)
  buzzer_beater_preview: {
    id: 'buzzer_beater_preview',
    name: 'Buzzer Beater (Preview)',
    tier: 0,
    category: 'betting',
    particles: [
      { emoji: '⏰', count: 1, size: { min: 60, max: 60 } },
      { emoji: '💥', count: 8, size: { min: 30, max: 45 } },
      { emoji: '🎯', count: 1, size: { min: 50, max: 50 } }
    ],
    physics: 'clockCountdown',
    duration: 5000 // Preview
  }
};

// ========================================
// File: components/effects/particles/Batch4Particles.tsx
// ========================================

import React, { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';
import type { PhysicsType } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Batch4ParticleProps {
  emoji: string;
  index: number;
  physics: PhysicsType;
  duration: number | null;
  size?: { min: number; max: number };
  totalCount?: number;
  onComplete?: () => void;
}

export const Batch4Particle: React.FC<Batch4ParticleProps> = ({
  emoji,
  index,
  physics,
  duration,
  size = { min: 20, max: 40 },
  totalCount = 20,
  onComplete
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(1);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const delay = index * 30;
    const particleSize = size.min + Math.random() * (size.max - size.min);
    const scaleFactor = particleSize / 30;

    switch (physics) {
      // 🌈 RAINBOW ARC - Rainbow with clouds and sparkles
      case 'rainbowArc':
        if (emoji === '🌈') {
          // Rainbow arc across top
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT * 0.2;
          scale.value = scaleFactor;
          
          // Gentle shimmer
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.05, { duration: 2000 }),
              withTiming(scaleFactor, { duration: 2000 })
            ),
            -1,
            true
          );
        } else if (emoji === '☁️') {
          // Clouds float along rainbow
          const cloudProgress = index / 6;
          const arcX = SCREEN_WIDTH * 0.2 + cloudProgress * SCREEN_WIDTH * 0.6;
          const arcY = SCREEN_HEIGHT * 0.2 - Math.sin(cloudProgress * Math.PI) * 50;
          
          translateX.value = arcX;
          translateY.value = arcY;
          scale.value = withDelay(delay, withSpring(scaleFactor));
          
          // Gentle cloud movement
          translateX.value = withRepeat(
            withSequence(
              withTiming(arcX - 20, { duration: 3000 }),
              withTiming(arcX + 20, { duration: 3000 })
            ),
            -1,
            true
          );
        } else {
          // Sparkles around rainbow
          const sparkleX = SCREEN_WIDTH * 0.1 + Math.random() * SCREEN_WIDTH * 0.8;
          const sparkleY = SCREEN_HEIGHT * 0.1 + Math.random() * 0.2 * SCREEN_HEIGHT;
          
          translateX.value = sparkleX;
          translateY.value = sparkleY;
          
          // Twinkle effect
          opacity.value = withDelay(
            Math.random() * 2000,
            withRepeat(
              withSequence(
                withTiming(0, { duration: 300 }),
                withTiming(1, { duration: 300 })
              ),
              -1,
              false
            )
          );
          
          scale.value = withDelay(
            Math.random() * 2000,
            withRepeat(
              withSequence(
                withSpring(scaleFactor * 1.5),
                withSpring(scaleFactor * 0.5)
              ),
              -1,
              false
            )
          );
        }
        break;

      // 👀 SLIDE IN LOOK - Eyes sliding in from sides
      case 'slideInLook':
        const isLeft = index % 2 === 0;
        const startX = isLeft ? -50 : SCREEN_WIDTH + 50;
        const targetX = isLeft 
          ? 50 + Math.random() * (SCREEN_WIDTH / 2 - 100)
          : SCREEN_WIDTH / 2 + Math.random() * (SCREEN_WIDTH / 2 - 100);
        const lookY = SCREEN_HEIGHT * 0.2 + Math.random() * SCREEN_HEIGHT * 0.6;
        
        translateX.value = startX;
        translateY.value = lookY;
        
        // Slide in
        translateX.value = withDelay(
          delay,
          withSpring(targetX, { damping: 15, stiffness: 100 })
        );
        
        scale.value = withDelay(delay, withSpring(scaleFactor));
        
        // Look around
        const lookAnimation = () => {
          translateX.value = withRepeat(
            withSequence(
              withTiming(targetX - 30, { duration: 800 }),
              withTiming(targetX + 30, { duration: 800 }),
              withTiming(targetX, { duration: 400 })
            ),
            -1,
            false
          );
        };
        
        setTimeout(lookAnimation, delay + 1000);
        break;

      // 👨‍🍳 KISS MOTION - Chef kisses with sparkles
      case 'kissMotion':
        if (emoji === '👨‍🍳') {
          // Chef appears
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = withSpring(scaleFactor);
          
          // Lean for kiss
          rotation.value = withSequence(
            withTiming(-10, { duration: 300 }),
            withTiming(0, { duration: 300 })
          );
        } else if (emoji === '💋') {
          // Kiss marks fly out
          const kissAngle = (Math.PI * 2 * index) / 5;
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          
          scale.value = withDelay(300, withSpring(scaleFactor));
          
          // Fly outward
          translateX.value = withDelay(
            300,
            withTiming(SCREEN_WIDTH / 2 + Math.cos(kissAngle) * 100, {
              duration: 800,
              easing: Easing.out(Easing.back)
            })
          );
          
          translateY.value = withDelay(
            300,
            withTiming(SCREEN_HEIGHT / 2 + Math.sin(kissAngle) * 100, {
              duration: 800,
              easing: Easing.out(Easing.back)
            })
          );
          
          opacity.value = withDelay(800, withTiming(0, { duration: 300 }));
        } else {
          // Sparkles
          const sparkleRadius = 80 + Math.random() * 40;
          const sparkleAngle = Math.random() * Math.PI * 2;
          
          translateX.value = SCREEN_WIDTH / 2 + Math.cos(sparkleAngle) * sparkleRadius;
          translateY.value = SCREEN_HEIGHT / 2 + Math.sin(sparkleAngle) * sparkleRadius;
          
          scale.value = withDelay(
            400 + Math.random() * 200,
            withSequence(
              withSpring(scaleFactor),
              withDelay(300, withTiming(0, { duration: 200 }))
            )
          );
        }
        break;

      // 🤔📸 CAMERA FLASH - Thinking face with camera flash
      case 'cameraFlash':
        if (emoji === '🤔') {
          // Thinking face
          translateX.value = SCREEN_WIDTH * 0.3;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = withSpring(scaleFactor);
          
          // Thinking motion
          translateY.value = withRepeat(
            withSequence(
              withTiming(SCREEN_HEIGHT / 2 - 10, { duration: 500 }),
              withTiming(SCREEN_HEIGHT / 2, { duration: 500 })
            ),
            1,
            true
          );
        } else {
          // Camera
          translateX.value = SCREEN_WIDTH * 0.7;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = withDelay(200, withSpring(scaleFactor));
          
          // Flash effect
          scale.value = withDelay(
            600,
            withSequence(
              withTiming(scaleFactor * 1.5, { duration: 100 }),
              withTiming(scaleFactor, { duration: 100 })
            )
          );
          
          // Screen flash (simulate with large white emoji)
          if (index === 1) {
            opacity.value = withDelay(
              600,
              withSequence(
                withTiming(0.8, { duration: 50 }),
                withTiming(0, { duration: 150 })
              )
            );
          }
        }
        break;

      // 🤖 ROBOTIC MARCH - NPCs marching in sync
      case 'roboticMarch':
        const row = Math.floor(index / 5);
        const col = index % 5;
        const marchX = SCREEN_WIDTH * 0.1 + col * (SCREEN_WIDTH * 0.18);
        const marchY = SCREEN_HEIGHT * 0.3 + row * 100;
        
        translateX.value = marchX;
        translateY.value = -50;
        
        // March into position
        translateY.value = withDelay(
          row * 200 + col * 50,
          withSpring(marchY, { damping: 20, stiffness: 200 })
        );
        
        scale.value = withDelay(
          row * 200 + col * 50,
          withSpring(scaleFactor)
        );
        
        // Synchronized movement
        const marchAnimation = () => {
          translateY.value = withRepeat(
            withSequence(
              withTiming(marchY - 10, { duration: 300 }),
              withTiming(marchY, { duration: 300 })
            ),
            -1,
            true
          );
          
          // Robotic rotation
          rotation.value = withRepeat(
            withSequence(
              withTiming(-5, { duration: 300 }),
              withTiming(5, { duration: 300 })
            ),
            -1,
            true
          );
        };
        
        setTimeout(marchAnimation, 1500);
        break;

      // ✨ TWINKLE - Random sparkles appearing
      case 'twinkle':
        const twinkleX = Math.random() * SCREEN_WIDTH;
        const twinkleY = Math.random() * SCREEN_HEIGHT;
        
        translateX.value = twinkleX;
        translateY.value = twinkleY;
        
        // Random delay for each sparkle
        const twinkleDelay = Math.random() * 3000;
        
        opacity.value = withDelay(
          twinkleDelay,
          withRepeat(
            withSequence(
              withTiming(0, { duration: 0 }),
              withTiming(1, { duration: 200 }),
              withTiming(1, { duration: 300 }),
              withTiming(0, { duration: 200 }),
              withTiming(0, { duration: 1000 })
            ),
            -1,
            false
          )
        );
        
        scale.value = withDelay(
          twinkleDelay,
          withRepeat(
            withSequence(
              withTiming(0, { duration: 0 }),
              withSpring(scaleFactor * 1.2),
              withTiming(scaleFactor, { duration: 300 }),
              withTiming(0, { duration: 200 }),
              withTiming(0, { duration: 1000 })
            ),
            -1,
            false
          )
        );
        
        rotation.value = withRepeat(
          withTiming(360, { duration: 3000, easing: Easing.linear }),
          -1
        );
        break;

      // 💎🙌 HOLD STRONG - Diamond hands holding position
      case 'holdStrong':
        if (emoji === '🙌') {
          // Hands at bottom
          const handX = index === 0 ? SCREEN_WIDTH * 0.3 : SCREEN_WIDTH * 0.7;
          translateX.value = handX;
          translateY.value = SCREEN_HEIGHT * 0.7;
          scale.value = scaleFactor;
          
          // Holding motion
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor * 1.1, { duration: 1000 }),
              withTiming(scaleFactor, { duration: 1000 })
            ),
            2,
            true
          );
        } else {
          // Diamonds sparkle above hands
          const diamondX = SCREEN_WIDTH * 0.2 + (index / 10) * SCREEN_WIDTH * 0.6;
          const diamondY = SCREEN_HEIGHT * 0.5 + Math.sin(index) * 50;
          
          translateX.value = diamondX;
          translateY.value = SCREEN_HEIGHT;
          
          // Rise up
          translateY.value = withDelay(
            delay,
            withSpring(diamondY, { damping: 10, stiffness: 50 })
          );
          
          scale.value = withDelay(delay, withSpring(scaleFactor));
          
          // Sparkle effect
          opacity.value = withDelay(
            delay + 500,
            withRepeat(
              withSequence(
                withTiming(0.7, { duration: 500 }),
                withTiming(1, { duration: 500 })
              ),
              2,
              true
            )
          );
        }
        
        // End preview
        if (duration) {
          opacity.value = withDelay(
            duration - 500,
            withTiming(0, { duration: 500 })
          );
        }
        break;

      // 😅💦 INTENSIFY SWEAT - Sweating increases over time
      case 'intensifySweat':
        if (emoji === '😅') {
          // Main sweating face
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT * 0.3;
          scale.value = scaleFactor;
          
          // Nervous shake
          translateX.value = withRepeat(
            withSequence(
              withTiming(SCREEN_WIDTH / 2 - 5, { duration: 100 }),
              withTiming(SCREEN_WIDTH / 2 + 5, { duration: 100 })
            ),
            -1,
            true
          );
          
          // Grow slightly as stress increases
          scale.value = withRepeat(
            withSequence(
              withTiming(scaleFactor, { duration: 2000 }),
              withTiming(scaleFactor * 1.1, { duration: 2000 })
            ),
            -1,
            true
          );
        } else {
          // Sweat drops intensify
          const sweatX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;
          translateX.value = sweatX;
          translateY.value = SCREEN_HEIGHT * 0.3 + 50;
          
          const dropDelay = Math.random() * 2000;
          scale.value = withDelay(dropDelay, withSpring(scaleFactor));
          
          // Fall faster over time
          const fallDuration = 1500 - (index * 50); // Gets faster
          
          translateY.value = withDelay(
            dropDelay,
            withRepeat(
              withTiming(SCREEN_HEIGHT + 50, {
                duration: Math.max(800, fallDuration),
                easing: Easing.in(Easing.quad)
              }),
              -1,
              false
            )
          );
          
          // More drops appear over time
          opacity.value = withDelay(
            dropDelay,
            withRepeat(
              withSequence(
                withTiming(1, { duration: 200 }),
                withTiming(1, { duration: 300 }),
                withTiming(0, { duration: 200 })
              ),
              -1,
              false
            )
          );
        }
        break;

      // 📉😩 SPIRAL DOWN - Chart and face spiral downward
      case 'spiralDown':
        if (emoji === '📉') {
          // Chart spirals down
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT * 0.2;
          scale.value = scaleFactor;
          
          // Spiral motion
          const spiralAnimation = () => {
            let progress = 0;
            const animate = () => {
              progress += 0.02;
              if (progress <= 1) {
                const radius = progress * 100;
                const angle = progress * Math.PI * 4;
                
                translateX.value = SCREEN_WIDTH / 2 + Math.cos(angle) * radius;
                translateY.value = SCREEN_HEIGHT * 0.2 + progress * SCREEN_HEIGHT * 0.5;
                rotation.value = progress * 360;
                
                animationRef.current = requestAnimationFrame(animate);
              }
            };
            animate();
          };
          
          spiralAnimation();
        } else if (emoji === '😩') {
          // Face follows chart
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT * 0.3;
          
          scale.value = withDelay(200, withSpring(scaleFactor));
          
          // Follow spiral
          translateY.value = withDelay(
            200,
            withTiming(SCREEN_HEIGHT * 0.7, {
              duration: 1800,
              easing: Easing.in(Easing.quad)
            })
          );
          
          rotation.value = withDelay(
            200,
            withTiming(180, { duration: 1800 })
          );
        } else {
          // Money flies away
          const moneyAngle = Math.random() * Math.PI * 2;
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          
          scale.value = withDelay(500 + delay, withSpring(scaleFactor));
          
          translateX.value = withDelay(
            500 + delay,
            withTiming(SCREEN_WIDTH / 2 + Math.cos(moneyAngle) * 200, {
              duration: 1000
            })
          );
          
          translateY.value = withDelay(
            500 + delay,
            withTiming(SCREEN_HEIGHT / 2 + Math.sin(moneyAngle) * 200, {
              duration: 1000
            })
          );
          
          opacity.value = withDelay(1000, withTiming(0, { duration: 500 }));
        }
        break;

      // 📋💵 FORM AMOUNT - Money forms into bet amount
      case 'formAmount':
        if (emoji === '📋') {
          // Clipboard slides down
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = -100;
          scale.value = scaleFactor;
          
          translateY.value = withSpring(SCREEN_HEIGHT * 0.3, {
            damping: 15,
            stiffness: 100
          });
        } else {
          // Money forms $100
          scale.value = 0;
          
          // Form positions for "$100"
          const positions = [
            // $ symbol (5 bills)
            { x: 0.35, y: 0.5 }, { x: 0.35, y: 0.45 }, { x: 0.35, y: 0.55 },
            { x: 0.38, y: 0.48 }, { x: 0.38, y: 0.52 },
            // 1 (4 bills)
            { x: 0.45, y: 0.45 }, { x: 0.45, y: 0.5 }, { x: 0.45, y: 0.55 }, { x: 0.45, y: 0.6 },
            // 0 (6 bills)
            { x: 0.55, y: 0.48 }, { x: 0.58, y: 0.5 }, { x: 0.58, y: 0.55 },
            { x: 0.55, y: 0.57 }, { x: 0.52, y: 0.55 }, { x: 0.52, y: 0.5 },
            // 0 (5 bills)
            { x: 0.65, y: 0.48 }, { x: 0.68, y: 0.5 }, { x: 0.68, y: 0.55 },
            { x: 0.65, y: 0.57 }, { x: 0.62, y: 0.52 }
          ];
          
          if (index < positions.length) {
            const targetPos = positions[index];
            
            // Start from random position
            translateX.value = Math.random() * SCREEN_WIDTH;
            translateY.value = Math.random() * SCREEN_HEIGHT;
            
            // Move to form number
            translateX.value = withDelay(
              500 + delay,
              withTiming(SCREEN_WIDTH * targetPos.x, {
                duration: 800,
                easing: Easing.out(Easing.back)
              })
            );
            
            translateY.value = withDelay(
              500 + delay,
              withTiming(SCREEN_HEIGHT * targetPos.y, {
                duration: 800,
                easing: Easing.out(Easing.back)
              })
            );
            
            scale.value = withDelay(500 + delay, withSpring(scaleFactor * 0.8));
          }
        }
        break;

      // ⚡📈 LIGHTNING STRIKE - Lightning hits chart
      case 'lightningStrike':
        if (emoji === '⚡') {
          // Lightning bolts
          const boltX = SCREEN_WIDTH * 0.3 + (index * SCREEN_WIDTH * 0.1);
          translateX.value = boltX;
          translateY.value = -50;
          
          // Strike down
          translateY.value = withDelay(
            index * 100,
            withTiming(SCREEN_HEIGHT / 2, {
              duration: 200,
              easing: Easing.in(Easing.cubic)
            })
          );
          
          scale.value = withDelay(
            index * 100,
            withSequence(
              withTiming(scaleFactor * 2, { duration: 100 }),
              withTiming(0, { duration: 100 })
            )
          );
        } else if (emoji === '📈') {
          // Chart gets boosted
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Shake from impact
          translateX.value = withDelay(
            500,
            withRepeat(
              withSequence(
                withTiming(SCREEN_WIDTH / 2 - 10, { duration: 50 }),
                withTiming(SCREEN_WIDTH / 2 + 10, { duration: 50 })
              ),
              3,
              true
            )
          );
          
          // Grow after strike
          scale.value = withDelay(
            500,
            withSpring(scaleFactor * 1.5, { damping: 10, stiffness: 200 })
          );
        } else {
          // Fire particles
          const fireX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;
          translateX.value = fireX;
          translateY.value = SCREEN_HEIGHT / 2;
          
          scale.value = withDelay(600 + delay, withSpring(scaleFactor));
          
          // Rise up
          translateY.value = withDelay(
            600 + delay,
            withTiming(SCREEN_HEIGHT / 2 - 100, {
              duration: 1000,
              easing: Easing.out(Easing.quad)
            })
          );
          
          opacity.value = withDelay(
            600 + delay,
            withTiming(0, { duration: 1000 })
          );
        }
        break;

      // 🚀🌙 MOON LAUNCH - Enhanced rocket to moon
      case 'moonLaunch':
        if (emoji === '🚀') {
          // Rocket launches
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT - 100;
          scale.value = scaleFactor;
          
          // Launch to moon
          translateY.value = withTiming(100, {
            duration: 2500,
            easing: Easing.in(Easing.quad)
          });
          
          // Wiggle during flight
          translateX.value = withRepeat(
            withSequence(
              withTiming(SCREEN_WIDTH / 2 - 20, { duration: 200 }),
              withTiming(SCREEN_WIDTH / 2 + 20, { duration: 200 })
            ),
            6,
            true
          );
          
          rotation.value = withRepeat(
            withSequence(
              withTiming(-10, { duration: 200 }),
              withTiming(10, { duration: 200 })
            ),
            6,
            true
          );
        } else if (emoji === '🌙') {
          // Moon at destination
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = 100;
          scale.value = 0;
          
          // Appear when rocket arrives
          scale.value = withDelay(
            2000,
            withSpring(scaleFactor, { damping: 10, stiffness: 100 })
          );
          
          // Glow effect
          opacity.value = withDelay(
            2000,
            withRepeat(
              withSequence(
                withTiming(0.8, { duration: 500 }),
                withTiming(1, { duration: 500 })
              ),
              2,
              true
            )
          );
        } else if (emoji === '⭐') {
          // Star trail
          const starX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 100;
          translateX.value = starX;
          translateY.value = SCREEN_HEIGHT - 100;
          
          scale.value = withDelay(delay * 2, withSpring(scaleFactor));
          
          // Follow rocket path
          translateY.value = withDelay(
            delay * 2,
            withTiming(200 + Math.random() * 200, {
              duration: 2000,
              easing: Easing.out(Easing.quad)
            })
          );
          
          opacity.value = withDelay(
            delay * 2,
            withSequence(
              withTiming(1, { duration: 500 }),
              withTiming(0, { duration: 1500 })
            )
          );
        } else {
          // Money trails behind
          const moneyX = SCREEN_WIDTH / 2 + (Math.random() - 0.5) * 50;
          translateX.value = moneyX;
          translateY.value = SCREEN_HEIGHT - 100;
          
          scale.value = withDelay(100 + delay, withSpring(scaleFactor));
          
          // Fall behind rocket
          translateY.value = withDelay(
            100 + delay,
            withSequence(
              withTiming(SCREEN_HEIGHT - 200, { duration: 500 }),
              withTiming(SCREEN_HEIGHT + 50, {
                duration: 1500,
                easing: Easing.in(Easing.quad)
              })
            )
          );
          
          rotation.value = withRepeat(
            withTiming(360, { duration: 1000 }),
            -1
          );
        }
        break;

      // 💼🚨 ALERT OPEN - Briefcase opens with alerts
      case 'alertOpen':
        if (emoji === '💼') {
          // Briefcase
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Open animation (scale up)
          scale.value = withSequence(
            withTiming(scaleFactor * 1.2, { duration: 500 }),
            withSpring(scaleFactor)
          );
          
          // Shake with excitement
          rotation.value = withDelay(
            500,
            withRepeat(
              withSequence(
                withTiming(-5, { duration: 100 }),
                withTiming(5, { duration: 100 })
              ),
              10,
              true
            )
          );
        } else if (emoji === '🚨') {
          // Alert lights
          const alertAngle = (Math.PI / 2) * index;
          const alertDistance = 80;
          
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          
          // Spread out from briefcase
          translateX.value = withDelay(
            500,
            withSpring(SCREEN_WIDTH / 2 + Math.cos(alertAngle) * alertDistance)
          );
          
          translateY.value = withDelay(
            500,
            withSpring(SCREEN_HEIGHT / 2 + Math.sin(alertAngle) * alertDistance)
          );
          
          scale.value = withDelay(500, withSpring(scaleFactor));
          
          // Flash effect
          opacity.value = withDelay(
            700,
            withRepeat(
              withSequence(
                withTiming(0.3, { duration: 200 }),
                withTiming(1, { duration: 200 })
              ),
              8,
              true
            )
          );
        } else {
          // Money bursts out
          const moneyAngle = Math.random() * Math.PI * 2;
          const moneyDistance = 100 + Math.random() * 100;
          
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          
          // Burst outward
          translateX.value = withDelay(
            600 + delay,
            withTiming(SCREEN_WIDTH / 2 + Math.cos(moneyAngle) * moneyDistance, {
              duration: 800,
              easing: Easing.out(Easing.back)
            })
          );
          
          translateY.value = withDelay(
            600 + delay,
            withSequence(
              withTiming(SCREEN_HEIGHT / 2 + Math.sin(moneyAngle) * moneyDistance - 50, {
                duration: 400,
                easing: Easing.out(Easing.quad)
              }),
              withTiming(SCREEN_HEIGHT / 2 + Math.sin(moneyAngle) * moneyDistance, {
                duration: 400,
                easing: Easing.in(Easing.quad)
              })
            )
          );
          
          scale.value = withDelay(600 + delay, withSpring(scaleFactor));
          
          rotation.value = withDelay(
            600 + delay,
            withTiming(720, { duration: 800 })
          );
        }
        
        // End preview
        if (duration) {
          opacity.value = withDelay(
            duration - 500,
            withTiming(0, { duration: 500 })
          );
        }
        break;

      // ⏰💥 CLOCK COUNTDOWN - Clock ticks down to explosion
      case 'clockCountdown':
        if (emoji === '⏰') {
          // Clock
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = scaleFactor;
          
          // Tick animation
          rotation.value = withRepeat(
            withSequence(
              withTiming(10, { duration: 100 }),
              withTiming(-10, { duration: 100 })
            ),
            15,
            true
          );
          
          // Grow with urgency
          scale.value = withSequence(
            withTiming(scaleFactor, { duration: 2500 }),
            withTiming(scaleFactor * 1.3, { duration: 500 }),
            withTiming(0, { duration: 100 })
          );
        } else if (emoji === '💥') {
          // Explosion
          const explodeAngle = (Math.PI * 2 * index) / 8;
          const explodeDistance = 150;
          
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          
          // Explode at countdown end
          translateX.value = withDelay(
            3000,
            withTiming(SCREEN_WIDTH / 2 + Math.cos(explodeAngle) * explodeDistance, {
              duration: 500,
              easing: Easing.out(Easing.cubic)
            })
          );
          
          translateY.value = withDelay(
            3000,
            withTiming(SCREEN_HEIGHT / 2 + Math.sin(explodeAngle) * explodeDistance, {
              duration: 500,
              easing: Easing.out(Easing.cubic)
            })
          );
          
          scale.value = withDelay(
            3000,
            withSequence(
              withSpring(scaleFactor * 1.5),
              withTiming(0, { duration: 300 })
            )
          );
        } else {
          // Target appears
          translateX.value = SCREEN_WIDTH / 2;
          translateY.value = SCREEN_HEIGHT / 2;
          scale.value = 0;
          
          // Appear after explosion
          scale.value = withDelay(
            3500,
            withSpring(scaleFactor, { damping: 10, stiffness: 200 })
          );
          
          // Pulse
          scale.value = withDelay(
            3700,
            withRepeat(
              withSequence(
                withTiming(scaleFactor * 1.2, { duration: 200 }),
                withTiming(scaleFactor, { duration: 200 })
              ),
              3,
              true
            )
          );
        }
        
        // End preview
        if (duration) {
          opacity.value = withDelay(
            duration - 500,
            withTiming(0, { duration: 500 })
          );
        }
        break;
    }

    // Handle completion
    if (duration && onComplete) {
      setTimeout(() => {
        runOnJS(onComplete)();
      }, duration);
    }

    return () => {
      cancelAnimation(translateX);
      cancelAnimation(translateY);
      cancelAnimation(scale);
      cancelAnimation(rotation);
      cancelAnimation(opacity);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [emoji, index, physics, duration, size, totalCount]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
    opacity: opacity.value
  }));

  return (
    <Animated.Text style={[{ position: 'absolute', fontSize: 30 }, animatedStyle]}>
      {emoji}
    </Animated.Text>
  );
};

// ========================================
// File: Update components/effects/EmojiEffectsManager.tsx
// ========================================

// Add to imports
import { BATCH4_EFFECTS } from './constants/batch4Effects';
import { Batch4Particle } from './particles/Batch4Particles';

// Update ALL_EFFECTS to include batch 4
export const ALL_EFFECTS = {
  ...EFFECT_CONFIGS,  // Batch 1
  ...BATCH2_EFFECTS,  // Batch 2
  ...BATCH3_EFFECTS,  // Batch 3
  ...BATCH4_EFFECTS   // Batch 4
};

// Add batch 4 physics to the render function
const batch4Physics = ['rainbowArc', 'slideInLook', 'kissMotion', 'cameraFlash', 
                      'roboticMarch', 'twinkle', 'holdStrong', 'intensifySweat',
                      'spiralDown', 'formAmount', 'lightningStrike', 'moonLaunch',
                      'alertOpen', 'clockCountdown'];

// In renderParticle function, add batch 4 handling
if (batch4Physics.includes(config.physics)) {
  return (
    <Batch4Particle
      key={particle.id}
      emoji={particle.emoji}
      index={index}
      physics={config.physics}
      duration={config.duration === 'continuous' ? null : config.duration}
      size={particle.size}
      totalCount={particles.length}
      onComplete={config.duration !== 'continuous' ? handleParticleComplete : undefined}
    />
  );
}

// ========================================
// File: Update types.ts to include batch 4 physics
// ========================================

export type PhysicsType = 
  // Batch 1
  | 'float' | 'floatUp' | 'fall' | 'explode' | 'launch' | 'bounce' | 'orbit' | 'wave'
  // Batch 2
  | 'bounce' | 'spinAway' | 'zoomDance' | 'gentleFloat' | 'explodeOut' 
  | 'lookAround' | 'formLetter' | 'riseUp' | 'slideDown' | 'flexPump'
  // Batch 3
  | 'crashDown' | 'headExplode' | 'sweatDrop' | 'victoryDance' 
  | 'angerBurst' | 'popIn' | 'formF' | 'sportsBounce' 
  | 'chaosCircle' | 'temperatureFlux' | 'saltPour'
  // Batch 4
  | 'rainbowArc' | 'slideInLook' | 'kissMotion' | 'cameraFlash'
  | 'roboticMarch' | 'twinkle' | 'holdStrong' | 'intensifySweat'
  | 'spiralDown' | 'formAmount' | 'lightningStrike' | 'moonLaunch'
  | 'alertOpen' | 'clockCountdown';

// ========================================
// File: Update EffectSelector.tsx for preview mode
// ========================================

// Add preview mode handling
interface EffectSelectorProps {
  activeEffectId: string | null;
  onSelectEffect: (effectId: string) => void;
  unlockedEffects?: string[];
  onPreviewEffect?: (effectId: string) => void; // New prop
}

// In the component, handle preview effects
const handleEffectPress = (effectId: string) => {
  const effect = ALL_EFFECTS[effectId];
  
  // Check if it's a preview effect
  if (effectId.includes('_preview')) {
    onPreviewEffect?.(effectId);
    // Auto-stop after 5 seconds
    setTimeout(() => {
      if (activeEffectId === effectId) {
        onSelectEffect(null);
      }
    }, 5000);
  } else {
    onSelectEffect(effectId);
  }
};