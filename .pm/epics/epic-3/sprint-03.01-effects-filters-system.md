# Sprint 03.01: Emoji Effects System Tracker

## Sprint Overview

**Status**: NEEDS_REVISION  
**Start Date**: January 2025  
**End Date**: January 2025  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Build a performant emoji-based effects system with React Native Reanimated 2, featuring 48 base effects, badge-based unlocks, real-time preview, and smooth integration with the camera flow from Sprint 03.00.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Fun effects to make content more engaging and viral
- Enables Story 5: Performance Tracking - Victory/loss effects tied to betting outcomes

## Sprint Plan

### Objectives
1. Create emoji effects library with 48 base effects across 17 categories
2. Implement badge-based unlock system (integrating with Epic 2 badges)
3. Build effect picker UI with category grouping
4. Add real-time effect preview on camera/media
5. Create particle-based animation system using Reanimated 2
6. Implement performance-adaptive particle limits
7. Add haptic feedback integration

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/effects/EmojiEffectsManager.tsx` | Main effects orchestrator | NOT STARTED |
| `components/effects/effects/FireEffect.tsx` | Fire effect variations (3 levels) | NOT STARTED |
| `components/effects/effects/MoneyEffect.tsx` | Money rain variations (3 levels) | NOT STARTED |
| `components/effects/effects/CelebrationEffect.tsx` | Confetti/celebration variants | NOT STARTED |
| `components/effects/effects/TearsEffect.tsx` | Loss/crying effects | NOT STARTED |
| `components/effects/effects/SportsEffect.tsx` | Sports ball animations | NOT STARTED |
| `components/effects/effects/SparkleEffect.tsx` | Magic/sparkle effects | NOT STARTED |
| `components/effects/effects/MemeEffects.tsx` | Gen Z meme effects (skull, etc) | NOT STARTED |
| `components/effects/effects/BettingEffects.tsx` | Betting-specific viral effects | NOT STARTED |
| `components/effects/particles/BaseParticle.tsx` | Reusable particle component | NOT STARTED |
| `components/effects/particles/BouncingParticle.tsx` | Bouncing physics particle | NOT STARTED |
| `components/effects/particles/FallingParticle.tsx` | Gravity physics particle | NOT STARTED |
| `components/effects/particles/ExplodingParticle.tsx` | Burst physics particle | NOT STARTED |
| `components/effects/constants/effectsConfig.ts` | All 73+ effect definitions | NOT STARTED |
| `components/effects/constants/particlePhysics.ts` | Animation physics constants | NOT STARTED |
| `components/effects/EffectSelector.tsx` | UI for selecting effects | NOT STARTED |
| `hooks/useEffects.ts` | Effect state and unlock management | NOT STARTED |
| `utils/effects/performanceOptimization.ts` | Device performance detection | NOT STARTED |
| `utils/effects/hapticPatterns.ts` | Haptic feedback patterns | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/camera/CameraView.tsx` | Add emoji effect overlay | NOT STARTED |
| `components/camera/MediaPreview.tsx` | Add effect capture with ViewShot | NOT STARTED |
| `package.json` | Remove lottie, add react-native-view-shot | NOT STARTED |
| `services/badges/badgeService.ts` | Export badge checking functions | NOT STARTED |
| `app/(drawer)/camera.tsx` | Integrate effect selector | NOT STARTED |

### Files to Delete
| File Path | Reason | Status |
|-----------|--------|--------|
| `components/effects/LottieEffect.tsx` | Replaced by emoji system | NOT STARTED |
| `components/effects/EffectLibrary.ts` | Replaced by effectsConfig.ts | NOT STARTED |
| `components/effects/EffectCategories.tsx` | Replaced by new structure | NOT STARTED |
| `components/effects/EffectPicker.tsx` | Replaced by EffectSelector.tsx | NOT STARTED |
| `components/effects/EffectPreview.tsx` | Integrated into particles | NOT STARTED |
| `assets/effects/*.json` | No longer needed (Lottie files) | NOT STARTED |

