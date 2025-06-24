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

### Established Patterns
- **Authentication**: OAuth-only with Supabase (Google/Twitter)
- **Error Handling**: [TBD]
- **Data Fetching**: [TBD - React Query pattern]
- **State Management**: Zustand for app state
- **Component Structure**: [TBD]
- **Badge System**: Auto-calculated with user selection for display
- **Stats Display**: User-customizable primary stat
- **Navigation**: Drawer menu for non-tab screens

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

## Critical Gotchas & Learnings

### Things That Tripped Us Up
- Tamagui doesn't export Button/Spinner components - use React Native equivalents
- AuthError interface too complex to extend - create custom error types
- Username validation needs race condition handling - implement smart caching

### Performance Optimizations
[Will be tracked as implemented]

### Security Considerations Implemented
- OAuth tokens in secure storage only
- Username validation with debouncing
- Referral code abuse prevention

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
| [Debt items will be tracked] | HIGH/MED/LOW | Epic # | Epic # or "Post-MVP" |

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
| P1 (High) | Live betting updates | Enhancement | 1-2 | Real-time odds |
| P1 (High) | Complex parlays | Story 2 enhancement | 1 | Multi-leg bets |
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

**Current Epic**: Epic 2 - Authentication & User System (IN PROGRESS - Sprints 02.00-02.03 APPROVED, 02.04 IN PROGRESS)
**Current Sprint**: Sprint 02.04 - Profile, Settings & Drawer (IN PROGRESS)
**Blocked Items**: None
**P0 Items in Backlog**: 0

### Epic 2 Progress Update
With Sprints 02.00-02.03 complete, we now have:
- ✅ OAuth with Google/Twitter working
- ✅ Welcome screen implemented
- ✅ Username selection with validation
- ✅ Session management secure
- ✅ Team selection (optional) with 62 teams
- ✅ Follow suggestions with smart algorithm
- ✅ Badge system infrastructure (8 types)
- ✅ Mock users with realistic stats
- ⏳ Profile system with Posts/Bets tabs (Sprint 02.04)
- ⏳ Complete drawer navigation menu (Sprint 02.04)
- ⏳ Settings screens and customization (Sprint 02.04)
- ⏳ Notification system foundation (Sprint 02.04)
- ⏳ Referral system and automation (Sprint 02.05)

### Sprint 02.03 Key Achievements
- Implemented all 62 NFL/NBA teams with official colors
- Smart follow suggestions based on team preference and performance
- Badge calculation service with proper thresholds
- Enhanced mock user data with realistic personality-based stats
- Database migrations for badge tracking and stats metadata

### New Features Added to Epic 2
Based on review, Epic 2 has been expanded to include:
- **Badge/Achievement System**: 8 badge types with auto-calculation ✅
- **Stats Display Customization**: Users choose primary stat to show ✅
- **Enhanced Profile**: Posts/Bets tabs instead of just stats (IN PROGRESS)
- **Drawer Navigation**: Complete menu system (IN PROGRESS)
- **Notification Foundation**: Real-time system with preferences (IN PROGRESS)
- **Referral System**: Growth mechanics with rewards (NOT STARTED)

---

*Last Updated: December 20, 2024*
*Updated By: Sprint 02.03 Completion & Sprint 02.04 Start* 