# Sprint 8.05: Complete Infrastructure & Find Your Tribe

**Status**: NOT STARTED  
**Estimated Duration**: 3-4 hours  
**Dependencies**: Sprints 8.01-8.04 completed  
**Primary Goal**: Generate behavioral embeddings and integrate Find Your Tribe into Explore tab

## Sprint Overview

This sprint implements behavioral embeddings and integrates AI user discovery INTO existing UI:
1. Generate user profile embeddings from ACTUAL ACTIONS (bets, follows, posts, engagement)
2. Add "Find Your Tribe" section to EXISTING Explore tab (not a new screen)
3. AI discovers ALL patterns from behavior - NO stored preferences

**CRITICAL**: 
- NO favorite_teams column or UI - team preferences are discovered dynamically
- AI analyzes betting history to find patterns in real-time
- All AI content has visual indicators (AIBadge component)

## How the RAG/AI Algorithm Works:

```
User Actions → Behavioral Profile Text → Embedding (1536d vector) → Vector Similarity Search → AI Interpretation
```

**What goes into embeddings**:
- Betting patterns (teams, sports, types, amounts, timing)
- Social connections (follows, engagement)
- Content patterns (posts, reactions)
- Temporal patterns (when active)

**How recommendations work**:
- Find Your Tribe: Vector similarity between user embeddings
- Feed Discovery: Posts from similar users scored by relevance
- Smart Notifications: Monitor similar users for interesting patterns

## Detailed Implementation Steps

### Part 1: Generate Behavioral Profile Embeddings (1.5 hours)

**Context**: We need to generate embeddings based on actual user behavior, not static preferences.

#### Step 1.1: Update Embedding Pipeline for Behavioral Data

**File**: `services/rag/embeddingPipeline.ts`

**IMPORTANT**: Remove the `favorite_teams` column entirely - team preferences should be discovered by AI, not stored:
- DELETE the `extractFavoriteTeams()` function 
- DO NOT populate any `favorite_teams` column
- Team preferences are discovered dynamically from embeddings

Update the user profile embedding to capture ALL behavioral signals:

