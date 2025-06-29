# Sprint 8.06: Enhanced Feed & Smart Notifications

**Status**: NOT STARTED  
**Estimated Duration**: 4-5 hours  
**Dependencies**: Sprint 8.05 completed (behavioral embeddings and Find Your Tribe)  
**Primary Goal**: Mix AI content into existing feed and notifications with visual indicators

## Sprint Overview

This sprint integrates AI features INTO existing UI components:
1. **Enhanced Feed**: Mix 30% AI-discovered content INTO the regular feed (not separate)
2. **Smart Notifications**: Add AI notifications INTO the regular notification list
3. **Visual Indicators**: All AI content has AIBadge to indicate it's AI-powered

**CRITICAL INTEGRATION POINTS**:
- NO separate AI feed - discovered posts appear IN the main feed
- NO separate AI notifications - they appear IN the regular notifications list
- Users see ONE feed and ONE notification list with AI content mixed in
- Clear visual indicators (AIBadge) on all AI-suggested content

## Detailed Implementation Steps

### Part 1: Enhanced Feed Implementation (2.5 hours)

Enhance the EXISTING feed service to include 30% AI-discovered content mixed with 70% following content.

#### Step 1.1: Extend Existing Feed Service

**INTEGRATION NOTE**: We'll enhance the existing feedService rather than creating a new one.

**File**: Update `services/feed/feedService.ts`

Add smart feed capabilities to the existing service:

