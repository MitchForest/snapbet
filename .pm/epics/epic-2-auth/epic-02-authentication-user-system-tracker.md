# Epic 02: Authentication & User System Tracker

## Epic Overview

**Status**: COMPLETED  
**Start Date**: 2024-12-19  
**Target End Date**: Day 1 (end) - Day 2 (morning)  
**Actual End Date**: 2024-01-19

**Epic Goal**: Implement complete OAuth authentication flow with Google and Twitter, create user onboarding experience, establish user profiles and settings, initialize bankroll system, and implement user engagement features.

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
| 02.03 | Team & Follow with Badges | APPROVED | 2024-12-20 | 2024-12-20 | Complete onboarding with badge system |
| 02.04 | Profile, Settings & Drawer | APPROVED | 2024-12-20 | 2024-12-20 | Full profile system with navigation |
| 02.05 | Referral & Badge Automation | APPROVED | 2024-12-20 | 2024-12-20 | Growth features and automation |
| 02.06 | Technical Debt Cleanup & Automation Migration | APPROVED | 2024-12-20 | 2024-12-20 | Zero lint issues, proper types, color extraction, refactoring |
| 02.07 | OAuth Implementation & Development Build Migration | APPROVED | 2024-01-18 | - | OAuth working, dev build migration |

**Statuses**: NOT STARTED | IN PROGRESS | IN REVIEW | APPROVED | BLOCKED

## Architecture & Design Decisions

### High-Level Architecture for This Epic
This epic establishes the complete authentication and user management system:
- OAuth integration through Supabase Auth
- Secure session management with refresh tokens
- Multi-step onboarding flow
- User profile and settings management
- Bankroll initialization and tracking
- Badge/achievement system
- Notification foundation
- Referral system for growth

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

7. **Badge System Architecture**: Auto-assigned with manual selection
   - Alternatives considered: Fully automatic, fully manual
   - Rationale: Ensures authenticity while giving users some control
   - Trade-offs: More complex but better user experience

8. **Stats Display Customization**: User chooses one primary stat
   - Alternatives considered: Show all stats, fixed format
   - Rationale: Reduces information overload, lets users emphasize strengths
   - Trade-offs: Hides some information but cleaner UI

9. **Referral Code Storage**: Use localStorage/AsyncStorage during OAuth flow
   - Alternatives considered: URL parameters, session storage
   - Rationale: Simpler than URL params, works across all OAuth providers
   - Trade-offs: Must clear after processing, potential edge cases

10. **Badge Automation via Cron Scripts**: Simple scripts instead of edge functions
    - Alternatives considered: Supabase Edge Functions, Vercel Cron
    - Rationale: Keep it simple for MVP, easy to migrate later
    - Trade-offs: Requires server/deployment solution, manual scheduling

11. **No Referral Rewards (MVP)**: Track referrals only, add rewards post-launch
    - Alternatives considered: Immediate rewards, milestone bonuses
    - Rationale: Prevents abuse, allows testing of viral mechanics first
    - Trade-offs: Less incentive initially, but safer launch

12. **Notification Schema Pattern**: Use type/data despite DB having title/body
    - Alternatives considered: Update service to use title/body
    - Rationale: More flexible, works with existing implementation
    - Trade-offs: Schema mismatch to resolve later

13. **Share Functionality**: expo-sharing with clipboard fallback
    - Alternatives considered: Custom share UI, web share API
    - Rationale: Native experience where available, universal fallback
    - Trade-offs: Different UX on different platforms

14. **Database-First Schema Fix**: Update database structure rather than service
    - Alternatives considered: Adapt service to match existing schema
    - Rationale: Eliminates technical debt, maintains intended flexible design
    - Trade-offs: Requires migration, but cleaner long-term solution

15. **Supabase Edge Functions for Automation**: Migrate scripts to Edge Functions
    - Alternatives considered: Traditional cron on server, GitHub Actions
    - Rationale: Serverless, scales automatically, integrated with Supabase
    - Trade-offs: Requires learning Deno, but no server maintenance

16. **Bearer Token Auth for Edge Functions**: Simple secret token validation
    - Alternatives considered: Supabase service role, complex JWT
    - Rationale: Simple, secure enough for cron jobs, easy to rotate
    - Trade-offs: Less sophisticated than full auth, but appropriate for use case

