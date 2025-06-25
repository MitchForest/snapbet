# SnapBet Emoji Effects Specification

## Overview
This document specifies the complete emoji-based effects system for SnapBet's camera feature. Instead of using Lottie files, we're implementing performant, fun emoji animations using React Native Reanimated 2.

## Why Emoji Effects?
- **Zero external dependencies** - No URLs, no downloads, no licensing
- **Tiny file size** - Emojis are just Unicode, virtually no storage
- **Better performance** - Reanimated 2 runs on UI thread
- **Perfect brand fit** - Fun, casual, instantly recognizable
- **Easy to extend** - Adding new effects is trivial

## Effect Tier System

### Tier 0: Base Effects (Free for Everyone)
Basic single-emoji animations to get users engaged

### Tier 1: Enhanced Effects (Any Badge)
More particles, better animations, unlocked with first badge

### Tier 2: Premium Effects (Specific Badges)
Complex multi-emoji compositions tied to achievements

### Tier 3: Elite Effects (Multiple Badges)
The most impressive effects for power users

### Tier 4: Seasonal/Special (Time-Limited)
Holiday themes, special events, promotional

## Effect UI Categories (For User Experience)

While we have 17 technical categories, effects will be grouped into 6 intuitive sections in the UI:

### 🏆 **WINS** 
Fire, Money, Celebrations, Charts Up

### 😭 **LOSSES**
Tears, Skull, Charts Down, Big L

### 🎭 **VIBES** 
All Gen Z Memes, Gaming Culture, Reaction Memes

### ⚡ **HYPE**
Sports, Strength, Confidence, Chaos Energy

### 🎲 **WILD CARDS**
Gambling, Weather, Magic, Viral Combos

### 🎄 **LIMITED** (Time-based)
Seasonal, Event-specific, Promotional

---

## Complete Effects List

### 🔥 FIRE EFFECTS

#### Fire Level 1 (Base - Tier 0)
- **Name**: "On Fire"
- **Emojis**: 🔥 (10-15 particles)
- **Animation**: Simple bounce from bottom, floating upward
- **Duration**: Continuous loop
- **Use Case**: Hot streak, confident picks

#### Fire Level 2 (Tier 1 - Any Badge)
- **Name**: "Blazing Hot"
- **Emojis**: 🔥 (25 particles) + occasional ✨
- **Animation**: More dynamic movement, varying sizes
- **Duration**: Continuous loop
- **Unlock**: Any badge earned

#### Fire Level 3 (Tier 2 - Hot Streak Badge)
- **Name**: "Inferno Mode"
- **Emojis**: 🔥 (40 particles) + 🌋 + 💥
- **Animation**: Erupting from bottom, explosive bursts
- **Duration**: Continuous with burst moments
- **Unlock**: hot_streak badge (3+ wins)

### 💰 MONEY EFFECTS

#### Money Level 1 (Base - Tier 0)
- **Name**: "Cha-Ching"
- **Emojis**: 💵 (15 particles)
- **Animation**: Falling from top, gentle sway
- **Duration**: Continuous loop
- **Use Case**: Wins, profits

#### Money Level 2 (Tier 1 - Any Badge)
- **Name**: "Money Shower"
- **Emojis**: 💵💴💶💷 (25 mixed bills)
- **Animation**: 3D rotation while falling, varying speeds
- **Duration**: Continuous loop
- **Unlock**: Any badge earned

#### Money Level 3 (Tier 2 - Profit Leader Badge)
- **Name**: "Make It Rain"
- **Emojis**: 💵💴💶💷💰💸🤑 (50+ particles)
- **Animation**: Heavy rain effect, money bags exploding
- **Duration**: Continuous with burst moments
- **Unlock**: profit_leader badge ($500+ profit)

### 🎉 CELEBRATION EFFECTS

#### Confetti Level 1 (Base - Tier 0)
- **Name**: "Winner!"
- **Emojis**: 🎉 (single burst)
- **Animation**: Explodes from center, falls down
- **Duration**: One-time (2 seconds)
- **Use Case**: Single win

#### Confetti Level 2 (Tier 1 - Any Badge)
- **Name**: "Party Time"
- **Emojis**: 🎉🎊🎈 (30 particles)
- **Animation**: Multiple burst points, colorful mix
- **Duration**: One-time (3 seconds)
- **Unlock**: Any badge earned