### Implementation Approach

#### 1. Dependencies Update
```bash
# Remove Lottie
bun remove lottie-react-native

# Add view capture for effects
bun add react-native-view-shot@~3.8.0

# Already have react-native-reanimated@~3.17.4
# Already have expo-haptics@^14.1.4
```

#### 2. Effect Categories with UI Grouping

**UI Categories (6 groups for user experience)**:
- 🏆 **WINS**: Fire, Money, Celebrations, Charts Up
- 😭 **LOSSES**: Tears, Skull, Charts Down, Big L
- 🎭 **VIBES**: All Gen Z Memes, Gaming Culture, Reaction Memes
- ⚡ **HYPE**: Sports, Strength, Confidence, Chaos Energy
- 🎲 **WILD CARDS**: Gambling, Weather, Magic, Viral Combos
- 🎄 **LIMITED**: Seasonal, Event-specific, Promotional

**Complete Effects List (73+ total)**:
- 48 base effects (Tier 0) available to everyone
- 25+ unlockable effects through badges and achievements

#### 3. Core Particle System Architecture
```typescript
// Base particle with Reanimated 2
interface ParticleConfig {
  emoji: string;
  startPosition: { x: number; y: number };
  physics: PhysicsType;
  size: { min: number; max: number };
  opacity: { min: number; max: number };
  duration: number;
  delay?: number;
}

// Physics engine types
type PhysicsType = 
  | 'gravity'    // Falling (money, tears)
  | 'bounce'     // Bouncing (fire, balls)
  | 'float'      // Floating (balloons)
  | 'explode'    // Burst (confetti)
  | 'orbit'      // Circular (championship)
  | 'wave';      // Flowing (water)
```

#### 4. Performance Adaptive System
```typescript
// Device-based particle limits
const PERFORMANCE_TIERS = {
  high: {
    maxParticles: 80,
    maxConcurrent: 3,
    particleSize: { min: 20, max: 60 },
    frameTarget: 60
  },
  medium: {
    maxParticles: 40,
    maxConcurrent: 2,
    particleSize: { min: 15, max: 45 },
    frameTarget: 30
  },
  low: {
    maxParticles: 20,
    maxConcurrent: 1,
    particleSize: { min: 10, max: 30 },
    frameTarget: 24
  }
};
```

#### 5. Haptic Feedback Integration
```typescript
// Haptic patterns by effect type
const HAPTIC_CONFIGS = {
  'confetti': {
    pattern: Haptics.NotificationFeedbackType.Success,
    trigger: 'onStart'
  },
  'mind_blown': {
    pattern: Haptics.ImpactFeedbackStyle.Heavy,
    trigger: 'onExplosion'
  },
  'fire': {
    pattern: Haptics.ImpactFeedbackStyle.Light,
    interval: 500, // Continuous pulse
    trigger: 'continuous'
  }
};
```

**Key Technical Decisions**:
- Emoji-based instead of Lottie (zero dependencies, better performance)
- Reanimated 2 for UI thread animations
- ViewShot for capturing effects with media
- Adaptive particle counts based on device
- Haptic feedback for enhanced experience
- One effect at a time (no stacking in MVP)

### Dependencies & Risks
**Dependencies**:
- Badge system from Epic 2 must be working
- Camera from Sprint 03.00 must be complete
- User preferences for haptics

**Identified Risks**:
- Too many particles on low-end devices: Mitigation - Adaptive limits
- Emoji rendering differences across platforms: Mitigation - Test both iOS/Android
- Memory usage with particle pooling: Mitigation - Proper cleanup

### Revision Requirements from Previous Implementation

**What Was Implemented**:
- Basic Lottie integration with 6 placeholder effects
- Simple effect picker
- Basic preview functionality

**What Needs to Change**:
1. **Complete removal of Lottie system**
   - Delete all Lottie-related files
   - Remove lottie-react-native dependency
   - Clean up any Lottie imports

