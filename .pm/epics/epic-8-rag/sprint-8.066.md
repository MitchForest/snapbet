# Sprint 8.066: Fix AI Features UX Issues

**Status**: IN_PROGRESS  
**Estimated Duration**: 2-3 hours  
**Dependencies**: Sprint 8.065 completed  
**Primary Goal**: Fix all UX issues with AI features (notifications, feed, follow states, real-time)

## Problem Summary

After Sprint 8.065 fixed the technical implementation, several UX issues remain:

1. **Duplicate "Powered by AI" badge** - Shows both as icon (✨) and separate badge component
2. **Smart notifications lack navigation** - Missing switch cases for AI notification types
3. **Low smart notification count** - Only 2 per type with short time windows
4. **Real-time subscription errors** - "tried to subscribe multiple times" error
5. **Follow state error** - "Already following" error when not actually following
6. **Insufficient feed content** - Posts timestamped too far apart
7. **AI posts query error** - Syntax error in discovered posts query preventing AI posts
8. **Low story count** - Only 1 story per user instead of multiple

## Root Cause Analysis

### 1. Duplicate AI Badge
- **Location**: `components/notifications/NotificationItem.tsx`
- **Lines**: Icon at 128-131, Badge at 316-327
- **Issue**: Both icon and badge component rendered

### 2. Missing Navigation Cases
- **Location**: `components/notifications/NotificationItem.tsx` line 64
- **Issue**: Switch statement missing cases for `similar_user_bet`, `behavioral_consensus`, `smart_alert`
- **Note**: Navigation data IS included by the job (actorUsername, betId)

### 3. Low Notification Volume
- **Location**: `scripts/jobs/smartNotifications.ts`
- **Lines**: 116 (slice 0,2), 157 (slice 0,2), 123 (30 min), 179 (1 hour)
- **Issue**: Hardcoded low limits and short time windows

### 4. Real-time Subscriptions
- **Location**: Various components bypassing `realtimeManager`
- **Issue**: Direct `supabase.channel()` calls instead of centralized management

### 5. Follow API Error
- **Location**: `services/api/followUser.ts` line 23
- **Issue**: Returns error on unique constraint instead of checking first

### 6. Post Timestamps
- **Location**: `scripts/mock/generators/posts.ts`
- **Lines**: 86, 115, 143, 199
- **Issue**: Posts created hours/days apart instead of minutes

### 7. AI Feed Query Error
- **Location**: `services/feed/feedService.ts` line 490
- **Issue**: `bets!inner` should be `bet:bets!bet_id`
- **Note**: Hybrid feed IS enabled by default

### 8. Story Generation
- **Location**: `scripts/mock/generators/posts.ts` lines 27-38
- **Issue**: Creates only 1 story per user
- **Config**: 15 users selected but need multiple stories each

## Implementation Plan

### Step 1: Remove Duplicate AI Badge (5 min)

**File**: `components/notifications/NotificationItem.tsx`

Delete lines 316-327:
```typescript
// DELETE THIS ENTIRE BLOCK
{(notification.type === 'similar_user_bet' ||
  notification.type === 'behavioral_consensus' ||
  notification.type === 'smart_alert') && (
  <View
    backgroundColor={Colors.ai}
    paddingHorizontal="$2"
    paddingVertical="$1"
    borderRadius="$2"
  >
    <Text fontSize={11} color="white" fontWeight="600">
      ✨ Powered by AI
    </Text>
  </View>
)}
```

### Step 2: Add Smart Notification Navigation (10 min)

**File**: `components/notifications/NotificationItem.tsx`

Add after line 64 (after the `milestone` case):
```typescript
case 'similar_user_bet':
  // Navigate to the user who placed the bet
  if (data.actorUsername) {
    router.push(`/(drawer)/profile/${data.actorUsername}`);
  }
  break;

case 'behavioral_consensus':
  // Navigate to games tab (until we have bet detail page)
  router.push('/(drawer)/(tabs)/games');
  break;

case 'smart_alert':
  // Navigate based on data
  if (data.actorUsername) {
    router.push(`/(drawer)/profile/${data.actorUsername}`);
  } else {
    router.push('/(drawer)/(tabs)/games');
  }
  break;
```

### Step 3: Increase Smart Notification Volume (15 min)

**File**: `scripts/jobs/smartNotifications.ts`

1. Line 123 - Increase time window:
```typescript
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // Was 30 minutes
```

2. Line 142 - Get more bets:
```typescript
.limit(10); // Was 5
```

3. Line 148 - Create more notifications:
```typescript
for (const bet of recentBets.slice(0, 5)) { // Was 2
```

4. Line 179 - Increase consensus window:
```typescript
const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // Was 1 hour
```

5. Line 194 - Check more user bets:
```typescript
for (const userBet of userBets.slice(0, 5)) { // Was 2
```

### Step 4: Fix Follow API Check (10 min)

**File**: `services/api/followUser.ts`

