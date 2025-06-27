# Badge Display Fix Investigation

## Current Issue
Badges are not displaying on user profiles despite the calculation and display components appearing to be properly implemented.

## Investigation Steps

### 1. Immediate Fix - Color Token Issue
The ProfileHeader component has a hardcoded `$emerald` color that doesn't exist in the theme.

**Location**: `components/profile/ProfileHeader.tsx` line 167
```tsx
// Current (broken):
backgroundColor="$emerald"

// Should be:
backgroundColor="$primary"
```

### 2. Check Database Functions

#### Verify RPC Functions Exist
```sql
-- Check if weekly stats function exists
SELECT proname, pronargs 
FROM pg_proc 
WHERE proname IN ('get_user_weekly_stats', 'get_week_start', 'get_week_end', 'check_perfect_nfl_sunday');

-- Check if user_badges table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'user_badges';
```

### 3. Debug Badge Calculation

Add logging to `services/badges/weeklyBadgeService.ts`:

```typescript
export async function calculateWeeklyBadges(userId: string): Promise<string[]> {
  console.log('[Badge Debug] Calculating badges for user:', userId);
  
  try {
    // Get user's weekly stats using the database function
    const { data: statsData, error: statsError } = await supabase.rpc('get_user_weekly_stats', {
      p_user_id: userId,
    });

    console.log('[Badge Debug] Stats data:', statsData);
    console.log('[Badge Debug] Stats error:', statsError);

    if (statsError || !statsData || (statsData as WeeklyStats[]).length === 0) {
      console.error('[Badge Debug] Error fetching weekly stats:', statsError);
      return [];
    }

    const stats = (statsData as WeeklyStats[])[0];
    const badges: string[] = [];
    
    console.log('[Badge Debug] User stats:', {
      current_streak: stats.current_streak,
      profit: stats.profit,
      win_rate: stats.win_rate,
      total_bets: stats.total_bets,
      total_wagered: stats.total_wagered,
      picks_posted: stats.picks_posted
    });

    // ... rest of badge calculation logic
    
    console.log('[Badge Debug] Calculated badges:', badges);
    return badges;
  } catch (error) {
    console.error('[Badge Debug] Error in calculateWeeklyBadges:', error);
    return [];
  }
}
```

### 4. Check Badge Data Flow

#### In Profile Page (`app/(drawer)/profile/[username].tsx`):
```typescript
// Add logging around line 145
if (bankrollData) {
  console.log('[Profile Debug] Fetching badges for user:', user.id);
  const { calculateUserBadges } = await import('@/services/badges/badgeService');
  const userBadges = await calculateUserBadges(user.id);
  console.log('[Profile Debug] Badges received:', userBadges);
  setBadges(userBadges);
}
```

#### In ProfileHeader (`components/profile/ProfileHeader.tsx`):
```typescript
// Add logging around line 175
{showStats && badges.length > 0 && (
  <View marginBottom="$3">
    {console.log('[ProfileHeader Debug] Rendering badges:', badges)}
    <WeeklyBadgeGrid badges={badges} />
  </View>
)}
```

### 5. Manual Badge Testing

If badges aren't calculating due to lack of data, manually insert test badges:

```sql
-- Insert test badges for a user
INSERT INTO user_badges (user_id, badge_id, week_start_date, weekly_reset_at, earned_at)
VALUES 
  ('USER_ID_HERE', 'hot_streak', CURRENT_DATE - INTERVAL '0 days' - (EXTRACT(DOW FROM CURRENT_DATE) || ' days')::INTERVAL, CURRENT_DATE + INTERVAL '7 days' - (EXTRACT(DOW FROM CURRENT_DATE) || ' days')::INTERVAL, NOW()),
  ('USER_ID_HERE', 'profit_machine', CURRENT_DATE - INTERVAL '0 days' - (EXTRACT(DOW FROM CURRENT_DATE) || ' days')::INTERVAL, CURRENT_DATE + INTERVAL '7 days' - (EXTRACT(DOW FROM CURRENT_DATE) || ' days')::INTERVAL, NOW());
```

### 6. Verify Badge Display Component

Check if `WEEKLY_BADGES` data exists:

```typescript
// In data/weeklyBadges.ts
console.log('[Badge Debug] Available badges:', Object.keys(WEEKLY_BADGES));
```

## Common Issues and Solutions

### Issue 1: Missing RPC Functions
**Solution**: Create the missing database functions

```sql
-- Create get_user_weekly_stats function
CREATE OR REPLACE FUNCTION get_user_weekly_stats(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  week_start DATE,
  total_bets INT,
  wins INT,
  losses INT,
  win_rate DECIMAL,
  total_wagered INT,
  total_won INT,
  profit INT,
  current_streak INT,
  picks_posted INT,
  days_since_last_post INT,
  tail_profit_generated INT,
  fade_profit_generated INT
) AS $$
BEGIN
  -- Implementation here
END;
$$ LANGUAGE plpgsql;
```

### Issue 2: No Badge Data
**Solution**: Ensure badge calculation runs after bets are settled

### Issue 3: Privacy Settings Blocking Display
**Solution**: Check if `showStats` is true in ProfileHeader

## Testing Plan

1. **Fix color token issue first**
2. **Add debug logging**
3. **Check database for badge data**
4. **Manually test with inserted badges**
5. **Verify calculation logic with real data**
6. **Remove debug logging once fixed** 