#### Confetti Level 3 (Tier 2 - Perfect Day Badge)
- **Name**: "Epic Celebration"
- **Emojis**: 🎉🎊🎈🎆🎇✨💫⭐ (60+ particles)
- **Animation**: Fireworks + confetti + sparkles combo
- **Duration**: One-time (5 seconds)
- **Unlock**: perfect_day badge (100% wins)

### 😭 LOSS EFFECTS

#### Tears Level 1 (Base - Tier 0)
- **Name**: "Bad Beat"
- **Emojis**: 💧 (10 drops)
- **Animation**: Falling from top corners
- **Duration**: Continuous loop
- **Use Case**: Losses

#### Tears Level 2 (Tier 1 - Any Badge)
- **Name**: "Crying Rivers"
- **Emojis**: 😭💧💦 (20 particles)
- **Animation**: Face emoji at top, tears streaming
- **Duration**: Continuous loop
- **Unlock**: Any badge earned

#### Tears Level 3 (Tier 2 - Fade Material Badge)
- **Name**: "Waterworks"
- **Emojis**: 😭💧💦🌊 (40+ particles)
- **Animation**: Flooding effect, waves at bottom
- **Duration**: Continuous loop
- **Unlock**: fade_material badge (40% or less wins)

### 🤎 CONFIDENCE EFFECTS

#### Cool Level 1 (Base - Tier 0)
- **Name**: "Too Cool"
- **Emojis**: 😎 (single, centered)
- **Animation**: Slides down from top, slight bounce
- **Duration**: One-time (1.5 seconds)
- **Use Case**: Confident picks

#### Cool Level 2 (Tier 1 - Any Badge)
- **Name**: "Ice Cold"
- **Emojis**: 😎❄️✨ (multiple)
- **Animation**: Sunglasses with frost effect
- **Duration**: Continuous sparkle after initial drop
- **Unlock**: Any badge earned

#### Cool Level 3 (Tier 2 - Sharp Badge)
- **Name**: "Untouchable"
- **Emojis**: 😎🕶️💎✨ (complex composition)
- **Animation**: Multiple sunglasses, diamond sparkles
- **Duration**: Looping with style
- **Unlock**: sharp badge (60%+ win rate)

### 🏀🏈⚾ SPORTS EFFECTS

#### Sports Level 1 (Base - Tier 0)
- **Name**: "Game Time"
- **Emojis**: 🏀 or 🏈 or ⚾ (5 bouncing)
- **Animation**: Bouncing across screen
- **Duration**: Continuous loop
- **Use Case**: Sport-specific bets

#### Sports Level 2 (Tier 1 - Any Badge)
- **Name**: "Sports Mania"
- **Emojis**: 🏀🏈⚾⚽🏒 (15 mixed)
- **Animation**: Raining down, bouncing off edges
- **Duration**: Continuous loop
- **Unlock**: Any badge earned

#### Sports Level 3 (Tier 2 - Sport-Specific Badges)
- **Name**: "Championship Mode"
- **Emojis**: 🏆🥇🎯 + sport balls (30+)
- **Animation**: Trophy spin with balls orbiting
- **Duration**: Continuous with special moments
- **Unlock**: Sport-specific achievement badges

### ✨ MAGIC EFFECTS

#### Sparkle Level 1 (Base - Tier 0)
- **Name**: "Sparkle"
- **Emojis**: ✨ (20 particles)
- **Animation**: Random twinkle around screen
- **Duration**: Continuous loop
- **Use Case**: Special moments

#### Sparkle Level 2 (Tier 1 - Any Badge)
- **Name**: "Stardust"
- **Emojis**: ✨⭐💫 (40 particles)
- **Animation**: Swirling pattern, trailing effect
- **Duration**: Continuous loop
- **Unlock**: Any badge earned

#### Sparkle Level 3 (Tier 2 - Specific Badge)
- **Name**: "Cosmic"
- **Emojis**: ✨⭐💫🌟🌠☄️ (60+ particles)
- **Animation**: Galaxy swirl effect, shooting stars
- **Duration**: Continuous with meteor showers
- **Unlock**: Special achievement

