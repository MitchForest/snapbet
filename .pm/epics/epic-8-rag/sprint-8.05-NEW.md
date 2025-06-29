# Sprint 8.05: Complete Infrastructure & Find Your Tribe

**Status**: NOT STARTED  
**Estimated Duration**: 3-4 hours  
**Dependencies**: Sprints 8.01-8.04 completed  
**Primary Goal**: Generate behavioral embeddings and integrate Find Your Tribe into Search tab

## Sprint Overview

This sprint implements behavioral embeddings and integrates AI user discovery INTO existing UI:
1. Generate user profile embeddings from ACTUAL ACTIONS (bets, follows, posts, engagement)
2. Add "Find Your Tribe" section to EXISTING Search tab at `/app/(drawer)/(tabs)/search.tsx`
3. AI discovers ALL patterns from behavior - NO stored preferences

**CRITICAL**: 
- Remove favorite_teams column completely via migration
- Team preferences are discovered dynamically from embeddings
- All AI content has visual indicators (AIBadge component already exists)

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

### Part 0: Remove ALL Team Preference Columns (15 minutes)

#### Step 0.1: Create Migration to Remove Team Columns

**File**: Create new migration `supabase/migrations/035_remove_favorite_teams.sql`

```sql
-- Remove BOTH team columns for pure behavioral AI approach
ALTER TABLE users DROP COLUMN IF EXISTS favorite_team;    -- singular
ALTER TABLE users DROP COLUMN IF EXISTS favorite_teams;   -- plural array

-- Add index for faster embedding queries if not exists
CREATE INDEX IF NOT EXISTS idx_users_last_embedding_update 
ON users(last_embedding_update) 
WHERE profile_embedding IS NOT NULL;
```

### Part 1: Generate Behavioral Profile Embeddings (1.5 hours)

**Context**: We need to generate embeddings based on actual user behavior, not static preferences.

#### Step 1.1: Update Embedding Pipeline for Behavioral Data

**File**: `services/rag/embeddingPipeline.ts`

**CRITICAL**: Remove ALL team preference extraction/storage logic and implement pure behavioral approach:

```typescript
export async function updateUserProfileEmbedding(userId: string): Promise<void> {
  try {
    // Check if user needs early update (20+ new bets)
    const { data: recentBets } = await supabase
      .from('bets')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', userData.last_embedding_update || '1970-01-01')
      .limit(21);
    
    const needsEarlyUpdate = recentBets && recentBets.length > 20;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    if (!needsEarlyUpdate && userData.last_embedding_update > sevenDaysAgo) {
      return; // Skip update
    }

    // Gather ALL behavioral data
    const { data: userData } = await supabase
      .from('users')
      .select(`
        *,
        bets(*, game:games(*)),
        posts(*),
        followers!follower_id(*),
        followers!following_id(*),
        reactions(*),
        comments(*)
      `)
      .eq('id', userId)
      .single();

    if (!userData) return;

    // Extract behavioral patterns - NO stored preferences
    const bettingPatterns = analyzeBettingBehavior(userData.bets || []);
    const socialPatterns = analyzeSocialBehavior(userData);
    const engagementPatterns = analyzeEngagement(userData);
    const temporalPatterns = analyzeTemporalActivity(userData);
    const bettingStyle = categorizeBettingStyle(bettingPatterns);

    // Create rich behavioral text representation (per reviewer guidance)
    const behavioralProfile = `
      ${userData.username} betting behavior:
      - Frequently bets on: ${bettingPatterns.topTeams.join(', ')}
      - Prefers ${bettingPatterns.dominantBetType} bets (${bettingPatterns.betTypePercentage}%)
      - Active during ${temporalPatterns.activeTimeSlots}
      - Average stake: $${bettingPatterns.avgStake}
      - Betting style: ${bettingStyle}
      - Social connections: follows ${socialPatterns.similarBettorCount} similar bettors
      
      DETAILED PATTERNS:
      Total bets: ${userData.bets?.length || 0}
      Sports: ${bettingPatterns.sports.join(', ')}
      Win rate: ${bettingPatterns.winRate}%
      Recent activity: ${bettingPatterns.recentBets.join('; ')}
      Engagement rate: ${socialPatterns.engagementRate}%
      Content style: ${engagementPatterns.captionStyle}
    `;

    // Generate embedding
    const embedding = await ragService.generateEmbedding(behavioralProfile);
    
    // Update ONLY embedding fields - NO team preferences
    await supabase
      .from('users')
      .update({
        profile_embedding: embedding,
        last_embedding_update: new Date().toISOString()
        // NO favorite_team or favorite_teams updates!
      })
      .eq('id', userId);

  } catch (error) {
    console.error(`Error updating profile embedding for ${userId}:`, error);
  }
}

function categorizeBettingStyle(patterns: BettingPatterns): string {
  if (patterns.avgStake > 100) return 'aggressive';
  if (patterns.avgStake < 25) return 'conservative';
  if (patterns.betTypes.includes('parlay')) return 'risk-taker';
  return 'balanced';
}
```

