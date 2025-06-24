# SnapBet - Project Tracker

## Overview
This document tracks high-level progress across all epics, maintains key architectural decisions, and serves as persistent memory for the project.

## Epic Status Overview

| Epic # | Epic Name | Status | Start Date | End Date | Key Outcome |
|--------|-----------|--------|------------|----------|-------------|
| 01 | Foundation & Infrastructure | COMPLETED | Dec 2024 | Dec 2024 | Complete dev environment and core architecture |
| 02 | Authentication & User System | COMPLETED | 2024-12-19 | 2025-01-19 | OAuth, profiles, badges, referrals - DEVELOPMENT BUILD REQUIRED |
| 03 | Social Feed & Content | IN PROGRESS | 2025-01-20 | - | Photo/video sharing with stories |
| 04 | Betting System | NOT STARTED | - | - | Mock betting with tail/fade mechanics |
| 05 | Messaging & Real-time | NOT STARTED | - | - | DMs, group chats, real-time updates |
| 06 | Discovery & Polish | NOT STARTED | - | - | Search, explore, notifications, UI polish |
| 07 | RAG - Intelligent Insights | NOT STARTED | - | - | Pattern recognition and analysis |
| 08 | RAG - Content Generation | NOT STARTED | - | - | AI-powered captions and suggestions |
| 09 | RAG - Social Intelligence | NOT STARTED | - | - | Smart recommendations and notifications |
| 10 | Launch Preparation | NOT STARTED | - | - | Testing, optimization, deployment |

**Statuses**: NOT STARTED | IN PROGRESS | COMPLETED | BLOCKED

## Completed Epics Summary

### Epic 01: Foundation & Infrastructure (Dec 2024)
- **Duration**: 1 day (9.5 hours across 4 sprints)
- **Key Achievements**:
  - Complete development environment with Expo, TypeScript, and Bun
  - Supabase backend with full schema, RLS, and storage
  - Tamagui UI system with custom theme
  - Navigation structure with drawer and tabs
  - 30 mock users with personality-driven behavior
  - Zero linting or type errors
- **Major Decisions**: Simple repo structure, cents for money, mock user system
- **Ready For**: Epic 2 - Authentication can now begin

### Epic 02: Authentication & User System (Dec 2024 - Jan 2025)
- **Duration**: 1 month (8 sprints)
- **Key Achievements**:
  - Complete OAuth with Google and Twitter (NO EMAIL/PASSWORD)
  - Development build migration (REQUIRED for OAuth)
  - Multi-step onboarding flow (username → team → follow)
  - User profiles with customizable stats display
  - Badge system with 8 achievement types
  - Real-time notifications infrastructure
  - Referral tracking (rewards deferred to prevent abuse)
  - Complete drawer navigation with all user screens
  - Zero lint/TypeScript errors maintained