```typescript
import { supabase } from '@/services/supabase/client';
import { Post } from '@/types/database';

interface FeedPost extends Post {
  is_discovered?: boolean;
  discovery_reason?: string;
}

// Add to existing feedService.ts
export class FeedService {
  // ... existing code ...
  
  // Add new properties for smart feed
  private readonly FOLLOWING_RATIO = 0.7;
  private readonly DISCOVERY_RATIO = 0.3;
  
  /**
   * Get hybrid feed with 70% following, 30% discovered content
   */
  async getHybridFeed(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<FeedPost[]> {
    try {
      // Calculate splits
      const followingCount = Math.floor(limit * this.FOLLOWING_RATIO);
      const discoveryCount = limit - followingCount;
      
      // Get both types of content in parallel
      const [followingPosts, discoveredPosts] = await Promise.all([
        this.getFollowingPosts(userId, followingCount * 2), // Get extra for filtering
        this.getDiscoveredPosts(userId, discoveryCount * 2)
      ]);
      
      // Mix the feeds using insertion pattern
      const mixedFeed = this.mixFeeds(
        followingPosts, 
        discoveredPosts,
        followingCount,
        discoveryCount
      );
      
      return mixedFeed.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error getting hybrid feed:', error);
      // Fallback to following-only feed
      return this.getFollowingPosts(userId, limit, offset);
    }
  }
  
  /**
   * Get posts from users you follow (existing logic)
   */
  private async getFollowingPosts(
    userId: string, 
    limit: number,
    offset: number = 0
  ): Promise<Post[]> {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users!user_id(*),
        reactions(count),
        comments(count)
      `)
      .in('user_id', 
        supabase.from('followers')
          .select('following_id')
          .eq('follower_id', userId)
      )
      .eq('archived', false)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (error) throw error;
    return posts || [];
  }
  
  /**
   * Get AI-recommended posts based on user's behavioral patterns
   */
  private async getDiscoveredPosts(
    userId: string,
    limit: number
  ): Promise<FeedPost[]> {
    try {
      // Get user's behavioral embedding
      const { data: userProfile } = await supabase
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single();
        
      if (!userProfile?.profile_embedding) {
        return [];
      }
      
      // Find behaviorally similar users first
      const { data: similarUsers } = await supabase
        .rpc('find_similar_users', {
          query_user_id: userId,
          match_threshold: 0.65, // Slightly lower for discovery
          limit_count: 20 // Get more users to pull content from
        });
        
      if (!similarUsers?.length) return [];
      
      // Get recent posts from similar users (not followed)
      const { data: followedUsers } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', userId);
        
      const followedIds = followedUsers?.map(f => f.following_id) || [];
      const similarNotFollowed = similarUsers
        .filter(u => !followedIds.includes(u.id))
        .map(u => u.id);
        
      if (!similarNotFollowed.length) return [];
      
      // Get posts from behaviorally similar users
      const { data: posts } = await supabase
        .from('posts')
        .select(`
          *,
          user:users!user_id(*),
          reactions(count),
          comments(count),
          bets!inner(bet_type, bet_details)
        `)
        .in('user_id', similarNotFollowed)
        .eq('archived', false)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get extra for filtering
        
      if (!posts?.length) return [];
      
      // Score and rank posts based on behavioral relevance
      const scoredPosts = await this.scorePostsForUser(userId, posts);
      
      // Add discovery metadata with behavioral reasons
      return scoredPosts.slice(0, limit).map(scoredPost => ({
        ...scoredPost.post,
        is_discovered: true,
        discovery_reason: scoredPost.reason,
        relevance_score: scoredPost.score
      }));
    } catch (error) {
      console.error('Error getting discovered posts:', error);
      return [];
    }
  }
  
  /**
   * Score posts based on behavioral relevance to user
   */
  private async scorePostsForUser(
    userId: string, 
    posts: any[]
  ): Promise<Array<{post: any, score: number, reason: string}>> {
    // Get user's recent behavior for comparison
    const { data: userBehavior } = await supabase
      .from('users')
      .select(`
        bets(bet_type, bet_details, created_at),
        reactions(post_id, reaction_type),
        posts(caption)
      `)
      .eq('id', userId)
      .single();
      
    if (!userBehavior) return posts.map(p => ({
      post: p,
      score: 0.5,
      reason: 'Suggested for you'
    }));
    
    // Score each post
    const scoredPosts = posts.map(post => {
      let score = 0.5; // Base score
      let reason = 'Suggested for you';
      
      // If it's a pick post, check betting similarity
      if (post.post_type === 'pick' && post.bets?.length > 0) {
        const postBet = post.bets[0];
        const similarBets = userBehavior.bets?.filter(b => 
          b.bet_type === postBet.bet_type ||
          b.bet_details?.team === postBet.bet_details?.team
        ) || [];
        
        if (similarBets.length > 0) {
          score += 0.3;
          reason = `Similar ${postBet.bet_type} betting`;
        }
      }
      
      // Check engagement patterns
      if (post.reactions_count > 10) {
        score += 0.1;
        if (reason === 'Suggested for you') {
          reason = 'Trending with similar bettors';
        }
      }
      
      // Time-based relevance
      const hourOfDay = new Date(post.created_at).getHours();
      const userActiveHours = this.getUserActiveHours(userBehavior.bets || []);
      if (userActiveHours.includes(hourOfDay)) {
        score += 0.1;
      }
      
      return { post, score, reason };
    });
    
    // Sort by score descending
    return scoredPosts.sort((a, b) => b.score - a.score);
  }
  
  private getUserActiveHours(bets: any[]): number[] {
    const hourCounts = new Map<number, number>();
    bets.forEach(bet => {
      const hour = new Date(bet.created_at).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    
    // Get top 6 active hours
    return Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([hour]) => hour);
  }
  
  /**
   * Mix following and discovered content
   */
  private mixFeeds(
    followingPosts: Post[],
    discoveredPosts: FeedPost[],
    followingTarget: number,
    discoveryTarget: number
  ): FeedPost[] {
    const mixed: FeedPost[] = [];
    let followingIndex = 0;
    let discoveryIndex = 0;
    let position = 0;
    
    // Use pattern: 3 following, 1 discovered, repeat
    while (
      mixed.length < followingTarget + discoveryTarget &&
      (followingIndex < followingPosts.length || 
       discoveryIndex < discoveredPosts.length)
    ) {
      // Add 3 following posts
      for (let i = 0; i < 3 && followingIndex < followingPosts.length; i++) {
        mixed.push(followingPosts[followingIndex++]);
      }
      
      // Add 1 discovered post
      if (discoveryIndex < discoveredPosts.length) {
        mixed.push(discoveredPosts[discoveryIndex++]);
      }
    }
    
    return mixed;
  }
  
  private extractTeamsFromPost(post: any): string[] {
    const teams: string[] = [];
    
    // Extract from caption
    const caption = post.caption || '';
    const teamNames = ['Lakers', 'Warriors', 'Cowboys', 'Chiefs', /* ... */];
    teamNames.forEach(team => {
      if (caption.includes(team)) teams.push(team);
    });
    
    // Extract from bet details if pick post
    if (post.bet_details?.team) {
      teams.push(post.bet_details.team);
    }
    
    return teams;
  }
}