### 💪 STRENGTH EFFECTS

#### Muscle Level 1 (Base - Tier 0)
- **Name**: "Flex"
- **Emojis**: 💪 (2, sides of screen)
- **Animation**: Flexing in and out
- **Duration**: Looping flex motion
- **Use Case**: Confident picks

#### Muscle Level 2 (Tier 1 - Any Badge)
- **Name**: "Beast Mode"
- **Emojis**: 💪🦾⚡ (multiple)
- **Animation**: Lightning between flexing arms
- **Duration**: Continuous with zaps
- **Unlock**: Any badge earned

### 🤯 REACTION EFFECTS

#### Mind Blown (Base - Tier 0)
- **Name**: "Mind Blown"
- **Emojis**: 🤯💥 (head exploding)
- **Animation**: Head shakes then explodes
- **Duration**: One-time (2 seconds)
- **Use Case**: Shocking results

#### Sweating (Base - Tier 0)
- **Name**: "Nervous"
- **Emojis**: 😰💧 (sweat drops)
- **Animation**: Drops falling from top
- **Duration**: Continuous loop
- **Use Case**: Close games

### 🎰 GAMBLING EFFECTS

#### Dice Roll (Tier 1 - Any Badge)
- **Name**: "Rolling Dice"
- **Emojis**: 🎲🎲 (2 dice)
- **Animation**: Tumbling across screen
- **Duration**: One-time (2 seconds)
- **Unlock**: Any badge earned

#### Slot Machine (Tier 2 - Specific Badge)
- **Name**: "Jackpot"
- **Emojis**: 🎰777🍒🍋 (slot symbols)
- **Animation**: Spinning reels effect
- **Duration**: One-time with win celebration
- **Unlock**: Gambling achievement

### 🌈 WEATHER EFFECTS

#### Rainbow (Base - Tier 0)
- **Name**: "Good Vibes"
- **Emojis**: 🌈☁️ (rainbow with clouds)
- **Animation**: Arc across top of screen
- **Duration**: Static with shimmer
- **Use Case**: Positive outlook

#### Storm (Tier 1 - Any Badge)
- **Name**: "Storm Coming"
- **Emojis**: ⛈️⚡🌧️ (storm elements)
- **Animation**: Lightning flashes, rain
- **Duration**: Continuous loop
- **Unlock**: Any badge earned

### 📊 STATS EFFECTS

#### Chart Up (Base - Tier 0)
- **Name**: "Trending Up"
- **Emojis**: 📈💹⬆️ (charts rising)
- **Animation**: Charts growing upward
- **Duration**: One-time (2 seconds)
- **Use Case**: Win streaks

#### Chart Down (Base - Tier 0)
- **Name**: "Rough Patch"
- **Emojis**: 📉💸⬇️ (charts falling)
- **Animation**: Charts crashing down
- **Duration**: One-time (2 seconds)
- **Use Case**: Loss streaks

### 💀 GEN Z MEME EFFECTS

#### Skull/Dead (Base - Tier 0)
- **Name**: "I'm Dead 💀"
- **Emojis**: 💀 (20-30 skulls)
- **Animation**: Skulls floating up with wobble, fading out
- **Duration**: Continuous loop
- **Use Case**: Hilarious moments, bad beats, "I can't even"

#### Crying Laughing (Base - Tier 0)
- **Name**: "Can't Stop Laughing"
- **Emojis**: 😂 (15-20 faces)
- **Animation**: Bouncing and rotating, tears flying off
- **Duration**: Continuous loop
- **Use Case**: Funny moments, ridiculous bets

#### Cap/No Cap (Base - Tier 0)
- **Name**: "No Cap"
- **Emojis**: 🧢 (10-15 caps)
- **Animation**: Caps flipping and spinning away
- **Duration**: One-time (2 seconds)
- **Use Case**: Calling out lies, truth moments

#### Clown Check (Base - Tier 0)
- **Name**: "Clown Check"
- **Emojis**: 🤡 (single large + smaller ones)
- **Animation**: Big clown face zoom in, smaller ones dancing
- **Duration**: One-time (2 seconds)
- **Use Case**: Bad predictions, self-roasting

