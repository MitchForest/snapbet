# Epic 02: Authentication & User System Tracker

## Epic Overview

**Status**: NOT STARTED  
**Start Date**: -  
**Target End Date**: Day 1 (end) - Day 2 (morning)  
**Actual End Date**: -

**Epic Goal**: Implement complete OAuth authentication flow with Google and Twitter, create user onboarding experience, establish user profiles and settings, and initialize bankroll system.

**User Stories Addressed**:
- Story 1: Social Pick Sharing - Enables user identity and profiles
- Story 2: Tail/Fade Decisions - Enables user identification for actions  
- Story 3: Ephemeral Content - Enables user ownership of content
- Story 4: Group Betting Coordination - Enables user identity in groups
- Story 5: Performance Tracking - Enables user stats foundation
- Story 6: AI-Powered Insights - Enables user data collection

**PRD Reference**: Authentication & Onboarding, User Profile & Account Management sections

## Sprint Breakdown

| Sprint # | Sprint Name | Status | Start Date | End Date | Key Deliverable |
|----------|-------------|--------|------------|----------|-----------------|
| 02.00 | OAuth Infrastructure | APPROVED | 2024-12-19 | 2024-12-19 | Working OAuth with Supabase |
| 02.01 | Welcome & OAuth Flow | APPROVED | 2024-12-19 | 2024-12-19 | Sign in with Google/Twitter |
| 02.02 | Onboarding - Username | APPROVED | 2024-12-20 | 2024-12-20 | Username selection screen |
| 02.03 | Onboarding - Team & Follow | NOT STARTED | - | - | Complete onboarding flow |
| 02.04 | User Profile & Settings | NOT STARTED | - | - | Profile management & bankroll |

**Statuses**: NOT STARTED | IN PROGRESS | IN REVIEW | APPROVED | BLOCKED

## Architecture & Design Decisions

### High-Level Architecture for This Epic
This epic establishes the complete authentication and user management system:
- OAuth integration through Supabase Auth
- Secure session management with refresh tokens
- Multi-step onboarding flow
- User profile and settings management
- Bankroll initialization and tracking

### Key Design Decisions

1. **OAuth-Only Authentication**: No email/password option
   - Alternatives considered: Traditional email/password, magic links
   - Rationale: Reduces friction, leverages existing accounts, no password management
   - Trade-offs: Requires Google/Twitter account, potential provider issues

2. **Supabase Auth Integration**: Use Supabase's built-in OAuth
   - Alternatives considered: Custom OAuth implementation, Auth0, Firebase Auth
   - Rationale: Integrated with our backend, handles tokens securely, includes RLS
   - Trade-offs: Vendor lock-in, but significant time savings

3. **30-Day Session Duration**: Long-lived sessions with refresh
   - Alternatives considered: 7-day sessions, until logout
   - Rationale: Balances security with user convenience for social app
   - Trade-offs: Slightly less secure, but better UX

4. **Optional Team Selection**: Can skip and set later
   - Alternatives considered: Mandatory selection
   - Rationale: Reduces onboarding friction, can infer from behavior
   - Trade-offs: Less initial personalization data

5. **Minimum 3 Follows**: Enforced during onboarding
   - Alternatives considered: No minimum, suggest but don't enforce
   - Rationale: Ensures feed has content, creates initial network
   - Trade-offs: Slight friction, but necessary for experience

6. **Username Immutability**: Cannot change after setting
   - Alternatives considered: Allow changes with cooldown
   - Rationale: Prevents confusion, maintains betting history integrity
   - Trade-offs: Users stuck with poor choices, but encourages thoughtfulness

### Dependencies
**External Dependencies**:
- Supabase Auth - OAuth provider integration
- expo-auth-session - OAuth flow handling
- expo-secure-store - Secure token storage
- expo-linking - Deep link handling
- react-native-mmkv - Fast persistent storage

**Internal Dependencies**:
- Requires: Database schema from Epic 1, Navigation structure from Epic 1
- Provides: User authentication for all future epics, User profiles for social features

## Implementation Notes

