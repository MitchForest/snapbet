# Sprint 04.02: Search & Discovery Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 4 - Feed & Social Engagement

**Sprint Goal**: Build the search tab with user search functionality and curated discovery sections to help users find interesting bettors to follow.

**User Story Contribution**: 
- Enables Story 5: The Missing My People Problem - Discovery features to find like-minded bettors
- Enables Story 4: The Isolation Problem - Help users build their network

## Sprint Plan

### Objectives
1. Create search screen with animated search bar
2. Implement user search with real-time results
3. Build discovery sections (Hot Bettors, Trending Picks, Fade Material, etc.)
4. Add recent searches with local storage
5. Create user cards with quick follow actions
6. Implement search debouncing for performance
7. Add loading states for each section
8. Cache discovery data for quick access

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(drawer)/(tabs)/search.tsx` | Complete search/discovery screen | NOT STARTED |
| `hooks/useSearch.ts` | Search logic and state management | NOT STARTED |
| `hooks/useDiscovery.ts` | Discovery sections data fetching | NOT STARTED |
| `components/search/SearchBar.tsx` | Animated search input component | NOT STARTED |
| `components/search/UserSearchCard.tsx` | User result card with follow button | NOT STARTED |
| `components/search/DiscoverySection.tsx` | Reusable discovery section component | NOT STARTED |
| `components/search/RecentSearches.tsx` | Recent searches component | NOT STARTED |
| `services/search/searchService.ts` | Search and discovery API calls | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/(tabs)/_layout.tsx` | Ensure search tab is properly configured | NOT STARTED |

### Implementation Approach

1. **Search Screen Structure**:
   ```
   SearchScreen
   ├── SearchBar (sticky top)
   ├── RecentSearches (when no query)
   └── ScrollView
       ├── SearchResults (when searching)
       └── DiscoverySections (when not searching)
           ├── Hot Bettors
           ├── Trending Picks
           ├── Fade Material
           └── Rising Stars
   ```

2. **Search Implementation**:
   - Debounce search input by 300ms
   - Search users by username and display_name
   - Show loading spinner during search
   - Display "No results" for empty searches
   - Limit to 20 results initially

3. **Discovery Sections**:
   - **Hot Bettors**: Users with highest win rate this week (min 5 bets)
   - **Trending Picks**: Most tailed picks in last 24 hours
   - **Fade Material**: Users with worst performance (entertainment value)
   - **Rising Stars**: New users (<7 days) with good early record

4. **Recent Searches**:
   - Store last 10 searches in MMKV
   - Show when search bar is focused but empty
   - Allow clearing individual or all searches

**Key Technical Decisions**:
- Use MMKV for recent searches (already in project)
- 300ms debounce balances responsiveness and server load
- Separate discovery queries to allow independent refresh
- Quick follow buttons use optimistic updates

### Dependencies & Risks
**Dependencies**:
- User search requires database indexes on username/display_name
- Discovery algorithms need performance metrics
- Follow functionality from existing services

**Identified Risks**:
- Discovery queries could be slow without proper indexes
- Need to handle users with no stats gracefully
- Discovery sections might be empty for new deployments

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates

**Reality Check 1** - [Date]
- Issue: [What wasn't working]
- Options Considered:
  1. [Option 1] - Pros/Cons
  2. [Option 2] - Pros/Cons
- Decision: [What was chosen]
- Plan Update: [How sprint plan changed]
- Epic Impact: [Any epic updates needed]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: [Should be 0 errors]

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: [Should be 0 errors]

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### New Functions/Components
```typescript
// hooks/useSearch.ts
export function useSearch() {
  // Purpose: Handle user search with debouncing
  // Returns: { query, setQuery, results, isSearching }
}

// hooks/useDiscovery.ts
export function useDiscovery() {
  // Purpose: Fetch and manage discovery sections
  // Returns: { hotBettors, trendingPicks, fadeMaterial, isLoading }
}

// services/search/searchService.ts
export async function searchUsers(query: string) {
  // Purpose: Search users by username or display name
  // Returns: User[] with stats
}

export async function getHotBettors(limit: number = 10) {
  // Purpose: Get top performing users this week
  // Returns: User[] with performance metrics
}
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| GET | /search/users | `{ q: string }` | `{ users: User[] }` | PLANNED |
| GET | /discover/hot-bettors | `{ limit: number }` | `{ users: User[] }` | PLANNED |
| GET | /discover/trending-picks | `{ limit: number }` | `{ picks: Pick[] }` | PLANNED |
| GET | /discover/fade-material | `{ limit: number }` | `{ users: User[] }` | PLANNED |

### State Management
- Search query in useSearch hook
- Recent searches in MMKV
- Discovery data cached with React Query (5 min cache)
- Follow states managed optimistically

## Testing Performed

### Manual Testing
- [ ] Search returns relevant users
- [ ] Search debouncing works (300ms)
- [ ] Recent searches persist across app restarts
- [ ] Discovery sections load independently
- [ ] Follow buttons work from search results
- [ ] Empty states display appropriately
- [ ] Pull-to-refresh updates discovery sections

### Edge Cases Considered
- Empty search query: Show discovery sections
- No search results: Show helpful empty state
- User already following: Show "Following" state
- Discovery section empty: Show appropriate message
- Offline mode: Show cached discovery data

## Documentation Updates

- [ ] Search algorithm documented
- [ ] Discovery section criteria documented
- [ ] MMKV usage for recent searches documented
- [ ] API endpoint documentation updated

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `[file1.ts]` - [Purpose]

**Modified**:
- `[file3.ts]` - [What changed and why]

### Key Decisions Made
1. [Decision]: [Rationale and impact]

### Deviations from Original Plan
- [Deviation 1]: [Why it was necessary]

### Known Issues/Concerns
- [Any issues the reviewer should know about]

### Suggested Review Focus
- Search performance with many users
- Discovery query efficiency
- UI/UX of search interactions

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: R persona  
**Review Date**: TBD

### Review Checklist
- [ ] Code matches sprint objectives
- [ ] All planned files created/modified
- [ ] Follows established patterns
- [ ] No unauthorized scope additions
- [ ] Code is clean and maintainable
- [ ] No obvious bugs or issues
- [ ] Integrates properly with existing code

### Review Outcome

**Status**: PENDING

### Feedback
[Review feedback will go here]

---

## Sprint Metrics

**Duration**: Planned 2 hours | Actual TBD  
**Scope Changes**: 0  
**Review Cycles**: 0  
**Files Touched**: TBD  
**Lines Added**: TBD  
**Lines Removed**: TBD

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: TBD*  
*Sprint Completed: TBD*  
*Final Status: NOT STARTED* 