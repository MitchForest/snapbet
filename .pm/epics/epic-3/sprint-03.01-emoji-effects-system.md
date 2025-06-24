# Sprint 03.01: Emoji Effects System Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Build a performant emoji-based effects system with React Native Reanimated 2, featuring 48+ base effects, badge-based unlocks, real-time preview, and smooth integration with the camera flow from Sprint 03.00.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Fun effects to make content more engaging and viral
- Enables Story 5: Performance Tracking - Victory/loss effects tied to betting outcomes

## Sprint Plan

### Objectives
1. Create emoji effects library with 48+ base effects across 17 categories
2. Implement badge-based unlock system (integrating with Epic 2 badges)
3. Build effect selector UI with category grouping
4. Add real-time effect preview on camera/media
5. Create particle-based animation system using Reanimated 2
6. Implement performance-adaptive particle limits
7. Add haptic feedback integration
8. Support effect preview mode for locked effects

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
| `components/effects/effects/GamingEffects.tsx` | Gaming culture effects | NOT STARTED |
| `components/effects/effects/WeatherEffects.tsx` | Weather-based effects | NOT STARTED |
| `components/effects/particles/BaseParticle.tsx` | Core particle component with Reanimated | NOT STARTED |
| `components/effects/particles/Batch2Particle.tsx` | Batch 2 physics implementations | NOT STARTED |
| `components/effects/particles/Batch3Particle.tsx` | Batch 3 physics implementations | NOT STARTED |
| `components/effects/particles/Batch4Particle.tsx` | Batch 4 physics implementations | NOT STARTED |
| `components/effects/particles/Tier1Particle.tsx` | Tier 1 enhanced physics | NOT STARTED |
| `components/effects/physics/index.ts` | Physics implementation registry | NOT STARTED |
| `components/effects/utils/devicePerformance.ts` | Performance detection & limits | NOT STARTED |
| `components/effects/utils/badgeCheck.ts` | Effect unlock verification | NOT STARTED |
| `components/effects/utils/effectPreview.ts` | Preview manager singleton | NOT STARTED |
| `components/effects/constants/hapticPatterns.ts` | Haptic feedback patterns | NOT STARTED |
| `components/effects/EffectSelector.tsx` | UI for selecting effects with categories | NOT STARTED |
| `hooks/useEffects.ts` | Effect state and unlock management | NOT STARTED |
| `hooks/useMediaPermissions.ts` | Already exists from 03.00 | DONE |
| `hooks/useCamera.ts` | Already exists from 03.00 | DONE |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/camera/CameraView.tsx` | Add emoji effect overlay | NOT STARTED |
| `components/camera/MediaPreview.tsx` | Add effect capture with ViewShot | NOT STARTED |
| `package.json` | Remove lottie, add react-native-view-shot | NOT STARTED |
| `services/badges/badgeService.ts` | Export badge checking functions | NOT STARTED |
| `app/(drawer)/camera.tsx` | Integrate effect selector | NOT STARTED |

### Files to Remove (Old Lottie System)
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

#### 2. Physics Implementation System

Each physics type needs its own implementation in the particle components:

**BaseParticle.tsx** handles:
- `float` - Fire effect floating upward
- `floatUp` - Skull effect with fade
- `fall` - Money/tears falling
- `explode` - Confetti burst
- `launch` - Rocket trajectory

**Batch2Particle.tsx** handles:
- `bounce` - Crying laughing bounce
- `spinAway` - Caps spinning off
- `zoomDance` - Clown zoom effect
- `gentleFloat` - Peaceful floating
- `explodeOut` - Explosive expansion
- `lookAround` - Eyes darting
- `formLetter` - W/L formation
- `riseUp` - Charts rising
- `slideDown` - Cool entrance
- `flexPump` - Muscle flexing

**Batch3Particle.tsx** handles:
- `crashDown` - Charts crashing
- `headExplode` - Mind blown effect
- `sweatDrop` - Nervous sweating
- `victoryDance` - GG celebration
- `angerBurst` - Rage quit explosion
- `popIn` - Poggers appearance
- `formF` - F formation
- `sportsBounce` - Ball physics
- `chaosCircle` - Menace circling
- `temperatureFlux` - Hot/cold alternating
- `saltPour` - Salt shaker effect

**Batch4Particle.tsx** handles:
- `rainbowArc` - Rainbow with clouds
- `slideInLook` - Side eye entrance
- `kissMotion` - Chef's kiss
- `cameraFlash` - Photo effect
- `roboticMarch` - NPC movement
- `twinkle` - Sparkle patterns
- `holdStrong` - Diamond hands
- `intensifySweat` - Increasing sweat
- `spiralDown` - Down bad spiral
- `formAmount` - Bet slip numbers
- `lightningStrike` - Boost effect
- `moonLaunch` - Enhanced rocket
- `alertOpen` - Bag alert
- `clockCountdown` - Buzzer beater

**Tier1Particle.tsx** handles:
- `enhancedFloat` - Advanced fire
- `money3D` - 3D money rotation
- `multiExplode` - Multiple explosions
- `riverFlow` - Tear rivers
- `iceCool` - Frost effects
- `sportsRain` - Complex ball physics
- `swirlPattern` - Spiral patterns
- `beastFlex` - Lightning between arms
- `diceRoll` - Tumbling dice
- `stormSystem` - Weather system
- `freezeWind` - Sheesh effect
- `ratioOverwhelm` - Comment flood
- `grassGrow` - Touch grass growth
- `chadEnergy` - Built different power
- `cameraFlashes` - 4K cameras
- `diamondHold` - Continuous diamonds
- `lastSecond` - Countdown explosion

#### 3. Preview System Implementation

```typescript
// components/effects/utils/effectPreview.ts
export class EffectPreviewManager {
  private static instance: EffectPreviewManager;
  private activePreview: PreviewState | null = null;
  private previewTimer: NodeJS.Timeout | null = null;