#### Vibes (Base - Tier 0)
- **Name**: "Vibing"
- **Emojis**: 😌✨🎵 (mixed)
- **Animation**: Gentle floating with music notes
- **Duration**: Continuous loop
- **Use Case**: Good vibes, chill moments

#### Sheesh (Tier 1 - Any Badge)
- **Name**: "SHEEEESH"
- **Emojis**: 🥶❄️💨 (ice and wind)
- **Animation**: Freeze effect with icy wind
- **Duration**: One-time (2 seconds)
- **Unlock**: Any badge earned

#### Bussin (Base - Tier 0)
- **Name**: "Bussin FR"
- **Emojis**: 🔥💯🚀 (explosive mix)
- **Animation**: Explosion outward from center
- **Duration**: One-time (2 seconds)
- **Use Case**: Amazing plays, huge wins

#### Sus (Base - Tier 0)
- **Name**: "That's Sus"
- **Emojis**: 🤨👀 (eyes looking around)
- **Animation**: Eyes darting suspiciously
- **Duration**: Continuous loop
- **Use Case**: Questionable calls, suspicious moments

#### W/L (Base - Tier 0)
- **Name**: "Big W" / "Big L"
- **Emojis**: W or L (large letter made of 🏆 or 😢)
- **Animation**: Letter forms and pulses
- **Duration**: One-time (2 seconds)
- **Use Case**: Wins and losses

#### Ratio (Tier 1 - Any Badge)
- **Name**: "Ratio'd"
- **Emojis**: 💬📊📉 (comments overwhelming)
- **Animation**: Comment bubbles multiplying rapidly
- **Duration**: One-time (3 seconds)
- **Unlock**: Any badge earned

### 🎮 GAMING/INTERNET CULTURE EFFECTS

#### GG (Base - Tier 0)
- **Name**: "GG EZ"
- **Emojis**: 🎮🏆 (controllers and trophies)
- **Animation**: Victory dance pattern
- **Duration**: One-time (2 seconds)
- **Use Case**: Game over, easy wins

#### Rage Quit (Base - Tier 0)
- **Name**: "Rage Quit"
- **Emojis**: 😤💢🎮💥 (angry explosion)
- **Animation**: Controller flying, explosion
- **Duration**: One-time (2 seconds)
- **Use Case**: Frustrating losses

#### POG (Base - Tier 0)
- **Name**: "POGGERS"
- **Emojis**: 😮🎉 (shocked faces)
- **Animation**: Faces popping in with excitement
- **Duration**: One-time (1.5 seconds)
- **Use Case**: Amazing moments

#### F in Chat (Base - Tier 0)
- **Name**: "F"
- **Emojis**: F (made of 😔 emojis)
- **Animation**: F forms and drops down
- **Duration**: One-time (2 seconds)
- **Use Case**: Paying respects, losses

#### Touch Grass (Tier 1 - Any Badge)
- **Name**: "Touch Grass"
- **Emojis**: 🌱🌿☘️ (grass growing)
- **Animation**: Grass sprouting from bottom
- **Duration**: One-time (3 seconds)
- **Unlock**: Any badge earned

### 😈 CHAOS ENERGY EFFECTS

#### Menace (Base - Tier 0)
- **Name**: "Menace to Society"
- **Emojis**: 😈🔥 (devil faces with fire)
- **Animation**: Devils circling with flame trail
- **Duration**: Continuous loop
- **Use Case**: Villain arc, chaos bets

#### Built Different (Tier 1 - Any Badge)
- **Name**: "Built Different"
- **Emojis**: 🗿💪⚡ (chad energy)
- **Animation**: Stone face with lightning
- **Duration**: One-time (2 seconds)
- **Unlock**: Any badge earned

#### No Chill (Base - Tier 0)
- **Name**: "No Chill"
- **Emojis**: 🥵🔥💦 (sweating and fire)
- **Animation**: Alternating hot and cold
- **Duration**: Continuous loop
- **Use Case**: Intense moments

#### Salty (Base - Tier 0)
- **Name**: "Stay Salty"
- **Emojis**: 🧂😭 (salt shakers)
- **Animation**: Salt pouring down
- **Duration**: Continuous loop
- **Use Case**: Sore losers, bad beats

