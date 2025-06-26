import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

async function checkReactions() {
  console.log('Checking reactions in database...\n');

  // Get all reactions
  const { data: reactions, error: reactionsError } = await supabase
    .from('reactions')
    .select('*')
    .limit(10);

  if (reactionsError) {
    console.error('Error fetching reactions:', reactionsError);
    return;
  }

  console.log(`Found ${reactions?.length || 0} reactions`);
  if (reactions && reactions.length > 0) {
    console.log('Sample reactions:', reactions.slice(0, 3));
  }

  // Get reaction counts by post
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('id, reaction_count')
    .not('reaction_count', 'is', null)
    .gt('reaction_count', 0)
    .limit(5);

  if (postsError) {
    console.error('Error fetching posts:', postsError);
    return;
  }

  console.log(`\nFound ${posts?.length || 0} posts with reactions`);
  if (posts && posts.length > 0) {
    posts.forEach((post) => {
      console.log(`Post ${post.id.slice(0, 8)}... has ${post.reaction_count} reactions`);
    });
  }

  // If no reactions, add some test reactions
  if (!reactions || reactions.length === 0) {
    console.log('\nNo reactions found. Adding test reactions...');

    // Get a post to add reactions to
    const { data: testPost } = await supabase.from('posts').select('id').limit(1).single();

    if (testPost) {
      // Get some users
      const { data: users } = await supabase.from('users').select('id').limit(3);

      if (users && users.length > 0) {
        const emojis = ['🔥', '💰', '😂'];

        for (let i = 0; i < users.length; i++) {
          const { error } = await supabase.from('reactions').insert({
            post_id: testPost.id,
            user_id: users[i].id,
            emoji: emojis[i],
          });

          if (error) {
            console.error(`Error adding reaction: ${error.message}`);
          } else {
            console.log(`Added ${emojis[i]} reaction from user ${users[i].id.slice(0, 8)}...`);
          }
        }

        console.log('\nTest reactions added! Run the script again to see them.');
      }
    }
  }
}

checkReactions().catch(console.error);
