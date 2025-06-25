# SnapBet Development Standards

## Overview
This document defines the mandatory development practices for all SnapBet development. These standards ensure code quality, maintainability, and consistency across the entire codebase.

## 🚨 MANDATORY FOR ALL SPRINTS

### 1. Database Management

#### Supabase MCP Usage
**You MUST use Supabase MCP tools to inspect the database state:**
```bash
# Check current schema
mcp_supabase_get_schemas

# Inspect tables in a schema
mcp_supabase_get_tables --schema_name public

# Get detailed table structure
mcp_supabase_get_table_schema --schema_name public --table posts

# Execute queries (be careful!)
mcp_supabase_execute_postgresql --query "SELECT * FROM users LIMIT 5;"
```

#### Type Synchronization
**After ANY database change:**
1. Create a migration file in `supabase/migrations/`
2. Run the migration: `supabase db push`
3. Generate types: `supabase gen types typescript --local > types/supabase-generated.ts`
4. Update `types/database.ts` if needed
5. Fix any TypeScript errors that arise from the changes

#### Migration Requirements
- **Every** database change needs a migration file
- Use descriptive names: `XXX_add_privacy_to_users.sql`
- Include rollback comments when possible
- Test on fresh database before committing

### 2. UI/UX Consistency

#### Tamagui Components
**ALWAYS use Tamagui components:**
```typescript
// ✅ CORRECT
import { View, Text, XStack, YStack, Stack } from '@tamagui/core';

// ❌ WRONG
import { View, Text } from 'react-native';
```

#### Color System
**NEVER hardcode colors:**
```typescript
// ✅ CORRECT
import { Colors } from '@/theme';
<Text color={Colors.primary}>Hello</Text>

// ❌ WRONG
<Text color="#10b981">Hello</Text>
<Text color="green">Hello</Text>
```

#### Spacing System
**Use Tamagui spacing tokens:**
```typescript
// ✅ CORRECT
<View padding="$4" marginTop="$2" gap="$3">

// ❌ WRONG
<View padding={16} marginTop={8} gap={12}>
```

#### Component Patterns
**Follow established patterns:**
```typescript
// Screen headers
import { ScreenHeader } from '@/components/ui/ScreenHeader';

// Safe area handling
const insets = useSafeAreaInsets();
<View paddingTop={insets.top}>

// Icons (use text characters)
<Text fontSize={24}>←</Text>  // Back arrow
<Text fontSize={24}>⚙️</Text>  // Settings
```

### 3. Code Quality Standards

#### Zero Tolerance Policy
**Before EVERY commit:**
```bash
# These MUST pass with 0 errors, 0 warnings
bun run lint
bun run typecheck

# If there's a build script
bun run build
```

#### Type Safety
**No `any` types without justification:**
```typescript
// ❌ WRONG
const handleData = (data: any) => { ... }

// ✅ CORRECT
const handleData = (data: UserProfile) => { ... }

// ✅ ACCEPTABLE (with comment)
// TODO: Type this properly after API stabilizes
const handleData = (data: any /* temporary */) => { ... }
```

#### Import Organization
**Consistent import order:**
```typescript
// 1. React/React Native
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

// 2. Third-party libraries
import { View, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';

// 3. Local imports (absolute paths)
import { Colors } from '@/theme';
import { supabase } from '@/services/supabase/client';

// 4. Relative imports
import { PostCard } from './PostCard';

// 5. Types
import type { Post } from '@/types/database';
```

### 4. State Management

#### Zustand Stores
**Keep stores focused:**
```typescript
// ✅ CORRECT - Single responsibility
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// ❌ WRONG - Kitchen sink store
const useAppStore = create((set) => ({
  user: null,
  posts: [],
  messages: [],
  // ... everything in one store
}));
```

#### React Query Patterns
**For server state (coming in Epic 4):**
```typescript
// Consistent key structure
const queryKeys = {
  posts: ['posts'],
  userPosts: (userId: string) => ['posts', 'user', userId],
  post: (postId: string) => ['posts', postId],
};
```

### 5. Performance Standards

#### Memoization
**Use wisely, not everywhere:**
```typescript
// ✅ CORRECT - Expensive computation
const expensiveValue = useMemo(() => 
  calculateComplexValue(data), [data]
);

// ❌ WRONG - Premature optimization
const simpleValue = useMemo(() => 
  user.name, [user.name]
);
```

#### List Performance
**For any list > 10 items:**
- Use FlashList (not FlatList)
- Implement proper `keyExtractor`
- Set `estimatedItemSize`
- Use `getItemType` for mixed content

### 6. Error Handling

