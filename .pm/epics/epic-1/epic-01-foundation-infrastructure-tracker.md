# Epic 01: Foundation & Infrastructure Tracker

## Epic Overview

**Status**: NOT STARTED  
**Start Date**: -  
**Target End Date**: Day 1 (end) - ~9.5 hours total  
**Actual End Date**: -

**Epic Goal**: Set up the complete development environment, core architecture, and foundational infrastructure for the SnapFade mobile app.

**User Stories Addressed**:
- Story 1-6: This epic enables all stories by providing the foundational infrastructure

**PRD Reference**: Technical Architecture, Repository Structure sections

## Sprint Breakdown

| Sprint # | Sprint Name | Status | Start Date | End Date | Est. Hours | Key Deliverable |
|----------|-------------|--------|------------|----------|------------|-----------------|
| 01.00 | Project Setup | NOT STARTED | - | - | 2.5 | Working Expo dev environment |
| 01.01 | Database & Backend | NOT STARTED | - | - | 3.5 | Complete Supabase setup |
| 01.02 | Navigation & Theme | NOT STARTED | - | - | 2.0 | App navigation with Tamagui |
| 01.03 | Mock Data & Scripts | NOT STARTED | - | - | 1.5 | 30 mock users and admin tools |

**Statuses**: NOT STARTED | IN PROGRESS | IN REVIEW | APPROVED | BLOCKED

## Architecture & Design Decisions

### High-Level Architecture for This Epic
This epic establishes the foundational architecture:
- Simple single-package structure with Expo Router
- Expo/React Native for the mobile app
- Supabase for backend (Auth, Database, Storage, Realtime)
- Tamagui for the UI component system
- TypeScript throughout for type safety

### Key Design Decisions
1. **Simple Repo Structure**: Single package with organized folders
   - Alternatives considered: Monorepo with workspaces, Nx, Turborepo
   - Rationale: Simpler to maintain, faster to develop, no workspace complexity
   - Trade-offs: Less separation of concerns, but not needed for single app

2. **Supabase vs Custom Backend**: Choosing Supabase
   - Alternatives considered: Firebase, Custom Node.js backend
   - Rationale: Built-in auth, realtime, storage, and RLS
   - Trade-offs: Vendor lock-in, but massive time savings

3. **Tamagui for UI**: Native-performance UI library
   - Alternatives considered: NativeBase, React Native Elements, custom
   - Rationale: Best performance, great DX, built for RN
   - Trade-offs: Learning curve, but worth it for 60fps

4. **Authentication Deferred**: OAuth moved to Epic 2
   - Alternatives considered: Include in Epic 1
   - Rationale: Keep Epic 1 focused on pure infrastructure
   - Trade-offs: Need placeholder auth for development

5. **Light Theme Design**: Warm, clean aesthetic
   - Alternatives considered: Dark theme
   - Rationale: Friendly, approachable feel for social betting
   - Trade-offs: Higher battery usage on OLED screens

### Dependencies
**External Dependencies**:
- Expo SDK 50 - Core framework
- Tamagui - UI components
- Supabase JS Client - Backend integration
- TypeScript - Type safety
- Bun - Package management and runtime

**Internal Dependencies**:
- Requires: None (first epic)
- Provides: Foundation for all future epics

## Implementation Notes

### Important Documentation References
Each sprint includes links to the relevant documentation sections. Always refer to:
- **[database.md](.pm/docs/database.md)** for exact schema, RLS policies, and functions
- **[ui-ux.md](.pm/docs/ui-ux.md)** for exact design specs, colors, and component details  
- **[mock.md](.pm/docs/mock.md)** for mock user personalities and data generation patterns
- **[PRD.md](.pm/docs/PRD.md)** for overall project context

### File Structure for Epic
```
snapfade/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Auth group
│   ├── (tabs)/            # Main app tabs
│   ├── profile/[id].tsx   # Dynamic routes
│   └── _layout.tsx        # Root layout
├── components/            # UI components
├── hooks/                 # React hooks
├── services/              # API/Supabase
├── stores/                # Zustand stores
├── utils/                 # Helpers
├── types/                 # TypeScript
├── assets/                # Media files
├── scripts/               # Dev scripts
│   ├── setup-db.ts       # Database setup
│   └── seed-users.ts     # Mock user creation
├── supabase/             # Supabase config
│   ├── migrations/       # SQL migrations
│   └── seed.sql         # Seed data
├── app.json              # Expo config
├── eas.json              # EAS Build config
├── package.json          # Dependencies
└── tsconfig.json         # TypeScript
```

### API Endpoints Added
| Method | Path | Purpose | Sprint |
|--------|------|---------|--------|
| - | Supabase Auth endpoints | OAuth handling | 01.01 |
| - | Supabase Storage | Media storage | 01.01 |
| - | Supabase Realtime | Subscriptions | 01.01 |

### Data Model Changes
```sql
-- Core tables to be created in Sprint 01.01
-- users, profiles, bankrolls, follows
-- See database-design.md for full schema
```

### Key Functions/Components Created
- `createSupabaseClient()` - Initialize Supabase - Sprint 01.01
- `AppNavigator` - Main navigation structure - Sprint 01.02
- `SnapFadeTheme` - Tamagui theme with warm colors - Sprint 01.02
- `TabBar` - Custom tab bar with raised camera button - Sprint 01.02
- `DrawerContent` - Profile drawer component - Sprint 01.02
- `seedMockUsers()` - Create test data - Sprint 01.03