#### Toxic (Tier 2 - Specific Badge)
- **Name**: "Toxic Trait"
- **Emojis**: ☠️💚🧪 (toxic symbols)
- **Animation**: Bubbling toxic waste effect
- **Duration**: Continuous loop
- **Unlock**: Controversial badge

### 🎭 REACTION MEMES

#### Side Eye (Base - Tier 0)
- **Name**: "Side Eye"
- **Emojis**: 👀 (multiple eyes)
- **Animation**: Eyes sliding in from sides
- **Duration**: Continuous loop
- **Use Case**: Suspicious moments

#### Chef's Kiss (Base - Tier 0)
- **Name**: "Chef's Kiss"
- **Emojis**: 👨‍🍳💋✨ (chef kissing)
- **Animation**: Kiss motion with sparkles
- **Duration**: One-time (1.5 seconds)
- **Use Case**: Perfect plays

#### This You? (Base - Tier 0)
- **Name**: "This You?"
- **Emojis**: 🤔📸 (thinking with camera)
- **Animation**: Camera flash effect
- **Duration**: One-time (1 second)
- **Use Case**: Calling out contradictions

#### Caught in 4K (Tier 1 - Any Badge)
- **Name**: "Caught in 4K"
- **Emojis**: 📸📹🎬 (cameras flashing)
- **Animation**: Multiple camera flashes
- **Duration**: One-time (2 seconds)
- **Unlock**: Any badge earned

### 🌟 VIRAL COMBO EFFECTS

#### Rizz (Tier 2 - Charm Badge)
- **Name**: "W Rizz"
- **Emojis**: 😏💫🌹 (smooth combo)
- **Animation**: Rose petals falling, wink sparkle
- **Duration**: One-time (3 seconds)
- **Unlock**: Social achievement

#### NPC Energy (Base - Tier 0)
- **Name**: "NPC Mode"
- **Emojis**: 🤖 (robots marching)
- **Animation**: Robotic synchronized movement
- **Duration**: Continuous loop
- **Use Case**: Predictable bets

#### Main Character (Tier 2 - Star Player Badge)
- **Name**: "Main Character"
- **Emojis**: 🌟🎬✨ (spotlight effect)
- **Animation**: Spotlight with sparkles
- **Duration**: Continuous subtle glow
- **Unlock**: Star player achievement

### 💎 BETTING-SPECIFIC VIRAL EFFECTS

#### Sweating Bullets (Base - Tier 0)
- **Name**: "Sweating Bullets"
- **Emojis**: 😅💦💧 (face with sweat drops)
- **Animation**: Sweat drops increasing in intensity
- **Duration**: Continuous loop
- **Use Case**: Close games, nervous moments

#### Diamond Hands (Tier 1 - Any Badge)
- **Name**: "Diamond Hands"
- **Emojis**: 💎🙌 (diamonds in palms)
- **Animation**: Hands holding with diamond sparkle
- **Duration**: Continuous pulse
- **Use Case**: Holding losing bets, not cashing out
- **Unlock**: Any badge earned

#### To The Moon (Base - Tier 0)
- **Name**: "To The Moon"
- **Emojis**: 🚀🌙⭐ (rocket trajectory)
- **Animation**: Rocket launching to moon
- **Duration**: One-time (3 seconds)
- **Use Case**: Unlikely wins, huge odds

#### Bag Alert (Tier 2 - Profit Leader Badge)
- **Name**: "Bag Alert"
- **Emojis**: 💼🚨💰 (briefcase with sirens)
- **Animation**: Briefcase opening with alert lights
- **Duration**: One-time (2 seconds)
- **Use Case**: Big wins, cashing out
- **Unlock**: profit_leader badge

#### Down Bad (Base - Tier 0)
- **Name**: "Down Bad"
- **Emojis**: 📉😩💸 (chart with pain)
- **Animation**: Chart falling with money floating away
- **Duration**: One-time (2 seconds)
- **Use Case**: Losing streaks

#### Bet Slip Reveal (Base - Tier 0)
- **Name**: "Bet Slip Drop"
- **Emojis**: 📋💵 (forms bet amount)
- **Animation**: Money emojis arrange into bet amount
- **Duration**: One-time (2 seconds)
- **Use Case**: Showing off bet size

