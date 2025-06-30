#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '../supabase-client';
import { embeddingPipeline } from '@/services/rag/embeddingPipeline';
import { ragService } from '@/services/rag/ragService';
import { aiReasoningService } from '@/services/ai/aiReasoningService';
import type { Database } from '@/types/database';

type Bet = Database['public']['Tables']['bets']['Row'] & {
  game?: Database['public']['Tables']['games']['Row'];
};

interface ExtendedJobOptions extends JobOptions {
  setupMode?: boolean;
  user?: string;
}

export class EmbeddingGenerationJob extends BaseJob {
  constructor() {
    super({
      name: 'embedding-generation',
      description: 'Generate embeddings for archived content without embeddings',
      schedule: '0 */4 * * *', // Every 4 hours
      timeout: 300000, // 5 minutes
    });
  }

  async run(options: ExtendedJobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalProcessed = 0;
    const details: Record<string, number> = {};

    try {
      // Check for OpenAI API key
      const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      if (!openaiApiKey) {
        console.error('Missing EXPO_PUBLIC_OPENAI_API_KEY environment variable');
        return {
          success: false,
          message: 'OpenAI API key not configured',
          affected: 0,
          details,
        };
      }

      // Initialize the services with required credentials
      ragService.initialize(openaiApiKey);
      embeddingPipeline.initialize(supabase);
      aiReasoningService.initialize(supabase);

      if (options.setupMode) {
        console.log('🚀 Running in SETUP MODE - processing ALL content');
      }

      // 1. Process posts
      const processedPosts = await this.processArchivedPosts(options);
      totalProcessed += processedPosts;
      details.posts = processedPosts;

      // 2. Process bets
      const processedBets = await this.processArchivedBets(options);
      totalProcessed += processedBets;
      details.bets = processedBets;

      // 3. Update user profiles
      const processedUsers = await this.updateUserProfiles(options);
      totalProcessed += processedUsers;
      details.users = processedUsers;

      return {
        success: true,
        message: `Generated embeddings for ${totalProcessed} items`,
        affected: totalProcessed,
        details,
      };
    } catch (error) {
      console.error('Embedding generation failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        affected: totalProcessed,
        details,
      };
    }
  }

  private async processArchivedPosts(options: ExtendedJobOptions): Promise<number> {
    // Find posts without embeddings
    const limit = options.limit || (options.setupMode ? 1000 : 50);

    let query = supabase
      .from('posts')
      .select('*')
      .is('embedding', null)
      .not('caption', 'is', null)
      .limit(limit);

    // In setup mode, process ALL posts, not just archived
    if (!options.setupMode) {
      query = query.eq('archived', true);
    }

    // If specific user is requested
    if (options.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('username', options.user)
        .single();

      if (userData) {
        query = query.eq('user_id', userData.id);
      }
    }

    const { data: posts, error } = await query;

    if (error) {
      console.error('Failed to fetch posts:', error);
      return 0;
    }

    if (!posts || posts.length === 0) {
      if (options.verbose) {
        this.log(`No ${options.setupMode ? '' : 'archived '}posts without embeddings found`);
      }
      return 0;
    }

    if (options.dryRun) {
      if (options.verbose) {
        this.log(`Would process ${posts.length} ${options.setupMode ? '' : 'archived '}posts`);
      }
      return posts.length;
    }

    if (options.verbose) {
      this.log(`Processing ${posts.length} ${options.setupMode ? '' : 'archived '}posts...`);
    }

    let processed = 0;
    for (const post of posts) {
      try {
        await embeddingPipeline.embedPost(post.id, {
          ...post,
          content: post.caption || '', // Map caption to content for the pipeline
        } as Parameters<typeof embeddingPipeline.embedPost>[1]);
        processed++;
      } catch (error) {
        console.error(`Failed to embed post ${post.id}:`, error);
        // Continue with other posts
      }
    }

    if (options.verbose) {
      this.log(`✅ Processed ${processed} posts`);
    }

    return processed;
  }

