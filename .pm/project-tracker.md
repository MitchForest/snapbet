# SnapBet - Project Tracker

## Overview
This document tracks high-level progress across all epics and maintains critical architectural decisions that impact future development.

## Epic Status Overview

| Epic # | Epic Name | Status | Start Date | End Date | Key Outcome |
|--------|-----------|--------|------------|----------|-------------|
| 01 | Foundation & Infrastructure | COMPLETED | Dec 2024 | Dec 2024 | Dev environment, Supabase, Tamagui, mock data |
| 02 | Authentication & User System | COMPLETED | 2024-12-19 | 2025-01-19 | OAuth-only auth, profiles, badges, referrals |
| 03 | Camera & Content Creation | IN PROGRESS | 2025-01-20 | - | Photo/video, effects, post types, weekly badges |
| 04 | Feed & Social Engagement | COMPLETED | 2024-12-19 | 2025-01-10 | FlashList feed, discovery, engagement, moderation |
| 05 | Betting & Bankroll System | COMPLETED | Jan 2025 | Jan 2025 | Mock betting with tail/fade mechanics |
| 06 | Messaging & Real-time | NOT STARTED | - | - | DMs, group chats, real-time updates |
| 07 | Polish & Feature Completion | NOT STARTED | - | - | Refactoring, push notifications, optimization |
| 08 | AI-Powered Intelligence | NOT STARTED | - | - | Smart discovery, notifications, content generation |
| 09 | Launch Preparation | NOT STARTED | - | - | App store prep, final polish, deployment |

## Completed Epics Summary

### Epic 01: Foundation & Infrastructure
**Completed**: December 2024
**Key Features Delivered**:
- Development environment setup with Expo
- Supabase integration and database schema
- Tamagui UI framework configuration
- Mock data generation scripts
- Basic project structure

### Epic 02: Authentication & User System
**Completed**: 2025-01-19
**Key Features Delivered**:
- OAuth-only authentication (Google, Apple)
- User profiles with usernames and avatars
- Badge system (8 weekly badges)
- Referral tracking system
- Bankroll initialization

### Epic 04: Feed & Social Engagement ✨ NEW
**Completed**: 2025-01-10
**Duration**: 23 days (9 sprints)
**Grade**: A+ (One sprint with commendation)

**Key Features Delivered**:
- High-performance social feed with FlashList (60 FPS scrolling)
- User search and discovery with trending/suggested users
- Following system with optimistic updates
- Private accounts with follow request management
- Full engagement system (comments, reactions, tail/fade UI)
- Instagram-style story viewer with reactions
- Comprehensive content moderation (blocking, reporting, auto-hide)
- $100 weekly referral bonus system
- Professional error handling and loading states

**Major Architectural Decisions**:
- **MMKV Storage Service**: 30x performance improvement over AsyncStorage
- **Service Independence**: No service-to-service calls prevent circular dependencies
- **Composite Cursor Pagination**: Stable infinite scroll that handles deletions
- **DeviceEventEmitter**: React Native event communication pattern
- **Defense in Depth**: Error boundaries at multiple levels
- **Smart Memoization**: ~80% reduction in unnecessary re-renders

**Important Learnings**:
- Database migration workflow is critical - always migrate first, regenerate types, then code
- MMKV provides massive performance improvements and should be used everywhere
- Service independence pattern prevents circular dependencies
- Memoization of list items has the biggest performance impact
- Error boundaries at multiple levels prevent app crashes
- Technical debt removal while implementing features is efficient

**Technical Achievements**:
- Zero TypeScript errors throughout epic
- Complete AsyncStorage to MMKV migration
- All database migrations properly applied
- Consistent haptic feedback on all primary actions
- Professional polish with loading states
- One sprint completed with commendation (04.04)

### Epic 05: Betting & Bankroll System ✨ NEW
**Completed**: Jan 2025
**Duration**: 8 sprints
**Grade**: A

**Key Features Delivered**:
- Games tab with NBA/NFL games and odds (mock data)
- 10-second bet placement flow with bottom sheet UI
- Tail/fade mechanics integrated with feed posts
- $1,000 weekly bankroll with automatic Monday reset
- Bet settlement system with admin scripts
- Pick/outcome post creation via camera
- Bet history with performance stats (W-L, ROI)