- **Major Decisions**: 
  - OAuth-only (no email/password)
  - Development builds required (Expo Go can't handle OAuth)
  - Referrals without rewards in MVP
  - Badge auto-calculation with user selection
  - UI/UX consistency rules established (.pm/process/ui-ux-consistency-rules.md)
- **Critical for Future Epics**: See "Critical Information for Future Agents" section below

## 🚨 CRITICAL INFORMATION FOR FUTURE AGENTS 🚨

### Development Environment Setup
**YOU MUST USE DEVELOPMENT BUILDS - EXPO GO WILL NOT WORK**
```bash
# One-time setup
eas build --profile development-simulator --platform ios

# Daily development
bun expo start --dev-client  # NOT just 'bun expo start'
```

### OAuth Authentication Flow
Our OAuth implementation has specific requirements due to Supabase quirks:

1. **URL Token Parsing**: Supabase returns tokens in URL fragment with `#` not `?`
   ```typescript
   // We manually parse tokens from redirect URL
   const transformedUrl = url.replace('#', '?');
   const params = new URLSearchParams(transformedUrl.split('?')[1]);
   ```

2. **Session Detection**: Uses retry mechanism (3 attempts) for reliability

3. **Google OAuth**: Requires email scope and 60-second timeout for 2FA
   ```typescript
   scopes: provider === 'google' ? 'https://www.googleapis.com/auth/userinfo.email' : undefined
   ```

4. **Database Trigger**: Auto-creates user records on OAuth signup
   - Email is nullable (Twitter doesn't always provide)
   - Username is nullable (set during onboarding)
   - Uses schema-qualified enum types: `'google'::public.oauth_provider`

### UI/UX Consistency Rules
**MANDATORY**: Follow `.pm/process/ui-ux-consistency-rules.md`
- Use Tamagui components (`View`, `Text`, `XStack`)
- Use `ScreenHeader` component for all drawer screens
- Use `Colors` constant from `@/theme` (never hardcoded colors)
- Use `useSafeAreaInsets()` hook (not SafeAreaView)
- Use text characters for icons ("←" for back)
- Standard padding: 16px, Header height: 56px

### Supabase Query Patterns
When querying related tables with multiple foreign keys:
```typescript
// WRONG - causes TypeScript errors
.select('follower:follower_id (...)')

// CORRECT - with relationship hints
.select('follower:users!follower_id (...)')
```

### Common Issues & Solutions
1. **Hermes Runtime Error**: Restart Metro bundler with `--clear`
2. **Navigation REPLACE Error**: Add 100ms delay before navigation
3. **SecureStore Warning**: Large tokens work fine, optimization deferred
4. **Profile Navigation**: Pass username parameter in DrawerContent

## Cross-Epic Architectural Decisions

### Decision Log
| Date | Decision | Rationale | Impacts |
|------|----------|-----------|---------|
| Dec 2024 | Use Bun instead of pnpm | Already in use, fast package management | Epic 1-10 |
| Dec 2024 | Defer auth to Epic 2 | Keep Epic 1 focused on pure infrastructure | Epic 1, 2 |
| Dec 2024 | Keep simple repo structure | Avoid monorepo complexity for single app | Epic 1 |
| Dec 2024 | Light theme design | Warm, friendly aesthetic for social platform | Epic 1-10 |
| Dec 2024 | Add mock user columns to users table | Support personality-driven mock data per mock.md | Epic 1 |
| Dec 2024 | Defer materialized views | Not needed for basic infrastructure | Epic 1 → Epic 4/6 |
| Dec 2024 | Add .prettierignore for generated files | Prevent formatting issues with auto-generated code | Epic 1 |
| Dec 2024 | Badge system auto-assigned with selection | Ensures authenticity while giving user control | Epic 2 |
| Dec 2024 | Single stat display in feed | Reduces clutter, emphasizes user choice | Epic 2 |
| Dec 2024 | Profile shows Posts/Bets tabs | More engaging than just stats view | Epic 2 |
| Dec 2024 | Referral rewards on first bet | Prevents abuse while encouraging engagement | Epic 2 |
| Dec 2024 | Referral code in localStorage during OAuth | Simpler than URL params, works across providers | Epic 2 |
| Dec 2024 | Badge automation via cron scripts | Keep it simple for MVP, defer edge functions | Epic 2 |
| Dec 2024 | No referral rewards for MVP | Track only, add rewards post-launch to prevent abuse | Epic 2 |
| Dec 2024 | Notification service uses type/data pattern | More flexible despite DB having title/body columns | Epic 2 |
| Dec 2024 | Share with expo-sharing + clipboard fallback | Native experience with universal fallback | Epic 2 |
| Dec 2024 | File-based locks for automation scripts | Simple solution for MVP, upgrade later | Epic 2 |
| Dec 2024 | Database-first for schema fixes | Fix root cause rather than work around issues | Epic 2, All |
| Dec 2024 | Supabase Edge Functions for automation | Serverless, scalable, no server maintenance | Epic 2, 4-10 |
| Dec 2024 | Bearer token auth for Edge Functions | Simple, secure, appropriate for cron jobs | Epic 2, All |
| Dec 2024 | Standardized color system | Single source of truth with semantic variations | Epic 2, All |
| Dec 2024 | EAS Build from day one | Smooth deployment path, early testing capability | Epic 2, All |
| Dec 2024 | Environment-based configuration | Clear dev/staging/prod separation | Epic 2, All |
| Dec 2024 | Mock data flag for APIs | Gradual migration from mock to real data | Epic 2, 4 |
| Jan 2025 | Migrate from Expo Go to Dev Build | OAuth requires proper deep linking | Epic 2, All |
| Jan 2025 | Manual token parsing for OAuth | Supabase uses # in redirect URLs | Epic 2 |
| Jan 2025 | Development builds for OAuth | Expo Go can't handle deep links properly | Epic 2, All |
| Jan 2025 | OAuth-only authentication | No email/password to reduce friction | Epic 2, All |
| Jan 2025 | ScreenHeader component pattern | Consistent UI across drawer screens | Epic 2, All |
| Jan 2025 | useUserList hook pattern | Shared logic for user lists | Epic 2, 3+ |

### Established Patterns
- **Authentication**: OAuth-only with Supabase (Google/Twitter) - NO EMAIL/PASSWORD
- **Development**: MUST use development builds (`bun expo start --dev-client`)
- **Error Handling**: User-friendly messages with specific error codes
- **Data Fetching**: Direct Supabase queries with relationship hints
- **State Management**: Zustand for app state, React Query for server state (future)
- **Component Structure**: Shared hooks for common logic (useUserList pattern)
- **UI Components**: Tamagui + ScreenHeader for drawer screens
- **Badge System**: Auto-calculated with user selection for display
- **Stats Display**: User-customizable primary stat
- **Navigation**: Drawer menu for non-tab screens, expo-router for all navigation
- **Color System**: Centralized Colors constant with semantic naming
- **Environment Management**: .env files with EXPO_PUBLIC_ prefix
- **Edge Functions**: Bearer token auth, environment-based configuration
- **Database Migrations**: Fix root issues rather than work around them
- **Code Quality**: Zero tolerance for lint errors/warnings
- **Type Safety**: No `any` types, proper interfaces for all data
- **Deployment**: EAS Build for distribution, development builds for dev

## Technology Stack Evolution

### Core Stack (from PRD)
- Frontend: React Native with Expo (SDK 50)
- Backend: Supabase (PostgreSQL, Auth, Realtime, Storage)
- Database: PostgreSQL via Supabase
- UI Library: Tamagui
- State: Zustand + React Query
- AI/RAG: OpenAI GPT-4 via Vercel AI SDK (Phase 2)

### Additional Libraries Added
| Library | Purpose | Added In Epic | Rationale |
|---------|---------|---------------|-----------|
| expo-sharing | Native share for referrals | Epic 2 | Referral system sharing |
| expo-notifications | Push notifications | Epic 2 | Engagement features |
| expo-auth-session | OAuth authentication | Epic 2 | Required for OAuth flow |
| expo-web-browser | OAuth browser handling | Epic 2 | Opens OAuth providers |
| expo-secure-store | Secure token storage | Epic 2 | OAuth token persistence |
| react-native-mmkv | Fast storage | Epic 2 | Settings persistence |

## Deployment Strategy

### Build & Distribution
- **Development**: Development builds via EAS (NOT Expo Go)
- **Testing**: EAS Build preview profiles for TestFlight/Internal Testing  
- **Production**: EAS Build production profiles for App Store/Play Store
- **Updates**: OTA updates via EAS Update for non-native changes

### Environment Strategy
| Environment | Purpose | Supabase Tier | Build Profile |
|------------|---------|---------------|---------------|
| Development | Local development | Cloud (free) | development-simulator |
| Staging | Integration testing | Free tier | preview |
| Production | Live users | Pro tier | production |

### Automation Infrastructure (DEFERRED - See Backlog)
- **Badge Updates**: Currently scripts, need Edge Function (hourly)
- **Bet Settlement**: Currently scripts, need Edge Function (every 5 min)
- **Game Addition**: Currently scripts, need Edge Function (daily 3 AM ET)
- **Deployment**: Manual builds, need GitHub Actions CI/CD

### Security Model
- **API Authentication**: Supabase Auth + RLS
- **Edge Functions**: Bearer token validation (when implemented)
- **Secrets Management**: EAS Secrets + Supabase Secrets
- **OAuth**: Google/Twitter via Supabase Auth (NO EMAIL/PASSWORD)

## Critical Gotchas & Learnings

### Things That Tripped Us Up
- Tamagui doesn't export Button/Spinner components - use React Native equivalents
- AuthError interface too complex to extend - create custom error types
- Username validation needs race condition handling - implement smart caching
- Notifications table created twice with different schemas - Epic 1 vs Epic 2
- CREATE TABLE IF NOT EXISTS doesn't modify existing tables - check migrations carefully
- TypeScript types for new tables not auto-generated - need manual regeneration
- Supabase MCP tools available for schema inspection - use instead of guessing
- Edge Functions use Deno not Node.js - different APIs and imports
- Color literals cause massive lint warnings - centralize early
- EAS doesn't break Expo Go - can set up deployment infrastructure from day one
- **Expo Go can't handle OAuth** - deep linking doesn't work, must use development builds
- **Supabase OAuth uses # not ?** - requires manual URL parsing for tokens
- **Auth callbacks can deadlock** - use sync callbacks with setTimeout for async work
- **Database triggers need schema qualification** - `public.oauth_provider` not just `oauth_provider`
- **Twitter OAuth needs email permission** - must enable in Twitter app settings
- **Development builds still support hot reload** - no loss of DX when migrating from Expo Go
- **Supabase queries need relationship hints** - when multiple foreign keys exist between tables
- **Navigation timing issues** - need delays to ensure navigators are mounted
- **Google OAuth can timeout** - 2FA flows need 60-second timeout
- **Hermes runtime errors on reload** - restart Metro bundler with --clear

### Performance Optimizations
- Badge calculation on-the-fly for now - will cache in Epic 4
- Follow suggestions use smart algorithm considering team and performance
- Settings auto-save reduces API calls vs explicit save button
- Edge Functions scale automatically - no server management needed
- File-based locks prevent badge update overlaps

### Security Considerations Implemented
- OAuth tokens in secure storage only
- Username validation with debouncing
- Referral code abuse prevention (no rewards in MVP)
- File-based locks prevent script overlap
- RLS policies on all new tables
- Bearer token auth for Edge Functions
- Environment-based secrets management
- No production credentials in development

## User Story Completion Status

| User Story | Status | Fully Enabled By Epics | Notes |
|------------|--------|------------------------|-------|
| Story 1: Social Pick Sharing | PARTIAL | Epic 1, 2, 3 | Auth/profiles ready, need camera/feed |
| Story 2: Tail/Fade Decisions | NOT STARTED | Epic 3, 4 | Betting logic and UI |
| Story 3: Ephemeral Content | NOT STARTED | Epic 1, 3 | Auto-expiration system |
| Story 4: Group Coordination | NOT STARTED | Epic 5 | Messaging system |
| Story 5: Performance Tracking | PARTIAL | Epic 2, 4, 6 | Badge system started, need full stats |
| Story 6: AI Insights (RAG) | NOT STARTED | Epic 7, 8, 9 | Phase 2 features |

## Refactoring & Technical Debt

### Completed Refactoring
- Created CustomAuthError instead of extending AuthError (Sprint 02.00)
- Inline SVG icons instead of icon library dependency (Sprint 02.01)
- Centralized color system with Colors constant (Sprint 02.06)
- Created ScreenHeader component for drawer screens (Sprint 02.07)
- Created useUserList hook for shared user list logic (Sprint 02.07)

### Identified Technical Debt
| Issue | Severity | Identified In | Planned Resolution |
|-------|----------|---------------|-------------------|
| Edge Functions migration | HIGH | Epic 2 | Epic 4-5 (see backlog) |
| CI/CD pipeline setup | HIGH | Epic 2 | Pre-Launch Epic |
| Environment management | MEDIUM | Epic 2 | When staging needed |
| SecureStore token optimization | LOW | Epic 2 | Performance Epic |
| Comprehensive documentation | MEDIUM | Epic 2 | Post-MVP |
| Badge calculation performance | LOW | Epic 2 | Batch processing hourly |
| Notification scaling | MEDIUM | Epic 2 | Pagination in Epic 6 |
| Referral rewards system | MEDIUM | Epic 2 | Post-MVP feature addition |
| Sports API integration | MEDIUM | Epic 2 | Mock flag allows future migration |

## Production Readiness Checklist

- [ ] All user stories for MVP completed
- [ ] Error handling comprehensive
- [ ] Performance acceptable
- [ ] Security measures in place
- [ ] Documentation updated
- [ ] Deployment pipeline ready
- [ ] Monitoring configured

## Deferred Features from Epic 1

### Features Deferred to Later Epics
| Feature | Originally Planned | Deferred To | Rationale |
|---------|-------------------|-------------|-----------|
| Materialized Views (user_stats, daily_leaderboard) | Epic 1 | Epic 4 or 6 | Not needed for basic infrastructure, adds complexity |
| pg_cron extension | Epic 1 | Epic 6 | Scheduled jobs not needed until polish phase |
| Activity Simulator Scripts | Epic 1 | Post-MVP | Complex automation not needed for initial development |
| Demo Scenario Scripts | Epic 1 | Epic 10 | Better suited for launch preparation |

### Why These Were Deferred
- **Focus**: Keep Epic 1 focused on core infrastructure setup
- **Complexity**: These features add significant complexity without immediate value
- **Dependencies**: Better to implement when we have real user patterns to optimize
- **Testing**: Can test core functionality with simple mock data first

## Deferred Features from Epic 2 (CRITICAL FOR FUTURE EPICS)

### 1. Edge Functions Migration (Target: Epic 4-5)
**Current State**: Using local scripts with file-based locking
**Migration Required**:
```typescript
// Current: scripts/update-badges.ts
// Future: supabase/functions/update-badges/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Verify Bearer token from cron
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${Deno.env.get('FUNCTION_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  // Port badge update logic here
})
```

**Also Migrate**:
- `scripts/settle-bets.ts` → Edge Function
- `scripts/add-games.ts` → Edge Function
- Set up Supabase cron triggers

### 2. CI/CD Pipeline (Target: Pre-Launch Epic)
**Files to Create**:
```yaml
# .github/workflows/eas-preview.yml
name: EAS Preview
on:
  pull_request:
    types: [opened, synchronize]
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: expo/expo-github-action@v8
      - run: eas build --profile preview --platform all
```

### 3. Environment Management (Target: When Staging Needed)
**Current**: Single `.env` file
**Future Structure**:
```
.env.development
.env.staging  
.env.production
config/environment.ts  # Environment switcher
```

### 4. Documentation (Target: Post-MVP)
**Create**:
- `docs/DEPLOYMENT.md` - EAS Build setup, env vars, secrets
- `docs/OAUTH_SETUP.md` - Google/Twitter app configuration
- `docs/TROUBLESHOOTING.md` - Common issues (Hermes, navigation, etc.)
- `docs/ARCHITECTURE.md` - System design, data flow
- `docs/CONTRIBUTING.md` - Development workflow, PR process

## Feature Backlog

### Prioritized Features (Post-MVP)
| Priority | Feature | User Story | Estimated Epics | Notes |
|----------|---------|------------|-----------------|-------|
| P0 (Critical) | Edge Functions | Infrastructure | 0.5 | Scripts work but not scalable |
| P0 (Critical) | CI/CD Pipeline | Infrastructure | 1 | Manual builds not sustainable |
| P1 (High) | Referral rewards system | Growth | 1 | Deferred from Epic 2 to prevent abuse |
| P1 (High) | Environment management | Infrastructure | 0.5 | Need staging environment |
| P1 (High) | Live betting updates | Enhancement | 1-2 | Real-time odds |
| P1 (High) | Complex parlays | Story 2 enhancement | 1 | Multi-leg bets |
| P2 (Medium) | SecureStore optimization | Performance | 0.5 | Split large tokens |
| P2 (Medium) | Documentation suite | Developer Experience | 1 | Comprehensive guides |
| P2 (Medium) | Public tournaments | New Story | 2-3 | Contest system |
| P3 (Low) | Web version | Platform expansion | 3-4 | Post mobile success |

### Ideas & Future Considerations
- Advanced analytics dashboard
- Voice/video calls in groups
- Apple Watch companion app
- NFT/crypto integration (market dependent)

## Bug Tracker

### Active Bugs
| ID | Description | Severity | Found In | Status | Assigned To |
|----|-------------|----------|----------|--------|-------------|
| [No bugs yet - will track as found] | - | - | - | - | - |

### Resolved Bugs
| ID | Description | Fixed In | Resolution |
|----|-------------|----------|------------|
| B001 | TypeScript error in useUserList | Epic 2, Sprint 02.07 | Added relationship hints |

## Open Questions & Decisions Needed

1. Should we support simple 2-3 leg parlays in MVP? - Blocks: Epic 4
2. How do we handle ties/pushes in fade scenarios? - Blocks: Epic 4
3. Should stories auto-generate for milestones? - Blocks: Epic 3
4. What's the max group chat size? - Blocks: Epic 5
5. ~~Do we need a tutorial/onboarding flow?~~ - ANSWERED: Yes, 3-step onboarding (Epic 2)

## Next Steps

**Current Epic**: Epic 3 - Social Feed & Content (IN PROGRESS)
**Prerequisites**: 
- Development build installed on simulator
- OAuth authentication working
- User profiles established

### Epic 3 Progress
**Completed Sprints**:
- Sprint 03.00 - Camera & Media Infrastructure ✅
  - Full camera implementation with photo/video capture
  - Gallery selection and media compression
  - Upload service with retry logic
  - Tab bar integration complete
  - Migrated from deprecated expo-av to expo-video

**Next Sprint**: 03.01 - Effects & Filters System
- Implement emoji-based effects system
- 48+ base effects across 17 categories
- Badge-based unlocks from Epic 2
- React Native Reanimated 2 for performance
- Haptic feedback integration
- 73+ total effects with tiers

**Critical Notes for Epic 3**:
1. Must use development builds (camera won't work in Expo Go)
2. Follow UI/UX consistency rules (.pm/process/ui-ux-consistency-rules.md)
3. Use established patterns (useUserList hook, ScreenHeader component)
4. Maintain zero lint/TypeScript errors
5. **expo-av is DEPRECATED** - always use expo-video for video playback
6. Emoji effects approach chosen over Lottie - zero dependencies, better performance

---

*Last Updated: January 20, 2025*
*Updated By: Epic 3 Sprint 03.00 Completion - Camera Infrastructure* 