17. **Color System Standardization**: Single source of truth with semantic variations
    - Alternatives considered: Keep all color variations, use Tamagui tokens only
    - Rationale: Consistency across app, easier maintenance, clear semantics
    - Trade-offs: Initial refactoring effort, but better developer experience

18. **EAS Build from Day One**: Set up deployment infrastructure early
    - Alternatives considered: Wait until ready to deploy, use local builds
    - Rationale: Smooth transition to production, team can test real builds
    - Trade-offs: Additional configuration, but prevents deployment surprises

19. **Environment-Based Configuration**: Separate dev/staging/prod environments
    - Alternatives considered: Single environment with feature flags
    - Rationale: Clear separation, prevents accidents, standard practice
    - Trade-offs: More configuration files, but safer deployments

20. **Mock Data Flag in Production**: Toggle between mock and real sports data
    - Alternatives considered: Always mock, always real, separate functions
    - Rationale: Allows gradual migration, testing in production
    - Trade-offs: Additional complexity, but safer rollout

### Dependencies
**External Dependencies**:
- Supabase Auth - OAuth provider integration
- expo-auth-session - OAuth flow handling
- expo-secure-store - Secure token storage
- expo-linking - Deep link handling
- react-native-mmkv - Fast persistent storage
- expo-sharing - Native share functionality
- expo-notifications - Push notification support

**Internal Dependencies**:
- Requires: Database schema from Epic 1, Navigation structure from Epic 1
- Provides: User authentication for all future epics, User profiles for social features, Badge system for engagement

## Implementation Notes

### File Structure for Epic
```
snapbet/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx          # Auth stack layout
│   │   ├── welcome.tsx          # OAuth provider selection
│   │   └── onboarding/
│   │       ├── _layout.tsx      # Onboarding flow layout
│   │       ├── username.tsx     # Username selection
│   │       ├── team.tsx         # Favorite team selection
│   │       └── follow.tsx       # Follow suggestions
│   ├── (drawer)/
│   │   ├── profile/
│   │   │   └── [username].tsx   # Dynamic profile view
│   │   ├── settings/
│   │   │   ├── index.tsx        # Settings main
│   │   │   ├── profile.tsx      # Profile editing
│   │   │   ├── notifications.tsx # Notification prefs
│   │   │   ├── privacy.tsx      # Privacy settings
│   │   │   └── stats-display.tsx # Stats customization
│   │   ├── following.tsx        # Following list
│   │   ├── followers.tsx        # Followers list
│   │   ├── notifications.tsx    # Notification center
│   │   ├── invite.tsx           # Referral screen
│   │   └── how-to-play.tsx      # Tutorial
├── services/
│   ├── auth/
│   │   ├── authService.ts       # OAuth flow logic
│   │   ├── sessionManager.ts    # Token management
│   │   └── types.ts             # Auth types
│   ├── badges/
│   │   ├── badgeService.ts      # Badge calculation
│   │   └── badgeAutomation.ts   # Automated updates
│   ├── notifications/
│   │   └── notificationService.ts # Notification logic
│   └── referral/
│       └── referralService.ts   # Referral system
├── stores/
│   ├── authStore.ts             # Auth state (Zustand)
│   └── userStore.ts             # User profile state
├── hooks/
│   ├── useAuth.ts               # Auth hook
│   ├── useUser.ts               # User data hook
│   ├── useSession.ts            # Session management
│   ├── useNotifications.ts      # Notification subscription
│   └── useReferral.ts           # Referral state
├── components/
│   ├── auth/
│   │   ├── OAuthButton.tsx      # OAuth provider button
│   │   ├── OnboardingStep.tsx   # Step indicator
│   │   └── UsernameInput.tsx    # Username validation
│   ├── profile/
│   │   ├── ProfileHeader.tsx    # Profile display with badges
│   │   ├── ProfileTabs.tsx      # Posts/Bets tabs
│   │   ├── BadgeSelector.tsx    # Badge selection
│   │   └── StatsCard.tsx        # Stats display
│   ├── common/
│   │   ├── BadgeDisplay.tsx     # Badge rendering
│   │   └── UserListItem.tsx     # User list rows
│   ├── invite/
│   │   ├── InviteCard.tsx       # Shareable invite
│   │   └── ReferralStats.tsx    # Referral performance
│   └── team/
│       ├── TeamSelector.tsx     # Team grid
│       └── TeamCard.tsx         # Team selection card
├── data/
│   ├── teams.ts                 # NFL/NBA team data
│   └── badges.ts                # Badge definitions
└── supabase/
    ├── migrations/
    │   ├── 003_user_badges.sql  # Badge tables
    │   ├── 004_notifications.sql # Notification tables
    │   └── 005_referrals.sql    # Referral tables
    └── functions/
        ├── calculate-badges/     # Badge automation
        └── process-referral/     # Referral rewards
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
| POST | /rest/v1/bankrolls | Initialize bankroll | 02.03 |
| GET | /rest/v1/user_badges | Get user badges | 02.03 |
| POST | /rest/v1/user_stats_display | Set stats preferences | 02.03 |
| GET | /rest/v1/notifications | Get notifications | 02.04 |
| POST | /rest/v1/referral_codes | Generate referral code | 02.05 |

### Data Model Changes
```sql
-- Sprint 02.03: Badge system
CREATE TABLE user_badges (
  user_id UUID REFERENCES users(id),
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  lost_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, badge_id, earned_at)
);