**Major Architectural Decisions**:
- **Bankroll in Cents**: Store as 100000 for $1,000 to avoid float precision issues
- **Mock Data Structure**: Follow The Odds API format for easy future migration
- **Single Bookmaker**: Display one set of odds for cleaner UI
- **Client-side ROI**: Calculate stats on client for MVP simplicity
- **Atomic Transactions**: Prevent bankroll race conditions with DB locks

**Important for Future Epics**:
- **Bet Relationships**: pick_actions table tracks tail/fade relationships
- **Game Scores**: Settlement scripts update scores in games table
- **Post Integration**: Pick posts link to bets via bet_id in metadata
- **Referral Bonuses**: $100 added to weekly bankroll per active referral
- **Effect Suggestions**: Outcome posts suggest effects based on win/loss

**Technical Achievements**:
- Zero TypeScript errors in betting system
- Zero ESLint warnings in betting code
- 60 FPS on games list using FlashList
- Real-time tail/fade count updates
- Optimistic UI for instant feedback

---

## 🚨 CRITICAL INFORMATION FOR FUTURE EPICS 🚨

### Development Environment
**MUST use development builds - Expo Go will NOT work:**
```bash
# Daily development
bun expo start --dev-client  # NOT 'bun expo start'
```

### OAuth Authentication Quirks
1. **Supabase returns tokens in URL fragment**: Must parse `#` not `?`
2. **Database trigger auto-creates users**: Uses schema-qualified enums
3. **Session detection needs retries**: 3 attempts for reliability
4. **Google needs email scope**: 60-second timeout for 2FA

### Architectural Patterns (MANDATORY)

#### Storage Pattern (NEW from Epic 4)
```typescript
// Use unified MMKV service - 30x faster than AsyncStorage
import { Storage } from '@/services/storage/storageService';
Storage.feed.set('key', value);
```

#### Pagination Pattern (NEW from Epic 4)
```typescript
// Composite cursor for stable pagination
interface Cursor {
  timestamp: string;
  id: string;
}
```

#### List Performance (NEW from Epic 4)
```typescript
// FlashList for ALL lists > 10 items
<FlashList
  estimatedItemSize={400}
  drawDistance={1000}
  removeClippedSubviews={true}
/>
```

#### UI Consistency
- **Tamagui only**: No React Native components
- **Colors constant**: Never hardcode colors
- **ScreenHeader**: For all drawer screens
- **Text icons**: Use "←" not icon libraries

#### Service Independence Pattern (NEW from Epic 4)
```typescript
// Services NEVER call other services
// Pass data as parameters instead
async function doSomething(userId: string, isPrivate: boolean) {
  // NOT: const isPrivate = await privacyService.check(userId)
}
```

#### Error Boundary Pattern (NEW from Epic 4)
```typescript
// Root level AND tab level for defense in depth
<ErrorBoundary level="root">
  <ErrorBoundary level="tab">
    <YourComponent />
  </ErrorBoundary>
</ErrorBoundary>
```

#### Event Communication Pattern (NEW from Epic 4)
```typescript
// Use DeviceEventEmitter for React Native, NEVER browser APIs
import { DeviceEventEmitter } from 'react-native';
DeviceEventEmitter.emit('event', data);
```

### Critical Architectural Decisions

| Decision | Impact | Reason |
|----------|--------|---------|
| OAuth-only (no email/password) | All epics | Reduce friction, modern auth |
| Development builds required | All epics | OAuth deep linking |
| MMKV storage service | Epic 4+ | 30x performance gain |
| FlashList for feeds | Epic 4+ | 60 FPS with media |
| Composite cursor pagination | Epic 4+ | Handles deletions gracefully |
| Real-time subscription limits | Epic 4+ | Cap at 100 for performance |
| Weekly badge system | Epic 3+ | 8 badges, Monday reset |
| Three post types | Epic 3+ | Content, Pick, Outcome |
| Supabase MCP for DB inspection | All epics | Real-time schema understanding |
| Service independence | Epic 4+ | Prevents circular dependencies |
| Error boundaries everywhere | Epic 4+ | Prevents app crashes |
| DeviceEventEmitter pattern | Epic 4+ | Cross-component communication |