  // Singleton pattern
  static getInstance(): EffectPreviewManager {
    if (!this.instance) {
      this.instance = new EffectPreviewManager();
    }
    return this.instance;
  }

  // Start 5-second preview for locked effects
  async startPreview(effectId: string, effect: EffectConfig, onComplete: () => void): Promise<void> {
    // Check daily limit
    const previewKey = `preview_${effectId}_${new Date().toDateString()}`;
    const hasPreviewedToday = await AsyncStorage.getItem(previewKey);
    
    if (hasPreviewedToday) {
      onComplete();
      return;
    }

    // Start preview with watermark
    this.activePreview = {
      effectId,
      startTime: Date.now(),
      duration: 5000
    };

    // Mark as previewed
    await AsyncStorage.setItem(previewKey, 'true');

    // Auto-stop after 5 seconds
    this.previewTimer = setTimeout(() => {
      this.stopPreview();
      onComplete();
    }, 5000);
  }

  getPreviewWatermark(): string | null {
    return this.activePreview ? 'PREVIEW' : null;
  }
}
```

#### 4. Performance Adaptive System

```typescript
// components/effects/utils/devicePerformance.ts
export const PARTICLE_LIMITS = {
  high: { base: 30, reduced: 20, max: 60 },
  medium: { base: 20, reduced: 15, max: 40 },
  low: { base: 10, reduced: 8, max: 20 }
};

export const getDevicePerformanceTier = async (): Promise<DeviceTier> => {
  // Run FPS benchmark
  // Check total memory
  // Return 'high' | 'medium' | 'low'
};

export const getParticleLimit = (tier: DeviceTier, effectTier: number): number => {
  const limits = PARTICLE_LIMITS[tier];
  if (effectTier === 0) return limits.base;
  if (effectTier === 1) return limits.reduced;
  return Math.min(limits.max, limits.base * (effectTier + 1));
};
```

#### 5. Haptic Feedback Patterns

```typescript
// components/effects/constants/hapticPatterns.ts
import * as Haptics from 'expo-haptics';

export const HAPTIC_PATTERNS = {
  // Continuous effects
  fire: { type: 'impact', style: 'light', interval: 500 },
  money: { type: 'impact', style: 'medium', interval: 300 },
  
  // One-time effects
  confetti: { type: 'notification', style: 'success' },
  mind_blown: { type: 'impact', style: 'heavy' },
  
  // Sequence effects
  buzzer_beater: {
    type: 'sequence',
    pattern: [
      { type: 'impact', style: 'light', delay: 0 },
      { type: 'impact', style: 'medium', delay: 100 },
      { type: 'impact', style: 'heavy', delay: 200 }
    ]
  }
};

export const triggerHaptic = async (effectId: string) => {
  const userHapticsEnabled = await AsyncStorage.getItem('haptics_enabled');
  if (userHapticsEnabled === 'false') return;
  
  const pattern = HAPTIC_PATTERNS[effectId];
  if (!pattern) return;
  
  // Execute haptic pattern
};
```

#### 6. Effect Manager Component

```typescript
// components/effects/EmojiEffectsManager.tsx
import { ALL_EFFECTS } from './constants/allEffects';
import { BaseParticle } from './particles/BaseParticle';
// ... other particle imports

export const EmojiEffectsManager: React.FC<Props> = ({ effectId, onComplete }) => {
  const [particles, setParticles] = useState([]);
  const [deviceTier, setDeviceTier] = useState<DeviceTier>('medium');
  
  const effect = ALL_EFFECTS[effectId];
  if (!effect) return null;

  // Create particles based on config and device performance
  useEffect(() => {
    const particleLimit = getParticleLimit(deviceTier, effect.tier);
    // Generate particles respecting limits
  }, [effectId, deviceTier]);

  // Route to appropriate particle component based on physics
  const renderParticle = (particle, index) => {
    // Check physics type and return appropriate component
  };

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {particles.map(renderParticle)}
    </View>
  );
};
```

#### 7. Camera Integration

```typescript
// Update components/camera/CameraView.tsx
import ViewShot from 'react-native-view-shot';
import { EmojiEffectsManager } from '../effects/EmojiEffectsManager';
import { EffectSelector } from '../effects/EffectSelector';

// Add to camera component
const viewShotRef = useRef<ViewShot>(null);
const [activeEffect, setActiveEffect] = useState<string | null>(null);

const handleCapture = async () => {
  // Capture with effects burned in
  const uri = await viewShotRef.current?.capture({
    format: 'jpg',
    quality: 0.9,
  });
};

// Wrap camera and effects in ViewShot
<ViewShot ref={viewShotRef} style={StyleSheet.absoluteFillObject}>
  <Camera />
  {activeEffect && <EmojiEffectsManager effectId={activeEffect} />}
</ViewShot>
```

---

*Sprint Last Updated: [Date]*
*Next Sprint: 03.02 - Feed Implementation*
