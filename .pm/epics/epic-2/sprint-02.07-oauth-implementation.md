# Sprint 02.07: OAuth Implementation & Development Build Migration

## Sprint Overview

**Status**: IN PROGRESS  
**Start Date**: 2024-01-18  
**End Date**: -  
**Epic**: 02 - Authentication & User System

**Original Sprint Goal**: Set up deployment infrastructure and configurations while maintaining Expo Go compatibility for development.

**Revised Sprint Goal**: Implement working OAuth authentication by migrating to development builds due to Expo Go limitations. Complete authentication flow and prepare deployment infrastructure.

## Major Pivot: Expo Go → Development Build

### Why the Change
During OAuth implementation, we discovered critical limitations with Expo Go:
1. **Deep linking issues**: `exp://` URLs don't properly handle OAuth redirects
2. **WebBrowser limitations**: Can't properly close auth sessions
3. **Supabase redirect handling**: Non-standard URL format (#) incompatible with Expo Go
4. **Session persistence**: Linking event listeners not firing reliably

### Current Status: OAuth Working but Critical UI/UX Issues! 🚨

#### ✅ Completed
1. **Development Build Setup**:
   - Installed EAS CLI with bun
   - Configured `eas.json` with development-simulator profile
   - Built and installed development build on iOS Simulator
   - OAuth now uses proper `snapbet://` deep links

2. **Supabase Configuration**:
   - Updated redirect URLs to support `snapbet://` scheme
   - Fixed Site URL configuration
   - Enabled email permissions for Twitter OAuth
   - Configured both Twitter and Google OAuth apps

3. **Database Fixes**:
   - Created auth trigger to auto-create user records on OAuth signup
   - Made email nullable (Twitter doesn't always provide)
   - Fixed username constraint to allow NULL during onboarding
   - Added error handling to auth trigger with proper schema qualification

4. **Code Updates**:
   - Fixed AuthProvider deadlock issue (async → sync callback)
   - Updated OAuth flow to use `WebBrowser.openAuthSessionAsync`
   - Added manual token parsing from redirect URL
   - Fixed all lint errors (42) and TypeScript errors (1)
   - Added proper error handling for OAuth failures

5. **OAuth Flow Fixed**:
   - Twitter login now works completely!
   - Session is properly set after OAuth redirect
   - User record is created in database
   - User can complete onboarding flow

#### 🚨 CRITICAL Issues (Blocking Users)

**Username Validation**: 
- Shows "already taken" while typing each character
- Missing proper debounce on validation
- Makes it impossible to type usernames

**Navigation Layouts**:
- Edit Profile screen cut off at top - can't see fields or navigate back
- Notifications page cut off - no back button, users get stuck
- Settings page has header/spacing issues
- Missing consistent header component across drawer screens

**Navigation Error**: 
```
ERROR  The action 'REPLACE' with payload {"name":"(drawer)"...} was not handled by any navigator.
```
- Appears when reaching the feed after onboarding
- Non-blocking but indicates navigation timing issue

**SecureStore Warning**:
```
WARN  Value being stored in SecureStore is larger than 2048 bytes
```
- Session tokens are large
- May need to store tokens separately or compress

### Technical Implementation Details

#### OAuth Flow (Working)
1. User clicks OAuth button
2. `WebBrowser.openAuthSessionAsync` opens provider
3. User authenticates with provider
4. Provider redirects to `snapbet://` with tokens in URL fragment
5. We parse tokens from URL and create session
6. Auth trigger creates user record in database
7. User navigates to username selection

#### Key Code Changes

**authService.ts**:
```typescript
// Parse tokens from redirect URL
if (result.url && result.url.includes('#access_token=')) {
  const params = new URLSearchParams(result.url.split('#')[1]);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  // ... create session
}
```

**Database Trigger**:
```sql
-- Properly qualified enum type
CASE 
  WHEN NEW.raw_app_meta_data->>'provider' = 'google' THEN 'google'::public.oauth_provider
  WHEN NEW.raw_app_meta_data->>'provider' = 'twitter' THEN 'twitter'::public.oauth_provider
END
```

### Remaining Sprint Tasks

#### Phase 0: CRITICAL UI/UX Fixes (MUST DO FIRST!)
**These issues are blocking users and must be fixed before anything else. Test each fix by reloading with 'r' and confirming the UI looks correct.**

1. **Username Validation Debouncing**:
   - [ ] Fix username validation to wait until user stops typing (add proper debounce)
   - [ ] Current issue: Shows "already taken" while typing
   - [ ] Should wait 500ms after last keystroke before checking
   - [ ] File: `components/auth/UsernameInput.tsx`

2. **Navigation Error on Feed**:
   - [ ] Fix "The action 'REPLACE' with payload..." error when reaching feed
   - [ ] Likely timing issue with navigation after auth
   - [ ] File: `app/_layout.tsx`

3. **Edit Profile Screen Layout**:
   - [ ] Fix cut-off header - can't see all fields or back button
   - [ ] Add proper header with back navigation
   - [ ] Ensure proper SafeAreaView and padding
   - [ ] File: `app/(drawer)/settings/profile.tsx`

4. **Notifications Page Layout**:
   - [ ] Fix cut-off header - no way to exit screen
   - [ ] Add consistent header with back button
   - [ ] File: `app/(drawer)/notifications.tsx`

5. **Settings Page Layout**:
   - [ ] Fix header and spacing issues
   - [ ] Add consistent navigation
   - [ ] File: `app/(drawer)/settings/index.tsx`

6. **Consistent Header Component**:
   - [ ] Create/fix a reusable header component for all drawer screens
   - [ ] Should include: back button, title, consistent padding
   - [ ] Use SafeAreaView to avoid notch/status bar issues
   - [ ] Ensure consistent spacing across all screens

**Testing Instructions**:
- After each fix, reload with 'r' in Metro
- Verify the UI is not cut off
- Ensure all screens have proper navigation
- Check on devices with notches (iPhone X+)
- Confirm with user before proceeding to Phase 1

**Implementation Notes for Header Fix**:
- All drawer screens should use `SafeAreaView` from `react-native-safe-area-context`
- Header should include:
  - Back button (chevron-left icon) that calls `navigation.goBack()`
  - Screen title centered
  - Consistent padding (16px horizontal)
  - Height of at least 44px for touch targets
- Example structure:
  ```tsx
  <SafeAreaView style={{ flex: 1, backgroundColor: Colors.background }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, height: 56 }}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-left" size={24} />
      </TouchableOpacity>
      <Text style={{ flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' }}>
        Screen Title
      </Text>
      <View style={{ width: 24 }} /> {/* Spacer for centering */}
    </View>
    {/* Screen content */}
  </SafeAreaView>
  ```

**Implementation Notes - IMPORTANT**:
**Follow the UI/UX Consistency Rules document at `.pm/ui-ux-consistency-rules.md`**

Key decisions based on codebase analysis:
1. **Create new `ScreenHeader` component** for drawer screens (don't modify existing Header)
2. **Use Tamagui components** (`View`, `Text`, `XStack` from `@tamagui/core`)
3. **Use `router.back()`** from expo-router (not navigation.goBack())
4. **Use `useSafeAreaInsets()` hook** instead of SafeAreaView component
5. **Use text characters for icons** (← for back) instead of icon libraries
6. **Use `Colors` constant** from `@/theme` for all colors
7. **Fix username validation** by adding `hasCheckedAvailability` state
8. **Test on iOS Simulator** with iPhone 14 Pro (has notch)

Example ScreenHeader implementation is provided in the consistency rules document.

#### Phase 1: Fix Navigation & Complete OAuth
- [ ] Fix navigation error after successful login
- [ ] Test Google OAuth (should work now)
- [ ] Verify logout/login cycle
- [ ] Test full onboarding flow (username → team → follow)

#### Phase 2: Environment Management
- [ ] Create environment files:
  - [ ] `.env.example` - Template for required variables
  - [ ] `.env.development` - Local development settings
  - [ ] `.env.staging` - Staging environment
  - [ ] `.env.production` - Production settings
- [ ] Create `config/environment.js` for environment switching
- [ ] Update `services/supabase/client.ts` to use environment config
- [ ] Add environment files to `.gitignore`
- [ ] Update `package.json` with environment scripts

#### Phase 3: Edge Functions Migration (From Sprint 02.06)
- [ ] Create Edge Functions structure:
  ```bash
  supabase/functions/
  ├── update-badges/
  ├── settle-bets/
  └── add-games/
  ```
- [ ] Migrate badge automation script
- [ ] Migrate bet settlement script
- [ ] Migrate game data script
- [ ] Create cron triggers migration (007_cron_triggers.sql)
- [ ] Test Edge Functions locally
- [ ] Deploy and configure cron schedules

#### Phase 4: Code Refactoring (From Sprint 02.06)
- [ ] Create `hooks/useUserList.ts` for shared user list logic
- [ ] Refactor `app/(drawer)/followers.tsx` to use hook
- [ ] Refactor `app/(drawer)/following.tsx` to use hook
- [ ] Remove duplicate code
- [ ] Add proper TypeScript types

#### Phase 5: CI/CD Foundation
- [ ] Create `.github/workflows/eas-preview.yml`
- [ ] Configure GitHub Actions for:
  - [ ] Running tests on PR
  - [ ] Linting and type checking
  - [ ] Preview build notifications
- [ ] Set up EAS secrets for CI
- [ ] Create build status badges

#### Phase 6: Documentation
- [ ] Create `docs/DEPLOYMENT.md` with:
  - [ ] Development workflow (dev builds vs Expo Go)
  - [ ] OAuth setup for production
  - [ ] Environment configuration
  - [ ] EAS build commands
  - [ ] Troubleshooting guide
- [ ] Create `scripts/version-bump.js` for version management
- [ ] Update README with new dev build workflow
- [ ] Document Edge Functions deployment

### Files Modified
| File Path | Changes | Status |
|-----------|---------|--------|
| `eas.json` | Added development-simulator profile | ✅ |
| `services/auth/authService.ts` | Complete OAuth flow rewrite | ✅ |
| `stores/authStore.ts` | Fixed session handling | ✅ |
| `components/auth/AuthProvider.tsx` | Fixed deadlock, added logging | ✅ |
| `app/_layout.tsx` | Added debug logging | ✅ |
| `supabase/migrations/007_create_auth_trigger.sql` | Created auth trigger | ✅ |
| `utils/auth/errorMessages.ts` | Added missing error codes | ✅ |

### Files to Create (Remaining Tasks)
| File Path | Purpose | Phase |
|-----------|---------|-------|
| `.env.example` | Environment variable template | Phase 2 |
| `.env.development` | Development environment | Phase 2 |
| `.env.staging` | Staging environment | Phase 2 |
| `.env.production` | Production environment | Phase 2 |
| `config/environment.js` | Environment management | Phase 2 |
| `supabase/functions/update-badges/index.ts` | Badge automation function | Phase 3 |
| `supabase/functions/settle-bets/index.ts` | Bet settlement function | Phase 3 |
| `supabase/functions/add-games/index.ts` | Game data function | Phase 3 |
| `supabase/migrations/008_cron_triggers.sql` | Cron job setup | Phase 3 |
| `hooks/useUserList.ts` | Shared user list hook | Phase 4 |
| `.github/workflows/eas-preview.yml` | CI/CD pipeline | Phase 5 |
| `docs/DEPLOYMENT.md` | Deployment guide | Phase 6 |
| `scripts/version-bump.js` | Version management | Phase 6 |

### Files to Modify (Remaining Tasks)
| File Path | Changes Needed | Phase |
|-----------|----------------|-------|
| `services/supabase/client.ts` | Use environment config | Phase 2 |
| `.gitignore` | Add environment files | Phase 2 |
| `package.json` | Add deployment scripts | Phase 2 |
| `app/(drawer)/followers.tsx` | Use useUserList hook | Phase 4 |
| `app/(drawer)/following.tsx` | Use useUserList hook | Phase 4 |
| `README.md` | Update dev workflow | Phase 6 |

### Key Learnings

1. **Expo Go is not suitable for OAuth**: Development builds required
2. **Supabase OAuth quirks**: Uses # in URLs, requires manual token parsing
3. **Database triggers need schema qualification**: `public.oauth_provider`
4. **Development builds maintain hot reload**: No loss of DX
5. **OAuth providers have different requirements**: Twitter needs email permission

### Development Workflow (Updated)

```bash
# Build development build (one time)
eas build --profile development-simulator --platform ios

# Start dev server
bun expo start --dev-client

# App now supports:
- ✅ OAuth with proper deep linking
- ✅ Hot reload
- ✅ All native features
- ✅ Proper `snapbet://` URL scheme
```

### Next Immediate Steps

1. **Fix navigation error**: Investigate timing of navigation after auth
2. **Test Google OAuth**: Should work with current implementation
3. **Complete onboarding flow**: Username → Team → Follow
4. **Move to original sprint tasks**: Environment setup, Edge Functions, etc.

### Success Criteria
- [x] OAuth login works for Twitter
- [ ] OAuth login works for Google
- [ ] **Username validation has proper debounce (no false "taken" messages)**
- [ ] **All drawer screens have consistent headers with back navigation**
- [ ] **No screens are cut off or inaccessible**
- [ ] **Navigation error resolved (no REPLACE action errors)**
- [ ] Full onboarding flow tested end-to-end
- [ ] Original deployment tasks completed

### Immediate Next Steps for Executor

1. **Start with Phase 0** - These are blocking issues that prevent users from using the app
2. **Test each fix individually** by reloading with 'r' 
3. **Get user confirmation** after fixing each screen
4. **Only proceed to Phase 1** after all UI/UX issues are resolved
5. **If any changes require a new build**, complete ALL fixes first, then build once

---

*Sprint Started: 2024-01-18*  
*OAuth Working: 2024-01-18*  
*Sprint Completed: -*  
*Final Status: IN PROGRESS - OAuth Working, Navigation Error* 