### Code Quality Standards
- **Zero tolerance**: No lint/type errors
- **Type generation**: After EVERY schema change
- **No `any` types**: Without explicit justification
- **Migration files**: For EVERY database change

## User Story Completion Status

| Story | Epic Coverage | Status |
|-------|--------------|---------|
| Story 1: Social Pick Sharing | Epic 3, 4, 5 | 100% ✅ |
| Story 2: Tail/Fade Decisions | Epic 4, 5 | 100% ✅ |
| Story 3: Ephemeral Content | Epic 3, 4 | 90% (stories complete) |
| Story 4: Group Coordination | Epic 4, 6 | 40% (social layer done) |
| Story 5: Performance Tracking | Epic 3, 4, 5 | 100% ✅ |
| Story 6: AI Insights | Epic 8 | 0% |

## Technical Debt & Future Considerations

### Immediate (Epic 6-7)
- Edge Functions migration for automation
- Weekly reset cron job
- Push notifications for outcomes
- Message expiration logic
- Real-time message sync

### Medium Priority (Epic 7)
- Service layer consolidation
- Component library extraction
- Performance profiling
- Test infrastructure

### Post-MVP
- CI/CD pipeline
- Staging environment
- Comprehensive documentation
- Referral rewards activation

## Key Learnings Applied Forward

### From Epic 2 (Auth)
- ✅ Development builds are non-negotiable for OAuth
- ✅ Supabase URL parsing needs manual handling
- ✅ UI consistency rules prevent technical debt

### From Epic 3 (Camera)
- ✅ Effect system architecture scales well
- ✅ Post type system is extensible
- ⚠️ Clean up `any` types in Sprint 3.07

### From Epic 4 (Feed & Social)
- ✅ Service independence prevents all circular dependency issues
- ✅ MMKV migration should be done immediately when found
- ✅ Error boundaries at multiple levels are essential
- ✅ Memoization has massive performance impact on lists
- ✅ Database migration workflow: migrate → regenerate types → code
- ✅ Technical debt removal during feature work is efficient
- ⚠️ 27 ESLint warnings remain (all intentional inline styles)

### From Epic 5 (Betting)
- ✅ Bankroll in cents prevents float precision issues
- ✅ Mock data following The Odds API enables easy migration
- ✅ Atomic transactions essential for concurrent bets
- ✅ Settlement scripts must update game scores
- ✅ Pick posts need bet_id in metadata for tail/fade
- ⚠️ Weekly reset cron job needed for production

## Next Critical Milestones

### Epic 3 Completion
- Sprint 03.07: Fix 39 lint issues, 18 type errors
- Achieve full type safety
- Complete effect tracking

### Epic 6 Planning (Messaging)
- Apply MMKV storage for message caching
- Use FlashList for conversation lists
- Consider real-time subscription limits (100 max)
- Integrate bet sharing in DMs
- Apply service independence pattern

### Epic 7 Considerations
- Migrate settlement to edge functions
- Implement weekly reset cron job
- Add push notifications for bet outcomes
- Performance profiling of betting flows

---

## Quick Reference

### Commands
```bash
# Development
bun expo start --dev-client

# Quality checks (MUST pass)
bun run lint
bun run typecheck

# Database inspection
mcp_supabase_get_schemas
mcp_supabase_get_tables schema_name="public"

# Type generation (after schema changes)
supabase gen types typescript --local > types/supabase-generated.ts
```

### File Patterns
```typescript
// Service pattern
services/[domain]/[domain]Service.ts

// Hook pattern  
hooks/use[Feature].ts

// Component pattern
components/[feature]/[Component].tsx
```

### Performance Targets
- Feed scroll: 60 FPS
- Initial load: < 1 second
- Navigation: < 100ms
- Type checking: 0 errors
- Linting: 0 errors/warnings

---

*Last Updated: January 2025*
*Next Review: After Epic 3 completion* 