# Sprint 03.0X - Process Emoji Effects From MD Files

**Sprint ID**: 03.0X (Special Processing Sprint)  
**Epic**: Epic 3 - Social Feed & Content  
**Duration**: 1 day  
**Status**: HANDOFF  

## Sprint Goal
Extract emoji effect data from 5 batch MD files and create exactly 71 individual effect configuration files plus supporting type definitions.

## Tier System Explanation

**What are Tiers?** Effects are organized by unlock requirements:
- **Tier 0**: Free effects available to all users (no badges required)
- **Tier 1**: Effects unlocked when user earns ANY badge
- **Tier 2**: Effects requiring SPECIFIC badges (e.g., "hot_streak" badge for Inferno Mode)
- **Tier 3**: Not implemented in MVP (would require multiple badges)
- **Tier 4**: Not implemented in MVP (would be seasonal/limited time)

## Source Files to Process

1. `.pm/execution_docs/emoji/batch-1.md` - Contains 6 effects (all Tier 0)
2. `.pm/execution_docs/emoji/batch-2.md` - Contains 11 effects (all Tier 0)  
3. `.pm/execution_docs/emoji/batch-3.md` - Contains 11 effects (all Tier 0)
4. `.pm/execution_docs/emoji/batch-4.md` - Contains 14 effects (all Tier 0)
5. `.pm/execution_docs/emoji/tier-1.md` - Contains 17 effects (all Tier 1)
6. `.pm/execution_docs/emoji/tier-2.md` - Contains 12 effects (all Tier 2)
7. `.pm/execution_docs/emoji_effects.md` - Contains category mappings and tier system

**Total Effects to Extract**: 71 (42 Tier 0 + 17 Tier 1 + 12 Tier 2)

## Exact Files to Create

### 1. Type Definition File (1 file)
```
components/effects/types.ts
```
**Content to Extract**: All TypeScript interfaces and types from the batch files:
- `PhysicsType` union type with all 48 physics types
- `EffectConfig` interface
- `ParticleConfig` interface  
- `DeviceTier` type ('low' | 'medium' | 'high')
- `EffectDuration` type (number | 'continuous')
- `UnlockRequirement` interface
- Any other interfaces found in the batch files

**Note**: The types.ts file should contain ALL type definitions needed by the effect system. Extract these from the TypeScript code blocks in the batch files.

### 2. Effect Configuration Files (71 files)

#### Tier 0 Effects (42 files) in `components/effects/constants/effectConfigs/tier0/`

From **batch-1.md** (6 files):
1. `fire.ts` - Fire effect config
2. `skull.ts` - I'm Dead 💀 effect config
3. `money.ts` - Cha-Ching effect config
4. `confetti.ts` - Winner! effect config
5. `tears.ts` - Bad Beat effect config
6. `rocket.ts` - To The Moon effect config

From **batch-2.md** (11 files):
7. `crying_laughing.ts` - Can't Stop Laughing
8. `no_cap.ts` - No Cap
9. `clown_check.ts` - Clown Check
10. `vibing.ts` - Vibing
11. `bussin.ts` - Bussin FR
12. `sus.ts` - That's Sus
13. `big_w.ts` - Big W
14. `big_l.ts` - Big L
15. `trending_up.ts` - Trending Up
16. `too_cool.ts` - Too Cool
17. `flex.ts` - Flex

From **batch-3.md** (11 files):
18. `rough_patch.ts` - Rough Patch
19. `mind_blown.ts` - Mind Blown
20. `nervous.ts` - Nervous
21. `gg_ez.ts` - GG EZ
22. `rage_quit.ts` - Rage Quit
23. `poggers.ts` - POGGERS
24. `f_in_chat.ts` - F
25. `game_time.ts` - Game Time
26. `menace.ts` - Menace to Society
27. `no_chill.ts` - No Chill
28. `stay_salty.ts` - Stay Salty

From **batch-4.md** (14 files):
29. `good_vibes.ts` - Good Vibes
30. `side_eye.ts` - Side Eye
31. `chefs_kiss.ts` - Chef's Kiss
32. `this_you.ts` - This You?
33. `npc_mode.ts` - NPC Mode
34. `sparkle.ts` - Sparkle
35. `diamond_hands_preview.ts` - Diamond Hands (Preview)
36. `sweating_bullets.ts` - Sweating Bullets
37. `down_bad.ts` - Down Bad
38. `bet_slip_drop.ts` - Bet Slip Drop
39. `boosted.ts` - Boosted
40. `to_the_moon.ts` - To The Moon
41. `bag_alert_preview.ts` - Bag Alert (Preview)
42. `buzzer_beater_preview.ts` - Buzzer Beater (Preview)