  private async processArchivedBets(options: ExtendedJobOptions): Promise<number> {
    // Find bets without embeddings
    const limit = options.limit || (options.setupMode ? 1000 : 50);

    let query = supabase
      .from('bets')
      .select(
        `
        *,
        game:games(*)
      `
      )
      .is('embedding', null)
      .limit(limit);

    // In setup mode, process ALL bets, not just archived
    if (!options.setupMode) {
      query = query.eq('archived', true);
    }

    // If specific user is requested
    if (options.user) {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('username', options.user)
        .single();

      if (userData) {
        query = query.eq('user_id', userData.id);
      }
    }

    const { data: bets, error } = await query;

    if (error) {
      console.error('Failed to fetch bets:', error);
      return 0;
    }

    if (!bets || bets.length === 0) {
      if (options.verbose) {
        this.log(`No ${options.setupMode ? '' : 'archived '}bets without embeddings found`);
      }
      return 0;
    }

    if (options.dryRun) {
      if (options.verbose) {
        this.log(`Would process ${bets.length} ${options.setupMode ? '' : 'archived '}bets`);
      }
      return bets.length;
    }

    if (options.verbose) {
      this.log(`Processing ${bets.length} ${options.setupMode ? '' : 'archived '}bets...`);
    }

    let processed = 0;
    for (const bet of bets) {
      try {
        await embeddingPipeline.embedBet(bet.id, bet as Bet);
        processed++;
      } catch (error) {
        console.error(`Failed to embed bet ${bet.id}:`, error);
        // Continue with other bets
      }
    }

    if (options.verbose) {
      this.log(`✅ Processed ${processed} bets`);
    }

    return processed;
  }

  private async updateUserProfiles(options: ExtendedJobOptions): Promise<number> {
    // Find users with stale or missing profile embeddings
    const limit = options.limit || (options.setupMode ? 200 : 20);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let query = supabase
      .from('users')
      .select('*')
      .not('username', 'is', null)
      .neq('username', 'system') // Exclude system user
      .limit(limit);

    // In setup mode, process ALL users regardless of last update
    if (options.setupMode) {
      // Get all users that need embeddings - no need for .or() filter
      // Just get all users, the limit will control how many we process
    } else {
      // Normal mode: only users with missing or stale embeddings
      query = query.or(
        `profile_embedding.is.null,last_embedding_update.lt.${sevenDaysAgo.toISOString()}`
      );
    }

    // If specific user is requested
    if (options.user) {
      query = supabase.from('users').select('*').eq('username', options.user);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Failed to fetch users for profile update:', error);
      return 0;
    }

    if (!users || users.length === 0) {
      if (options.verbose) {
        this.log('No users need profile embedding updates');
      }
      return 0;
    }

    if (options.dryRun) {
      if (options.verbose) {
        this.log(`Would update ${users.length} user profiles`);
      }
      return users.length;
    }

    if (options.verbose) {
      this.log(`Updating ${users.length} user profiles...`);
    }

    let processed = 0;
    let skipped = 0;

    for (const user of users) {
      try {
        // Check if user has any bets (required for embedding)
        const { data: userBets } = await supabase
          .from('bets')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (!userBets || userBets.length === 0) {
          if (options.verbose) {
            console.log(`  ⚠️  Skipping ${user.username} - no bets found`);
          }
          skipped++;
          continue;
        }

        await embeddingPipeline.updateUserProfile(user.id);
        processed++;

        if (options.verbose && processed % 10 === 0) {
          console.log(`  Progress: ${processed}/${users.length} users processed`);
        }
      } catch (error) {
        console.error(`Failed to update profile for user ${user.id} (${user.username}):`, error);
        // Continue with other users
      }
    }

    if (options.verbose) {
      this.log(`✅ Updated ${processed} user profiles (${skipped} skipped due to no bets)`);
    }

    return processed;
  }
}

// Support direct execution
if (process.argv[1] === import.meta.url.slice(7)) {
  const job = new EmbeddingGenerationJob();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: ExtendedJobOptions = {
    verbose: true,
    dryRun: args.includes('--dry-run'),
    limit: args.includes('--limit') ? parseInt(args[args.indexOf('--limit') + 1]) : undefined,
    setupMode: args.includes('--setup-mode'),
    user: args.includes('--user') ? args[args.indexOf('--user') + 1] : undefined,
  };

  if (options.setupMode) {
    console.log('🚀 SETUP MODE ENABLED');
    console.log('  - Will process ALL content (not just archived)');
    console.log('  - Will update ALL user profiles');
    console.log('  - Using higher limits for batch processing');
    if (options.user) {
      console.log(`  - Targeting specific user: ${options.user}`);
    }
  }

  await job.execute(options);
  process.exit(0);
}
