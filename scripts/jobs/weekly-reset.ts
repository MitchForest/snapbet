#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function performWeeklyResets() {
  console.log('🔄 Starting weekly bankroll reset...');
  console.log(`📅 Reset time: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`);

  try {
    // Get all users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, referral_count');

    if (usersError) {
      console.error('❌ Failed to fetch users:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found to reset');
      return;
    }

    console.log(`👥 Found ${users.length} users to reset`);

    let successCount = 0;
    let failureCount = 0;

    // Reset each user's bankroll
    for (const user of users) {
      try {
        // Call the reset_bankroll function
        const { error } = await supabase.rpc('reset_bankroll', {
          p_user_id: user.id,
        });

        if (error) {
          console.error(`❌ Failed to reset ${user.username}:`, error.message);
          failureCount++;
        } else {
          const referralBonus = (user.referral_count || 0) * 100;
          const totalBankroll = 1000 + referralBonus;
          console.log(
            `✅ Reset ${user.username}: $${totalBankroll} (base: $1,000 + referrals: $${referralBonus})`
          );
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error resetting ${user.username}:`, error);
        failureCount++;
      }
    }

    // Reset weekly badges
    console.log('\n🏆 Resetting weekly badges...');
    const { error: badgeError } = await supabase.rpc('reset_weekly_badges');

    if (badgeError) {
      console.error('❌ Failed to reset weekly badges:', badgeError);
    } else {
      console.log('✅ Weekly badges reset successfully');
    }

    // Summary
    console.log('\n📊 Weekly Reset Summary:');
    console.log(`✅ Successful resets: ${successCount}`);
    console.log(`❌ Failed resets: ${failureCount}`);
    console.log(`🏆 Badges reset: ${badgeError ? 'Failed' : 'Success'}`);
    console.log(`⏰ Next reset: Monday at midnight`);
  } catch (error) {
    console.error('❌ Fatal error during weekly reset:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  performWeeklyResets()
    .then(() => {
      console.log('\n✅ Weekly reset complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Weekly reset failed:', error);
      process.exit(1);
    });
}

export { performWeeklyResets };