#### Step 1.2: Enhance Existing Embedding Generation Job

**File**: `scripts/jobs/embedding-generation.ts`

The job already exists and processes embeddings. Ensure it uses the behavioral approach:

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
-- favorite_teams column should be removed by migration 035
```

### Part 2: Implement Find Your Tribe Feature (2 hours)

#### Step 2.1: Create Friend Discovery Service

**File**: Create new service `services/rag/friendDiscoveryService.ts`

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

    // Betting behavior analysis - PURE BEHAVIORAL
    const user1Bets = user1.bets || [];
    const user2Bets = user2.bets || [];

    // Dynamically find common betting patterns from actual bets
    const commonTeams = this.findCommonlyBetTeams(user1Bets, user2Bets);
    const commonSports = this.findCommonSports(user1Bets, user2Bets);
    const avgBet1 = this.calculateAvgBet(user1Bets);
    const avgBet2 = this.calculateAvgBet(user2Bets);
    const betTiming1 = this.analyzeBetTiming(user1Bets);
    const betTiming2 = this.analyzeBetTiming(user2Bets);

    // Generate natural language reasons (per reviewer guidance)
    if (commonTeams.length > 0) {
      reasons.push(`Both frequently bet on ${commonTeams[0]} games`);
    }

    if (commonSports.length > 0) {
      reasons.push(`Both actively bet on ${commonSports.join(' and ')}`);
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

  // Dynamically extract teams from betting history
  private findCommonlyBetTeams(bets1: any[], bets2: any[]): string[] {
    const teams1 = new Map<string, number>();
    const teams2 = new Map<string, number>();
    
    // Count team frequencies in user 1's bets
    bets1.forEach(bet => {
      const team = bet.bet_details?.team;
      if (team) teams1.set(team, (teams1.get(team) || 0) + 1);
    });
    
    // Count team frequencies in user 2's bets
    bets2.forEach(bet => {
      const team = bet.bet_details?.team;
      if (team) teams2.set(team, (teams2.get(team) || 0) + 1);
    });
    
    // Find teams both users bet on frequently (3+ times each)
    const commonTeams: string[] = [];
    teams1.forEach((count1, team) => {
      const count2 = teams2.get(team) || 0;
      if (count1 >= 3 && count2 >= 3) {
        commonTeams.push(team);
      }
    });
    
    return commonTeams.sort((a, b) => {
      const scoreA = (teams1.get(a) || 0) + (teams2.get(b) || 0);
      const scoreB = (teams1.get(b) || 0) + (teams2.get(b) || 0);
      return scoreB - scoreA;
    });
  }

  private findCommonSports(bets1: any[], bets2: any[]): string[] {
    const sports1 = new Map<string, number>();
    const sports2 = new Map<string, number>();
    
    // Count sports frequencies in user 1's bets
    bets1.forEach(bet => {
      const sport = bet.game?.sport;
      if (sport) sports1.set(sport, (sports1.get(sport) || 0) + 1);
    });
    
    // Count sports frequencies in user 2's bets
    bets2.forEach(bet => {
      const sport = bet.game?.sport;
      if (sport) sports2.set(sport, (sports2.get(sport) || 0) + 1);
    });
    
    // Find sports both users bet on frequently (3+ times each)
    const commonSports: string[] = [];
    sports1.forEach((count1, sport) => {
      const count2 = sports2.get(sport) || 0;
      if (count1 >= 3 && count2 >= 3) {
        commonSports.push(sport);
      }
    });
    
    return commonSports.sort((a, b) => {
      const scoreA = (sports1.get(a) || 0) + (sports2.get(b) || 0);
      const scoreB = (sports1.get(b) || 0) + (sports2.get(b) || 0);
      return scoreB - scoreA;
    });
  }

  private calculateAvgBet(bets: any[]): number {
    if (bets.length === 0) return 0;
    const totalAmount = bets.reduce((total, bet) => total + bet.amount, 0);
    return totalAmount / bets.length;
  }

  private analyzeBetTiming(bets: any[]): {
    primetime: boolean;
    activeTimeSlots: string;
  } {
    const primetime = bets.some(bet => {
      const gameTime = new Date(bet.game?.start_time);
      const hour = gameTime.getHours();
      return hour >= 18 && hour <= 23;
    });

    const activeTimeSlots = bets
      .map(bet => {
        const gameTime = new Date(bet.game?.start_time);
        const hour = gameTime.getHours();
        if (hour >= 18 && hour <= 23) return 'primetime';
        if (hour >= 0 && hour <= 5) return 'night';
        if (hour >= 6 && hour <= 11) return 'morning';
        if (hour >= 12 && hour <= 17) return 'afternoon';
        return 'evening';
      })
      .join(', ');

    return {
      primetime,
      activeTimeSlots
    };
  }

  private findMutualFollows(followers1: any[], followers2: any[]): string[] {
    const mutualFollows = new Map<string, number>();
    
    // Count mutual follows
    followers1.forEach(follower => {
      if (followers2.includes(follower.following_id)) {
        const count = mutualFollows.get(follower.following_id) || 0;
        mutualFollows.set(follower.following_id, count + 1);
      }
    });
    
    // Filter mutual follows with count >= 3
    const result: string[] = [];
    mutualFollows.forEach((count, userId) => {
      if (count >= 3) {
        result.push(userId);
      }
    });
    
    return result;
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

#### Step 2.3: Integrate into EXISTING Search Tab

**File**: Update `/app/(drawer)/(tabs)/search.tsx`

Integrate with the existing discovery hook and add "Find Your Tribe" section:

```typescript
// Extend the existing useDiscovery hook
import { useDiscovery } from '@/hooks/useDiscovery';
import { friendDiscoveryService } from '@/services/rag/friendDiscoveryService';
import { AIBadge } from '@/components/common/AIBadge';

