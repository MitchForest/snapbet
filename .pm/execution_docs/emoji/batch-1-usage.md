# SnapBet Effects System - Batch 1 Implementation Guide

## 🚀 What's Included in Batch 1

This batch delivers the **core particle system** and **6 base effects**:

1. **🔥 Fire (On Fire)** - Floating upward with wobble
2. **💀 Skull (I'm Dead)** - Float up with fade out  
3. **💰 Money (Cha-Ching)** - Falling with sway motion
4. **🎉 Confetti (Winner!)** - Explosive burst from center
5. **😭 Tears (Bad Beat)** - Rain effect with emoji mix
6. **🚀 Rocket (To The Moon)** - Launch trajectory with stars

## 📁 File Structure

```
components/
├── effects/
│   ├── types.ts                        # TypeScript interfaces
│   ├── EmojiEffectsManager.tsx        # Main manager component
│   ├── EffectSelector.tsx             # UI for selecting effects
│   ├── constants/
│   │   └── effectsConfig.ts           # Effect configurations
│   ├── particles/
│   │   └── BaseParticle.tsx           # Core particle component
│   └── utils/
│       └── devicePerformance.ts       # Performance detection
```

## 🔧 Installation

### Dependencies Required

```bash
npm install react-native-reanimated react-native-device-info
# or
yarn add react-native-reanimated react-native-device-info
```

### iOS Setup
```bash
cd ios && pod install
```

### Configure Reanimated
Add to `babel.config.js`:
```javascript
module.exports = {
  plugins: [
    'react-native-reanimated/plugin',
  ],
};
```

## 💻 Basic Usage

```tsx
import { EmojiEffectsManager } from './components/effects/EmojiEffectsManager';
import { EffectSelector } from './components/effects/EffectSelector';

const YourCameraScreen = () => {
  const [activeEffectId, setActiveEffectId] = useState<string | null>(null);

  return (
    <View style={{ flex: 1 }}>
      <Camera style={StyleSheet.absoluteFillObject} />
      
      {/* Effect Overlay */}
      {activeEffectId && (
        <EmojiEffectsManager 
          effectId={activeEffectId}
          onComplete={() => {
            // Called when one-time effects complete
            setActiveEffectId(null);
          }}
        />
      )}
      
      {/* Effect Selector UI */}
      <EffectSelector
        activeEffectId={activeEffectId}
        onSelectEffect={setActiveEffectId}
      />
    </View>
  );
};
```

## 🎯 Key Features Implemented

### 1. **Performance Auto-Detection**
- Runs benchmark on first launch
- Adjusts particle count based on device capability
- Three tiers: low (10 particles), medium (20), high (30)

### 2. **Physics Engines**
- **Float**: Fire effect with upward float and wobble
- **FloatUp**: Skull effect with fade-out
- **Fall**: Money/tears with gravity and sway
- **Explode**: Confetti burst from center
- **Launch**: Rocket trajectory with trail

### 3. **Continuous vs One-Time Effects**
- **Continuous**: Fire, Skull, Money, Tears (loop forever)
- **One-Time**: Confetti (2s), Rocket (3s)

### 4. **Optimizations**
- Uses Reanimated 2 worklets for UI thread animations
- Particle pooling (reuses completed particles)
- Staggered initialization to prevent frame drops
- Automatic cleanup on unmount

## 🎨 Customization

### Adjust Particle Counts
```typescript
// In effectsConfig.ts
money: {
  particles: [
    { emoji: '💵', count: 25 } // Increase from 15 to 25
  ]
}
```

### Change Animation Speed
```typescript
// In BaseParticle.tsx, find the physics case
case 'fall':
  translateY.value = withTiming(SCREEN_HEIGHT + 100, {
    duration: 2000, // Faster fall (was 3000)
  });
```

### Add Size Variations
```typescript
// In effectsConfig.ts
fire: {
  particles: [
    { emoji: '🔥', count: 15, size: { min: 20, max: 60 } }
  ]
}
```

## 📱 Platform Differences

### iOS
- Better performance due to native Reanimated support
- Smoother animations at 60 FPS
- Can handle more particles

### Android
- May need lower particle counts on older devices
- Test on real devices for performance
- Consider reducing max particle count

## 🐛 Troubleshooting

### Effects Not Showing
1. Check that Reanimated is properly installed
2. Verify babel plugin is configured
3. Ensure you've rebuilt the app after installation

### Performance Issues
1. Reduce particle count in `PARTICLE_LIMITS`
2. Simplify animations (remove rotation or opacity)
3. Force lower performance tier:
```typescript
// In devicePerformance.ts
export const getDevicePerformanceTier = async () => 'low';
```

### Particles Stuck on Screen
- Ensure cleanup in `useEffect` return
- Check that `cancelAnimation` is called
- Verify duration handling for one-time effects

## 🧪 Testing the Demo

The web demo artifact shows all 6 effects in action:
- Click any effect button to activate
- Click "Stop Effect" for continuous effects
- One-time effects auto-clear after completion
- Performance tier shown at bottom

## 📊 Performance Metrics

| Device Tier | Base Particles | Reduced | Max |
|-------------|---------------|---------|-----|
| High        | 30            | 20      | 60  |
| Medium      | 20            | 15      | 40  |
| Low         | 10            | 8       | 20  |

## ✅ Next Steps for Batch 2

Ready to implement:
- All remaining Tier 0 effects (40+ effects)
- Category organization (WINS, LOSSES, VIBES, etc.)
- Effect preview mode (5-second trial)
- Haptic feedback integration
- More physics types (bounce, orbit, wave)

## 🎉 Success Checklist

- [ ] All 6 effects animate smoothly
- [ ] Performance detection works
- [ ] One-time effects complete properly
- [ ] Continuous effects can be stopped
- [ ] No memory leaks
- [ ] Works on both iOS and Android
- [ ] Particles respect screen boundaries
- [ ] Effect selector UI is responsive

## 💡 Tips for Integration

1. **With Expo Camera**: Use the provided CameraScreen example
2. **With React Native Camera**: Replace `CameraView` with `RNCamera`
3. **With Custom Camera**: Just overlay the `EmojiEffectsManager`
4. **For Screenshots**: Effects will be captured automatically
5. **For Video Recording**: Effects render in real-time

The system is designed to be modular - you can use just the effects without the selector, or build your own UI on top of the effect engine!