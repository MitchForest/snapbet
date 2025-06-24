# Epic 01: Foundation & Infrastructure Tracker

## Epic Overview

**Status**: COMPLETED  
**Start Date**: Dec 2024  
**Target End Date**: Day 1 (end)  
**Actual End Date**: Dec 2024

**Epic Goal**: Set up the complete development environment, core architecture, and foundational infrastructure for the SnapBet mobile app.

**User Stories Addressed**:
- Story 1-6: This epic enables all stories by providing the foundational infrastructure

**PRD Reference**: Technical Architecture, Repository Structure sections

## Sprint Breakdown

| Sprint # | Sprint Name | Status | Start Date | End Date | Key Deliverable |
|----------|-------------|--------|------------|----------|-----------------|
| 01.00 | Project Setup | APPROVED | Dec 2024 | Dec 2024 | Working Expo dev environment |
| 01.01 | Database & Backend | APPROVED | Dec 2024 | Dec 2024 | Complete Supabase setup |
| 01.02 | Navigation & Theme | APPROVED | Dec 2024 | Dec 2024 | App navigation with Tamagui |
| 01.03 | Mock Data & Scripts | APPROVED | Dec 2024 | Dec 2024 | 30 mock users and admin tools |

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

### File Structure for Epic
```
snapbet/
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
- `SnapBetTheme` - Tamagui theme with warm colors - Sprint 01.02
- `TabBar` - Custom tab bar with raised camera button - Sprint 01.02
- `DrawerContent` - Profile drawer component - Sprint 01.02
- `seedMockUsers()` - Create test data - Sprint 01.03

## Sprint Execution Log

### Sprint 01.00: Project Setup
**Status**: APPROVED
**Summary**: Successfully reorganized project structure, configured TypeScript path aliases, and set up ESLint v9 with flat config.
**Key Decisions**: 
- Kept simple single-package structure instead of monorepo
- Used path aliases (@/) for cleaner imports
- Migrated to ESLint v9 flat config
**Issues Encountered**: 
- Initial plan for monorepo was rejected in favor of simplicity

### Sprint 01.01: Database & Backend
**Status**: APPROVED
**Summary**: Successfully deployed complete database schema with 15 tables, RLS policies, storage buckets, and TypeScript integration. Fixed TypeScript error in test connection script.
**Key Decisions**: 
- Used cents (integers) for all monetary values
- Added mock user support columns (is_mock, mock_personality_id, mock_behavior_seed)
- Generated TypeScript types from database schema
- Created .prettierignore to exclude generated files (types/supabase.ts)
**Issues Encountered**: 
- TypeScript error in test-connection.ts (fixed with proper typing)
- Prettier formatting issues in generated types file (resolved by adding .prettierignore)

### Sprint 01.02: Navigation & Theme
**Status**: APPROVED
**Summary**: Implemented complete navigation structure with Tamagui theme system, custom tab bar with raised camera button, and all placeholder screens.
**Key Decisions**: 
- Drawer wraps tabs for better navigation hierarchy
- Custom TabBar component for raised camera button design
- Fixed Tamagui babel configuration
- Used system fonts (Inter) for native feel
**Issues Encountered**: 
- Tamagui babel plugin needed configuration fix
- Minor warnings about color literals (acceptable for now)

### Sprint 01.03: Mock Data & Scripts
**Status**: APPROVED
**Summary**: Created comprehensive mock data system with 30 personality-driven users, database management scripts, and realistic social activity generation.
**Key Decisions**: 
- NBA-only games initially (NFL can be added later)
- 12 personality types distributed across 30 users
- Safety features with --force and --dry-run flags
- Realistic social graph with popular sharps
**Issues Encountered**: 
- Supabase delete operations don't return count
- Fixed game deletion query syntax

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
- Bun package manager is fast and reliable
- Tamagui provides excellent performance and DX
- Supabase setup was straightforward
- Mock data system enables realistic testing
- Simple folder structure keeps things organized

### Challenges Faced
- Tamagui babel configuration required manual path setup
- TypeScript types for navigation needed careful typing
- Supabase delete operations don't return counts
- Balancing mock user personalities to exactly 30

### Gotchas for Future Development
- Always prefix unused parameters with underscore for ESLint
- Use Tamagui theme tokens instead of color literals
- Generated files should be in .prettierignore
- Supabase admin operations need service key
- Mock users are clearly marked with is_mock flag

## Epic Completion Checklist

- [x] All planned sprints completed and approved
- [x] Development environment fully functional
- [x] Database schema deployed and tested
- [x] Navigation structure implemented
- [x] Theme system working correctly
- [x] Mock data successfully seeded
- [x] Documentation updated
- [x] No critical bugs remaining
- [x] Ready for Epic 2 (Authentication)

## Epic Summary for Project Tracker

**Epic 01 successfully established the complete foundation for SnapBet development.**

**Delivered Features**:
- Complete Expo development environment with TypeScript
- Supabase backend with 15 tables, RLS policies, and storage
- Tamagui UI system with warm, light theme
- Navigation structure (Drawer → Tabs) with all screens
- Mock data system with 30 personality-driven users
- Admin scripts for database management
- Clean codebase with no linting or type errors

**Key Architectural Decisions**:
- Simple single-package structure (no monorepo)
- Bun for package management
- Cents for monetary values (avoid float issues)
- Mock user columns in main users table
- Custom TabBar for raised camera button
- Tamagui for consistent theming

**Critical Learnings**:
- Tamagui babel configuration needs explicit path
- Supabase delete operations don't return counts
- ESLint v9 flat config simplifies setup
- Generated TypeScript types need .prettierignore

**Technical Debt Created**:
- Auth storage using placeholder (TODO in supabase client)
- Some Tamagui components could be further optimized
- Mock avatar URLs are placeholders
- No automated tests yet

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
- Restructure existing Expo project into monorepo
- Set up monorepo structure with bun workspaces
- Configure development environment
- Maintain existing project configuration

**Tasks**:
1. [ ] Move existing Expo project to apps/mobile directory
2. [ ] Set up bun workspaces in root package.json
3. [ ] Create packages/shared and packages/supabase directories
4. [ ] Update TypeScript config for monorepo structure
5. [ ] Update ESLint and Prettier for monorepo
6. [ ] Update paths and imports
7. [ ] Create .env.example file
8. [ ] Test that existing project still runs

**Success Criteria**:
- Can run `bun install` from root
- Can run `cd apps/mobile && bun run start`
- TypeScript compilation works
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
- Implement SnapBet theme

**Tasks**:
1. [ ] Install Tamagui and dependencies
2. [ ] Configure Tamagui with Expo
3. [ ] Create theme with SnapBet colors:
   - Primary: Emerald (#059669)
   - Background: Warm off-white (#FAF9F5)
   - Surface: White (#FFFFFF)
   - Tail: Bright Blue (#3B82F6)
   - Fade: Orange (#FB923C)
4. [ ] Set up Expo Router file structure
5. [ ] Create drawer navigation (left side)
6. [ ] Create bottom tab navigation with raised camera button
7. [ ] Add placeholder screens for all routes
8. [ ] Implement header with SnapBet logo (emerald)

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