CREATE TABLE user_stats_display (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  primary_stat TEXT NOT NULL DEFAULT 'record',
  show_badge BOOLEAN DEFAULT true,
  selected_badge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sprint 02.04: Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Sprint 02.05: Referrals
CREATE TABLE referral_codes (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  code TEXT UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT -1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  code TEXT NOT NULL,
  status TEXT NOT NULL,
  reward_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referred_id)
);

CREATE TABLE badge_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  badge_id TEXT NOT NULL,
  action TEXT NOT NULL,
  stats_snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Key Functions/Components Created
- `OAuthButton` - Branded OAuth buttons - Sprint 02.01
- `useAuth` - Authentication hook - Sprint 02.00
- `UsernameInput` - Real-time validation - Sprint 02.02
- `TeamSelector` - Team selection grid - Sprint 02.03
- `FollowSuggestions` - User recommendation list - Sprint 02.03
- `BadgeDisplay` - Badge rendering system - Sprint 02.03
- `ProfileHeader` - User profile display with badges - Sprint 02.04
- `ProfileTabs` - Posts/Bets tab navigation - Sprint 02.04
- `DrawerContent` - Complete drawer menu - Sprint 02.04
- `NotificationItem` - Notification display - Sprint 02.04
- `InviteCard` - Shareable referral card - Sprint 02.05
- `calculateBadges` - Edge function for badge updates - Sprint 02.05

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

### Sprint 02.03: Team & Follow with Badges
**Status**: APPROVED
**Summary**: Successfully implemented team selection, follow suggestions, and badge system infrastructure. All 62 teams (NFL/NBA) available with sport toggle. Smart follow algorithm considers team preference and user performance. Badge calculation service ready with 8 badge types. Mock users enhanced with realistic stats. After revision, all badge thresholds now match specifications exactly.
**Key Decisions**: 
- Made team selection optional with skip button
- Set minimum 3 follows to ensure social engagement
- Used colored circles for team logos instead of images
- Badge calculation on-the-fly (could be cached later)
- Direct database queries instead of RPC functions
- Username presence used to track onboarding completion
**Issues Encountered**: Initial badge thresholds didn't match spec - fixed in revision. TypeScript types for new tables not yet generated - worked around with type assertions.

### Sprint 02.04: Profile, Settings & Drawer
**Status**: APPROVED
**Summary**: Successfully implemented complete user profile system with Posts/Bets tabs, drawer menu navigation, all settings screens (profile, notifications, privacy, stats display), notification infrastructure, and following/followers lists. After revision, addressed most linting issues and clarified database schema discrepancy.
**Key Decisions**: 
- Profile tabs structure (Posts vs Bets views)
- Settings auto-save without explicit save button
- Real-time notification subscriptions with Supabase channels
- Stats display customization (user selects primary stat)
- Badge selector for feed display
- Drawer menu as central navigation hub
**Issues Encountered**: Database schema mismatch - notifications table created in Epic 1 with title/body columns, but Sprint 02.04 implementation uses type/data pattern. Resolved by documenting for future cleanup. Reduced lint errors from 18 to 11.