```typescript
export async function updateUserProfileEmbedding(userId: string): Promise<void> {
  try {
    // Gather ALL behavioral data
    const { data: userData } = await supabase
      .from('users')
      .select(`
        *,
        bets(*),
        posts(*),
        followers!follower_id(*),
        followers!following_id(*),
        reactions(*),
        comments(*)
      `)
      .eq('id', userId)
      .single();

    if (!userData) return;

    // Extract behavioral patterns
    const bettingPatterns = analyzeBettingBehavior(userData.bets || []);
    const socialPatterns = analyzeSocialBehavior(userData);
    const engagementPatterns = analyzeEngagement(userData);
    const temporalPatterns = analyzeTemporalActivity(userData);

    // Create rich behavioral text representation
    const behavioralProfile = `
      User ${userData.username} behavioral profile:
      
      BETTING BEHAVIOR:
      Total bets: ${userData.bets?.length || 0}
      Sports bet on: ${bettingPatterns.sports.join(', ')}
      Teams frequently bet: ${bettingPatterns.topTeams.join(', ')}
      Bet types: ${bettingPatterns.betTypes.join(', ')}
      Average stake: $${bettingPatterns.avgStake}
      Typical bet timing: ${bettingPatterns.timing}
      Win rate: ${bettingPatterns.winRate}%
      Recent bets: ${bettingPatterns.recentBets.join('; ')}
      
      SOCIAL BEHAVIOR:
      Follows ${socialPatterns.followingCount} users
      Followed by ${socialPatterns.followersCount}
      Key connections: ${socialPatterns.topConnections.join(', ')}
      Engagement rate: ${socialPatterns.engagementRate}
      
      CONTENT PATTERNS:
      Posts created: ${userData.posts?.length || 0}
      Typical captions: ${engagementPatterns.captionStyle}
      Active times: ${temporalPatterns.activeTimes}
      Tailing frequency: ${engagementPatterns.tailingRate}
      
      RECENT ACTIVITY:
      ${userData.bets?.slice(0, 10).map(b => 
        `Bet ${b.amount} on ${b.bet_details.team} ${b.bet_type}`
      ).join(', ')}
    `;

    // Generate embedding
    const embedding = await ragService.generateEmbedding(behavioralProfile);
    
    // Update user profile - ONLY embedding, no favorite_teams!
    await supabase
      .from('users')
      .update({
        profile_embedding: embedding,
        last_embedding_update: new Date().toISOString()
        // NO favorite_teams - discovered dynamically from embedding
      })
      .eq('id', userId);

  } catch (error) {
    console.error(`Error updating profile embedding for ${userId}:`, error);
  }
}

function analyzeBettingBehavior(bets: any[]) {
  const sports = new Set<string>();
  const teams = new Map<string, number>();
  const betTypes = new Map<string, number>();
  let totalAmount = 0;
  let wins = 0;

  bets.forEach(bet => {
    // Extract sport from game
    if (bet.game?.sport) sports.add(bet.game.sport);
    
    // Count team frequency
    const team = bet.bet_details?.team;
    if (team) teams.set(team, (teams.get(team) || 0) + 1);
    
    // Count bet types
    betTypes.set(bet.bet_type, (betTypes.get(bet.bet_type) || 0) + 1);
    
    // Track amounts and wins
    totalAmount += bet.amount;
    if (bet.status === 'won') wins++;
  });

  // Get top teams (most frequently bet on)
  const topTeams = Array.from(teams.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([team]) => team);

  return {
    sports: Array.from(sports),
    topTeams,
    betTypes: Array.from(betTypes.keys()),
    avgStake: bets.length > 0 ? Math.round(totalAmount / bets.length) : 0,
    winRate: bets.length > 0 ? Math.round((wins / bets.length) * 100) : 0,
    timing: extractBetTiming(bets),
    recentBets: bets.slice(0, 5).map(b => 
      `${b.bet_details.team} ${b.bet_type} ${b.amount}`
    )
  };
}

function analyzeSocialBehavior(userData: any) {
  const following = userData.followers?.filter(f => f.follower_id === userData.id) || [];
  const followers = userData.followers?.filter(f => f.following_id === userData.id) || [];
  
  // Find most interacted with users
  const interactions = new Map<string, number>();
  userData.reactions?.forEach(r => {
    const userId = r.post?.user_id;
    if (userId) interactions.set(userId, (interactions.get(userId) || 0) + 1);
  });
  
  const topConnections = Array.from(interactions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId]) => userId); // Would need username lookup

  return {
    followingCount: following.length,
    followersCount: followers.length,
    topConnections,
    engagementRate: calculateEngagementRate(userData)
  };
}
```

#### Step 1.2: Update Embedding Generation Job

**File**: `scripts/jobs/embedding-generation.ts`

Ensure the job uses the new behavioral approach:

```typescript
// In the embedUserProfiles function
async function embedUserProfiles(limit: number = 50) {
  console.log('Generating behavioral embeddings for user profiles...');
  
  // Get users who need embedding updates
  const { data: users } = await supabase
    .from('users')
    .select('id, username')
    .or('profile_embedding.is.null,last_embedding_update.lt.' + oneHourAgo)
    .limit(limit);

  for (const user of users || []) {
    console.log(`Generating behavioral embedding for ${user.username}`);
    await embeddingPipeline.updateUserProfileEmbedding(user.id);
    
    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

#### Step 1.3: Run Behavioral Embedding Generation

**Execute**:
```bash
# Generate embeddings for all users based on their behavior
bun run scripts/jobs/embedding-generation.ts --type users --force
```

**Verification**:
```sql
-- Verify embeddings exist and are recent
SELECT username, 
       profile_embedding IS NOT NULL as has_embedding,
       last_embedding_update,
       (SELECT COUNT(*) FROM bets WHERE user_id = users.id) as bet_count,
       (SELECT COUNT(*) FROM posts WHERE user_id = users.id) as post_count