#### Last Second Win (Tier 1 - Any Badge)
- **Name**: "Buzzer Beater"
- **Emojis**: ⏰💥🎯 (clock explosion)
- **Animation**: Clock counting down to explosion
- **Duration**: One-time (3 seconds)
- **Use Case**: Last minute wins
- **Unlock**: Any badge earned

#### Odds Boost (Base - Tier 0)
- **Name**: "Boosted"
- **Emojis**: ⚡📈🔥 (lightning strike on chart)
- **Animation**: Lightning strikes number, makes it grow
- **Duration**: One-time (1.5 seconds)
- **Use Case**: Showing boosted odds

---

## Implementation Blueprint

### 1. File Structure
```
components/
├── effects/
│   ├── EmojiEffectsManager.tsx    # Main manager component
│   ├── effects/
│   │   ├── FireEffect.tsx          # All fire variations
│   │   ├── MoneyEffect.tsx         # All money variations
│   │   ├── CelebrationEffect.tsx   # Confetti variants
│   │   ├── TearsEffect.tsx         # Loss effects
│   │   ├── SportsEffect.tsx        # Sports balls
│   │   ├── SparkleEffect.tsx       # Magic effects
│   │   └── [other categories...]
│   ├── particles/
│   │   ├── BaseParticle.tsx        # Reusable particle component
│   │   ├── BouncingParticle.tsx    # Bouncing physics
│   │   ├── FallingParticle.tsx     # Gravity physics
│   │   └── ExplodingParticle.tsx   # Burst physics
│   └── constants/
│       ├── effectsConfig.ts         # All effect definitions
│       └── particlePhysics.ts       # Animation constants
```

### 2. Core Components Needed

#### BaseParticle Component
```typescript
interface BaseParticleProps {
  emoji: string;
  startPosition: { x: number; y: number };
  physics: PhysicsConfig;
  onComplete?: () => void;
}
```

#### Physics Engine Types
- **Gravity**: For falling effects (money, rain, tears)
- **Bounce**: For bouncing effects (balls, fire)
- **Float**: For floating effects (balloons, bubbles)
- **Explode**: For burst effects (confetti, fireworks)
- **Orbit**: For circular motions (sports championship)
- **Wave**: For flowing effects (water, wind)

#### Effect Configuration Schema
```typescript
interface EffectConfig {
  id: string;
  name: string;
  tier: 0 | 1 | 2 | 3 | 4;
  category: 'fire' | 'money' | 'celebration' | 'loss' | 'sports' | 'magic' | 'reaction' | 'stats';
  emojis: EmojiParticle[];
  physics: PhysicsConfig;
  duration: number | 'continuous';
  unlockRequirement?: {
    type: 'badge' | 'achievement' | 'time';
    value: string;
  };
}

interface EmojiParticle {
  emoji: string;
  count: number;
  size?: { min: number; max: number };
  opacity?: { min: number; max: number };
  delay?: { min: number; max: number };
}
```

### 3. Performance Optimization Strategy

#### Device-Based Particle Limits
```typescript
const getParticleLimit = (tier: number): number => {
  const baseLimit = {
    high: { 0: 20, 1: 40, 2: 60, 3: 80 },
    medium: { 0: 15, 1: 25, 2: 40, 3: 50 },
    low: { 0: 10, 1: 15, 2: 20, 3: 25 }
  };
  
  const deviceTier = getDevicePerformanceTier();
  return baseLimit[deviceTier][tier];
};
```

#### Animation Pooling
- Pre-create particle instances
- Reuse completed particles
- Limit concurrent animations

### 4. Effect Categories Summary

| Category | Base Effects | Total Variations | Key Emojis |
|----------|-------------|------------------|-------------|
| Fire | 1 | 3 | 🔥🌋💥 |
| Money | 1 | 3 | 💵💰🤑 |
| Celebration | 1 | 3 | 🎉🎊🎆 |
| Loss | 1 | 3 | 😭💧🌊 |
| Confidence | 1 | 3 | 😎🕶️💎 |
| Sports | 3 | 6 | 🏀🏈⚾ |
| Magic | 1 | 3 | ✨⭐💫 |
| Strength | 1 | 2 | 💪🦾⚡ |
| Reaction | 2 | 2 | 🤯😰 |
| Gambling | 0 | 2 | 🎲🎰 |
| Weather | 1 | 2 | 🌈⛈️ |
| Stats | 2 | 2 | 📈📉 |
| Gen Z Memes | 8 | 10 | 💀😂🧢 |
| Gaming Culture | 4 | 5 | 🎮😤😮 |
| Chaos Energy | 4 | 5 | 😈🗿🧂 |
| Reaction Memes | 4 | 4 | 👀👨‍🍳📸 |
| Viral Combos | 2 | 3 | 😏🤖🌟 |
| Betting Viral | 8 | 8 | 💎🚀💼 |