### File Structure for Epic
```
snapfade/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── welcome.tsx          # OAuth provider selection
│   │   └── onboarding/
│   │       ├── _layout.tsx      # Onboarding flow layout
│   │       ├── username.tsx     # Username selection
│   │       ├── team.tsx         # Favorite team selection
│   │       └── follow.tsx       # Follow suggestions
│   ├── profile/
│   │   ├── [username].tsx       # Public profile view
│   │   └── settings.tsx         # User settings
├── services/
│   ├── auth/
│   │   ├── authService.ts       # OAuth flow logic
│   │   ├── sessionManager.ts    # Token management
│   │   └── types.ts             # Auth types
├── stores/
│   ├── authStore.ts             # Auth state (Zustand)
│   └── userStore.ts             # User profile state
├── hooks/
│   ├── useAuth.ts               # Auth hook
│   ├── useUser.ts               # User data hook
│   └── useSession.ts            # Session management
├── components/
│   ├── auth/
│   │   ├── OAuthButton.tsx      # OAuth provider button
│   │   ├── OnboardingStep.tsx   # Step indicator
│   │   └── UsernameInput.tsx    # Username validation
│   ├── profile/
│   │   ├── ProfileHeader.tsx    # Profile display
│   │   ├── BankrollCard.tsx     # Bankroll display
│   │   └── SettingsItem.tsx     # Settings row
│   └── team/
│       ├── TeamSelector.tsx     # Team grid
│       └── TeamLogo.tsx         # SVG team logo
└── constants/
    └── teams.ts                 # NFL/NBA team data
```

### API Endpoints Added
| Method | Path | Purpose | Sprint |
|--------|------|---------|--------|
| POST | /auth/v1/signup | OAuth signup | 02.00 |
| POST | /auth/v1/token | Refresh token | 02.00 |
| GET | /auth/v1/user | Get current user | 02.01 |
| PATCH | /rest/v1/users | Update profile | 02.02 |
| GET | /rest/v1/users?username=eq.* | Check username | 02.02 |
| POST | /rest/v1/follows | Follow user | 02.03 |
| POST | /rest/v1/bankrolls | Initialize bankroll | 02.04 |

### Data Model Changes
```sql
-- No schema changes needed, using existing tables from Epic 1:
-- users: OAuth data, profile info
-- bankrolls: User bankroll tracking
-- follows: User relationships
-- user_settings: Preferences (JSONB in users table)
```

### Key Functions/Components Created
- `OAuthButton` - Branded OAuth buttons - Sprint 02.01
- `useAuth` - Authentication hook - Sprint 02.00
- `UsernameInput` - Real-time validation - Sprint 02.02
- `TeamSelector` - Team selection grid - Sprint 02.03
- `FollowSuggestions` - User recommendation list - Sprint 02.03
- `ProfileHeader` - User profile display - Sprint 02.04
- `BankrollCard` - Bankroll display/reset - Sprint 02.04

## Sprint Execution Log

### Sprint 02.00: OAuth Infrastructure
**Status**: APPROVED
**Summary**: Successfully implemented complete OAuth infrastructure with secure token storage, session management, and deep linking configuration. All objectives met with zero errors/warnings.
**Key Decisions**: 
- Created CustomAuthError interface instead of extending complex AuthError
- Combined Supabase client with auth service for better encapsulation
- Used catch blocks without error parameter to avoid linting issues
**Issues Encountered**: TypeScript error with extending AuthError interface - resolved by creating custom type

### Sprint 02.01: Welcome & OAuth Flow
**Status**: APPROVED
**Summary**: Successfully implemented welcome screen with OAuth sign-in buttons, full error handling, and navigation logic. All design specs met with clean, reusable components.
**Key Decisions**: 
- Used inline SVG icons instead of icon library to minimize dependencies
- Implemented Pressable with styled Views when Tamagui Button wasn't available
- Query users table for username to determine onboarding status
**Issues Encountered**: Tamagui doesn't export Button/Spinner components - worked around with native components

### Sprint 02.02: Onboarding - Username
**Status**: APPROVED
**Summary**: Successfully implemented username selection with real-time validation, smart suggestions, and race condition handling. Database migration created to make username nullable.
**Key Decisions**: 
- Direct Supabase query instead of RPC function
- Comprehensive validation rules (start with letter, no consecutive underscores, etc.)
- Smart caching for availability checks
- 5 different suggestion strategies for taken usernames
**Issues Encountered**: None - smooth implementation with proper error handling

### Sprint 02.03: Onboarding - Team & Follow
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 02.04: User Profile & Settings
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

## Testing & Quality

### Testing Approach
- Manual testing of OAuth flows with real Google/Twitter accounts
- Test username validation edge cases
- Verify deep linking works on both platforms
- Test session persistence and refresh
- Ensure onboarding can't be bypassed

### Known Issues
| Issue | Severity | Sprint | Status | Resolution |
|-------|----------|--------|--------|------------|
| [None yet] | - | - | - | - |

## Refactoring Completed

### Code Improvements
[To be tracked during implementation]