FROM users 
WHERE username LIKE 'mock_%'
ORDER BY created_at;
-- Note: NO favorite_teams column - preferences discovered from embeddings!
```

### Part 2: Implement Find Your Tribe Feature (2 hours)

#### Step 2.1: Create Friend Discovery Service

**File**: `services/rag/friendDiscoveryService.ts`

```typescript
import { supabase } from '@/services/supabase/client';
import { User } from '@/types/database';

interface SimilarUser {
  user: User;
  similarity_score: number;
  common_teams: string[];
  common_bet_types: string[];
  similarity_reasons: string[];
}

export class FriendDiscoveryService {
  /**
   * Find similar users based on behavioral embeddings
   * Uses the RPC function created in Sprint 8.01
   */
  async findSimilarUsers(
    userId: string, 
    limit: number = 10
  ): Promise<SimilarUser[]> {
    try {
      // Call the RPC function from Sprint 8.01
      const { data: similarUsers, error } = await supabase
        .rpc('find_similar_users', {
          query_user_id: userId,
          match_threshold: 0.7,
          limit_count: limit
        });

      if (error) throw error;
      if (!similarUsers?.length) return [];

      // Use AI to interpret behavioral similarities
      const enrichedUsers = await this.interpretBehavioralSimilarities(
        userId, 
        similarUsers
      );

      return enrichedUsers;
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }

  /**
   * Use AI to interpret WHY users are behaviorally similar
   */
  private async interpretBehavioralSimilarities(
    userId: string,
    similarUsers: any[]
  ): Promise<SimilarUser[]> {
    // Get both users' behavioral data
    const { data: currentUser } = await supabase
      .from('users')
      .select(`
        *,
        bets(*),
        posts(caption),
        followers!follower_id(following_id)
      `)
      .eq('id', userId)
      .single();

    if (!currentUser) return [];

    // Process each similar user
    const enrichedUsers = await Promise.all(
      similarUsers.map(async (similar) => {
        // Get similar user's data
        const { data: similarUserData } = await supabase
          .from('users')
          .select(`
            *,
            bets(*),
            posts(caption),
            followers!follower_id(following_id)
          `)
          .eq('id', similar.id)
          .single();

        if (!similarUserData) return null;

        // Use AI to analyze behavioral patterns
        const behaviorAnalysis = await this.analyzeBehavioralPatterns(
          currentUser,
          similarUserData
        );

        return {
          user: similar,
          similarity_score: similar.similarity_score,
          behavioral_insights: behaviorAnalysis.insights,
          similarity_reasons: behaviorAnalysis.reasons,
          common_patterns: behaviorAnalysis.patterns
        };
      })
    );

    return enrichedUsers.filter(Boolean);
  }

  /**
   * Analyze behavioral patterns between two users
   */
  private async analyzeBehavioralPatterns(
    user1: any,
    user2: any
  ): Promise<{
    insights: string[];
    reasons: string[];
    patterns: any;
  }> {
    const reasons: string[] = [];
    const insights: string[] = [];

    // Betting behavior analysis
    const user1Bets = user1.bets || [];
    const user2Bets = user2.bets || [];

    // Find common betting patterns
    const commonSports = this.findCommonSports(user1Bets, user2Bets);
    const commonTeams = this.findCommonTeams(user1Bets, user2Bets);
    const avgBet1 = this.calculateAvgBet(user1Bets);
    const avgBet2 = this.calculateAvgBet(user2Bets);
    const betTiming1 = this.analyzeBetTiming(user1Bets);
    const betTiming2 = this.analyzeBetTiming(user2Bets);

    // Generate natural language reasons
    if (commonSports.length > 0) {
      reasons.push(`Both actively bet on ${commonSports.join(' and ')}`);
    }

    if (commonTeams.length > 0) {
      insights.push(`Frequently bet on ${commonTeams[0]} games`);
    }

    if (Math.abs(avgBet1 - avgBet2) < 20) {
      reasons.push(`Similar betting amounts (~$${Math.round((avgBet1 + avgBet2) / 2)})`);
    }

    // Analyze bet types
    const betTypes1 = new Set(user1Bets.map(b => b.bet_type));
    const betTypes2 = new Set(user2Bets.map(b => b.bet_type));
    const commonBetTypes = [...betTypes1].filter(t => betTypes2.has(t));

    if (commonBetTypes.includes('total') && !commonBetTypes.includes('spread')) {
      insights.push('Both prefer betting totals over spreads');
    }

    // Social behavior patterns
    const mutualFollows = this.findMutualFollows(
      user1.followers || [],
      user2.followers || []
    );

    if (mutualFollows.length > 3) {
      reasons.push(`Follow ${mutualFollows.length} of the same users`);
    }

    // Temporal patterns
    if (betTiming1.primetime && betTiming2.primetime) {
      insights.push('Both bet primarily on primetime games');
    }

    return {
      insights,
      reasons: reasons.slice(0, 3), // Top 3 reasons
      patterns: {
        commonSports,
        commonTeams: commonTeams.slice(0, 3),
        avgBetDifference: Math.abs(avgBet1 - avgBet2),
        mutualFollows: mutualFollows.length
      }
    };
  }

  private findCommonTeams(teams1: string[], teams2: string[]): string[] {
    return teams1.filter(team => teams2.includes(team));
  }

  private analyzeBetTypes(bets: any[]): string[] {
    const types = bets.map(bet => bet.bet_type);
    return [...new Set(types)];
  }

  private findCommonBetTypes(types1: string[], types2: string[]): string[] {
    return types1.filter(type => types2.includes(type));
  }

  /**
   * Get daily recommendations for the discover tab
   */
  async getDailyRecommendations(userId: string): Promise<{
    similarBettors: SimilarUser[];
    teamBasedMatches: SimilarUser[];
    styleBasedMatches: SimilarUser[];
  }> {
    // Get all similar users
    const allSimilar = await this.findSimilarUsers(userId, 30);
    
    // Categorize them
    const teamBased = allSimilar.filter(u => 
      u.common_teams.length > 0
    ).slice(0, 5);
    
    const styleBased = allSimilar.filter(u => 
      u.similarity_reasons.some(r => r.includes('style'))
    ).slice(0, 5);
    
    return {
      similarBettors: allSimilar.slice(0, 10),
      teamBasedMatches: teamBased,
      styleBasedMatches: styleBased
    };
  }
}

export const friendDiscoveryService = new FriendDiscoveryService();
```

#### Step 2.2: Create Discovery UI Components

**File**: `components/search/SimilarUserCard.tsx`

```typescript
import React from 'react';
import { Pressable } from 'react-native';
import { View, Text, Image } from 'tamagui';
import { AIBadge } from '@/components/common/AIBadge';
import { UserAvatar } from '@/components/common/UserAvatar';
import { FollowButton } from '@/components/social/FollowButton';
import { Colors } from '@/theme';
import { useNavigation } from '@react-navigation/native';
import type { SimilarUser } from '@/services/rag/friendDiscoveryService';

interface SimilarUserCardProps {
  similarUser: SimilarUser;
  currentUserId: string;
}

export function SimilarUserCard({ similarUser, currentUserId }: SimilarUserCardProps) {
  const navigation = useNavigation();
  const { user, similarity_score, similarity_reasons } = similarUser;
  
  const matchPercentage = Math.round(similarity_score * 100);
  
  const handlePress = () => {
    navigation.navigate('Profile', { userId: user.id });
  };

  return (
    <Pressable onPress={handlePress}>
      <View 
        backgroundColor="$gray1"
        padding="$3"
        borderRadius="$2"
        marginBottom="$2"
      >
        <View flexDirection="row" alignItems="center" gap="$3">
          <UserAvatar user={user} size={50} />
          
          <View flex={1}>
            <View flexDirection="row" alignItems="center" gap="$2">
              <Text fontSize="$5" fontWeight="600">
                {user.display_name}
              </Text>
              <AIBadge 
                variant="small" 
                text={`${matchPercentage}% match`}
              />
            </View>
            
            <Text fontSize="$3" color="$gray11" marginTop="$1">
              @{user.username}
            </Text>
            
            {similarity_reasons.length > 0 && (
              <Text fontSize="$2" color="$gray10" marginTop="$1">
                {similarity_reasons[0]}
              </Text>
            )}
          </View>
          
          <FollowButton 
            userId={user.id}
            currentUserId={currentUserId}
            size="small"
          />
        </View>
        
        {/* Show betting stats */}
        <View 
          flexDirection="row" 
          gap="$4" 
          marginTop="$3"
          paddingTop="$2"
          borderTopWidth={1}
          borderTopColor="$gray3"
        >
          <View alignItems="center">
            <Text fontSize="$1" color="$gray10">Win Rate</Text>
            <Text fontSize="$3" fontWeight="600">
              {user.win_rate}%
            </Text>
          </View>
          
          <View alignItems="center">
            <Text fontSize="$1" color="$gray10">ROI</Text>
            <Text fontSize="$3" fontWeight="600">
              {user.roi > 0 ? '+' : ''}{user.roi}%
            </Text>
          </View>
          
          <View alignItems="center">
            <Text fontSize="$1" color="$gray10">Avg Bet</Text>
            <Text fontSize="$3" fontWeight="600">
              ${user.avg_bet_amount}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}
```

#### Step 2.3: Integrate into EXISTING Explore Tab

**File**: Update `screens/ExploreScreen.tsx`

Add "Find Your Tribe" as the FIRST section in the existing Explore tab:

```typescript
import { friendDiscoveryService } from '@/services/rag/friendDiscoveryService';
import { SimilarUserCard } from '@/components/search/SimilarUserCard';

// In the ExploreScreen component, add state:
const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
const [loadingSimilar, setLoadingSimilar] = useState(true);

useEffect(() => {
  loadSimilarUsers();
}, [user.id]);

const loadSimilarUsers = async () => {
  setLoadingSimilar(true);
  try {
    const similar = await friendDiscoveryService.findSimilarUsers(user.id, 5);
    setSimilarUsers(similar);
  } finally {
    setLoadingSimilar(false);
  }
};

// In the render, ADD AS FIRST SECTION (before "Top Bettors"):
return (
  <ScrollView>
    {/* Find Your Tribe - AI Discovery Section */}
    <View marginBottom="$4">
      <View flexDirection="row" alignItems="center" gap="$2" marginBottom="$3">
        <Text fontSize="$6" fontWeight="700">Find Your Tribe</Text>
        <AIBadge variant="small" text="AI" opacity={0.8} />
      </View>
      
      {loadingSimilar ? (
        <ActivityIndicator />
      ) : similarUsers.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {similarUsers.map(similarUser => (
            <SimilarUserCard 
              key={similarUser.user.id}
              similarUser={similarUser}
              currentUserId={user.id}
            />
          ))}
        </ScrollView>
      ) : (
        <Text color="$gray10">Make more bets to discover similar bettors</Text>
      )}
    </View>

    {/* EXISTING SECTIONS CONTINUE BELOW */}
    {/* Top Bettors This Week */}
    {/* Trending Picks */}
    {/* etc... */}
  </ScrollView>
);
```

**Key Integration Points**:
- Goes at the TOP of Explore tab (most prominent position)
- Has AIBadge to indicate AI-powered feature
- Falls back gracefully if no similar users found
- Doesn't create a new screen or navigation

### Part 3: Mock Data Behavioral Scenarios (30 minutes)

#### Step 3.1: Create Behavioral Pattern Scenarios

**File**: `scripts/mock/generators/createBehavioralScenarios.ts`

```typescript
import { supabase } from '@/scripts/supabase-client';

export async function createBehavioralScenarios() {
  console.log('Creating behavioral pattern scenarios...');
  
  // DON'T set preferences - create BEHAVIORS that will cluster naturally
  
  // Scenario 1: Users who naturally bet Lakers games and unders
  const lakersUndersBehavior = async (usernames: string[]) => {
    for (const username of usernames) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
        
      if (!user) continue;
      
      // Create 20+ bets on Lakers games, mostly unders
      const lakersGames = await supabase
        .from('games')
        .select('*')
        .or('home_team.eq.Lakers,away_team.eq.Lakers')
        .limit(20);
        
      for (const game of lakersGames.data || []) {
        // 80% bet unders, 20% other
        const betType = Math.random() > 0.2 ? 'total' : 'spread';
        const selection = betType === 'total' ? 'under' : 'Lakers';
        
        await supabase.from('bets').insert({
          user_id: user.id,
          game_id: game.id,
          bet_type: betType,
          bet_details: {
            team: selection === 'Lakers' ? 'Lakers' : undefined,
            selection: betType === 'total' ? selection : undefined,
            line: betType === 'total' ? 'u225.5' : '-5.5',
            odds: -110
          },
          amount: 50 + Math.random() * 50, // $50-100 range
          potential_payout: 0,
          status: Math.random() > 0.45 ? 'won' : 'lost', // 55% win rate
          created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }
  };
  
  // Scenario 2: High-stakes weekend NFL bettors
  const nflWeekendWarriors = async (usernames: string[]) => {
    for (const username of usernames) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
        
      if (!user) continue;
      
      // Create bets only on Sundays, high amounts
      const nflGames = await supabase
        .from('games')
        .select('*')
        .eq('sport', 'NFL')
        .limit(30);
        
      for (const game of nflGames.data || []) {
        const gameDate = new Date(game.start_time);
        if (gameDate.getDay() === 0) { // Sunday only
          await supabase.from('bets').insert({
            user_id: user.id,
            game_id: game.id,
            bet_type: 'spread',
            bet_details: {
              team: Math.random() > 0.5 ? game.home_team : game.away_team,
              line: '-3.5',
              odds: -110
            },
            amount: 150 + Math.random() * 100, // $150-250
            potential_payout: 0,
            status: 'pending',
            created_at: gameDate
          });
        }
      }
    }
  };
  
  // Scenario 3: Late night degen parlayers
  const lateNightParlayers = async (usernames: string[]) => {
    for (const username of usernames) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
        
      if (!user) continue;
      
      // Create posts and bets between 10pm-2am
      const lateHours = [22, 23, 0, 1, 2];
      
      // Create late night posts
      for (let i = 0; i < 10; i++) {
        const hour = lateHours[Math.floor(Math.random() * lateHours.length)];
        const timestamp = new Date();
        timestamp.setHours(hour);
        
        await supabase.from('posts').insert({
          user_id: user.id,
          caption: `Late night degen hours 🦉💰 Who's with me?`,
          post_type: 'post',
          media_url: 'mock-media',
          media_type: 'photo',
          created_at: timestamp
        });
      }
    }
  };
  
  // Apply behavioral patterns
  await lakersUndersBehavior(['mock_sarah_sharp', 'mock_emma_analyst', 'mock_alex_stats']);
  await nflWeekendWarriors(['mock_tyler_weekend', 'mock_jake_sunday', 'mock_mike_nfl']);
  await lateNightParlayers(['mock_chris_degen', 'mock_ryan_late', 'mock_david_night']);
  
  // Create following patterns - users with similar behaviors follow each other
  await createSocialClusters();
  
  console.log('Behavioral scenarios created - patterns will emerge from actions');
}

async function createSocialClusters() {
  // Users who bet similarly tend to follow each other
  const clusters = [
    ['mock_sarah_sharp', 'mock_emma_analyst', 'mock_alex_stats'], // Lakers/unders
    ['mock_tyler_weekend', 'mock_jake_sunday', 'mock_mike_nfl'], // NFL weekend
    ['mock_chris_degen', 'mock_ryan_late', 'mock_david_night'] // Late night
  ];
  
  for (const cluster of clusters) {
    // Create mutual follows within behavioral clusters
    for (let i = 0; i < cluster.length; i++) {
      for (let j = i + 1; j < cluster.length; j++) {
        const { data: user1 } = await supabase
          .from('users').select('id').eq('username', cluster[i]).single();
        const { data: user2 } = await supabase
          .from('users').select('id').eq('username', cluster[j]).single();
          
        if (user1 && user2) {
          await supabase.from('followers').insert([
            { follower_id: user1.id, following_id: user2.id },
            { follower_id: user2.id, following_id: user1.id }
          ]);
        }
      }
    }
  }
}
```

#### Step 3.2: Update Main Mock Setup

**File**: `scripts/mock/setup-mock-data.ts`

Add to the two-phase setup:

```typescript
// Phase 1: Historical data with embeddings
async function setupHistoricalPhase() {
  // ... existing code ...
  
  // Add discovery scenarios
  await createDiscoveryScenarios();
  
  // Generate embeddings for all historical content
  console.log('Generating embeddings for historical mock data...');
  await execSync('bun run scripts/jobs/embedding-generation.ts --type all --force', {
    stdio: 'inherit'
  });
}
```

### Part 4: Testing & Verification

#### Step 4.1: Test Discovery Queries

```sql
-- Test the find_similar_users RPC function
SELECT * FROM find_similar_users(
  (SELECT id FROM users WHERE username = 'mock_sarah_sharp'),
  0.7,
  10
);
-- Should return other Lakers/unders bettors

-- Verify all users have embeddings
SELECT COUNT(*) as total,
       COUNT(profile_embedding) as with_embeddings
FROM users
WHERE username LIKE 'mock_%';
-- Should be 30, 30
```

#### Step 4.2: Manual Testing Checklist

1. **Profile Embeddings**:
   - [ ] All 30 mock users have profile_embedding populated
   - [ ] last_embedding_update is recent
   - [ ] favorite_teams array is populated

2. **Discovery Feature**:
   - [ ] "Find Your Tribe" section appears in Explore
   - [ ] Shows 5-10 recommended users
   - [ ] Each card shows match percentage
   - [ ] Similarity reasons make sense
   - [ ] Tapping card navigates to profile
   - [ ] Follow button works

3. **Mock Scenarios**:
   - [ ] Lakers fans find other Lakers fans
   - [ ] Aggressive bettors find similar risk-takers
   - [ ] Similar bet amounts cluster together

## Success Criteria

1. **All mock users have complete profile embeddings** generated via production job
2. **Find Your Tribe feature fully functional** in Explore tab
3. **Similarity scores are meaningful** (Lakers fans match with Lakers fans)
4. **Mock data creates discoverable patterns** for demo
5. **Production embedding job handles both mock and real users** identically

## Common Issues & Solutions

**Issue**: Find similar users returns empty
**Solution**: Check profile_embedding is populated, run embedding-generation job

**Issue**: Similarity scores all very low
**Solution**: Ensure favorite_teams and betting history provide enough signal

**Issue**: RPC function fails with permission error  
**Solution**: Check RLS policies from Sprint 8.01 are active

## Next Sprint Preview

Sprint 8.06 will implement the Enhanced Feed (70/30 mixing) and Consensus Alerts, building on the embeddings and infrastructure completed here.