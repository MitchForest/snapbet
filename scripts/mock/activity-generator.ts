import { supabase } from '@/services/supabase/client';
import {
  messageTemplates,
  postTemplates,
  getRandomTemplate,
  fillTemplate,
  getPersonalityFromBehavior,
  mockMediaUrls,
} from './templates';
import type { Database } from '@/types/supabase-generated';

type Tables = Database['public']['Tables'];
type MockUser = Tables['users']['Row'] & { is_mock: true };

// Activity patterns by personality type and time of day
const activityPatterns = {
  'sharp-bettor': {
    morning: { post: 0.3, message: 0.2, reaction: 0.2, tailFade: 0.2, comment: 0.1 },
    afternoon: { post: 0.25, message: 0.2, reaction: 0.2, tailFade: 0.25, comment: 0.1 },
    evening: { post: 0.15, message: 0.25, reaction: 0.2, tailFade: 0.25, comment: 0.15 },
  },
  degen: {
    morning: { post: 0.1, message: 0.15, reaction: 0.35, tailFade: 0.3, comment: 0.1 },
    afternoon: { post: 0.2, message: 0.2, reaction: 0.25, tailFade: 0.25, comment: 0.1 },
    evening: { post: 0.35, message: 0.2, reaction: 0.15, tailFade: 0.2, comment: 0.1 },
  },
  'fade-material': {
    morning: { post: 0.25, message: 0.25, reaction: 0.2, tailFade: 0.15, comment: 0.15 },
    afternoon: { post: 0.3, message: 0.2, reaction: 0.2, tailFade: 0.15, comment: 0.15 },
    evening: { post: 0.3, message: 0.25, reaction: 0.15, tailFade: 0.15, comment: 0.15 },
  },
  contrarian: {
    morning: { post: 0.2, message: 0.2, reaction: 0.2, tailFade: 0.3, comment: 0.1 },
    afternoon: { post: 0.25, message: 0.2, reaction: 0.15, tailFade: 0.3, comment: 0.1 },
    evening: { post: 0.2, message: 0.25, reaction: 0.15, tailFade: 0.3, comment: 0.1 },
  },
  homer: {
    morning: { post: 0.15, message: 0.2, reaction: 0.3, tailFade: 0.25, comment: 0.1 },
    afternoon: { post: 0.2, message: 0.2, reaction: 0.25, tailFade: 0.25, comment: 0.1 },
    evening: { post: 0.35, message: 0.2, reaction: 0.15, tailFade: 0.2, comment: 0.1 },
  },
  'live-bettor': {
    morning: { post: 0.05, message: 0.2, reaction: 0.35, tailFade: 0.3, comment: 0.1 },
    afternoon: { post: 0.15, message: 0.2, reaction: 0.3, tailFade: 0.25, comment: 0.1 },
    evening: { post: 0.4, message: 0.15, reaction: 0.15, tailFade: 0.2, comment: 0.1 },
  },
  'parlay-degen': {
    morning: { post: 0.25, message: 0.2, reaction: 0.2, tailFade: 0.25, comment: 0.1 },
    afternoon: { post: 0.2, message: 0.25, reaction: 0.2, tailFade: 0.25, comment: 0.1 },
    evening: { post: 0.2, message: 0.25, reaction: 0.2, tailFade: 0.25, comment: 0.1 },
  },
};

// Reaction emoji patterns by personality
const reactionPatterns = {
  'sharp-bettor': ['💯', '📊', '✅', '🎯'],
  degen: ['🔥', '🚀', '😭', '🙏', '💀'],
  'fade-material': ['😤', '🤬', '😂', '🤡'],
  contrarian: ['🤔', '🎣', '📉', '🔄'],
  homer: ['❤️', '💪', '🏆', '🔥'],
  'live-bettor': ['👀', '📺', '⚡', '💰'],
  'parlay-degen': ['🎰', '🤞', '😰', '🌙'],
};

// Get time period for activity patterns
function getTimePeriod(hour: number): 'morning' | 'afternoon' | 'evening' {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}

// Get mock users active at this hour
async function getMockUsersForHour(hour: number): Promise<MockUser[]> {
  const { data: mockUsers, error } = await supabase
    .from('users')
    .select('*')
    .eq('is_mock', true)
    .not('deleted_at', 'is', null);

  if (error || !mockUsers) return [];

  // Filter by personality active hours (simplified - most active 8am-11pm)
  return (mockUsers as MockUser[]).filter((user) => {
    const personality = getPersonalityFromBehavior(user.mock_personality_id || '');

    // Different personalities have different active patterns
    if (personality === 'sharp-bettor' && hour >= 6 && hour <= 10) return true;
    if (personality === 'degen' && (hour >= 20 || hour <= 2)) return true;
    if (personality === 'live-bettor' && hour >= 19) return true;

    // General activity hours for others
    return hour >= 8 && hour <= 23;
  });
}

