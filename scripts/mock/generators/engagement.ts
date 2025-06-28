#!/usr/bin/env bun

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';
import { MOCK_CONFIG, ALLOWED_EMOJIS } from '../config';
import { messageTemplates, getRandomTemplate } from '../templates';
import { getPersonalityFromBehavior } from '../utils/helpers';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type Post = Tables['posts']['Row'];

type MockUser = User & {
  mock_personality_id: string | null;
};

export async function createEngagementForPosts(posts: Post[], mockUsers: MockUser[]) {
  console.log('💬 Creating engagement...');

  const reactions = [];
  const comments = [];
  const pickActions = [];

  for (const post of posts) {
    // Skip if post doesn't have an ID
    if (!post.id) continue;

    // Add reactions
    const reactionCount =
      Math.floor(
        Math.random() *
          (MOCK_CONFIG.content.engagement.reactionsPerPost.max -
            MOCK_CONFIG.content.engagement.reactionsPerPost.min)
      ) + MOCK_CONFIG.content.engagement.reactionsPerPost.min;

    const reactingUsers = mockUsers
      .filter((u) => u.id !== post.user_id)
      .sort(() => Math.random() - 0.5)
      .slice(0, reactionCount);

    for (const reactor of reactingUsers) {
      reactions.push({
        post_id: post.id,
        user_id: reactor.id,
        emoji: ALLOWED_EMOJIS[Math.floor(Math.random() * ALLOWED_EMOJIS.length)],
      });
    }

    // Add comments
    const commentCount =
      Math.floor(
        Math.random() *
          (MOCK_CONFIG.content.engagement.commentsPerPost.max -
            MOCK_CONFIG.content.engagement.commentsPerPost.min)
      ) + MOCK_CONFIG.content.engagement.commentsPerPost.min;

    const commentingUsers = mockUsers
      .filter((u) => u.id !== post.user_id)
      .sort(() => Math.random() - 0.5)
      .slice(0, commentCount);

    for (const commenter of commentingUsers) {
      const personality = getPersonalityFromBehavior(commenter.mock_personality_id || '');
      const templates = messageTemplates[personality as keyof typeof messageTemplates];
      const content = getRandomTemplate(templates?.reaction || ["Let's go!"]);

      comments.push({
        post_id: post.id,
        user_id: commenter.id,
        content: content,
      });
    }

    // Add pick actions for pick posts
    if (post.post_type === 'pick') {
      const tailCount =
        Math.floor(
          Math.random() *
            (MOCK_CONFIG.content.engagement.tailsPerPick.max -
              MOCK_CONFIG.content.engagement.tailsPerPick.min)
        ) + MOCK_CONFIG.content.engagement.tailsPerPick.min;

      const tailingUsers = mockUsers
        .filter((u) => u.id !== post.user_id)
        .sort(() => Math.random() - 0.5)
        .slice(0, tailCount);

      for (const tailer of tailingUsers) {
        pickActions.push({
          post_id: post.id,
          user_id: tailer.id,
          action_type: Math.random() > 0.8 ? ('fade' as const) : ('tail' as const),
        });
      }
    }
  }

  // Insert all engagement
  if (reactions.length > 0) {
    const { error } = await supabase.from('reactions').insert(reactions);
    if (error) console.error('Error creating reactions:', error);
    else console.log(`  ✅ Created ${reactions.length} reactions`);
  }

  if (comments.length > 0) {
    const { error } = await supabase.from('comments').insert(comments);
    if (error) console.error('Error creating comments:', error);
    else console.log(`  ✅ Created ${comments.length} comments`);
  }

  if (pickActions.length > 0) {
    const { error } = await supabase.from('pick_actions').insert(pickActions);
    if (error) console.error('Error creating pick actions:', error);
    else console.log(`  ✅ Created ${pickActions.length} pick actions`);
  }

  return { reactions, comments, pickActions };
}
