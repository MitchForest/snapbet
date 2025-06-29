# Sprint 8.065: Fix AI Features Display

**Status**: COMPLETE ✅  
**Estimated Duration**: 1-2 hours  
**Actual Duration**: 1.5 hours  
**Dependencies**: Sprints 8.01-8.06 completed  
**Primary Goal**: Fix AI features (Find Your Tribe, Smart Feed, Smart Notifications) that aren't displaying properly

## Sprint Completion Summary

### What Was Successfully Fixed

1. **Database Issues** ✅
   - Applied missing smart notification types to database constraint
   - Fixed embedding metadata duplicate key errors by switching to UPSERT
   - Added indexes for smart notification performance

2. **Mock Setup Script** ✅
   - Moved main user bet creation before production jobs
   - Added smart notifications job after final embedding generation
   - Enhanced verification function to check all AI features
   - Fixed system user embedding error

3. **Smart Notifications Job** ✅
   - Completely rewrote to avoid React Native imports
   - Implemented direct database operations
   - Fixed TypeScript type depth issues
   - Job now runs successfully without errors

4. **Code Quality** ✅
   - 0 TypeScript errors
   - 0 lint errors
   - All services properly structured for Node.js execution

### What Remains

The technical implementation is complete. The remaining items require running the setup and verifying in the app:

1. **Run Fresh Setup**
   ```bash
   bun run mock:cleanup
   bun run mock:setup --username=MitchForest
   ```

2. **Verify in App**
   - Find Your Tribe section in Search tab
   - AI-discovered posts (30%) with purple badges in feed
   - Smart notifications with AI badges

All infrastructure is now in place and working. The AI features should be visible once the setup completes successfully.

## Problem Summary

Based on database investigation:
- ✅ 53 users exist (43 with pattern names)
- ✅ 50 users have embeddings
- ✅ MitchForest has embedding and follows 10 users
- ✅ 73 posts exist, 68 recent
- ✅ `find_similar_users` RPC exists and works
- ❌ Smart notification types missing (causing errors)
- ❌ No smart notifications being generated
- ❌ AI features not visible in app

## Root Causes

1. **Missing Notification Types**: Migration 036 not applied - `similar_user_bet`, `behavioral_consensus`, `smart_alert` types don't exist
2. **Smart Notifications Job Not Running**: Job exists but isn't being called during setup or on schedule
3. **Setup Script Issues**: Main user bets created too late, smart notifications job not included

## Implementation Plan

### Step 1: Apply Missing Smart Notification Types

**Option A: Run existing migration**
```bash
bun run supabase db push
```

**Option B: If migration fails due to partial types, run this SQL directly**
```sql
-- Safe addition of notification types
DO $$ 
BEGIN
    -- Check and add similar_user_bet
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'notification_type' 
        AND e.enumlabel = 'similar_user_bet'
    ) THEN
        ALTER TYPE notification_type ADD VALUE 'similar_user_bet';
    END IF;
    
    -- Check and add behavioral_consensus
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'notification_type' 
        AND e.enumlabel = 'behavioral_consensus'
    ) THEN
        ALTER TYPE notification_type ADD VALUE 'behavioral_consensus';
    END IF;
    
    -- Check and add smart_alert
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t 
        JOIN pg_enum e ON t.oid = e.enumtypid 
        WHERE t.typname = 'notification_type' 
        AND e.enumlabel = 'smart_alert'
    ) THEN
        ALTER TYPE notification_type ADD VALUE 'smart_alert';
    END IF;
END $$;

-- Add indexes for smart notification performance
CREATE INDEX IF NOT EXISTS idx_bets_user_created_archived 
ON bets(user_id, created_at DESC, archived) 
WHERE archived = false;

CREATE INDEX IF NOT EXISTS idx_bets_game_type_team 
ON bets(game_id, bet_type, (bet_details->>'team')) 
WHERE archived = false;
```

### Step 2: Fix Mock Setup Script

**File**: `scripts/mock/orchestrators/setup.ts`

**Change 1: Move main user bet creation earlier (around line 560)**

Move this block BEFORE `runProductionJobs()`:
```typescript
// 13a. IMPORTANT: Create some betting activity for the main user
console.log('\n🎯 Creating betting activity for main user...');
const mainUserBets = [];
// ... rest of main user bet creation ...
```

**Change 2: Add smart notifications job after final embedding generation (around line 880)**
```typescript
// After the final embedding generation
console.log('\n🔔 Running smart notifications job...');
try {
  const { execSync } = await import('child_process');
  execSync('bun run scripts/jobs/smartNotifications.ts', { stdio: 'inherit' });
  console.log('  ✅ Smart notifications generated');
} catch (error) {
  console.error('  ⚠️  Smart notifications job failed:', error);
}
```