// The existing feedService singleton is already exported
```

#### Step 1.2: Update Feed Hook and Component

**File**: Update `hooks/useFeed.ts`

**CRITICAL**: We're enhancing the existing useFeed hook to support smart feed:

```typescript
// In useFeed hook, add smart feed option:
export function useFeed() {
  const { user } = useAuth();
  const [enableSmartFeed, setEnableSmartFeed] = useState(true);
  
  // Modify existing loadPosts function
  const loadPosts = async (refresh = false) => {
    try {
      let posts;
      if (enableSmartFeed && user?.profile_embedding) {
        // Use enhanced feed with AI content
        posts = await feedService.getHybridFeed(
          user.id,
          limit,
          refresh ? 0 : offset
        );
      } else {
        // Fallback to regular following feed
        posts = await feedService.getFollowingFeed(
          user.id,
          limit,
          refresh ? 0 : offset
        );
      }
      
      // ... rest of existing logic
    } catch (error) {
      // ... existing error handling
    }
  };
  
  return {
    ...existingReturns,
    enableSmartFeed,
    setEnableSmartFeed
  };
}

// Update PostCard component at components/content/PostCard.tsx
// Add discovery indicator to existing PostCard:
import { DiscoveryBadge } from '@/components/feed/DiscoveryBadge';

export function PostCard({ post, ...props }) {
  return (
    <View style={styles.container}>
      {/* Existing post header */}
      
      {/* ADD: AI discovery indicator if applicable */}
      {post.is_discovered && (
        <DiscoveryBadge 
          reason={post.discovery_reason}
          style={styles.discoveryBadge}
        />
      )}
      
      {/* Rest of existing post content */}
    </View>
  );
}
```

**Integration Points**:
- Enhances existing feedService and useFeed hook
- Discovered posts use the same PostCard component
- Only difference is the small DiscoveryBadge overlay
- Graceful fallback if user has no embedding

#### Step 1.3: Create Discovery Badge Component

**File**: `components/feed/DiscoveryBadge.tsx`

```typescript
import React from 'react';
import { View, Text } from 'tamagui';
import { AIBadge } from '@/components/common/AIBadge';

interface DiscoveryBadgeProps {
  reason?: string;
}

export function DiscoveryBadge({ reason = 'Suggested' }: DiscoveryBadgeProps) {
  return (
    <View 
      position="absolute" 
      top="$2" 
      right="$2"
      backgroundColor="rgba(0,0,0,0.6)"
      paddingHorizontal="$2"
      paddingVertical="$1"
      borderRadius="$2"
      flexDirection="row"
      alignItems="center"
      gap="$1"
    >
      <AIBadge variant="tiny" />
      <Text fontSize="$1" color="white">
        {reason}
      </Text>
    </View>
  );
}
```

### Part 2: Smart Notifications Implementation (2 hours)

Integrate AI notifications INTO the existing notification system - they appear in the same list with visual indicators.

#### Step 2.1: Extend Notification Service

**File**: Update `services/notifications/notificationService.ts`

Add smart notification capabilities to existing service:

```typescript
import { supabase } from '@/services/supabase/client';
// Using the existing notification service imports

// Add to existing NotificationService class:
export class NotificationService {
  // ... existing code ...
  
  // Add smart notification methods
  /**
   * Generate smart notifications based on behavioral patterns
   * Called by production job every 5 minutes
   */
  async generateSmartNotifications(userId: string): Promise<void> {
    try {
      // Get user's behavioral embedding
      const { data: user } = await supabase
        .from('users')
        .select('profile_embedding')
        .eq('id', userId)
        .single();
        
      if (!user?.profile_embedding) return;
      
      // Find behaviorally similar users
      const { data: similarUsers } = await supabase
        .rpc('find_similar_users', {
          query_user_id: userId,
          match_threshold: 0.75, // Higher threshold for notifications
          limit_count: 30
        });
        
      if (!similarUsers?.length) return;
      
      // Check for notification-worthy activities
      await Promise.all([
        this.checkSimilarUserBets(userId, similarUsers),
        this.checkConsensusPatterns(userId, similarUsers),
        this.checkTrendingWithSimilar(userId, similarUsers)
      ]);
      
    } catch (error) {
      console.error('Error generating smart notifications:', error);
    }
  }
  
