# Sprint 8.05-8.07 Corrections Review

## Sprint 8.05-NEW Corrections

### 1. File Path Corrections
- **INCORRECT**: References to `components/feed/FeedList.tsx`
- **CORRECT**: Use `app/(drawer)/(tabs)/index.tsx` - this is the main feed screen
- **CORRECT**: Feed logic is in `hooks/useFeed.ts` and `services/feed/feedService.ts`

### 2. favorite_teams Column Confusion
- **ISSUE**: Sprint mentions removing `favorite_teams` column but later uses it in verification queries
- **REALITY**: Database has `favorite_teams` column (confirmed in migration 033)
- **RECOMMENDATION**: Either:
  - Keep the column but populate it dynamically from embeddings, OR
  - Remove it entirely and rely purely on behavioral embeddings
- **VERIFICATION QUERIES**: Should NOT check for `favorite_teams` if the sprint removes it

### 3. Integration with Existing Hooks
- **MISSING**: Should integrate with existing `useDiscovery` hook in `hooks/useDiscovery.tsx`
- **CORRECT PATTERN**: The `friendDiscoveryService` should be called by the existing discovery hook
- **UPDATE**: Modify `useDiscovery` to add a new section for "Find Your Tribe"

### 4. Component Naming
- **INCORRECT**: Creating new `SimilarUserCard` component
- **CORRECT**: Should extend/reuse existing `UserSearchCard` component from `components/search/UserSearchCard.tsx`
- **PATTERN**: Add similarity score and reasons as props to existing card

### 5. Mock Data Functions
- **MISSING IMPORTS**: References functions like `createBehavioralBettingHistory` that don't exist
- **CORRECT**: Should use existing mock data orchestrators in `scripts/mock/orchestrators/`
- **UPDATE**: The behavioral scenarios should integrate with `unified-setup.ts`

## Sprint 8.06-NEW Corrections

### 1. Feed Component References
- **INCORRECT**: References to non-existent `FeedList.tsx`
- **CORRECT**: 
  - Feed screen: `app/(drawer)/(tabs)/index.tsx`
  - Feed hook: `hooks/useFeed.ts`
  - Feed service: `services/feed/feedService.ts`

### 2. PostCard Integration
- **INCORRECT**: Shows modifications to PostCard for discovery badge
- **CORRECT**: `PostCard` is in `components/content/PostCard.tsx`
- **PATTERN**: Discovery badge should be added as an overlay, similar to existing overlays

### 3. Notification Integration
- **INCORRECT**: References generic notification patterns
- **CORRECT**:
  - Notifications screen: `app/(drawer)/notifications.tsx`
  - Notification service: `services/notifications/notificationService.ts`
  - Should integrate with existing `useNotifications` hook

### 4. Smart Feed Service Integration
- **ISSUE**: `smartFeedService` needs to integrate with existing `feedService`
- **CORRECT APPROACH**: 
  - Extend `feedService` rather than creating parallel service
  - Or have `smartFeedService` wrap/enhance `feedService`

### 5. RPC Function Names
- **INCORRECT**: Generic RPC function names that might not exist
- **VERIFY**: Check that RPC functions from Sprint 8.01 match:
  - `find_similar_users`
  - `check_bet_consensus`

## Sprint 8.07-NEW Corrections

### 1. Mock Setup Integration
- **INCORRECT**: References `setup-mock-data.ts` as new file
- **CORRECT**: Should integrate with existing `scripts/mock/orchestrators/unified-setup.ts`
- **PATTERN**: The unified setup already takes username parameter

### 2. Missing Mock Data Generators
- **ISSUE**: References many generator functions that don't exist
- **CORRECT**: Should use existing generators or create them in `scripts/mock/generators/`
- **MISSING FUNCTIONS**:
  - `createBehavioralBettingHistory`
  - `createBehavioralFollowGraph`
  - `createBehavioralPosts`
  - `createBehavioralEngagement`

### 3. Migration Number Conflict
- **INCORRECT**: Suggests creating migration 034
- **CORRECT**: Migration 034 already exists (`034_caption_generation_tracking.sql`)
- **FIX**: New migration should be 035

### 4. Performance Indexes
- **GOOD**: Index creation looks correct
- **CHECK**: Some indexes might already exist from Sprint 8.01 (migration 033)
- **VERIFY**: Use IF NOT EXISTS pattern as shown

### 5. Mock Data Command
- **INCORRECT**: `bun run mock:setup --username:USERNAME`
- **CORRECT**: `bun run scripts/mock/orchestrators/unified-setup.ts --username=USERNAME`
- **OR**: Add npm script to package.json for convenience

## General Architecture Issues

### 1. Service Layer Consistency
- **ISSUE**: Creating new services parallel to existing ones
- **RECOMMENDATION**: Extend existing services:
  - Extend `feedService` with smart feed capabilities
  - Extend `notificationService` with smart notifications
  - Add to `useDiscovery` hook for Find Your Tribe

### 2. Database Schema
- **CONFUSION**: favorite_teams column existence/removal
- **RECOMMENDATION**: Clear decision needed:
  - Option A: Keep column, populate from embeddings
  - Option B: Remove column entirely (requires migration)

### 3. Mock Data Strategy
- **GOOD**: Two-phase approach (historical + fresh)
- **ISSUE**: Many referenced functions don't exist
- **FIX**: Either create the missing generators or use existing ones

### 4. Production Jobs
- **GOOD**: Job structure looks correct
- **VERIFY**: Jobs should handle both mock and real data
- **CHECK**: Jobs should work even if no mock data exists

## Recommended Implementation Order

1. **Fix Database Schema** (Sprint 8.05)
   - Decide on favorite_teams column
   - Run any necessary migrations

2. **Update Existing Services** (Sprint 8.05-8.06)
   - Extend feedService
   - Extend notificationService
   - Update useDiscovery hook

3. **Create Mock Data Generators** (Sprint 8.07)
   - Build missing generator functions
   - Integrate with unified-setup.ts

4. **Implement UI Changes** (Sprint 8.05-8.06)
   - Add Find Your Tribe to Explore
   - Add discovery badges to posts
   - Add AI badges to notifications

5. **Create Production Jobs** (All Sprints)
   - Embedding generation
   - Smart notifications
   - Consensus detection

## Critical Integration Points

1. **Feed Integration**
   - Use existing `useFeed` hook
   - Modify `feedService.getFeedPosts()` to mix in AI content
   - Add discovery metadata to PostWithType

2. **Notification Integration**
   - Use existing notification structures
   - Add new notification types
   - Ensure push notifications work

3. **Discovery Integration**
   - Extend `useDiscovery` hook
   - Add new section for behavioral similarity
   - Reuse UserSearchCard component

4. **Mock Data Integration**
   - Use existing unified-setup.ts
   - Create generators in proper directory
   - Ensure two-phase approach works

## Production Readiness Checklist

- [ ] All RPC functions created and tested
- [ ] Indexes created for performance
- [ ] Mock data generators working
- [ ] Production jobs scheduled
- [ ] Error handling and fallbacks
- [ ] Performance monitoring in place
- [ ] Documentation updated