**Total Base Effects**: 48
**Total All Variations**: 73+

### 5. Delivery Requirements for Browser Agent

#### What We Need:
1. **Effect Configurations** - Complete JSON/TypeScript configs for all effects
2. **Animation Curves** - Specific timing functions for each effect type
3. **Particle Behaviors** - Detailed physics for each animation style
4. **Visual Previews** - Screenshots or recordings of each effect
5. **Performance Profiles** - Recommended particle counts per device tier

#### Format for Delivery:
```typescript
// effectsLibrary.ts
export const EMOJI_EFFECTS: Record<string, EffectConfig> = {
  'fire_level_1': {
    id: 'fire_level_1',
    name: 'On Fire',
    tier: 0,
    category: 'fire',
    emojis: [
      { emoji: '🔥', count: 15, size: { min: 20, max: 40 } }
    ],
    physics: {
      type: 'bounce',
      gravity: -0.5,
      damping: 0.8,
      initialVelocity: { x: [-2, 2], y: [-5, -3] }
    },
    duration: 'continuous'
  },
  // ... all other effects
};
```

### 6. Integration Points

#### Camera Integration
```typescript
// In CameraView.tsx
const [activeEffect, setActiveEffect] = useState<string | null>(null);

return (
  <View>
    <Camera />
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
    <EffectSelector 
      unlockedEffects={getUserUnlockedEffects()}
      onSelect={setActiveEffect}
    />
  </View>
);
```

#### Badge System Integration
```typescript
const getUserUnlockedEffects = () => {
  const userBadges = getUserBadges();
  return EMOJI_EFFECTS.filter(effect => {
    if (effect.tier === 0) return true;
    if (effect.tier === 1 && userBadges.length > 0) return true;
    if (effect.unlockRequirement?.type === 'badge') {
      return userBadges.includes(effect.unlockRequirement.value);
    }
    return false;
  });
};
```

### 7. Testing Checklist

- [ ] All base effects work on low-end devices
- [ ] Tier unlocking works correctly with badges
- [ ] Performance stays above 60 FPS
- [ ] Memory usage remains stable
- [ ] Effects capture correctly in screenshots
- [ ] One-time effects complete properly
- [ ] Continuous effects loop seamlessly
- [ ] Device rotation handled gracefully
- [ ] Background/foreground transitions work

### 8. Advanced Features (Future Enhancements)

#### Effect Combinations
```typescript
// Allow users to combine compatible effects
const COMBO_EFFECTS = {
  'fire_money': {
    effects: ['fire_level_1', 'money_level_1'],
    name: 'Hot Money',
    tier: 1
  },
  'emotional_damage': {
    effects: ['skull', 'crying'],
    name: 'Emotional Damage',
    tier: 0
  },
  'full_send': {
    effects: ['rocket', 'fire_level_2', 'money_eyes'],
    name: 'Full Send',
    tier: 2
  }
};
```

#### Reactive Effects (Camera-Triggered)
```typescript
// Effects that respond to user actions
const REACTIVE_TRIGGERS = {
  'smile_detected': 'money_rain',
  'frown_detected': 'crying',
  'eyes_closed': 'sweating',
  'mouth_open': 'mind_blown'
};
```

#### Time-Based Unlocks
```typescript
const TIMED_EFFECTS = {
  'thursday_night': {
    window: 'thursday 20:00-23:00',
    effect: 'tnf_special',
    name: 'TNF Exclusive'
  },
  'super_bowl': {
    window: '2025-02-09',
    effect: 'championship_ultimate',
    name: 'Super Bowl Special'
  },
  'march_madness': {
    window: 'march',
    effect: 'bracket_chaos',
    name: 'March Madness'
  }
};
```