  /**
   * Notify about bets from behaviorally similar users
   */
  private async checkSimilarUserBets(
    userId: string, 
    similarUsers: any[]
  ): Promise<void> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    
    // Get recent bets from similar users
    const { data: recentBets } = await supabase
      .from('bets')
      .select(`
        *,
        user:users!user_id(username, display_name),
        game:games!game_id(home_team, away_team, sport)
      `)
      .in('user_id', similarUsers.map(u => u.id))
      .gte('created_at', thirtyMinutesAgo)
      .eq('archived', false)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (!recentBets?.length) return;
    
    // Group by interesting patterns
    const interestingBets = this.findInterestingBets(recentBets);
    
    for (const pattern of interestingBets) {
      await this.createSmartNotification(userId, {
        type: 'similar_user_bet',
        title: '🎯 Similar Bettor Alert',
        message: pattern.message,
        data: pattern.data
      });
    }
  }
  
  /**
   * Enhanced consensus detection including behavioral similarity
   */
  private async checkConsensusPatterns(
    userId: string,
    similarUsers: any[]
  ): Promise<void> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    // Get user's recent bets
    const { data: userBets } = await supabase
      .from('bets')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', oneHourAgo)
      .eq('archived', false);
      
    if (!userBets?.length) return;
    
    // For each bet, check if similar users made the same bet
    for (const userBet of userBets) {
      const { data: matchingBets } = await supabase
        .from('bets')
        .select(`
          *,
          user:users!user_id(username, display_name)
        `)
        .in('user_id', similarUsers.map(u => u.id))
        .eq('game_id', userBet.game_id)
        .eq('bet_type', userBet.bet_type)
        .eq('bet_details->team', userBet.bet_details.team)
        .gte('created_at', oneHourAgo);
        
      if (matchingBets && matchingBets.length >= 2) {
        const usernames = matchingBets.map(b => b.user.username);
        const message = matchingBets.length === 2
          ? `${usernames.join(' and ')} also bet ${userBet.bet_details.team} ${userBet.bet_type}`
          : `${matchingBets.length} similar bettors including ${usernames[0]} bet ${userBet.bet_details.team}`;
          
        await this.createSmartNotification(userId, {
          type: 'behavioral_consensus',
          title: '🤝 Consensus Alert',
          message,
          data: {
            bet_id: userBet.id,
            matching_users: matchingBets.map(b => b.user_id),
            consensus_type: 'behavioral'
          }
        });
      }
    }
  }
  
  /**
   * Find bets that would interest this user based on behavior
   */
  private findInterestingBets(bets: any[]): any[] {
    const patterns: any[] = [];
    
    // Group by game and bet type
    const gameGroups = new Map<string, any[]>();
    bets.forEach(bet => {
      const key = `${bet.game_id}-${bet.bet_type}`;
      if (!gameGroups.has(key)) gameGroups.set(key, []);
      gameGroups.get(key)!.push(bet);
    });
    
    // Find consensus patterns
    gameGroups.forEach((groupBets, key) => {
      if (groupBets.length >= 3) {
        const firstBet = groupBets[0];
        const usernames = groupBets.map(b => b.user.username).slice(0, 3);
        
        patterns.push({
          message: `${usernames.join(', ')} all bet ${firstBet.bet_details.team} ${firstBet.bet_type}`,
          data: {
            game_id: firstBet.game_id,
            bet_type: firstBet.bet_type,
            team: firstBet.bet_details.team,
            user_count: groupBets.length
          }
        });
      }
    });
    
    // Find high-value bets from similar users
    const highValueBets = bets.filter(b => b.amount >= 150);
    if (highValueBets.length > 0) {
      const bet = highValueBets[0];
      patterns.push({
        message: `${bet.user.username} just placed $${bet.amount} on ${bet.bet_details.team}`,
        data: {
          bet_id: bet.id,
          amount: bet.amount,
          user_id: bet.user_id
        }
      });
    }
    
    return patterns.slice(0, 3); // Max 3 notifications
  }
  
  /**
   * Find other users who made the same bet
   */
  private async findConsensusForBet(
    userId: string, 
    bet: any
  ): Promise<ConsensusMatch | null> {
    // Use RPC function from Sprint 8.01
    const { data: matches, error } = await supabase
      .rpc('check_bet_consensus', {
        user_bet_id: bet.id,
        time_window: '1 hour',
        min_matches: 2
      });
      
    if (error || !matches?.length) return null;
    
    // Get usernames for notification
    const { data: users } = await supabase
      .from('users')
      .select('id, username')
      .in('id', matches.map(m => m.user_id));
      
    return {
      bet_id: bet.id,
      user_ids: matches.map(m => m.user_id),
      team: bet.bet_details.team,
      bet_type: bet.bet_type,
      line: bet.bet_details.line,
      count: matches.length,
      usernames: users?.map(u => u.username) || []
    };
  }
  
  /**
   * Create consensus notification
   */
  private async createConsensusNotification(
    userId: string,
    consensus: ConsensusMatch
  ): Promise<void> {
    const { usernames, team, bet_type, line, count } = consensus;
    
    // Format notification message
    let message = '';
    if (count === 3) {
      message = `${usernames.slice(0, 3).join(', ')} all bet ${team} ${bet_type}`;
    } else {
      message = `${count} friends including ${usernames[0]} bet ${team} ${bet_type}`;
    }
    
    if (line) {
      message += ` ${line}`;
    }
    
    // Create notification using existing pattern
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'consensus_alert',
        title: '🎯 Consensus Alert',
        message,
        data: {
          bet_id: consensus.bet_id,
          matching_users: consensus.user_ids,
          team,
          bet_type
        },
        read: false,
        created_at: new Date().toISOString()
      });
      
    // Send push notification if enabled
    await notificationService.sendPushNotification(
      userId,
      '🎯 Consensus Alert',
      message
    );
  }
  
  /**
   * Get historical consensus for display
   */
  async getConsensusHistory(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('type', 'consensus_alert')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    return notifications || [];
  }
}