### Sprint 02.05: Referral & Badge Automation
**Status**: APPROVED
**Summary**: Successfully implemented referral tracking system (without rewards) and badge automation. Referral codes use memorable username prefixes, AsyncStorage handles OAuth flow persistence, and badge updates run via cron-ready script with file locking. All objectives met with production-ready code.
**Key Decisions**: 
- AsyncStorage for referral code persistence across OAuth redirect
- File-based locking for badge automation script (prevents concurrent runs)
- Native share with clipboard fallback for invite sharing
- Silent handling of self-referrals
- Badge history tracks only action and timestamp (simplified for MVP)
**Issues Encountered**: Minor lint warnings (3 new) - inline styles and missing useEffect dependency. Will be addressed in cleanup sprint.

### Sprint 02.06: Technical Debt Cleanup & Automation Migration (9-10 hours)

**Status**: APPROVED
**Summary**: Successfully eliminated all technical debt with zero lint errors/warnings, fixed notification schema properly, implemented comprehensive color system, and regenerated TypeScript types. Deferred Edge Functions migration and some optimizations to Sprint 02.07 due to extended sprint duration.
**Key Decisions**: 
- Updated database schema to match service expectations (type/data pattern)
- Created comprehensive Colors export for consistent theming
- Fixed all React hooks without using eslint-disable
- Deferred non-critical items to maintain sprint scope
**Issues Encountered**: None - smooth implementation with all critical objectives met

### Sprint 02.07: OAuth Implementation & Development Build Migration

**Status**: APPROVED
**Summary**: Major pivot from deployment preparation to fixing OAuth authentication. Successfully migrated to development builds, implemented working OAuth flow with Twitter and Google, fixed all critical UI/UX issues, and resolved TypeScript error after review feedback.