### Performance Optimizations
[To be tracked during implementation]

## Learnings & Gotchas

### What Worked Well
[To be documented at epic end]

### Challenges Faced
[To be documented at epic end]

### Gotchas for Future Development
[To be documented at epic end]

## Epic Completion Checklist

- [ ] All planned sprints completed and approved
- [ ] OAuth working with both providers
- [ ] Onboarding flow smooth and complete
- [ ] User profiles properly initialized
- [ ] Bankroll system working
- [ ] Settings persisted correctly
- [ ] Deep linking configured
- [ ] No critical bugs remaining
- [ ] Ready for Epic 3 (Social Feed)

## Epic Summary for Project Tracker

**[To be completed at epic end]**

**Delivered Features**:
- [To be listed]

**Key Architectural Decisions**:
- [To be summarized]

**Critical Learnings**:
- [To be captured]

**Technical Debt Created**:
- [To be noted]

---

## Detailed Sprint Plans

### Sprint 02.00: OAuth Infrastructure (2.5 hours)

**Objectives**:
- Configure Supabase Auth with OAuth providers
- Set up deep linking for OAuth redirects
- Create auth state management
- Implement secure token storage
- Build session management with refresh

**Prerequisites**:
- Google OAuth app created with redirect URLs
- Twitter OAuth app created with redirect URLs
- Supabase project has OAuth providers configured

**Tasks**:
1. [ ] Configure Supabase OAuth providers:
   - [ ] Add Google client ID and secret to Supabase dashboard
   - [ ] Add Twitter client ID and secret to Supabase dashboard
   - [ ] Set redirect URLs for both providers
   - [ ] Enable email scope for both providers

2. [ ] Set up deep linking in app.json:
   ```json
   {
     "expo": {
       "scheme": "snapfade",
       "ios": {
         "bundleIdentifier": "com.snapfade.app"
       },
       "android": {
         "package": "com.snapfade.app"
       }
     }
   }
   ```

3. [ ] Install required dependencies:
   ```bash
   bun add expo-auth-session expo-crypto expo-web-browser
   bun add expo-secure-store expo-linking
   bun add react-native-mmkv
   ```

4. [ ] Create auth service (services/auth/authService.ts):
   - [ ] Initialize Supabase client
   - [ ] Create signInWithOAuth function
   - [ ] Handle OAuth redirects
   - [ ] Parse auth tokens from URL
   - [ ] Store tokens securely

5. [ ] Create session manager (services/auth/sessionManager.ts):
   - [ ] Secure token storage with expo-secure-store
   - [ ] Automatic token refresh logic
   - [ ] Session expiry handling (30 days)
   - [ ] Clear session on logout

6. [ ] Create auth store (stores/authStore.ts):
   ```typescript
   interface AuthState {
     user: User | null;
     session: Session | null;
     isLoading: boolean;
     isAuthenticated: boolean;
     
     // Actions
     signIn: (provider: 'google' | 'twitter') => Promise<void>;
     signOut: () => Promise<void>;
     refreshSession: () => Promise<void>;
     checkSession: () => Promise<void>;
   }
   ```

7. [ ] Create auth hooks (hooks/useAuth.ts):
   - [ ] useAuth - main auth hook
   - [ ] useSession - session management
   - [ ] useRequireAuth - route protection

8. [ ] Set up auth context provider:
   - [ ] Wrap app with AuthProvider
   - [ ] Check session on app launch
   - [ ] Listen for auth state changes
   - [ ] Handle deep link returns

**Success Criteria**:
- Can trigger OAuth flow programmatically
- Tokens stored securely
- Session persists across app restarts
- Deep links handled correctly
- Auth state available throughout app

---

### Sprint 02.01: Welcome & OAuth Flow (2 hours)

**Objectives**:
- Build welcome screen with OAuth options
- Implement OAuth sign-in flow
- Handle auth errors gracefully
- Create loading states
- Set up navigation after auth