// In the Search tab component, enhance the existing discovery data:
export default function SearchScreen() {
  const { data: existingDiscovery, loading } = useDiscovery();
  const [similarUsers, setSimilarUsers] = useState<SimilarUser[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadSimilarUsers();
    }
  }, [user?.id]);

  const loadSimilarUsers = async () => {
    try {
      const similar = await friendDiscoveryService.findSimilarUsers(user.id, 5);
      setSimilarUsers(similar);
    } finally {
      setLoadingSimilar(false);
    }
  };

  return (
    <ScrollView>
      {/* Find Your Tribe - NEW AI Discovery Section */}
      <DiscoverySection
        title="Find Your Tribe"
        icon={<AIBadge variant="small" />}
        loading={loadingSimilar}
        data={similarUsers}
        renderItem={(item) => (
          <UserSearchCard
            user={item.user}
            showStats
            additionalInfo={
              <View flexDirection="row" alignItems="center" gap="$1">
                <AIBadge variant="tiny" />
                <Text fontSize="$2" color="$gray10">
                  {Math.round(item.similarity_score * 100)}% match
                </Text>
              </View>
            }
            subtitle={item.similarity_reasons[0]}
          />
        )}
        emptyMessage="Make more bets to discover similar bettors"
      />

      {/* EXISTING DISCOVERY SECTIONS */}
      {existingDiscovery?.sections.map(section => (
        <DiscoverySection key={section.id} {...section} />
      ))}
    </ScrollView>
  );
}
```

**Key Integration Points**:
- Reuses existing `DiscoverySection` and `UserSearchCard` components
- Integrates with existing `useDiscovery` hook
- Has AIBadge to indicate AI-powered feature
- Falls back gracefully if no similar users found

### Part 3: Enhance Mock Data with Behavioral Scenarios (30 minutes)

#### Step 3.1: Extend Existing Mock Generators

**File**: Update `scripts/mock/generators/bets.ts`

Add behavioral pattern generation to existing bet generator:

```typescript
import { supabase } from '@/scripts/supabase-client';

