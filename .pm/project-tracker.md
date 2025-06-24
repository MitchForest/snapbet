# SnapFade - Project Tracker

## Overview
This document tracks high-level progress across all epics, maintains key architectural decisions, and serves as persistent memory for the project.

## Epic Status Overview

| Epic # | Epic Name | Status | Start Date | End Date | Key Outcome |
|--------|-----------|--------|------------|----------|-------------|
| 01 | Foundation & Infrastructure | COMPLETED | Dec 2024 | Dec 2024 | Complete dev environment and core architecture |
| 02 | Authentication & User System | IN PROGRESS | 2024-12-19 | - | OAuth flow and user profile management |
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

### Established Patterns
- **Authentication**: [TBD - OAuth with Supabase]
- **Error Handling**: [TBD]
- **Data Fetching**: [TBD - React Query pattern]
- **State Management**: [TBD - Zustand for app state]
- **Component Structure**: [TBD]

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
| [Libraries will be tracked as added] | [Why needed] | Epic # | [Reason for choice] |

## Critical Gotchas & Learnings

### Things That Tripped Us Up
[Will be populated during development]

### Performance Optimizations
[Will be tracked as implemented]

### Security Considerations Implemented
[Will be tracked as implemented]

## User Story Completion Status

| User Story | Status | Fully Enabled By Epics | Notes |
|------------|--------|------------------------|-------|
| Story 1: Social Pick Sharing | NOT STARTED | Epic 1, 2, 3 | Camera, feed, media storage |
| Story 2: Tail/Fade Decisions | NOT STARTED | Epic 3, 4 | Betting logic and UI |
| Story 3: Ephemeral Content | NOT STARTED | Epic 1, 3 | Auto-expiration system |
| Story 4: Group Coordination | NOT STARTED | Epic 5 | Messaging system |
| Story 5: Performance Tracking | NOT STARTED | Epic 4, 6 | Stats and profiles |
| Story 6: AI Insights (RAG) | NOT STARTED | Epic 7, 8, 9 | Phase 2 features |

## Refactoring & Technical Debt

### Completed Refactoring
[Will be tracked as completed]

### Identified Technical Debt
| Issue | Severity | Identified In | Planned Resolution |
|-------|----------|---------------|-------------------|
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
5. Do we need a tutorial/onboarding flow? - Blocks: Epic 2

## Next Steps

**Current Epic**: Epic 2 - Authentication & User System (IN PROGRESS - Sprint 02.00 APPROVED)
**Next Planned Epic**: Epic 3 - Social Feed & Content
**Blocked Items**: None
**P0 Items in Backlog**: 0

### Ready for Epic 2
With Epic 1 complete, we now have:
- ✅ Working development environment
- ✅ Database with users table ready for OAuth
- ✅ Navigation structure for auth flows
- ✅ Theme system for consistent UI
- ✅ Mock users to test with
- ✅ Clean, lint-free codebase

---

*Last Updated: Dec 2024*
*Updated By: Epic 01 Complete* 