2. **Implement full emoji particle system**
   - 48 base effects across all categories
   - Reanimated 2 physics engine
   - Performance-adaptive rendering

3. **Add missing viral effects**
   - Gen Z meme effects (skull, cap, etc.)
   - Betting-specific effects (diamond hands, to the moon)
   - Gaming culture effects

4. **Implement advanced features**
   - Effect preview mode (5 seconds for locked effects)
   - Haptic feedback patterns
   - Device performance detection

**Time Estimate**: 3-4 hours for complete implementation

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates
[To be filled during implementation]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: 0 errors, 0 warnings

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: 0 errors

**Performance Testing**:
- [ ] 60 FPS maintained with effects
- [ ] Memory usage stable
- [ ] Haptic feedback responsive

## Key Code Additions

### Emoji Effects Manager
```typescript
// components/effects/EmojiEffectsManager.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FireEffect } from './effects/FireEffect';
import { MoneyEffect } from './effects/MoneyEffect';
import { CelebrationEffect } from './effects/CelebrationEffect';
import { MemeEffects } from './effects/MemeEffects';
import { BettingEffects } from './effects/BettingEffects';
import type { EffectConfig } from '@/types/effects';

interface EmojiEffectsManagerProps {
  effectId: string;
  onComplete?: () => void;
}

export function EmojiEffectsManager({ effectId, onComplete }: EmojiEffectsManagerProps) {
  const effect = getEffectById(effectId);
  if (!effect) return null;

  switch (effect.category) {
    case 'fire':
      return <FireEffect config={effect} onComplete={onComplete} />;
    case 'money':
      return <MoneyEffect config={effect} onComplete={onComplete} />;
    case 'celebration':
      return <CelebrationEffect config={effect} onComplete={onComplete} />;
    case 'meme':
      return <MemeEffects config={effect} onComplete={onComplete} />;
    case 'betting':
      return <BettingEffects config={effect} onComplete={onComplete} />;
    // ... other categories
    default:
      return null;
  }
}
```

### Fire Effect Implementation
```typescript
// components/effects/effects/FireEffect.tsx
import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { BaseParticle } from '../particles/BaseParticle';
import { getParticleLimit } from '@/utils/effects/performanceOptimization';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export function FireEffect({ config, onComplete }) {
  const particleCount = getParticleLimit(config.tier);
  
  const particles = Array(particleCount).fill(0).map((_, index) => ({
    id: index,
    emoji: '🔥',
    delay: index * 50,
    startX: Math.random() * SCREEN_WIDTH,
    startY: SCREEN_HEIGHT - 100,
    size: 20 + Math.random() * 20,
  }));

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map(particle => (
        <BaseParticle
          key={particle.id}
          emoji={particle.emoji}
          startPosition={{ x: particle.startX, y: particle.startY }}
          physics={{
            type: 'bounce',
            gravity: -0.5,
            damping: 0.8,
            initialVelocity: { x: [-2, 2], y: [-5, -3] }
          }}
          size={{ min: particle.size, max: particle.size * 1.5 }}
          delay={particle.delay}
        />
      ))}
    </View>
  );
}
```

