# Sprint 01.00: Project Setup

## Sprint Overview

**Epic**: 01 - Foundation & Infrastructure  
**Sprint**: 01.00  
**Name**: Project Setup  
**Status**: NOT STARTED  
**Estimated Duration**: 2.5 hours  
**Actual Duration**: -  

## Sprint Objectives

- Organize existing Expo project with clean folder structure
- Set up Expo Router for file-based navigation
- Configure TypeScript path aliases for clean imports
- Create directories for scripts and Supabase config
- Maintain existing project functionality

## Required Documentation

- **[PRD](.pm/docs/PRD.md)** - Overall project vision and requirements
- **[UI/UX Design](.pm/docs/ui-ux.md)** - For understanding app structure
- **[Setup Guide](.pm/docs/SETUP.md)** - Reference for environment setup

## Success Criteria

- [ ] Can run `bun install`
- [ ] Can run `bun run start`
- [ ] TypeScript compilation works with path aliases
- [ ] Clean import paths working (e.g., `@/components/Button`)
- [ ] Expo Router navigation structure in place
- [ ] Existing app functionality preserved

## Tasks

### 1. Review Existing Code (30 minutes)
- [ ] Document current file structure
- [ ] Identify code to preserve vs reorganize
- [ ] List current dependencies
- [ ] Note any custom configurations

### 2. Create Folder Structure
- [ ] Create `app/` directory for Expo Router screens
- [ ] Create `components/` for reusable UI components
- [ ] Create `services/` for API and Supabase logic
- [ ] Create `stores/` for Zustand state management
- [ ] Create `hooks/` for custom React hooks
- [ ] Create `utils/` for helper functions
- [ ] Create `types/` for TypeScript definitions
- [ ] Create `scripts/` for development scripts
- [ ] Create `supabase/` for migrations and config

### 3. Set Up Expo Router
- [ ] Install expo-router: `bun add expo-router`
- [ ] Create `app/_layout.tsx` for root layout
- [ ] Create placeholder screens:
  - [ ] `app/index.tsx` (redirect to auth/tabs)
  - [ ] `app/(auth)/_layout.tsx` (auth group)
  - [ ] `app/(tabs)/_layout.tsx` (main app tabs)
- [ ] Configure metro.config.js for Expo Router

### 4. Configure TypeScript Path Aliases
- [ ] Update `tsconfig.json` with path mappings:
  ```json
  {
    "compilerOptions": {
      "baseUrl": ".",
      "paths": {
        "@/*": ["./*"],
        "@/components/*": ["components/*"],
        "@/services/*": ["services/*"],
        "@/types/*": ["types/*"]
      }
    }
  }
  ```
- [ ] Install babel-plugin-module-resolver
- [ ] Configure babel.config.js with alias plugin

### 5. Install Core Dependencies
- [ ] Add required packages:
  ```bash
  bun add @supabase/supabase-js zustand @tamagui/core @tamagui/config
  bun add react-native-safe-area-context react-native-screens
  bun add -d @types/react @types/react-native
  ```
- [ ] Verify all dependencies installed correctly

### 6. Update Configuration Files
- [ ] Update `.gitignore` for new structure
- [ ] Configure ESLint with React Native rules
- [ ] Update Prettier configuration
- [ ] Move existing code to appropriate folders

### 7. Environment Setup
- [ ] Create `.env.example` with required variables:
  ```
  EXPO_PUBLIC_SUPABASE_URL=
  EXPO_PUBLIC_SUPABASE_ANON_KEY=
  ```
- [ ] Document environment setup in README
- [ ] Add `.env` to `.gitignore`

### 8. Create Health Check Screen
- [ ] Create temporary home screen with connection test:
  ```typescript
  // app/(tabs)/index.tsx
  export default function HomeScreen() {
    const [connected, setConnected] = useState(false)
    
    useEffect(() => {
      // Will test Supabase in next sprint
      setConnected(true) // For now, just check app loads
    }, [])
    
    return (
      <View style={styles.container}>
        <Text>SnapFade</Text>
        <Text>Environment: {connected ? '✅ Ready' : '⏳ Loading'}</Text>
      </View>
    )
  }
  ```

### 9. Documentation
- [ ] Create `.pm/docs/SETUP.md` with setup instructions
- [ ] Document any issues encountered
- [ ] Update README with basic project info

### 10. Verify Everything Works
- [ ] Run `bun install`
- [ ] Start Expo dev server with `bun run start`
- [ ] Verify hot reload works
- [ ] Check TypeScript compilation
- [ ] Test navigation between screens
- [ ] Verify path aliases work

## Technical Decisions

### Project Structure
```
snapfade/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth group
│   ├── (tabs)/            # Main app tabs
│   ├── profile/[id].tsx   # Dynamic routes
│   └── _layout.tsx        # Root layout
├── components/            # UI components
├── hooks/                 # React hooks
├── services/              # API/Supabase
├── stores/                # Zustand stores
├── utils/                 # Helpers
├── types/                 # TypeScript
├── assets/                # Media files
├── scripts/               # Dev scripts
├── supabase/             # Supabase config
│   ├── migrations/       # SQL migrations
│   └── seed.sql         # Seed data
├── app.json              # Expo config
├── eas.json              # EAS Build config
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript
```

### Package Scripts
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "db:setup": "bun scripts/setup-db.ts",
    "db:seed": "bun scripts/seed-mock-data.ts"
  }
}
```

## Known Issues & Blockers

- None identified yet

## Notes

- Preserving existing `bun.lockb` file to maintain dependency versions
- Not breaking any existing functionality, just reorganizing
- Simple structure is easier to maintain than monorepo for single app
- Path aliases provide clean imports without workspace complexity

## Handoff to Reviewer

**Status**: NOT STARTED

### What Was Implemented
[To be completed at sprint end]

### Files Modified/Created
[To be completed at sprint end]

### Key Decisions Made
[To be completed at sprint end]

### Testing Performed
[To be completed at sprint end]

---

*Sprint Started: -*  
*Sprint Completed: -* 