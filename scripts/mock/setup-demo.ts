#!/usr/bin/env bun

/**
 * Unified demo setup script that creates a complete mock ecosystem
 * Including adding the current user to demo chats
 */

import { supabase } from '@/services/supabase/client';
import { prepareDemo } from './demo-scenarios';
import { generateHourlyActivity } from './activity-generator';

// Get current user ID from environment or command line
async function getCurrentUserId(): Promise<string | null> {
  // Try to get from command line first
  const userIdArg = process.argv.find((arg) => arg.startsWith('--user-id='));
  if (userIdArg) {
    return userIdArg.split('=')[1];
  }

  // Try to get from Supabase auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id || null;
}

// Add user to all demo chats
async function addUserToChats(userId: string) {
  console.log('📱 Adding you to demo chats...');

  // Get all group chats
  const { data: chats } = await supabase
    .from('chats')
    .select('id, name')
    .eq('chat_type', 'group')
    .in('name', ['NBA Degens 🏀', 'Saturday Squad 🏈', 'Degen Support Group 🫂']);

  if (!chats) return;

  for (const chat of chats) {
    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('chat_members')
      .select('id')
      .eq('chat_id', chat.id)
      .eq('user_id', userId)
      .single();

    if (!existingMember) {
      await supabase.from('chat_members').insert({
        chat_id: chat.id,
        user_id: userId,
        role: 'member' as const,
      });
      console.log(`  ✅ Added to "${chat.name}"`);
    } else {
      console.log(`  ⏭️  Already in "${chat.name}"`);
    }
  }
}

// Main setup function
async function setupDemo() {
  console.log('🎬 Setting up complete demo environment...\n');

  try {
    // 1. Check if mock users exist
    const { data: mockUsers, error: mockError } = await supabase
      .from('users')
      .select('id')
      .eq('is_mock', true)
      .limit(1);

    if (mockError || !mockUsers || mockUsers.length === 0) {
      console.error('❌ No mock users found. Please run: bun run scripts/seed-mock-users.ts');
      process.exit(1);
    }

    // 2. Create fresh content for new user experience
    console.log('🏗️  Creating new user experience...');
    await prepareDemo('new-user');

    // 3. Add some betting activity
    console.log('\n🎲 Creating betting activity...');
    await prepareDemo('saturday-football');

    // 4. Generate some additional hourly activity
    console.log('\n⏰ Generating recent activity...');
    await generateHourlyActivity();

    // 5. Add current user to chats if possible
    const userId = await getCurrentUserId();
    if (userId) {
      console.log('\n');
      await addUserToChats(userId);
    } else {
      console.log(
        '\n⚠️  Could not determine current user. Run with --user-id=YOUR_USER_ID to join chats.'
      );
    }

    console.log('\n✅ Demo environment ready!');
    console.log('\n📋 What was created:');
    console.log('  • Recent posts with picks and reactions');
    console.log('  • Active group chats with conversations');
    console.log('  • Mock users placing bets');
    console.log('  • Tail/fade actions on picks');
    console.log('  • Comments and reactions');
    console.log('\n🚀 You can now explore the app with realistic content!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
setupDemo();