### Effect Selector UI
```typescript
// components/effects/EffectSelector.tsx
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { View, XStack, YStack, Text } from '@tamagui/core';
import { useEffects } from '@/hooks/useEffects';
import { EMOJI_EFFECTS, UI_CATEGORIES } from '@/components/effects/constants/effectsConfig';
import { Colors } from '@/theme';

interface EffectSelectorProps {
  onSelectEffect: (effectId: string | null) => void;
  currentEffectId?: string | null;
  userBadges: string[];
}

export function EffectSelector({ onSelectEffect, currentEffectId, userBadges }: EffectSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState('WINS');
  const { isEffectUnlocked, startPreview } = useEffects(userBadges);
  
  const categoryEffects = UI_CATEGORIES[selectedCategory].effects;
  
  return (
    <YStack h={200} bg={Colors.surface} borderTopWidth={1} borderColor={Colors.border}>
      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack p="$2" gap="$2">
          {Object.entries(UI_CATEGORIES).map(([key, cat]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedCategory(key)}
            >
              <View
                bg={selectedCategory === key ? Colors.primary : Colors.surfaceAlt}
                px="$3"
                py="$2"
                br="$4"
              >
                <Text color={selectedCategory === key ? 'white' : Colors.text}>
                  {cat.icon} {cat.name}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </XStack>
      </ScrollView>
      
      {/* Effects Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <XStack p="$2" gap="$2">
          {/* Clear Effect Option */}
          {currentEffectId && (
            <TouchableOpacity onPress={() => onSelectEffect(null)}>
              <YStack
                w={60}
                h={60}
                ai="center"
                jc="center"
                bg={Colors.error}
                br="$3"
              >
                <Text fontSize={24}>✕</Text>
                <Text fontSize={10} color="white">Clear</Text>
              </YStack>
            </TouchableOpacity>
          )}
          
          {/* Effects */}
          {categoryEffects.map(effectId => {
            const effect = EMOJI_EFFECTS[effectId];
            const isUnlocked = isEffectUnlocked(effect);
            const isSelected = effectId === currentEffectId;
            
            return (
              <TouchableOpacity
                key={effectId}
                onPress={() => {
                  if (isUnlocked) {
                    onSelectEffect(effectId);
                  } else {
                    startPreview(effectId);
                  }
                }}
              >
                <YStack
                  w={60}
                  h={60}
                  ai="center"
                  jc="center"
                  bg={isSelected ? Colors.primary : Colors.surfaceAlt}
                  br="$3"
                  opacity={isUnlocked ? 1 : 0.6}
                >
                  <Text fontSize={24}>{effect.preview}</Text>
                  <Text fontSize={10} numberOfLines={1}>
                    {isUnlocked ? effect.name : '🔒'}
                  </Text>
                </YStack>
              </TouchableOpacity>
            );
          })}
        </XStack>
      </ScrollView>
    </YStack>
  );
}
```

### Integration with Camera
```typescript
// In components/camera/CameraView.tsx
import ViewShot from 'react-native-view-shot';
import { EmojiEffectsManager } from '../effects/EmojiEffectsManager';

// Add to camera component
const viewShotRef = useRef<ViewShot>(null);
const [activeEffect, setActiveEffect] = useState<string | null>(null);

const handleCapture = async () => {
  // Capture the view including effects
  const uri = await viewShotRef.current?.capture({
    format: 'jpg',
    quality: 0.9,
  });
  
  // Process captured image with effects burned in
  onMediaCaptured({
    uri,
    type: 'photo',
    effectUsed: activeEffect,
  });
};

// In render
<ViewShot ref={viewShotRef} style={StyleSheet.absoluteFillObject}>
  <Camera style={StyleSheet.absoluteFillObject} />
  {activeEffect && (
    <EmojiEffectsManager 
      effectId={activeEffect}
      onComplete={() => {
        if (!isLooping(activeEffect)) {
          setActiveEffect(null);
        }
      }}
    />
  )}
</ViewShot>
```

## Testing Checklist

- [ ] All 48 base effects working
- [ ] Badge unlocking functioning
- [ ] Performance stays above 60 FPS
- [ ] Haptic feedback working on both platforms
- [ ] Effects capture correctly with media
- [ ] Preview mode for locked effects
- [ ] Device performance detection
- [ ] Memory usage stable
- [ ] No TypeScript errors
- [ ] No ESLint warnings

## Handoff Notes

**For Reviewer**:
- Test on both iOS and Android devices
- Verify performance on older devices
- Check all effect categories
- Confirm haptic patterns feel right
- Test effect preview mode
- Verify badge integration

**Known Limitations**:
- One effect at a time (by design)
- Effects burn into media (not separate layer)
- No effect stacking in MVP
- Haptics require device support

---

*Sprint Last Updated: [Date]*
*Next Sprint: 03.02 - Feed Implementation* 