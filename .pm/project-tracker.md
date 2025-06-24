# SnapBet - Project Tracker

## Overview
This document tracks high-level progress across all epics, maintains key architectural decisions, and serves as persistent memory for the project.

## Epic Status Overview

| Epic # | Epic Name | Status | Start Date | End Date | Key Outcome |
|--------|-----------|--------|------------|----------|-------------|
| 01 | Foundation & Infrastructure | COMPLETED | Dec 2024 | Dec 2024 | Complete dev environment and core architecture |
| 02 | Authentication & User System | IN PROGRESS | 2024-12-19 | - | OAuth, profiles, badges, notifications, referrals |
| 03 | Social Feed & Content | NOT STARTED | - | - | Photo/video sharing with stories |
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

### Established Patterns
- **Authentication**: OAuth-only with Supabase (Google/Twitter)
- **Error Handling**: User-friendly messages with specific error codes
- **Data Fetching**: Direct Supabase queries (no RPC functions)
- **State Management**: Zustand for app state, React Query for server state (future)
- **Component Structure**: Shared hooks for common logic (useUserList pattern)
- **Badge System**: Auto-calculated with user selection for display
- **Stats Display**: User-customizable primary stat
- **Navigation**: Drawer menu for non-tab screens
- **Color System**: Centralized Colors constant with semantic naming
- **Environment Management**: .env files with EXPO_PUBLIC_ prefix
- **Edge Functions**: Bearer token auth, environment-based configuration
- **Database Migrations**: Fix root issues rather than work around them
- **Code Quality**: Zero tolerance for lint errors/warnings
- **Type Safety**: No `any` types, proper interfaces for all data
- **Deployment**: EAS Build for distribution, Expo Go for development

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
| [Libraries will be tracked as added] | [Why needed] | Epic # | [Reason for choice] |

## Deployment Strategy

### Build & Distribution
- **Development**: Expo Go for rapid iteration
- **Testing**: EAS Build preview profiles for TestFlight/Internal Testing  
- **Production**: EAS Build production profiles for App Store/Play Store
- **Updates**: OTA updates via EAS Update for non-native changes

### Environment Strategy
| Environment | Purpose | Supabase Tier | Build Profile |
|------------|---------|---------------|---------------|
| Development | Local development | Local Docker | Expo Go |
| Staging | Integration testing | Free tier | preview |
| Production | Live users | Pro tier | production |

### Automation Infrastructure
- **Badge Updates**: Supabase Edge Function (hourly)
- **Bet Settlement**: Supabase Edge Function (every 5 min)
- **Game Addition**: Supabase Edge Function (daily 3 AM ET)
- **Deployment**: GitHub Actions CI/CD pipeline

### Security Model
- **API Authentication**: Supabase Auth + RLS
- **Edge Functions**: Bearer token validation
- **Secrets Management**: EAS Secrets + Supabase Secrets
- **OAuth**: Google/Twitter via Supabase Auth

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

### Identified Technical Debt
| Issue | Severity | Identified In | Planned Resolution |
|-------|----------|---------------|-------------------|
| Badge calculation performance | LOW | Epic 2 | Batch processing hourly |
| Notification scaling | MEDIUM | Epic 2 | Pagination in Epic 6 |
| Notification schema mismatch | HIGH | Epic 2 | Fixed in Sprint 02.06 |
| Badge automation deployment | MEDIUM | Epic 2 | Edge Functions in Sprint 02.06 |
| Referral rewards system | MEDIUM | Epic 2 | Post-MVP feature addition |
| Remaining lint errors | LOW | Epic 2 | Sprint 02.06 cleanup |
| File-based script locks | LOW | Epic 2 | Replaced with Edge Functions |
| TypeScript type generation | LOW | Epic 2 | Manual types in Sprint 02.06 |
| Sports API integration | MEDIUM | Epic 2 | Mock flag allows future migration |
| Color system fragmentation | MEDIUM | Epic 2 | Centralized in Sprint 02.06 |

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

## Feature Backlog

### Prioritized Features (Post-MVP)
| Priority | Feature | User Story | Estimated Epics | Notes |
|----------|---------|------------|-----------------|-------|
| P0 (Critical) | [Features from PRD exclusions] | - | - | [To be populated] |
| P1 (High) | Referral rewards system | Growth | 1 | Deferred from Epic 2 to prevent abuse |
| P1 (High) | Badge automation edge functions | Performance | 1 | Replace cron scripts |
| P1 (High) | Live betting updates | Enhancement | 1-2 | Real-time odds |
| P1 (High) | Complex parlays | Story 2 enhancement | 1 | Multi-leg bets |
| P2 (Medium) | Notification schema cleanup | Tech debt | 0.5 | Resolve title/body mismatch |
| P2 (Medium) | Production automation scheduling | Infrastructure | 1 | Proper cron/scheduling solution |
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
| [Will track resolved bugs] | - | - | - |

## Open Questions & Decisions Needed

1. Should we support simple 2-3 leg parlays in MVP? - Blocks: Epic 4
2. How do we handle ties/pushes in fade scenarios? - Blocks: Epic 4
3. Should stories auto-generate for milestones? - Blocks: Epic 3
4. What's the max group chat size? - Blocks: Epic 5
5. Do we need a tutorial/onboarding flow? - Blocks: Epic 2 - ANSWERED: Yes, 3-step onboarding

## Next Steps

**Current Epic**: Epic 2 - Authentication & User System (IN PROGRESS - Sprints 02.00-02.05 APPROVED)
**Current Sprint**: Sprint 02.06 - Technical Debt Cleanup (NOT STARTED)
**Blocked Items**: None
**P0 Items in Backlog**: 0

### Epic 2 Progress Update
With Sprints 02.00-02.05 complete, we now have:
- ✅ OAuth with Google/Twitter working
- ✅ Welcome screen implemented
- ✅ Username selection with validation
- ✅ Session management secure
- ✅ Team selection (optional) with 62 teams
- ✅ Follow suggestions with smart algorithm
- ✅ Badge system infrastructure (8 types)
- ✅ Mock users with realistic stats
- ✅ Profile system with Posts/Bets tabs
- ✅ Complete drawer navigation menu
- ✅ Settings screens and customization
- ✅ Notification system foundation
- ✅ Referral system (tracking only, no rewards)
- ✅ Badge automation scripts
- ⏳ Technical debt cleanup (11 errors, 43 warnings)

### Sprint 02.05 Key Achievements
- Implemented referral tracking system without rewards
- Created memorable referral codes with username prefixes
- Built invite screen with native share and clipboard fallback
- Added referral code input to welcome screen
- Developed production-ready badge automation script with file locking
- Integrated AsyncStorage for OAuth flow persistence

### Remaining in Epic 2
Sprint 02.06 will complete the epic with:
- Fix notification schema mismatch (database vs service)
- Eliminate ALL lint errors (11) and warnings (43)
- Extract ~40 color literals to theme constants
- Regenerate TypeScript types for new tables
- Remove code duplication with reusable hooks
- Create deployment documentation

### Technical Decisions from Sprint 02.05
- AsyncStorage for referral code persistence across OAuth redirect
- File-based locking prevents concurrent badge updates
- Native share with clipboard fallback for better UX
- Silent handling of self-referrals
- Badge history simplified for MVP (action and timestamp only)

---

*Last Updated: December 20, 2024*
*Updated By: Sprint 02.05 Completion & Review* 