**Key Decisions**:
- Migrated from Expo Go to development builds due to deep linking limitations
- Fixed Supabase OAuth redirect handling (# vs ? in URLs)
- Created auth trigger to auto-create user records
- Made email nullable to support Twitter OAuth
- Fixed username constraint to allow NULL during onboarding
- Created consistent ScreenHeader component for all drawer screens
- Fixed Supabase query relationships with explicit hints (users!follower_id)
- Deferred non-critical tasks (Edge Functions, CI/CD) to maintain momentum

**Completed**:
- [x] Development build setup with EAS
- [x] Supabase redirect URLs configured for snapbet://
- [x] OAuth flow working with Twitter
- [x] OAuth flow working with Google (with email scope and retry)
- [x] Database triggers and constraints fixed
- [x] All lint errors (42) resolved - ZERO errors/warnings
- [x] All TypeScript errors resolved - ZERO errors
- [x] All critical UI/UX issues fixed (Phase 0 complete)
- [x] Username validation debouncing fixed
- [x] Consistent headers on all drawer screens
- [x] Safe area handling for all screens
- [x] Profile navigation fixed with username parameter
- [x] Navigation delay added to fix REPLACE action error
- [x] README updated with OAuth setup instructions
- [x] useUserList hook created for code refactoring
- [x] TypeScript error in useUserList fixed with relationship hints

**Deferred to Future Epics/Sprints (Comprehensive Backlog)**:

1. **Edge Functions Migration (Target: Epic 4-5)**
   - Migrate scripts/update-badges.ts → supabase/functions/update-badges/
   - Migrate scripts/settle-bets.ts → supabase/functions/settle-bets/
   - Migrate scripts/add-games.ts → supabase/functions/add-games/
   - Set up Supabase cron triggers
   - Add Bearer token authentication
   - Note: Scripts work fine for MVP, Edge Functions require Deno runtime knowledge

2. **CI/CD Pipeline (Target: Pre-Launch Epic)**
   - Create .github/workflows/eas-preview.yml for PR previews
   - EAS Build webhooks for notifications
   - Automated testing before builds
   - Version bumping automation
   - App Store release workflow
   - Note: Not needed until deployment, EAS builds cost money

3. **Full Environment Management (Target: When Staging Needed)**
   - Create .env.development, .env.staging, .env.production
   - Create config/environment.ts for env switching
   - Multiple Supabase projects per environment
   - EAS Build profiles per environment
   - Note: Single dev environment sufficient for MVP

4. **SecureStore Token Optimization (Target: Performance Epic)**
   - Split session into smaller chunks (access_token, refresh_token, meta)
   - Implement token compression if needed
   - Migration for existing sessions
   - Note: Warning is non-blocking, sessions work fine

5. **Comprehensive Documentation (Target: Post-MVP)**
   - docs/DEPLOYMENT.md - Full deployment guide
   - docs/OAUTH_SETUP.md - OAuth provider configuration
   - docs/TROUBLESHOOTING.md - Common issues and solutions
   - docs/ARCHITECTURE.md - System design decisions
   - docs/CONTRIBUTING.md - Development workflow
   - Note: Code is self-documenting for now, document as features stabilize

**Issues Encountered**: 
- Expo Go can't handle OAuth redirects properly
- Supabase uses non-standard URL format for tokens
- Database trigger needed schema qualification for enum types
- Hermes runtime errors on hot reload (needs Metro restart)
- Navigation error occurs after successful login (fixed with delay)
- TypeScript error in useUserList hook (fixed with relationship hints)

**Key Learnings**:
- Development builds required for OAuth (Expo Go insufficient)
- Supabase OAuth uses # in redirect URLs (non-standard)
- Database triggers need explicit schema qualification
- Async callbacks in auth can cause deadlocks
- Development builds maintain hot reload capability
- Twitter OAuth requires email permission request
- Google OAuth needs email scope and may timeout with 2FA
- Supabase queries need explicit relationship hints when multiple foreign keys exist

---

*Epic Started: 2024-12-19*  
*Epic Completed: 2024-01-19*  
*Total Duration: 1 month*

## Testing & Quality

### Testing Approach
- Manual testing of OAuth flows with real Google/Twitter accounts
- Test username validation edge cases
- Verify deep linking works on both platforms
- Test session persistence and refresh
- Ensure onboarding can't be bypassed
- Test badge calculation accuracy
- Verify notification delivery
- Test referral code generation and redemption

### Known Issues
| Issue | Severity | Sprint | Status | Resolution |
|-------|----------|--------|--------|------------|
| Notification schema mismatch | HIGH | 02.04 | OPEN | Epic 1 created table with title/body, Epic 2 uses type/data |
| Lint errors from previous sprints | MEDIUM | 02.04 | PARTIAL | Reduced from 64 to 54, 11 errors remain |
| Badge automation deployment | MEDIUM | 02.05 | PLANNED | Need production scheduling solution |
| TypeScript types not generated | LOW | 02.03 | WORKAROUND | Using type assertions until regenerated |

### Technical Debt Created
| Debt Item | Severity | Sprint | Impact | Planned Resolution |
|-----------|----------|--------|--------|-------------------|
| Notification table schema mismatch | HIGH | 02.04 | Service doesn't match DB schema | Migration in Epic 6 |
| Badge calculation performance | MEDIUM | 02.03 | Calculates on every request | Cache in Epic 4 |
| Referral rewards system | MEDIUM | 02.05 | No incentive for referrals | Post-MVP feature |
| Automation script scheduling | MEDIUM | 02.05 | Manual cron setup required | Production solution in Epic 10 |
| Remaining lint errors | LOW | Multiple | Code quality | Cleanup sprint needed |
| File-based locks for scripts | LOW | 02.05 | Not scalable | Edge functions in future |

## Refactoring Completed

### Code Improvements
[To be tracked during implementation]

### Performance Optimizations
[To be tracked during implementation]

## Learnings & Gotchas

### What Worked Well
- Direct Supabase queries instead of RPC functions - simpler and more flexible
- Username validation with smart caching prevented race conditions
- Optional team selection reduced onboarding friction
- Badge system with on-the-fly calculation allows easy updates
- Settings auto-save provides better UX than explicit save buttons

### Challenges Faced
- Tamagui component limitations required native React Native fallbacks
- AuthError interface too complex to extend, needed custom error type
- Notification table created twice with different schemas
- CREATE TABLE IF NOT EXISTS doesn't modify existing tables
- TypeScript types for new tables required manual type assertions

### Gotchas for Future Development
- Always check if tables exist in previous migrations before creating
- Badge automation scripts need lock mechanisms to prevent overlaps
- Referral codes should be validated without blocking signup flow
- File-based locks work for single server but won't scale
- Notification service pattern (type/data) more flexible than fixed columns
- Always regenerate Supabase types after migrations

## Epic Completion Checklist

- [x] All planned sprints completed and approved
- [x] OAuth working with both providers
- [x] Onboarding flow smooth and complete
- [x] User profiles properly initialized
- [x] Bankroll system working
- [x] Badge system calculating correctly
- [x] Notifications delivering in real-time
- [x] Referral system functional
- [x] Settings persisted correctly
- [x] Deep linking configured
- [x] No critical bugs remaining
- [x] Ready for Epic 3 (Social Feed)

## Epic Summary for Project Tracker

**Duration**: 1 month (December 19, 2024 - January 19, 2025)

**Delivered Features**:
- Complete OAuth authentication with Google and Twitter
- Development build migration (required for OAuth)
- Multi-step onboarding (username → team → follow)
- User profile system with customizable display
- Badge system with 8 achievement types
- Notification infrastructure with real-time updates
- Referral tracking system (rewards deferred)
- Settings management with auto-save
- Drawer navigation with all user screens
- Bankroll initialization and reset functionality
- Zero lint errors and TypeScript errors

**Key Architectural Decisions**:
1. **OAuth-Only Authentication**: No email/password to reduce friction
2. **Development Builds Required**: Expo Go can't handle OAuth deep links
3. **Manual Token Parsing**: Supabase uses # in redirect URLs
4. **Nullable Email/Username**: Supports Twitter OAuth and onboarding flow
5. **Badge Auto-Assignment**: Calculated on-the-fly with user selection
6. **Referral Without Rewards**: Track only in MVP to prevent abuse
7. **File-Based Script Locks**: Simple concurrency control for automation
8. **Type/Data Notification Pattern**: More flexible than fixed columns
9. **ScreenHeader Component**: Consistent UI across all drawer screens
10. **Relationship Hints in Queries**: Required for ambiguous Supabase joins

**Critical Learnings**:
1. **Expo Go Limitations**: Can't handle OAuth redirects, WebBrowser issues, requires dev builds
2. **Supabase OAuth Quirks**: Non-standard URL format (#), manual token parsing needed
3. **Database Triggers**: Need explicit schema qualification for enum types
4. **Async Auth Callbacks**: Can cause deadlocks, use sync with setTimeout
5. **Twitter OAuth**: Requires explicit email permission request
6. **Google OAuth**: Needs email scope, may timeout with 2FA (60s timeout helps)
7. **Navigation Timing**: Need delays to ensure navigators are mounted
8. **TypeScript with Supabase**: Queries need explicit relationship hints
9. **Hot Reload Issues**: Hermes runtime errors fixed by Metro restart
10. **SecureStore Limits**: Large tokens show warnings but work fine

**Technical Debt Created**:
1. **Edge Functions Migration**: Scripts work but need serverless solution
2. **CI/CD Pipeline**: Manual builds work but need automation
3. **Environment Management**: Single dev environment, need staging/prod
4. **SecureStore Optimization**: Token splitting for large sessions
5. **Comprehensive Documentation**: Basic README done, need full docs

**Deferred to Future Epics**:
1. **Edge Functions (Epic 4-5)**:
   - Badge automation → supabase/functions/update-badges/
   - Bet settlement → supabase/functions/settle-bets/
   - Game data → supabase/functions/add-games/
   - Cron triggers setup
   - Bearer token authentication

2. **CI/CD Pipeline (Pre-Launch Epic)**:
   - GitHub Actions for EAS preview builds
   - Automated testing before builds
   - Version bumping automation
   - App Store release workflow

3. **Full Environment Management (When Staging Needed)**:
   - Multiple .env files (dev/staging/prod)
   - Environment switching logic
   - Multiple Supabase projects
   - EAS Build profiles per environment

4. **Documentation (Post-MVP)**:
   - DEPLOYMENT.md guide
   - OAUTH_SETUP.md for providers
   - TROUBLESHOOTING.md
   - ARCHITECTURE.md
   - CONTRIBUTING.md

**Ready for Epic 3**:
- Authentication fully working
- User profiles established
- Navigation structure complete
- UI/UX patterns established (see .pm/process/ui-ux-consistency-rules.md)
- Development workflow optimized
- All infrastructure ready for social features

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
       "scheme": "snapbet",
       "ios": {
         "bundleIdentifier": "com.snapbet.app"
       },
       "android": {
         "package": "com.snapbet.app"
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
   - [ ] SnapBet logo (80x80, emerald color)
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

### Sprint 02.03: Team & Follow with Badges (3 hours)

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