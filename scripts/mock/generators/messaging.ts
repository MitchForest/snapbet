#!/usr/bin/env bun

import { supabase } from '../../supabase-client';
import type { Database } from '@/types/database';
import { MOCK_CONFIG } from '../config';
import { messageTemplates, getRandomTemplate } from '../templates';
import { getPersonalityFromBehavior } from '../utils/helpers';

type Tables = Database['public']['Tables'];
type User = Tables['users']['Row'];
type MockUser = User & { mock_personality_id: string | null };

interface Chat {
  id: string;
  name?: string;
  chat_type: 'dm' | 'group';
  created_by: string;
  created_at: string;
}

export async function createMessaging(userId: string, mockUsers: MockUser[]) {
  console.log('💬 Creating messaging...');

  const chats: Chat[] = [];
  const chatMembers = [];
  const messages = [];

  // 1. Create DM chats
  const dmUsers = mockUsers.sort(() => Math.random() - 0.5).slice(0, MOCK_CONFIG.messaging.dmChats);

  for (const dmUser of dmUsers) {
    const chatId = crypto.randomUUID();
    const createdAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();

    chats.push({
      id: chatId,
      chat_type: 'dm',
      created_by: userId,
      created_at: createdAt,
    });

    // Add both members
    chatMembers.push(
      { chat_id: chatId, user_id: userId, joined_at: createdAt },
      { chat_id: chatId, user_id: dmUser.id, joined_at: createdAt }
    );

    // Create messages
    const messageCount = Math.floor(Math.random() * 15) + 5;
    for (let i = 0; i < messageCount; i++) {
      const isUserMessage = Math.random() < MOCK_CONFIG.messaging.userMessageRatio;
      const senderId = isUserMessage ? userId : dmUser.id;
      const personality = isUserMessage
        ? 'degen'
        : getPersonalityFromBehavior(dmUser.mock_personality_id);

      const templates = messageTemplates[personality as keyof typeof messageTemplates];
      const content = getRandomTemplate(templates?.greeting || ['Hey!']);

      messages.push({
        id: crypto.randomUUID(),
        chat_id: chatId,
        sender_id: senderId,
        content,
        message_type: 'text' as const,
        created_at: new Date(new Date(createdAt).getTime() + i * 30 * 60 * 1000).toISOString(),
      });
    }
  }

  // 2. Create group chats
  for (let i = 0; i < MOCK_CONFIG.messaging.groupChats; i++) {
    const chatId = crypto.randomUUID();
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();

    const groupName =
      MOCK_CONFIG.messaging.groupNames[
        Math.floor(Math.random() * MOCK_CONFIG.messaging.groupNames.length)
      ];

    chats.push({
      id: chatId,
      name: groupName,
      chat_type: 'group',
      created_by: userId,
      created_at: createdAt,
    });

    // Add members (including main user)
    const memberCount = Math.floor(Math.random() * 5) + 3;
    const groupMembers = [
      userId,
      ...mockUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, memberCount - 1)
        .map((u) => u.id),
    ];

    for (const memberId of groupMembers) {
      chatMembers.push({
        chat_id: chatId,
        user_id: memberId,
        joined_at: createdAt,
      });
    }

    // Create initial system message
    messages.push({
      id: crypto.randomUUID(),
      chat_id: chatId,
      sender_id: userId,
      content: `${groupName} created`,
      message_type: 'system' as const,
      created_at: new Date(new Date(createdAt).getTime() + 30 * 60 * 1000).toISOString(),
    });

    // Create group messages
    const messageCount = Math.floor(Math.random() * 30) + 10;
    for (let j = 0; j < messageCount; j++) {
      const senderId = groupMembers[Math.floor(Math.random() * groupMembers.length)];
      const isUserMessage = senderId === userId;

      const senderUser = mockUsers.find((u) => u.id === senderId);
      const personality = isUserMessage
        ? 'degen'
        : getPersonalityFromBehavior(senderUser?.mock_personality_id || '');

      const templates = messageTemplates[personality as keyof typeof messageTemplates];
      const content = getRandomTemplate(templates?.reaction || ['Nice!']);

      messages.push({
        id: crypto.randomUUID(),
        chat_id: chatId,
        sender_id: senderId,
        content,
        message_type: 'text' as const,
        created_at: new Date(
          new Date(createdAt).getTime() + (j + 1) * 60 * 60 * 1000
        ).toISOString(),
      });
    }
  }

  // Insert all data
  if (chats.length > 0) {
    const { error: chatError } = await supabase.from('chats').insert(chats);
    if (chatError) {
      console.error('Error creating chats:', chatError);
      return { chats: [], messages: [] };
    }

    const { error: memberError } = await supabase.from('chat_members').insert(chatMembers);
    if (memberError) console.error('Error adding chat members:', memberError);

    const { error: messageError } = await supabase.from('messages').insert(messages);
    if (messageError) console.error('Error creating messages:', messageError);

    console.log(
      `  ✅ Created ${dmUsers.length} DM chats and ${MOCK_CONFIG.messaging.groupChats} group chats`
    );
    console.log(`  ✅ Created ${messages.length} messages`);
  }

  return { chats, messages };
}