#### User-Facing Errors
**Always provide context:**
```typescript
// ✅ CORRECT
Alert.alert(
  'Unable to Load Posts',
  'Please check your connection and try again.',
  [{ text: 'Retry', onPress: retry }]
);

// ❌ WRONG
Alert.alert('Error', error.message);
```

#### Error Boundaries
**Wrap major features:**
```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <Feed />
</ErrorBoundary>
```

### 7. Testing Approach

#### Manual Testing Checklist
Before marking sprint complete:
- [ ] Feature works on iOS simulator
- [ ] Feature works on Android (if possible)
- [ ] No console errors/warnings
- [ ] Performance feels smooth
- [ ] Error states handled
- [ ] Loading states present
- [ ] Empty states designed

### 8. Git Commit Standards

#### Commit Messages
```bash
# ✅ CORRECT
feat(feed): implement infinite scroll with FlashList
fix(auth): handle Twitter OAuth timeout
refactor(profile): extract stats calculation to service

# ❌ WRONG
updated stuff
fix
WIP
```

### 9. Documentation

#### Code Comments
```typescript
// ✅ CORRECT - Explains WHY
// We need to delay navigation to ensure the drawer is mounted
setTimeout(() => router.push('/home'), 100);

// ❌ WRONG - Explains WHAT (obvious)
// Navigate to home
router.push('/home');
```

#### Complex Logic
**Always document:**
- Non-obvious algorithms
- Business logic decisions
- Workarounds for library bugs
- Performance optimizations

### 10. Security Practices

#### API Keys
**NEVER commit:**
- API keys
- Private keys  
- Passwords
- Even in development

#### User Data
**Always validate:**
```typescript
// ✅ CORRECT
const username = input.trim().toLowerCase();
if (!isValidUsername(username)) {
  throw new Error('Invalid username');
}

// ❌ WRONG
const username = input; // Direct use
```

## Sprint Handoff Checklist

Before marking ANY sprint as complete:

- [ ] `bun run lint` - 0 errors, 0 warnings
- [ ] `bun run typecheck` - 0 errors
- [ ] All database changes have migrations
- [ ] Types are regenerated and committed
- [ ] UI follows Tamagui/Colors pattern
- [ ] No hardcoded colors or dimensions
- [ ] Error handling implemented
- [ ] Loading states present
- [ ] Manual testing completed
- [ ] Sprint document updated with results

## Enforcement

These standards are **non-negotiable**. Code that doesn't meet these standards should not be merged, regardless of time pressure. Quality is part of our velocity, not separate from it.

## Architectural Patterns

### State Machine Pattern (Best Practice)
Based on the excellent implementation in Sprint 04.04, use state machines for complex workflows:

```typescript
// Example from follow request system
interface StateTransition {
  canTransitionTo(newState: State): boolean;
  onTransition(newState: State): Promise<void>;
}

class PendingState implements StateTransition {
  canTransitionTo(newState: State): boolean {
    return ['accepted', 'rejected', 'expired'].includes(newState);
  }
  
  async onTransition(newState: State): Promise<void> {
    // Handle side effects (notifications, follow creation, etc.)
  }
}
```

**When to use:**
- Multi-step workflows (follow requests, bet settlement, etc.)
- When state transitions have side effects
- When invalid transitions must be prevented
- For self-documenting code

### Singleton Services
Use singleton pattern for services that manage global state:

```typescript
export class PrivacyService {
  private static instance: PrivacyService;
  
  static getInstance(): PrivacyService {
    if (!this.instance) {
      this.instance = new PrivacyService();
    }
    return this.instance;
  }
}
```

### Multi-Layer Security
For privacy and security features, enforce at multiple levels:
1. **Database**: RLS policies, triggers, constraints
2. **Service**: Centralized access control checks
3. **UI**: Additional filtering as safety net

Never rely on just one layer for security-critical features.

## React Native Specific Standards

### Platform Awareness
**CRITICAL**: React Native is NOT a web browser. It has its own runtime and APIs.

### Forbidden APIs (Will Cause Crashes)
The following browser/DOM APIs do NOT exist in React Native and must NEVER be used:
- `window.*` (addEventListener, removeEventListener, location, etc.)
- `document.*` (getElementById, querySelector, etc.)
- `localStorage` (use AsyncStorage or MMKV)
- `fetch` with credentials (use proper auth headers)
- Any DOM manipulation

### Required React Native Patterns

#### Event Communication
```typescript
// CORRECT: React Native EventEmitter
import { DeviceEventEmitter } from 'react-native';

// WRONG: Browser events
window.addEventListener('custom-event', handler); // WILL CRASH
```

#### Storage
```typescript
// CORRECT: React Native storage
import { storageService } from '@/services/storage/storageService'; // MMKV

// WRONG: Browser storage
localStorage.setItem('key', 'value'); // WILL CRASH
```