// Add to existing generateMockBets function
export async function generateMockBets(options: MockBetOptions) {
  console.log('Creating bets with behavioral patterns...');
  
  // Create natural behavioral clusters through betting patterns
  
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

#### Step 3.2: Update Existing Mock Orchestrator

**File**: Update `scripts/mock/orchestrators/unified-setup.ts`

Enhance the existing setup to include behavioral patterns:

```typescript
// In the existing unified setup, add behavioral patterns:
const setupOptions = {
  username: args.username,
  includeBehavioralPatterns: true, // NEW
  behavioralClusters: [
    { pattern: 'nba_unders', users: 5 },
    { pattern: 'nfl_weekend', users: 5 },
    { pattern: 'late_night', users: 5 },
    { pattern: 'conservative', users: 5 },
    { pattern: 'high_stakes', users: 5 }
  ]
};

// After creating mock data, generate embeddings
await execSync('bun run scripts/jobs/embedding-generation.ts --type=users --force');
await execSync('bun run scripts/jobs/embedding-generation.ts --type=posts --force');
await execSync('bun run scripts/jobs/embedding-generation.ts --type=bets --force');
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
   - [ ] favorite_teams column has been removed

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
**Solution**: Ensure betting history and user actions provide enough behavioral signal

**Issue**: RPC function fails with permission error  
**Solution**: Check RLS policies from Sprint 8.01 are active

## Next Sprint Preview

Sprint 8.06 will implement the Enhanced Feed (70/30 mixing) and Consensus Alerts, building on the embeddings and infrastructure completed here.

## Implementation Log

### Day-by-Day Progress

**2024-12-30 - Sprint Start Investigation**:
- Started: Deep codebase investigation as Executor
- Completed: Comprehensive analysis of current state
- Status: AWAITING REVIEWER APPROVAL

### Investigation Findings & Implementation Plan

**Date**: 2024-12-30  
**Executor**: E

#### Database State Analysis
- **Critical Finding**: Users table has TWO team-related columns:
  - `favorite_team` (text) - singular
  - `favorite_teams` (ARRAY) - plural (this is the one to remove per sprint plan)
- `profile_embedding` and `last_embedding_update` columns already exist from Sprint 8.01
- Migration 034 already exists (caption generation), so we'll use 035
- `find_similar_users` RPC function exists and is ready to use

#### Current Architecture Analysis
1. **Search Tab Structure**:
   - Located at `/app/(drawer)/(tabs)/search.tsx`
   - Uses `DiscoverySection` component for user categories
   - Has existing hooks: `useDiscovery` and `useSearch`
   - Uses `UserSearchCard` for user display
   - Horizontal scroll pattern for discovery sections

2. **Embedding Infrastructure**:
   - `embeddingPipeline.ts` has `updateUserProfile` that currently:
     - Extracts favorite teams from betting history
     - Updates BOTH `profile_embedding` AND `favorite_teams` (needs modification)
   - `embedding-generation.ts` job processes profiles every 4 hours
   - Job checks for embeddings older than 7 days

3. **UI Components**:
   - `AIBadge` component exists and properly uses Tamagui
   - Tamagui pattern: `import { View, Text } from '@tamagui/core'`
   - Uses token spacing: `$1`, `$2`, `$3` and colors: `$gray1`, `$gray10`

4. **Mock Data System**:
   - Sophisticated betting pattern generation exists
   - Mock orchestrator has two-phase approach (historical → fresh)
   - Production jobs process mock data identically to real data

#### Proposed Implementation Plan

**Step 1: Database Migration (15 minutes)**
- Create `supabase/migrations/035_remove_favorite_teams.sql`
- Remove `favorite_teams` ARRAY column
- Add index for embedding queries

**Step 2: Update Embedding Pipeline (1.5 hours)**
- Modify `services/rag/embeddingPipeline.ts`:
  - Remove `favorite_teams` update logic
  - Expand behavioral data collection:
    - Betting patterns (teams, sports, types, amounts, timing)
    - Social connections (follows, engagement)
    - Content patterns (posts, reactions)
    - Temporal patterns (active times)
  - Create helper functions: `analyzeBettingBehavior`, `analyzeSocialBehavior`, etc.

**Step 3: Create Friend Discovery Service (2 hours)**
- Create `services/rag/friendDiscoveryService.ts`:
  - Use existing `find_similar_users` RPC
  - Add behavioral interpretation layer
  - Generate natural language similarity reasons
  - Handle edge cases (no bets, new users)

**Step 4: Integrate into Search Tab (30 minutes)**
- Update `/app/(drawer)/(tabs)/search.tsx`:
  - Add "Find Your Tribe" as FIRST discovery section
  - Use existing `DiscoverySection` and `UserSearchCard`
  - Add AIBadge integration for match percentage
  - Handle loading/error states

**Step 5: Enhance Mock Data (30 minutes)**
- Update `scripts/mock/generators/bets.ts`:
  - Add behavioral clustering functions
  - Create 5 distinct patterns:
    - Lakers/unders cluster
    - NFL weekend warriors
    - Late night degenerates
    - Conservative bettors
    - High stakes players
  - Build social connections within clusters

### Questions Requiring Reviewer Clarification

1. **AIBadge Display Options**
   - **Context**: AIBadge component exists with `variant` and `text` props
   - **Question**: For inline display (e.g., "85% match"), should I:
     a) Use existing `variant="small"` with custom text?
     b) Add a new `variant="tiny"` for inline use?
     c) Create a separate component for match percentage?
   - **My Recommendation**: Option A - use existing small variant

2. **Behavioral Analysis Depth**
   - **Context**: Can analyze multiple behavioral dimensions
   - **Question**: How detailed should similarity reasons be?
   - **Options**:
     a) Simple: "Similar betting style"
     b) Specific: "Both bet Lakers unders frequently"
     c) Detailed: "75% of bets on NBA unders, avg $50 stakes, active late nights"
   - **My Recommendation**: Option B - specific but concise

3. **Discovery Section Placement**
   - **Context**: Search tab has 4 existing sections (Hot Bettors, Trending, Fade, Rising)
   - **Question**: Should Find Your Tribe:
     a) Replace an existing section?
     b) Be added as 5th section at the top?
     c) Be added at the bottom?
   - **My Recommendation**: Option B - add as first section (most personalized)

4. **Embedding Update Frequency**
   - **Context**: Current job updates profiles older than 7 days
   - **Question**: For behavioral embeddings, should we:
     a) Keep 7-day update cycle?
     b) Update more frequently (e.g., daily)?
     c) Update on significant activity (e.g., 10+ new bets)?
   - **My Recommendation**: Option A for now, monitor and adjust

5. **Similar User Count**
   - **Context**: RPC function accepts a limit parameter
   - **Question**: How many similar users to show initially?
     a) 5 users (quick to load, focused)
     b) 10 users (more options)
     c) 20 users (comprehensive)
   - **My Recommendation**: Option A - 5 users for performance

6. **Empty State Behavior**
   - **Context**: New users or users with few bets won't have good matches
   - **Question**: What to show when no similar users found?
     a) Hide the section entirely
     b) Show "Make more bets to discover similar bettors"
     c) Show generic popular users instead
   - **My Recommendation**: Option B - educational empty state

### Technical Decisions Made
1. **Use existing RPC function** - `find_similar_users` already handles privacy/blocking
2. **Extend existing components** - Reuse `DiscoverySection` and `UserSearchCard`
3. **Service architecture** - Create new `friendDiscoveryService` following existing patterns
4. **Behavioral over static** - Remove stored preferences, derive everything from actions

### Risk Mitigation
- **Performance**: Limit to 5 users, use existing ivfflat indexes
- **Empty data**: Graceful handling with educational messaging
- **Type safety**: Define all interfaces upfront
- **Testing**: Use mock data clusters to verify algorithm

**Sprint Status**: AWAITING REVIEWER APPROVAL

---

## Reviewer Section

**Reviewer**: R (Project Reviewer)  
**Review Date**: 2024-12-30

### Review Outcome

**Status**: APPROVED WITH CORRECTIONS

### Critical Correction Required

**Remove BOTH team-related columns** for true behavioral AI:
- `favorite_team` (text) - singular
- `favorite_teams` (ARRAY) - plural

The sprint plan originally mentioned only `favorite_teams`, but for pure behavioral AI, we should not store ANY team preferences. Team affinity should be discovered dynamically from behavioral embeddings.

### Answers to Questions

1. **AIBadge Display** → **Approved: Option A**
   - Use existing `variant="small"` with custom text like "85% match"
   - Maintains consistency with existing UI patterns

2. **Behavioral Analysis Depth** → **Approved: Option B**
   - Specific but concise: "Both bet Lakers unders frequently"
   - Gives users actionable insight without overwhelming detail

3. **Discovery Section Placement** → **Approved: Option B**
   - Add as FIRST section at the top
   - Most personalized content should be most prominent

4. **Embedding Update Frequency** → **Approved: Option A with modification**
   - Keep 7-day cycle for now
   - ADD: Check for significant activity (if user has 20+ new bets since last update, trigger early update)

5. **Similar User Count** → **Approved: Option A**
   - Show 5 users initially
   - Good balance of performance and discovery

6. **Empty State Behavior** → **Approved: Option B**
   - Show educational message: "Make more bets to discover similar bettors"
   - Helps users understand the feature

### Additional Implementation Guidance

1. **Behavioral Profile Text Structure**:
```typescript
const behavioralProfile = `
  ${username} betting behavior:
  - Frequently bets on: ${topTeams.join(', ')} 
  - Prefers ${dominantBetType} bets (${betTypePercentage}%)
  - Active during ${activeTimeSlots}
  - Average stake: $${avgStake}
  - Betting style: ${bettingStyle} // e.g., "conservative", "aggressive"
  - Social connections: follows ${similarBettorCount} similar bettors
`;
```

2. **Remove ALL Team Preference Logic**:
   - Remove any code that extracts or stores team preferences
   - Team preferences should ONLY exist as patterns within the embedding vector

3. **Similarity Reason Generation**:
```typescript
// DON'T: Check stored favorite_teams
// DO: Analyze betting patterns dynamically
const commonTeams = findCommonlyBetTeams(user1Bets, user2Bets);
if (commonTeams.length > 0) {
  reasons.push(`Both frequently bet on ${commonTeams[0]} games`);
}
```

### Approved Implementation Plan

**Step 1: Database Migration (15 minutes)**
- Remove BOTH `favorite_team` and `favorite_teams` columns
- Add index for embedding queries

**Step 2: Update Embedding Pipeline (1.5 hours)**
- Remove ALL team preference extraction/storage logic
- Implement rich behavioral profile generation
- Add early update trigger for 20+ new bets

**Step 3: Create Friend Discovery Service (2 hours)**
- Dynamic team preference discovery from bets
- Natural language similarity reasons
- No stored preferences used

**Step 4: Search Tab Integration (30 minutes)**
- Add as FIRST discovery section
- Use `variant="small"` AIBadge with match percentage

**Step 5: Mock Data Enhancement (30 minutes)**
- Create 5 behavioral clusters
- Build natural social connections

**Sprint Status**: APPROVED - READY FOR IMPLEMENTATION

### Post-Review Updates

**2024-12-30**: Implementation plan approved with corrections. Key changes:
- Remove BOTH team columns (not just array)
- Add activity-based embedding update trigger
- Ensure pure behavioral approach throughout