#### Tier 1 Effects (17 files) in `components/effects/constants/effectConfigs/tier1/`

From **tier-1.md**:
1. `fire_level_2.ts` - Blazing Hot
2. `money_level_2.ts` - Money Shower
3. `celebration_level_2.ts` - Party Time
4. `tears_level_2.ts` - Crying Rivers
5. `cool_level_2.ts` - Ice Cold
6. `sports_level_2.ts` - Sports Mania
7. `sparkle_level_2.ts` - Stardust
8. `muscle_level_2.ts` - Beast Mode
9. `dice_roll.ts` - Rolling Dice
10. `storm.ts` - Storm Coming
11. `sheesh.ts` - SHEEEESH
12. `ratio.ts` - Ratio'd
13. `touch_grass.ts` - Touch Grass
14. `built_different.ts` - Built Different
15. `caught_4k.ts` - Caught in 4K
16. `diamond_hands.ts` - Diamond Hands (Full)
17. `buzzer_beater.ts` - Buzzer Beater (Full)

#### Tier 2 Effects (12 files) in `components/effects/constants/effectConfigs/tier2/`

From **tier-2.md**:
1. `fire_level_3.ts` - Inferno Mode
2. `money_level_3.ts` - Make It Rain
3. `celebration_level_3.ts` - Epic Celebration
4. `tears_level_3.ts` - Waterworks
5. `cool_level_3.ts` - Untouchable
6. `sports_level_3.ts` - Championship Mode
7. `sparkle_level_3.ts` - Cosmic
8. `slot_machine.ts` - Jackpot
9. `toxic.ts` - Toxic Trait
10. `rizz.ts` - W Rizz
11. `main_character.ts` - Main Character
12. `bag_alert.ts` - Bag Alert (Full Version)

### 3. Index Files (4 files)

1. `components/effects/constants/effectConfigs/tier0/index.ts`
   - Export all 48 tier 0 effects

2. `components/effects/constants/effectConfigs/tier1/index.ts`
   - Export all 17 tier 1 effects

3. `components/effects/constants/effectConfigs/tier2/index.ts`
   - Export all 12 tier 2 effects

4. `components/effects/constants/effectConfigs/index.ts`
   - Export all tiers

### 4. Category Mapping File (1 file)

`components/effects/constants/categories.ts`

Extract from emoji_effects.md:
```typescript
export const UI_CATEGORIES = {
  WINS: {
    name: 'Wins',
    icon: '🏆',
    effects: [/* list of effect IDs */]
  },
  LOSSES: { /* ... */ },
  VIBES: { /* ... */ },
  HYPE: { /* ... */ },
  WILDCARDS: { /* ... */ },
  BETTING: { /* ... */ }
} as const;
```

### 5. All Effects Registry (1 file)

`components/effects/constants/allEffects.ts`

Create registry importing all 73 effects:
```typescript
import * as tier0Effects from './effectConfigs/tier0';
import * as tier1Effects from './effectConfigs/tier1';
import * as tier2Effects from './effectConfigs/tier2';

export const ALL_EFFECTS = {
  ...tier0Effects,
  ...tier1Effects,
  ...tier2Effects
};
```

## Effect File Template

Each of the 73 effect files MUST follow this exact structure:

```typescript
import { EffectConfig } from '../../types';

export const [effectName]Effect: EffectConfig = {
  id: '[effect_id]',           // From MD file
  name: '[Display Name]',      // From MD file
  tier: [0|1|2],              // From MD file
  category: '[category]',      // From MD file
  particles: [                 // From MD file
    {
      emoji: '[emoji]',
      count: [number],
      size: { min: [num], max: [num] },
      opacity: { min: [num], max: [num] },
      delay: { min: [num], max: [num] }
    }
  ],
  physics: '[physics_type]',   // From MD file
  duration: [number|'continuous'], // From MD file
  unlockRequirement: {         // Only if tier > 0
    type: 'badge',
    value: '[badge_name|any]'
  }
};
```

## Data Extraction Rules

### From Batch Files:
1. **Effect ID**: Use snake_case from the effect object key
2. **Name**: Extract from `name` property
3. **Tier**: Extract from `tier` property
4. **Category**: Extract from `category` property
5. **Particles**: Extract full array with all properties
6. **Physics**: Extract from `physics` property
7. **Duration**: Extract from `duration` property
8. **Unlock Requirement**: Extract if present