**Tasks**:
1. [ ] Create welcome screen (app/(auth)/welcome.tsx):
   - [ ] SnapFade logo (80x80, emerald color)
   - [ ] Tagline: "Sports betting with friends"
   - [ ] OAuth buttons with provider branding
   - [ ] Legal disclaimer: "For entertainment only. Must be 21+"
   - [ ] Warm background (#FAF9F5)

2. [ ] Create OAuth button component (components/auth/OAuthButton.tsx):
   ```typescript
   interface OAuthButtonProps {
     provider: 'google' | 'twitter';
     onPress: () => void;
     loading?: boolean;
   }
   ```
   - [ ] Provider-specific styling
   - [ ] Loading state with spinner
   - [ ] Disabled state during auth
   - [ ] Haptic feedback on press

3. [ ] Implement OAuth flow:
   - [ ] Handle button press
   - [ ] Call authService.signInWithOAuth
   - [ ] Show loading state
   - [ ] Handle success redirect
   - [ ] Handle error cases

4. [ ] Create auth error handling:
   - [ ] Network errors
   - [ ] Provider errors
   - [ ] User cancellation
   - [ ] Show user-friendly messages
   - [ ] Offer retry or alternative provider

5. [ ] Set up post-auth navigation:
   - [ ] Check if new user (no username)
   - [ ] Navigate to onboarding if new
   - [ ] Navigate to feed if existing
   - [ ] Handle edge cases

6. [ ] Add auth persistence check:
   - [ ] Check for existing session on app launch
   - [ ] Skip welcome if authenticated
   - [ ] Show splash during check

**Success Criteria**:
- Can sign in with Google
- Can sign in with Twitter
- Errors shown clearly
- Loading states smooth
- Navigates correctly after auth

---

### Sprint 02.02: Onboarding - Username (2.5 hours)

**Objectives**:
- Build username selection screen
- Implement real-time validation
- Create username suggestions
- Save username to profile
- Show progress indicators

**Tasks**:
1. [ ] Create username screen (app/(auth)/onboarding/username.tsx):
   - [ ] Progress dots (● ○ ○)
   - [ ] Back button to welcome
   - [ ] Profile picture from OAuth
   - [ ] Username input field
   - [ ] Validation messages
   - [ ] Continue button

2. [ ] Create username input component (components/auth/UsernameInput.tsx):
   ```typescript
   interface UsernameInputProps {
     value: string;
     onChange: (value: string) => void;
     onValidation: (isValid: boolean) => void;
   }
   ```
   - [ ] Real-time validation with 500ms debounce
   - [ ] Show loading during check
   - [ ] Show checkmark if available
   - [ ] Show error if taken
   - [ ] Format enforcement (3-20 chars, alphanumeric + underscore)

3. [ ] Implement username validation:
   - [ ] Client-side format validation
   - [ ] Server-side uniqueness check
   - [ ] Case-insensitive comparison
   - [ ] Profanity filter (basic)
   - [ ] Reserved username list

4. [ ] Create username suggestions:
   ```typescript
   function generateSuggestions(username: string): string[] {
     // Returns 3-4 variations like:
     // mike_bets, mikebets_, themikebets, mikebets24
   }
   ```
   - [ ] Show when username taken
   - [ ] One-tap to use suggestion
   - [ ] Update input and re-validate

5. [ ] Save username to profile:
   - [ ] Update user record
   - [ ] Set username immutable flag
   - [ ] Update auth store
   - [ ] Handle save errors

6. [ ] Create onboarding layout:
   - [ ] Consistent header with steps
   - [ ] Smooth transitions
   - [ ] Prevent back navigation after save

**Success Criteria**:
- Username validation works in real-time
- Suggestions helpful and relevant
- Cannot proceed with invalid username
- Username saved permanently
- Progress shown clearly

---

### Sprint 02.03: Onboarding - Team & Follow (3 hours)

**Objectives**:
- Build team selection screen (optional)
- Create follow suggestions screen
- Implement follow/unfollow logic
- Complete onboarding flow
- Initialize user relationships

**Tasks**:
1. [ ] Create team constants (constants/teams.ts):
   ```typescript
   interface Team {
     id: string;
     name: string;
     city: string;
     abbreviation: string;
     sport: 'NFL' | 'NBA';
     primaryColor: string;
     secondaryColor: string;
   }
   ```
   - [ ] All 32 NFL teams
   - [ ] All 30 NBA teams
   - [ ] Color hex values

2. [ ] Create team logo component (components/team/TeamLogo.tsx):
   - [ ] SVG circle with diagonal split
   - [ ] Two team colors
   - [ ] 40x40 for lists, 60x60 for selection
   - [ ] Hover/press states

3. [ ] Create team selection screen (app/(auth)/onboarding/team.tsx):
   - [ ] Progress dots (○ ● ○)
   - [ ] Sport toggle (NFL/NBA)
   - [ ] 4-column grid of teams
   - [ ] Selected state with border
   - [ ] "Skip for now" option
   - [ ] Continue button

4. [ ] Create follow suggestions screen (app/(auth)/onboarding/follow.tsx):
   - [ ] Progress dots (○ ○ ●)
   - [ ] "Follow at least 3 bettors to continue (0/3)"
   - [ ] List of 10 mock users
   - [ ] User cards with stats
   - [ ] Follow/Following button states
   - [ ] Start Betting button (disabled until 3)

5. [ ] Implement follow suggestions algorithm:
   ```typescript
   function getFollowSuggestions(favoriteTeam?: string): User[] {
     // Returns mix of:
     // - 2-3 users with same favorite team
     // - 2-3 high performers (sharps)
     // - 1-2 entertainment (fade material)
     // - Random from remaining
   }
   ```

6. [ ] Create follow/unfollow logic:
   - [ ] Optimistic UI updates
   - [ ] Create follow records
   - [ ] Update follower counts
   - [ ] Handle errors gracefully

7. [ ] Complete onboarding:
   - [ ] Mark user as onboarded
   - [ ] Initialize bankroll ($1,000)
   - [ ] Navigate to main app
   - [ ] Show success animation

**Success Criteria**:
- Can select favorite team or skip
- Follow suggestions relevant
- Must follow 3+ users
- Bankroll initialized
- Smooth transition to app

---

### Sprint 02.04: User Profile & Settings (2.5 hours)

**Objectives**:
- Build user profile structure
- Create settings screen
- Implement bankroll display/reset
- Add profile editing
- Set up preferences storage

**Tasks**:
1. [ ] Create user store (stores/userStore.ts):
   ```typescript
   interface UserState {
     profile: UserProfile | null;
     bankroll: Bankroll | null;
     settings: UserSettings;
     
     // Actions
     updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
     resetBankroll: () => Promise<void>;
     updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
   }
   ```

2. [ ] Create profile header component (components/profile/ProfileHeader.tsx):
   - [ ] Avatar (from OAuth)
   - [ ] Username and display name
   - [ ] Stats (W-L, profit, ROI)
   - [ ] Badges (hot streak, etc.)
   - [ ] Bio display

3. [ ] Create bankroll card component (components/profile/BankrollCard.tsx):
   - [ ] Current balance display
   - [ ] Total wagered/won
   - [ ] Win rate percentage
   - [ ] Reset button with confirmation
   - [ ] Last reset date

4. [ ] Create settings screen (app/profile/settings.tsx):
   - [ ] Account section (username, email, team)
   - [ ] Notification toggles
   - [ ] Privacy settings
   - [ ] About section
   - [ ] Sign out button

5. [ ] Implement settings storage:
   - [ ] Use MMKV for fast access
   - [ ] Sync with database
   - [ ] Default values
   - [ ] Migration strategy

6. [ ] Create profile editing:
   - [ ] Edit display name
   - [ ] Edit bio (140 chars)
   - [ ] Change favorite team
   - [ ] Save/cancel actions

7. [ ] Implement bankroll reset:
   ```typescript
   async function resetBankroll(): Promise<void> {
     // Show confirmation dialog
     // Call database function
     // Update local state
     // Show success message
   }
   ```

**Success Criteria**:
- Profile displays correctly
- Settings persist across sessions
- Bankroll reset works
- Can edit profile fields
- Sign out clears session

---

## Implementation Guidelines

### OAuth Setup Requirements
1. **Google OAuth**:
   - Create project in Google Cloud Console
   - Enable Google+ API
   - Create OAuth 2.0 Client ID (Web application)
   - Add redirect URIs:
     - `https://[project-ref].supabase.co/auth/v1/callback`
     - `http://localhost:54321/auth/v1/callback`

2. **Twitter OAuth**:
   - Create app in Twitter Developer Portal
   - Use OAuth 2.0 (not 1.0a)
   - Set callback URL
   - Request email permission

3. **Supabase Configuration**:
   - Add provider client IDs and secrets
   - Enable providers in Auth settings
   - Configure redirect URLs

### Security Considerations
- Store tokens in expo-secure-store only
- Never log sensitive data
- Implement rate limiting on username checks
- Validate all inputs client and server side
- Use HTTPS for all API calls

### Error Handling Patterns
```typescript
try {
  await authService.signIn(provider);
} catch (error) {
  if (error.code === 'USER_CANCELLED') {
    // User cancelled OAuth flow
  } else if (error.code === 'NETWORK_ERROR') {
    // Show network error message
  } else {
    // Generic error handling
  }
}
```

### Performance Considerations
- Lazy load onboarding screens
- Preload team data during username step
- Cache OAuth provider logos
- Debounce username validation
- Use optimistic UI for follows

---

*Epic Started: -*  
*Epic Completed: -*  
*Total Duration: -* 