// Pick activity type based on personality and time
function pickActivityType(
  personality: string,
  hour: number
): 'post' | 'message' | 'reaction' | 'tailFade' | 'comment' {
  const period = getTimePeriod(hour);
  const patterns =
    activityPatterns[personality as keyof typeof activityPatterns] || activityPatterns['degen'];
  const weights = patterns[period];

  const random = Math.random();
  let cumulative = 0;

  cumulative += weights.post;
  if (random < cumulative) return 'post';

  cumulative += weights.message;
  if (random < cumulative) return 'message';

  cumulative += weights.reaction;
  if (random < cumulative) return 'reaction';

  cumulative += weights.tailFade;
  if (random < cumulative) return 'tailFade';

  return 'comment';
}

// Create a mock post
async function createMockPost(user: MockUser, _personality: string) {
  // Check if user has recent unsettled bets
  const { data: recentBets } = await supabase
    .from('bets')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1);

  const hasPendingBet = recentBets && recentBets.length > 0;

  // Determine post type
  let postType: 'pick' | 'reaction' | 'outcome';
  if (hasPendingBet && Math.random() < 0.5) {
    postType = 'pick';
  } else if (Math.random() < 0.3) {
    postType = 'outcome';
  } else {
    postType = 'reaction';
  }

  // Get appropriate template
  let caption = '';
  let mediaUrl = '';

  if (postType === 'pick' && hasPendingBet && recentBets && recentBets.length > 0) {
    const template = getRandomTemplate(postTemplates['pick-share'].normal);
    caption = fillTemplate(template, {
      team: 'Lakers', // Would extract from bet.bet_details
      spread: '-5.5',
      odds: '-110',
      type: 'spread',
      line: '-5.5',
      confidence: 'medium',
    });
  } else if (postType === 'outcome') {
    const isWin = Math.random() < 0.5;
    const templates = isWin
      ? postTemplates['outcome-positive'].normal
      : postTemplates['outcome-negative'].normal;
    caption = fillTemplate(getRandomTemplate(templates), {
      result: isWin ? 'W' : 'L',
      record: `${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 10)}`,
      team: 'Lakers',
      profit: '+$250',
    });
  } else {
    // Reaction post
    const templates = postTemplates['reaction'].exciting;
    caption = getRandomTemplate(templates);
    mediaUrl = mockMediaUrls.reaction[Math.floor(Math.random() * mockMediaUrls.reaction.length)];
  }

  // Create the post
  await supabase.from('posts').insert({
    user_id: user.id,
    caption,
    media_url: mediaUrl || mockMediaUrls.reaction[0],
    media_type: 'photo' as const,
    post_type: postType === 'pick' ? 'pick' : 'content',
    bet_id:
      postType === 'pick' && hasPendingBet && recentBets && recentBets.length > 0
        ? recentBets[0].id
        : null,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}

// Send a mock message to an existing chat
async function sendMockMessage(user: MockUser, personality: string) {
  // Find a chat this user is part of
  const { data: userChats } = await supabase
    .from('chat_members')
    .select('chat_id')
    .eq('user_id', user.id)
    .limit(5);

  if (!userChats || userChats.length === 0) return;

  // Pick a random chat
  const chatId = userChats[Math.floor(Math.random() * userChats.length)].chat_id;

  // Get message template
  const templates =
    messageTemplates[personality as keyof typeof messageTemplates] || messageTemplates['degen'];
  const messageType = Math.random() < 0.5 ? 'greeting' : 'discussion';
  const template = getRandomTemplate(
    templates[messageType as keyof typeof templates] || templates.greeting
  );

  const content = fillTemplate(template, {
    team: 'Lakers',
    game: 'Lakers vs Celtics',
    favoriteTeam: user.favorite_team || 'Lakers',
  });

  // Send the message
  await supabase.from('messages').insert({
    chat_id: chatId,
    sender_id: user.id,
    content,
    message_type: 'text',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  });
}

// Add tail/fade action to a pick post
async function addTailFadeAction(user: MockUser, personality: string) {
  // Find recent pick posts from other users
  const { data: recentPicks } = await supabase
    .from('posts')
    .select('id, user_id, caption')
    .eq('post_type', 'pick')
    .neq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentPicks || recentPicks.length === 0) return;

  // Pick a random post
  const post = recentPicks[Math.floor(Math.random() * recentPicks.length)];

  // Check if already acted on this post
  const { data: existingAction } = await supabase
    .from('pick_actions')
    .select('id')
    .eq('post_id', post.id)
    .eq('user_id', user.id)
    .single();

  if (existingAction) return;

  // Decide to tail or fade based on personality
  const fadePersonalities = ['contrarian', 'fade-material', 'sharp-bettor'];
  const shouldFade = fadePersonalities.includes(personality)
    ? Math.random() < 0.6
    : Math.random() < 0.3;
  const action = shouldFade ? 'fade' : 'tail';

  // Add the action
  await supabase.from('pick_actions').insert({
    post_id: post.id,
    user_id: user.id,
    action_type: action as Database['public']['Enums']['pick_action'],
  });

  console.log(`  ${action === 'tail' ? '👥' : '🚫'} ${user.username} ${action}ed a pick`);
}