#### Social Sharing Optimizations
```typescript
// Pre-render popular effects for instant sharing
const SHAREABLE_PRESETS = {
  'big_win': {
    effects: ['money_rain', 'fire'],
    watermark: '@snapbet',
    duration: 3000,
    format: 'mp4'
  },
  'bad_beat': {
    effects: ['skull', 'crying'],
    watermark: '@snapbet', 
    duration: 2000,
    format: 'mp4'
  }
};
```

#### Effect Preview Mode
```typescript
// Let users try locked effects for 5 seconds
const PREVIEW_CONFIG = {
  duration: 5000, // 5 seconds
  watermark: 'PREVIEW',
  onComplete: () => {
    // Show unlock prompt
    showUnlockPrompt({
      message: 'Unlock this effect by earning badges!',
      cta: 'View Badges',
      action: () => navigateTo('/badges')
    });
  }
};

// In effect selector
const handleEffectPress = (effect) => {
  if (effect.isLocked && !effect.isPreviewing) {
    startPreview(effect);
  } else if (!effect.isLocked) {
    selectEffect(effect);
  }
};
```

### 9. Performance Guidelines

#### Adaptive Quality System
```typescript
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

#### Memory Management
- Pool particle instances (create once, reuse)
- Clear effects when leaving camera
- Limit effect preview in selector
- Use `runOnUI` for all animations

### 10. Haptic Feedback Integration (Sprint Implementation)

**Note: This section is for the development team to implement during Sprint 03.01, NOT for the browser agent.**

#### Haptic Patterns by Effect Type
```typescript
import * as Haptics from 'expo-haptics';

const HAPTIC_CONFIGS = {
  // One-time burst effects
  'confetti': {
    pattern: Haptics.NotificationFeedbackType.Success,
    trigger: 'onStart'
  },
  'mind_blown': {
    pattern: Haptics.ImpactFeedbackStyle.Heavy,
    trigger: 'onExplosion'
  },
  
  // Continuous effects
  'fire': {
    pattern: Haptics.ImpactFeedbackStyle.Light,
    interval: 500, // Pulse every 500ms
    trigger: 'continuous'
  },
  'money_rain': {
    pattern: Haptics.ImpactFeedbackStyle.Medium,
    interval: 300,
    trigger: 'continuous'
  },
  
  // Special patterns
  'buzzer_beater': {
    pattern: [
      { type: Haptics.ImpactFeedbackStyle.Light, delay: 0 },
      { type: Haptics.ImpactFeedbackStyle.Medium, delay: 100 },
      { type: Haptics.ImpactFeedbackStyle.Heavy, delay: 200 }
    ],
    trigger: 'sequence'
  }
};

// Implementation in effect manager
const triggerHaptic = async (effectId: string) => {
  const userHapticsEnabled = await AsyncStorage.getItem('haptics_enabled');
  if (userHapticsEnabled === 'false') return;
  
  const config = HAPTIC_CONFIGS[effectId];
  if (!config) return;
  
  switch (config.trigger) {
    case 'onStart':
      await Haptics.notificationAsync(config.pattern);
      break;
    case 'continuous':
      // Set up interval for continuous effects
      break;
    case 'sequence':
      // Execute pattern sequence
      break;
  }
};
```

#### Platform Considerations
- iOS: Full haptic support with Taptic Engine
- Android: Basic vibration patterns (map to closest equivalent)
- Add user preference toggle in settings
- Respect system accessibility settings

---

## Next Steps

1. **Browser Agent Tasks**:
   - Create visual mockups of each effect
   - Define exact particle counts and timings
   - Specify animation curves for each physics type
   - Provide color/size variations

2. **Implementation Order**:
   - Phase 1: Base effects (Tier 0) - MVP
   - Phase 2: Enhanced effects (Tier 1)
   - Phase 3: Premium effects (Tier 2)
   - Phase 4: Elite and seasonal effects

3. **Sprint 03.01 Updates**:
   - Replace Lottie implementation with emoji system
   - Create reusable particle components
   - Implement physics engine
   - Add effect selector UI
   - Integrate with camera capture

---

*Document Created: January 2025*
*Purpose: Define emoji-based effects system for SnapBet*
*Sprint: 03.01 - Effects & Filters System* 