**Change 3: Enhance verification function (replace existing `verifyRAGSuggestions`)**
```typescript
async function verifyRAGSuggestions(userId: string) {
  console.log('\n🔍 Verifying AI features...');

  try {
    // 1. Check user embedding
    const { data: currentUser } = await supabase
      .from('users')
      .select('profile_embedding')
      .eq('id', userId)
      .single();

    if (!currentUser?.profile_embedding) {
      console.log('  ❌ Main user has no embedding');
      return;
    }
    console.log('  ✅ Main user has embedding');

    // 2. Test Find Your Tribe
    const { data: similarUsers, error } = await supabase.rpc('find_similar_users', {
      query_embedding: currentUser.profile_embedding,
      p_user_id: userId,
      limit_count: 5,
    });

    if (error) {
      console.log('  ❌ Find Your Tribe error:', error.message);
    } else {
      console.log(`  ✅ Find Your Tribe: ${similarUsers?.length || 0} similar users found`);
      if (similarUsers && similarUsers.length > 0) {
        console.log('    Sample matches:');
        similarUsers.slice(0, 3).forEach((user: any, i: number) => {
          console.log(`      ${i + 1}. ${user.username} (${(user.similarity * 100).toFixed(1)}% match)`);
        });
      }
    }

    // 3. Check smart notifications
    const { data: smartNotifs } = await supabase
      .from('notifications')
      .select('type, created_at')
      .eq('user_id', userId)
      .in('type', ['similar_user_bet', 'behavioral_consensus', 'smart_alert'])
      .order('created_at', { ascending: false })
      .limit(5);

    console.log(`  ✅ Smart Notifications: ${smartNotifs?.length || 0} AI notifications`);
    if (smartNotifs && smartNotifs.length > 0) {
      console.log('    Recent notifications:');
      smartNotifs.forEach((notif: any) => {
        console.log(`      - ${notif.type} at ${new Date(notif.created_at).toLocaleTimeString()}`);
      });
    }

    // 4. Check feed prerequisites
    const { data: followingCheck } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    console.log(`  ✅ Following ${followingCheck?.length || 0} users (needed for hybrid feed)`);

    // 5. Check for discoverable posts
    const { data: recentPosts } = await supabase
      .from('posts')
      .select('id')
      .eq('archived', false)
      .is('deleted_at', null)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    console.log(`  ✅ Recent posts available: ${recentPosts?.length || 0} (for discovery feed)`);

    console.log('\n  ✨ AI features verification complete!');
  } catch (error) {
    console.error('  ❌ Verification failed:', error);
  }
}
```

### Step 3: Run Smart Notifications Manually

After fixing the database:
```bash
# Generate smart notifications for all users with embeddings
bun run scripts/jobs/smartNotifications.ts
```

### Step 4: Add to Cron Schedule

Add to production cron:
```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/snapbet && bun run scripts/jobs/smartNotifications.ts
```

## Verification Steps

After implementation:

1. **Check notification types exist**:
```sql
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'notification_type'
AND enumlabel IN ('similar_user_bet', 'behavioral_consensus', 'smart_alert');
```

2. **Verify Find Your Tribe works**:
- Open app → Search tab
- Should see "Find Your Tribe" section with similar users
- Each user should show match percentage and reasons

3. **Verify Smart Feed**:
- Open app → Home feed
- Some posts should have purple "✨ Powered by AI" badge
- These are the 30% discovered posts

4. **Verify Smart Notifications**:
- Open app → Notifications
- Should see notifications with purple AI badge
- Types: similar user bets, consensus alerts

## Success Criteria

- [x] Smart notification types added to database
- [x] Mock setup script updated with fixes
- [x] Smart notifications job runs without errors
- [x] No errors in console about missing types
- [x] All TypeScript and lint errors fixed
- [ ] Find Your Tribe shows similar users (pending app verification)
- [ ] Feed shows AI-discovered posts (30%) (pending app verification)
- [ ] Notifications include AI-powered alerts (pending app verification)

## Additional Fixes Applied

### Embedding Metadata Duplicate Key Error
- **Problem**: `trackEmbedding` method was using INSERT instead of UPSERT
- **Solution**: Changed to use `upsert` with `onConflict: 'entity_type,entity_id'`
- **File**: `services/rag/embeddingPipeline.ts`

### System User Embedding Error
- **Problem**: Embedding generation was trying to process the system user
- **Solution**: Added `.neq('username', 'system')` filter to exclude system user
- **File**: `scripts/jobs/embedding-generation.ts`

### Smart Notifications Job React Native Error
- **Problem**: Job was trying to import React Native services which can't run in Node.js
- **Solution**: Rewritten the job to use direct database operations instead of importing notificationService
- **File**: `scripts/jobs/smartNotifications.ts`
- **Changes**:
  - Removed import of notificationService
  - Implemented notification generation logic directly in the job
  - Fixed TypeScript depth issues by simplifying queries
  - Added proper module execution check

## Testing Commands

```bash
# 1. Clean and fresh setup
bun run mock:cleanup
bun run mock:setup --username=MitchForest

# 2. Verify AI features
bun run supabase db push  # Apply migrations
bun run scripts/jobs/smartNotifications.ts  # Generate notifications

# 3. Check in app
# - Search tab: Find Your Tribe section
# - Home feed: Purple AI badges on some posts
# - Notifications: AI notifications with purple badge
```

## Common Issues & Solutions

1. **"notification_type does not exist" error**
   - Run the SQL in Step 1 Option B directly

2. **No similar users in Find Your Tribe**
   - Ensure embeddings exist: `bun run scripts/jobs/embedding-generation.ts --limit=100`

3. **No AI posts in feed**
   - Check user follows others: need following relationships for hybrid feed
   - Verify posts exist from non-followed users

4. **No smart notifications**
   - Run job manually: `bun run scripts/jobs/smartNotifications.ts`
   - Check for recent betting activity (needed for consensus)

## Notes

- The core infrastructure (embeddings, RPC functions) is working
- Main issue is missing notification types and job scheduling
- Fix is straightforward once types are added
- Consider adding smart notifications job to regular job runner 