#### Navigation
```typescript
// CORRECT: React Navigation
import { useRouter } from 'expo-router';
const router = useRouter();
router.push('/screen');

// WRONG: Browser navigation
window.location.href = '/page'; // WILL CRASH
```

### Testing Requirements
Before ANY sprint handoff:
1. **iOS Simulator**: Must run without crashes
2. **Android Emulator**: Must run without crashes
3. **Build Evidence**: Screenshot of running app required
4. **Platform Checks**: Use `Platform.OS` when needed

### Development Environment Setup
Your IDE/editor MUST be configured to:
1. Flag browser-specific APIs as errors
2. Use React Native TypeScript definitions
3. Enable React Native ESLint rules

Failure to understand platform differences is grounds for sprint rejection.

## Build Testing Requirements

### Sprint-Level Requirements
At the end of EVERY sprint:
```bash
bun run lint      # MUST return 0 errors, 0 warnings
bun run typecheck # MUST return 0 errors
```

No sprint can be approved with ANY errors or warnings.

### Epic-Level Requirements
At the end of EVERY epic, full platform testing is MANDATORY:

1. **Environment Cleanup**
   ```bash
   rm -rf .expo node_modules/.cache .tamagui ios/build android/build
   ```

2. **Platform Prebuilds**
   ```bash
   bun expo prebuild --platform ios --clean
   bun expo prebuild --platform android --clean
   ```

3. **Platform Testing**
   ```bash
   bun expo run:ios     # Must run without crashes
   bun expo run:android # Must run without crashes
   ```

4. **Verification Checklist**
   - [ ] Both platforms build successfully
   - [ ] Both platforms launch without crashes
   - [ ] All features work on both platforms
   - [ ] No platform-specific bugs
   - [ ] Screenshots taken as evidence

### Common Build Issues & Solutions

**MMKV Crash**: See sprint-x-fix-build.md for lazy initialization pattern

**Missing Native Modules**: Always run `prebuild --clean` after adding dependencies

**Platform-Specific Code**: Use `Platform.OS` checks when needed:
```typescript
import { Platform } from 'react-native';

const styles = {
  shadow: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
    },
    android: {
      elevation: 4,
    },
  }),
};
```

### Build Failure Protocol
If builds fail at epic end:
1. Create fix-build sprint immediately
2. Document all errors in sprint tracker
3. Fix all issues
4. Re-run full verification
5. Epic remains IN PROGRESS until builds pass

## Service Architecture Standards

### Service Independence (CRITICAL)
Services must NEVER call other services directly. This prevents circular dependencies and makes testing easier.

**BAD - Circular Dependency:**
```typescript
// services/followService.ts
import { privacyService } from './privacyService';

export class FollowService {
  async toggleFollow(targetId: string) {
    const isPrivate = await privacyService.isUserPrivate(targetId); // ❌ Creates cycle
    if (isPrivate) {
      // handle private account
    }
  }
}
```

**GOOD - Dependency Injection:**
```typescript
// services/followService.ts
export class FollowService {
  async toggleFollow(targetId: string, targetUserData: { isPrivate: boolean }) {
    if (targetUserData.isPrivate) { // ✅ No service dependency
      // handle private account
    }
  }
}

// hooks/useFollow.ts
const targetUser = await userService.getUser(targetId);
await followService.toggleFollow(targetId, { isPrivate: targetUser.is_private });
```

### Data Flow Architecture
```
UI Components
    ↓
Custom Hooks (orchestration layer)
    ↓
Services (pure business logic)
    ↓
Supabase/External APIs
```

Services should ONLY flow downward, never sideways to other services.

### Modal Navigation Standards
**NEVER use manual Modal components in screen files:**
```typescript
// ❌ WRONG - Manual modal
export default function CameraScreen() {
  return (
    <Modal visible={true} animationType="slide">
      <CameraView />
    </Modal>
  );
}

// ✅ CORRECT - Router-managed modal
// In _layout.tsx:
<Stack.Screen 
  name="camera" 
  options={{ 
    presentation: 'fullScreenModal',
    animation: 'slide_from_bottom'
  }}
/>

// In camera.tsx:
export default function CameraScreen() {
  return <CameraView />; // Router handles modal presentation
}
```

### Image Processing Standards
Always handle modern image formats explicitly:
```typescript
import * as ImageManipulator from 'expo-image-manipulator';

export async function processImage(uri: string) {
  // Convert any format (including HDR) to standard JPEG
  const processed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1080 } }],
    { 
      compress: 0.8, 
      format: ImageManipulator.SaveFormat.JPEG // Force JPEG to avoid HDR issues
    }
  );
  return processed.uri;
}
```

---

*Last Updated: January 2025*
*Version: 1.0* 