// Add a comment to a recent post
async function addMockComment(user: MockUser, personality: string) {
  // Find recent posts to comment on
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, user_id, post_type, caption')
    .neq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentPosts || recentPosts.length === 0) return;

  const post = recentPosts[Math.floor(Math.random() * recentPosts.length)];

  // Generate comment based on personality and post type
  const templates =
    messageTemplates[personality as keyof typeof messageTemplates] || messageTemplates['degen'];

  let comment = '';
  if (post.post_type === 'pick') {
    // Comment on picks
    comment = getRandomTemplate(templates.discussion || templates.greeting);
  } else {
    // Comment on content/reactions
    comment = getRandomTemplate(templates.reaction || templates.greeting);
  }

  comment = fillTemplate(comment, {
    team: 'Lakers',
    game: 'Lakers vs Celtics',
  });

  await supabase.from('comments').insert({
    post_id: post.id,
    user_id: user.id,
    content: comment,
  });

  console.log(`  💬 ${user.username} commented: "${comment.substring(0, 30)}..."`);
}

// Add a mock reaction to a recent post
async function addMockReaction(user: MockUser, personality: string) {
  // Find recent posts from other users
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id')
    .neq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!recentPosts || recentPosts.length === 0) return;

  // Pick a random post
  const postId = recentPosts[Math.floor(Math.random() * recentPosts.length)].id;

  // Check if already reacted
  const { data: existingReaction } = await supabase
    .from('reactions')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (existingReaction) return;

  // Get reaction emoji based on personality
  const emojis =
    reactionPatterns[personality as keyof typeof reactionPatterns] || reactionPatterns['degen'];
  const emoji = emojis[Math.floor(Math.random() * emojis.length)];

  // Add reaction
  await supabase.from('reactions').insert({
    post_id: postId,
    user_id: user.id,
    emoji,
  });
}

// Main hourly activity generation function
export async function generateHourlyActivity() {
  const hour = new Date().getHours();
  const mockUsers = await getMockUsersForHour(hour);

  console.log(`🤖 Generating activity for ${mockUsers.length} mock users at hour ${hour}`);

  for (const user of mockUsers) {
    const personality = getPersonalityFromBehavior(user.mock_personality_id || '');

    // 30% chance of activity per hour per user
    if (Math.random() < 0.3) {
      const activityType = pickActivityType(personality, hour);

      try {
        switch (activityType) {
          case 'post':
            await createMockPost(user, personality);
            console.log(`  📝 ${user.username} created a post`);
            break;
          case 'message':
            await sendMockMessage(user, personality);
            console.log(`  💬 ${user.username} sent a message`);
            break;
          case 'reaction':
            await addMockReaction(user, personality);
            console.log(`  ❤️ ${user.username} reacted to a post`);
            break;
          case 'tailFade':
            await addTailFadeAction(user, personality);
            break;
          case 'comment':
            await addMockComment(user, personality);
            break;
        }
      } catch (error) {
        console.error(`Error generating ${activityType} for ${user.username}:`, error);
      }
    }
  }

  console.log('✅ Hourly activity generation complete');
}

// Helper to clear recent activity (for demos)
export async function clearRecentActivity(hoursAgo: number = 24) {
  const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();

  // Get mock users first
  const { data: mockUsers } = await supabase.from('users').select('id').eq('is_mock', true);

  if (!mockUsers || mockUsers.length === 0) return;

  const mockUserIds = mockUsers.map((u) => u.id);

  // Delete recent posts
  await supabase.from('posts').delete().gte('created_at', cutoffTime).in('user_id', mockUserIds);

  // Delete recent messages
  await supabase
    .from('messages')
    .delete()
    .gte('created_at', cutoffTime)
    .in('sender_id', mockUserIds);

  console.log('🧹 Cleared recent mock activity');
}