## Sprint Execution Log

### Sprint 01.00: Project Setup
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 01.01: Database & Backend
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 01.02: Navigation & Theme
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

### Sprint 01.03: Mock Data & Scripts
**Status**: NOT STARTED
**Summary**: [To be completed]
**Key Decisions**: [To be completed]
**Issues Encountered**: [To be completed]

## Testing & Quality

### Testing Approach
- Manual testing for this epic (infrastructure focus)
- Verify database connections
- Test navigation flows
- Ensure theme applies correctly
- Validate mock data generation

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
- [ ] Development environment fully functional
- [ ] Database schema deployed and tested
- [ ] Navigation structure implemented
- [ ] Theme system working correctly
- [ ] Mock data successfully seeded
- [ ] Documentation updated
- [ ] No critical bugs remaining
- [ ] Ready for Epic 2 (Authentication)

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

## Deferred Features

### Features Deferred to Later Epics
- **Materialized Views** (user_stats, daily_leaderboard) → Epic 4 or 6
  - Not needed for basic infrastructure
  - Better to implement when we have real usage patterns
- **pg_cron Extension** → Epic 6
  - Scheduled jobs not needed until polish phase
  - Can use manual scripts initially
- **Activity Simulator Scripts** → Post-MVP
  - Complex automation adds unnecessary complexity
  - Manual testing sufficient for development
- **Demo Scenario Scripts** → Epic 10
  - Better suited for launch preparation
  - Need full app to create meaningful demos

---

## Detailed Sprint Plans

### Sprint 01.00: Project Setup (2 hours)

**Objectives**:
- Organize existing Expo project with clean folder structure
- Set up Expo Router for navigation
- Configure development environment
- Maintain existing project configuration

**Tasks**:
1. [ ] Create organized folder structure (components, services, types, etc.)
2. [ ] Move existing code to appropriate folders
3. [ ] Set up Expo Router with app directory
4. [ ] Configure TypeScript paths for clean imports
5. [ ] Update ESLint and Prettier configuration
6. [ ] Create .env.example file
7. [ ] Create supabase and scripts directories
8. [ ] Test that existing project still runs

**Success Criteria**:
- Can run `bun install`
- Can run `bun run start`
- TypeScript compilation works
- Clean import paths (e.g., `@/components/Button`)
- Linting passes
- Existing app functionality preserved

---

### Sprint 01.01: Database & Backend Setup (3 hours)

**Objectives**:
- Create Supabase project
- Design and deploy database schema
- Set up Row Level Security policies
- Configure storage buckets
- Create Supabase client package
- Plan mock odds data structure

**Tasks**:
1. [ ] Create new Supabase project
2. [ ] Design database schema (users, profiles, bankrolls, etc.)
3. [ ] Write migration files for all tables
4. [ ] Implement RLS policies for security
5. [ ] Create storage buckets for media
6. [ ] Set up Supabase client in packages/supabase
7. [ ] Generate TypeScript types from schema
8. [ ] Design mock odds data structure following The Odds API spec
9. [ ] Test database connections

**Success Criteria**:
- All tables created successfully
- RLS policies prevent unauthorized access
- Can upload/retrieve from storage
- TypeScript types match schema
- Mock odds structure defined

---

### Sprint 01.02: Navigation & Theme (2 hours)

**Objectives**:
- Install and configure Tamagui
- Set up Expo Router navigation
- Create base layout with drawer and tabs
- Implement SnapFade theme

**Tasks**:
1. [ ] Install Tamagui and dependencies
2. [ ] Configure Tamagui with Expo
3. [ ] Create theme with SnapFade colors:
   - Primary: Emerald (#059669)
   - Background: Warm off-white (#FAF9F5)
   - Surface: White (#FFFFFF)
   - Tail: Bright Blue (#3B82F6)
   - Fade: Orange (#FB923C)
4. [ ] Set up Expo Router file structure
5. [ ] Create drawer navigation (left side)
6. [ ] Create bottom tab navigation with raised camera button
7. [ ] Add placeholder screens for all routes
8. [ ] Implement header with SnapFade logo (emerald)

**Success Criteria**:
- Theme colors match warm, light design system
- Can navigate between all placeholder screens
- Drawer opens from left with profile info
- Bottom tabs show correct icons with emerald active state
- Camera button is raised with emerald background

---

### Sprint 01.03: Mock Data & Scripts (1 hour)

**Objectives**:
- Create scripts for database management
- Generate 30 mock users with personalities
- Set up admin tools for development
- Prepare for testing future features

**Tasks**:
1. [ ] Create seed-mock-data.ts script using mock.md strategy
2. [ ] Generate 30 unique mock users with personalities
3. [ ] Assign betting personalities (sharp, square, fade material, etc.)
4. [ ] Create initial follow relationships
5. [ ] Set up mock bankrolls ($1,000 each)
6. [ ] Create setup-db.ts for easy reset
7. [ ] Create initial mock games data
8. [ ] Document script usage
9. [ ] Test data generation

**Success Criteria**:
- 30 mock users in database with is_mock flag
- Each user has personality type and behavior patterns
- Follow relationships established
- Mock games available for testing
- Can reset database easily

---

*Epic Started: -*  
*Epic Completed: -*  
*Total Duration: -* 