### Physics Types to Extract:
All physics types mentioned across batch files (48 total):
- From Batch 1: `float`, `floatUp`, `fall`, `explode`, `launch`
- From Batch 2: `bounce`, `spinAway`, `zoomDance`, `gentleFloat`, `explodeOut`, `lookAround`, `formLetter`, `riseUp`, `slideDown`, `flexPump`
- From Batch 3: `crashDown`, `headExplode`, `sweatDrop`, `victoryDance`, `angerBurst`, `popIn`, `formF`, `sportsBounce`, `chaosCircle`, `temperatureFlux`, `saltPour`
- From Batch 4: `rainbowArc`, `slideInLook`, `kissMotion`, `cameraFlash`, `roboticMarch`, `twinkle`, `holdStrong`, `intensifySweat`, `spiralDown`, `formAmount`, `lightningStrike`, `moonLaunch`, `alertOpen`, `clockCountdown`
- From Tier 1: `enhancedFloat`, `money3D`, `multiExplode`, `riverFlow`, `iceCool`, `sportsRain`, `swirlPattern`, `beastFlex`, `diceRoll`, `stormSystem`, `freezeWind`, `ratioOverwhelm`, `grassGrow`, `chadEnergy`, `cameraFlashes`, `diamondHold`, `lastSecond`
- From Tier 2: `infernoEruption`, `moneyTornado`, `fireworksShow`, `floodingTears`, `diamondAura`, `championOrbit`, `galaxySwirl`, `slotSpin`, `toxicBubble`, `smoothCharm`, `spotlight`, `bagBurst`

## Deliverables Summary

**Total Files Created**: 78
- 1 types.ts file (containing all interfaces and types)
- 71 individual effect configuration files (42 tier 0 + 17 tier 1 + 12 tier 2)
- 4 index files  
- 1 categories.ts file
- 1 allEffects.ts file

**Directory Structure**:
```
components/effects/
├── types.ts
└── constants/
    ├── allEffects.ts
    ├── categories.ts
    └── effectConfigs/
        ├── index.ts
        ├── tier0/
        │   ├── index.ts
        │   └── [48 effect files]
        ├── tier1/
        │   ├── index.ts
        │   └── [17 effect files]
        └── tier2/
            ├── index.ts
            └── [12 effect files]
```

## Success Criteria

- [x] Exactly 78 files created in correct locations
- [x] All 71 effects extracted with complete data
- [x] No physics implementations (just string references)
- [x] No UI components
- [x] No preview system
- [x] No haptic configurations
- [x] Just pure effect configuration data
- [x] All files follow exact template structure
- [x] TypeScript types properly imported/exported

## Notes

- This sprint ONLY extracts and structures data
- NO implementation of physics, UI, or systems
- Physics are just string references in configs
- All other implementation happens in Sprint 03.01

## Next Steps

After this sprint:
1. Sprint 03.01 can immediately use these files
2. No need to revisit batch documentation
3. Easy to add new effects following the pattern
4. Preview system ready for monetization

## Handoff to Reviewer

**Status**: HANDOFF

### What Was Implemented
- Extracted and created all 71 emoji effect configuration files from batch documentation
- Created comprehensive TypeScript type definitions with 70 physics types
- Organized effects into proper tier structure (tier0, tier1, tier2)
- Created category mappings and effect registry system

### Files Modified/Created
- `components/effects/types.ts` - All TypeScript interfaces and types
- `components/effects/constants/effectConfigs/tier0/` - 42 Tier 0 effect files
- `components/effects/constants/effectConfigs/tier1/` - 17 Tier 1 effect files  
- `components/effects/constants/effectConfigs/tier2/` - 12 Tier 2 effect files
- `components/effects/constants/effectConfigs/index.ts` - Main tier exports
- `components/effects/constants/categories.ts` - UI category mappings
- `components/effects/constants/allEffects.ts` - Effect registry

### Key Decisions Made
- Used exact effect naming from documentation (camelCase with "Effect" suffix)
- Maintained all physics types as string references (no implementations)
- Fixed import paths to properly reference types file
- Organized effects by tier for easy badge-based unlocking

### Testing Performed
- TypeScript compilation passes (for effect files)
- ESLint passes with no errors/warnings
- All 71 effects properly extracted with complete data
- Import/export structure verified 