Replace entire `followUser` function (lines 3-33):
```typescript
export async function followUser(
  followingId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Check if already following first
    const alreadyFollowing = await isFollowing(followingId);
    if (alreadyFollowing) {
      return { success: true }; // Don't error, just return success
    }

    const { error } = await supabase.from('follows').insert({
      follower_id: user.id,
      following_id: followingId,
    });

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Error following user:', error);
    return { success: false, error: 'Failed to follow user' };
  }
}
```

### Step 5: Fix AI Feed Query (15 min)

**File**: `services/feed/feedService.ts`

Replace lines 488-510 in `getDiscoveredPosts`:
```typescript
// Get posts from behaviorally similar users
const { data: posts } = await this.getClient()
  .from('posts')
  .select(
    `
    *,
    user:users!user_id(
      id,
      username,
      display_name,
      avatar_url
    ),
    bet:bets!bet_id(
      id,
      bet_type,
      bet_details,
      stake,
      potential_win,
      status,
      game:games!game_id(
        id,
        sport,
        home_team,
        away_team
      )
    )
  `
  )
  .in('user_id', similarNotFollowed)
  .eq('archived', false)
  .is('deleted_at', null)
  .gte('expires_at', new Date().toISOString())
  .order('created_at', { ascending: false })
  .limit(limit * 2);

if (!posts?.length) return [];
```

### Step 6: Generate More Recent Posts (20 min)

**File**: `scripts/mock/generators/posts.ts`

1. Line 86 - User's posts timing:
```typescript
created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(), // 30 minutes apart
```

2. Line 115 - User's regular posts:
```typescript
created_at: new Date(Date.now() - i * 45 * 60 * 1000).toISOString(), // 45 minutes apart
```

3. Line 143 - Mock users' pick posts:
```typescript
const hoursAgo = i < 10 ? Math.random() * 6 : (i + 1) * 2; // More recent posts
```

4. Line 199 - Mock users' regular posts:
```typescript
created_at: new Date(Date.now() - i * 30 * 60 * 1000).toISOString(), // 30 minutes apart
```

### Step 7: Generate Multiple Stories Per User (15 min)

**File**: `scripts/mock/generators/posts.ts`

Replace lines 27-38 with:
```typescript
for (let i = 0; i < storyUsers.length; i++) {
  const user = storyUsers[i];
  // Create 1-3 stories per user
  const storyCount = Math.floor(Math.random() * 3) + 1;
  
  for (let j = 0; j < storyCount; j++) {
    const mediaCategory = allCategories[(i + j) % allCategories.length];
    
    stories.push({
      user_id: user.id,
      media_url: getRandomMediaUrl(mediaCategory),
      media_type: 'photo' as const,
      caption: j === 0 ? 'Check this out! 🔥' : j === 1 ? 'Game day vibes 🏀' : 'Let\'s go! 💪',
      created_at: new Date(Date.now() - (j * 2 + Math.random() * 4) * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + (20 - j * 2) * 60 * 60 * 1000).toISOString(),
    });
  }
}
```

### Step 8: Adjust Story User Count (5 min)

**File**: `scripts/mock/config.ts`

Line 59 - Reduce users but get more stories:
```typescript
count: 10, // Was 15, but we'll create more stories per user
```

## Testing Procedure

### 1. Clean Setup
```bash
# Run fresh mock setup
bun run mock-setup
```

### 2. Verify Notifications
- Open notifications tab
- Confirm only ✨ icon shows (no badge)
- Click each smart notification type
- Count smart notifications (should be 5-10+)

### 3. Verify Feed
- Pull to refresh home feed
- Look for posts marked "Suggested for you"
- Verify ~30% are AI-discovered posts
- Check post timestamps are recent

### 4. Test Follow Flow
- Go to Search tab → Find Your Tribe
- Click on a suggested user
- Tap Follow button
- Should change to "Following" without error

### 5. Check Stories
- Look at story bar
- Count users with stories (should be 7-10)
- Some users should have multiple dots

### 6. Monitor Console
- No real-time subscription errors
- No TypeScript errors
- No failed API calls

## Success Criteria

- [ ] No duplicate AI badges in notifications
- [ ] All smart notifications are clickable with proper navigation
- [ ] 5-10+ smart notifications generated per user
- [ ] No real-time subscription errors in console
- [ ] Follow/unfollow works without "Already following" error
- [ ] Feed shows ~30% AI-discovered posts with reasons
- [ ] 7-10 users have stories, some with multiple
- [ ] All posts are recent (within 24 hours)
- [ ] Zero TypeScript/lint errors

## Key Differences from Original Plan

1. **Navigation data already exists** - The job includes actorUsername and betId, just need switch cases
2. **Hybrid feed is already enabled** - The issue is a query syntax error (`bets!inner` → `bet:bets!bet_id`)
3. **Follow error is API-level** - Not a cache issue, need to check before insert
4. **Stories need multiple per user** - Not more users, but 1-3 stories each
5. **No complex deduplication needed** - Job runs every 5 minutes with time windows

## Notes

- Priority is fixing user-facing issues quickly
- All fixes target specific line numbers found in codebase
- No assumptions - every fix based on actual code analysis
- Focus on minimal changes that solve the problems 