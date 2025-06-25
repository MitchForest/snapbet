# SnapBet - Project Tracker

## Overview
This document tracks high-level progress across all epics and maintains critical architectural decisions that impact future development.

## Epic Status Overview

| Epic # | Epic Name | Status | Start Date | End Date | Key Outcome |
|--------|-----------|--------|------------|----------|-------------|
| 01 | Foundation & Infrastructure | COMPLETED | Dec 2024 | Dec 2024 | Dev environment, Supabase, Tamagui, mock data |
| 02 | Authentication & User System | COMPLETED | 2024-12-19 | 2025-01-19 | OAuth-only auth, profiles, badges, referrals |
| 03 | Camera & Content Creation | IN PROGRESS | 2025-01-20 | - | Photo/video, effects, post types, weekly badges |
| 04 | Feed & Social Engagement | IN PROGRESS | 2024-12-19 | - | FlashList feed, discovery, engagement, analytics |
| 05 | Betting & Bankroll System | NOT STARTED | - | - | Mock betting with tail/fade mechanics |
| 06 | Messaging & Real-time | NOT STARTED | - | - | DMs, group chats, real-time updates |
| 07 | Polish & Feature Completion | NOT STARTED | - | - | Refactoring, push notifications, optimization |
| 08 | AI-Powered Intelligence | NOT STARTED | - | - | Smart discovery, notifications, content generation |
| 09 | Launch Preparation | NOT STARTED | - | - | App store prep, final polish, deployment |

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

### Code Quality Standards
- **Zero tolerance**: No lint/type errors
- **Type generation**: After EVERY schema change
- **No `any` types**: Without explicit justification
- **Migration files**: For EVERY database change

## User Story Completion Status

| Story | Epic Coverage | Status |
|-------|--------------|---------|
| Story 1: Social Pick Sharing | Epic 3, 4, 5 | 60% (need betting) |
| Story 2: Tail/Fade Decisions | Epic 4, 5 | 20% (UI only) |
| Story 3: Ephemeral Content | Epic 3, 4 | 40% (need expiration) |
| Story 4: Group Coordination | Epic 6 | 0% |
| Story 5: Performance Tracking | Epic 3, 4 | 70% (need charts) |
| Story 6: AI Insights | Epic 8 | 0% |

## Technical Debt & Future Considerations

### Immediate (Epic 5-6)
- Edge Functions migration for automation
- Bet settlement system
- Real money calculations
- Message expiration logic

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

### From Epic 4 Sprint 01 (Feed)
- ✅ FlashList migration is straightforward
- ✅ MMKV should be adopted everywhere
- ✅ Composite cursors solve edge cases
- ✅ Storage architecture decisions compound

## Next Critical Milestones

### Epic 3 Completion
- Sprint 03.07: Fix 39 lint issues, 18 type errors
- Achieve full type safety
- Complete effect tracking

### Epic 4 Sprint 02 (Search)
- Apply MMKV storage pattern
- Use FlashList for results
- Consider real-time search limits

### Epic 5 Planning
- Integrate with Epic 4's tail/fade UI
- Use MMKV for bet caching
- Apply composite cursor for bet history

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

*Last Updated: December 2024*
*Next Review: After Epic 4 completion* 