// Use the existing notificationService singleton
```

#### Step 2.2: Update Notification Display

**File**: Update `/app/(drawer)/notifications.tsx` and `/components/notifications/NotificationItem.tsx`

**CRITICAL**: AI notifications appear IN the existing notification list with visual indicators:

```typescript
// In NotificationItem.tsx, add AI indicator:
import { AIBadge } from '@/components/common/AIBadge';

export function NotificationItem({ notification }: NotificationItemProps) {
  const isAINotification = [
    'similar_user_bet',
    'behavioral_consensus',
    'smart_alert'
  ].includes(notification.type);

  return (
    <Pressable onPress={handlePress} style={styles.container}>
      <View style={styles.content}>
        {/* Existing icon/avatar */}
        
        <View style={styles.textContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{notification.title}</Text>
            {isAINotification && (
              <AIBadge variant="tiny" style={styles.aiBadge} />
            )}
          </View>
          <Text style={styles.message}>{notification.message}</Text>
          <Text style={styles.timestamp}>
            {formatRelativeTime(notification.created_at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
```

**Integration Points**:
- AI notifications use the SAME UI component as regular notifications
- Only difference is the AIBadge indicator
- They're sorted chronologically with all other notifications
- No separate section or filtering

#### Step 2.3: Create Smart Notification Job

**File**: Create new job `scripts/jobs/smart-notifications.ts`

**NOTE**: This job creates notifications that appear in the regular notification list.

```typescript
#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js';
import { notificationService } from '@/services/notifications/notificationService';

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
// Use the enhanced notification service

async function runConsensusDetection() {
  console.log(`[${new Date().toISOString()}] Starting consensus detection job...`);
  
  try {
    // Get all active users who placed bets in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    
    const { data: recentBettors } = await supabase
      .from('bets')
      .select('user_id')
      .gte('created_at', oneHourAgo)
      .eq('archived', false);
      
    if (!recentBettors?.length) {
      console.log('No recent bets found');
      return;
    }
    
    // Get unique user IDs
    const userIds = [...new Set(recentBettors.map(b => b.user_id))];
    console.log(`Checking consensus for ${userIds.length} users`);
    
    // Process each user
    for (const userId of userIds) {
      try {
        await notificationService.generateSmartNotifications(userId);
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error);
      }
    }
    
    console.log('Consensus detection completed');
  } catch (error) {
    console.error('Fatal error in consensus detection:', error);
    process.exit(1);
  }
}

// Run the job
runConsensusDetection();
```

#### Step 2.4: Add to Cron Schedule

**File**: Update `scripts/jobs/README.md` or cron configuration

```bash
# Add to crontab or job scheduler
# Run every 5 minutes to generate AI notifications
*/5 * * * * cd /path/to/snapbet && bun run scripts/jobs/smart-notifications.ts >> logs/smart-notifications.log 2>&1
```

### Part 3: Enhance Mock Data with Smart Features (1.5 hours)

#### Step 3.1: Add Consensus Scenarios to Existing Generators

**File**: Update `scripts/mock/generators/bets.ts`

Add consensus patterns to existing bet generation:

```typescript
import { supabase } from '@/scripts/supabase-client';
import { mockGames } from '../data/games';

// Add to existing bet generator
export async function generateMockBetsWithConsensus(options: MockBetOptions & {
  consensusPatterns?: ConsensusPattern[]
}) {
  console.log('Creating bets with consensus patterns...');
  
  // Scenario 1: Lakers consensus (5 users bet Lakers spread)
  const lakersGame = mockGames.nba.find(g => 
    g.home_team === 'Lakers' || g.away_team === 'Lakers'
  );
  
  if (lakersGame) {
    const lakersBettors = [
      'mock_sarah_sharp',
      'mock_emma_analyst',
      'mock_david_pro',
      'mock_alex_stats',
      'mock_mike_yolo'
    ];
    
    // Create similar bets within 30 minutes
    const baseTime = new Date();
    for (let i = 0; i < lakersBettors.length; i++) {
      const user = await supabase
        .from('users')
        .select('id')
        .eq('username', lakersBettors[i])
        .single();
        
      if (user.data) {
        const betTime = new Date(baseTime.getTime() + i * 5 * 60000); // 5 min apart
        
        await supabase
          .from('bets')
          .insert({
            user_id: user.data.id,
            game_id: lakersGame.id,
            bet_type: 'spread',
            bet_details: {
              team: 'Lakers',
              line: '-5.5',
              odds: -110
            },
            amount: 100,
            potential_payout: 190.91,
            status: 'pending',
            created_at: betTime.toISOString()
          });
      }
    }
  }
  
  // Scenario 2: NFL Under consensus (4 users bet under on same game)
  const nflGame = mockGames.nfl[0];
  const underBettors = [
    'mock_tyler_weekend',
    'mock_jake_degen',
    'mock_lisa_expert',
    'mock_chris_wild'
  ];
  
  // Similar logic for NFL under bets
  
  // Scenario 3: Mixed consensus (same team, different bet types)
  // This tests partial consensus matching
  
  console.log('Consensus scenarios created');
}
```

#### Step 3.2: Enhance Post Generator for Discovery

**File**: Update `scripts/mock/generators/posts.ts`

Add discovery-worthy content patterns:

```typescript
// Add to existing post generator
export async function generateDiscoveryPosts(options: MockPostOptions) {
  console.log('Creating discovery-worthy content...');
  
  // Create posts that will match behavioral patterns
  
  // 1. Posts from users with different behavioral patterns
  const behavioralPatterns = [
    { type: 'nba_focus', keywords: ['Lakers', 'Warriors', 'NBA'], betTypes: ['total'] },
    { type: 'nfl_weekend', keywords: ['NFL', 'Sunday', 'RedZone'], betTypes: ['spread'] },
    { type: 'late_night', keywords: ['late night', 'degen hours', '🦉'], timing: [22, 23, 0, 1] }
      
      await createPost({
        user_id: getRandomNonFollowedUser(user.id),
        caption: `${team} looking strong tonight! 🔥`,
        post_type: 'post',
        media_url: 'mock-media-url',
        // Will be marked for discovery due to team match
      });
    }
  }
  
  // 2. High-engagement posts (trending)
  await createTrendingPosts();
  
  // 3. Posts with similar betting patterns
  await createSimilarBettingPosts();
}
```

#### Step 3.3: Update Mock Orchestrator

**File**: Update `scripts/mock/orchestrators/unified-setup.ts`

```typescript
// In the existing orchestrator, enhance with smart features:
const mockOptions = {
  ...existingOptions,
  // Add smart feed patterns
  includeBehavioralPatterns: true,
  consensusScenarios: [
    { game: 'Lakers vs Warriors', betType: 'spread', team: 'Lakers', userCount: 5 },
    { game: 'Chiefs vs Bills', betType: 'total', selection: 'under', userCount: 4 }
  ],
  discoveryContent: {
    crossBehavioralPosts: true, // Posts that appeal across behavioral groups
    trendingTopics: ['playoffs', 'injury report', 'weather impact']
  }
};

// After generating content, create embeddings
await execSync('bun run scripts/jobs/embedding-generation.ts --type=all --force');
```

### Part 4: Testing & Verification

#### Step 4.1: Test Enhanced Feed

```typescript
// Test query to verify 70/30 mix
const testFeed = await feedService.getHybridFeed('test-user-id', 20);
const followingCount = testFeed.filter(p => !p.is_discovered).length;
const discoveredCount = testFeed.filter(p => p.is_discovered).length;

console.log(`Following: ${followingCount}, Discovered: ${discoveredCount}`);
// Should be approximately 14:6 ratio
```

#### Step 4.2: Test Consensus Detection

```bash
# Run smart notifications job manually
bun run scripts/jobs/smart-notifications.ts

# Check notifications created
```

```sql
-- Verify consensus notifications
SELECT * FROM notifications 
WHERE type = 'consensus_alert'
ORDER BY created_at DESC;
```

#### Step 4.3: Manual Testing Checklist

1. **Enhanced Feed**:
   - [ ] Feed shows mix of following and discovered content
   - [ ] Discovery badges appear on AI-suggested posts
   - [ ] Discovery reasons make sense (team match, trending, etc.)
   - [ ] Approximately 70/30 ratio maintained
   - [ ] Feed still works if discovery fails (fallback)

2. **Consensus Alerts**:
   - [ ] Notifications created when 3+ friends bet same thing
   - [ ] Alert shows friend usernames
   - [ ] Alert includes bet details
   - [ ] Push notifications sent (if enabled)
   - [ ] Consensus job runs without errors

3. **Mock Scenarios Work**:
   - [ ] Lakers consensus scenario triggers notifications
   - [ ] Discovery content appears in feeds
   - [ ] Non-followed content shows with reasons

## Production Job Schedule

Add these to your cron/scheduler:

```bash
# Smart notifications - every 5 minutes
*/5 * * * * bun run scripts/jobs/smart-notifications.ts

# Embedding updates - every hour for active users
0 * * * * bun run scripts/jobs/embedding-generation.ts --type=users --active-only
```

## Success Criteria

1. **Enhanced feed shows 70/30 mix** of following vs discovered content
2. **Discovery reasons are meaningful** and accurate
3. **Consensus alerts fire** when 3+ friends make similar bets
4. **All features work with mock data** using production code paths
5. **Performance is acceptable** (feed loads in <2 seconds)

## Common Issues & Solutions

**Issue**: Feed only shows following content
**Solution**: Check user has profile_embedding, run embedding-generation job

**Issue**: No consensus alerts firing
**Solution**: Verify RPC function permissions, check bet timing windows

**Issue**: Discovery content not relevant
**Solution**: Tune embedding similarity threshold, improve reason detection

## Integration Notes

- Enhanced feedService integrates with existing feed infrastructure
- Smart notifications use existing notification system and UI
- Both features gracefully degrade if AI features unavailable
- Mock data extends existing generators with behavioral patterns

## Next Sprint Preview

Sprint 8.07 will focus on creating a comprehensive demo experience, performance optimization, and the mock:setup script that showcases all RAG features.