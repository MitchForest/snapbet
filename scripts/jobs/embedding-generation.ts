#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '../supabase-client';
import { embeddingPipeline } from '@/services/rag/embeddingPipeline';
import { ragService } from '@/services/rag/ragService';
import type { Database } from '@/types/database';

type Bet = Database['public']['Tables']['bets']['Row'] & {
  game?: Database['public']['Tables']['games']['Row'];
};

export class EmbeddingGenerationJob extends BaseJob {
  constructor() {
    super({
      name: 'embedding-generation',
      description: 'Generate embeddings for archived content without embeddings',
      schedule: '0 */4 * * *', // Every 4 hours
      timeout: 300000, // 5 minutes
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
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

      // 1. Process archived posts without embeddings
      const processedPosts = await this.processArchivedPosts(options);
      totalProcessed += processedPosts;
      details.posts = processedPosts;

      // 2. Process archived bets without embeddings
      const processedBets = await this.processArchivedBets(options);
      totalProcessed += processedBets;
      details.bets = processedBets;

      // 3. Update user profiles with stale embeddings
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

  private async processArchivedPosts(options: JobOptions): Promise<number> {
    // Find archived posts without embeddings
    const limit = options.limit || 50;

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('archived', true)
      .is('embedding', null)
      .not('caption', 'is', null)
      .limit(limit);

    if (error) {
      console.error('Failed to fetch archived posts:', error);
      return 0;
    }

    if (!posts || posts.length === 0) {
      if (options.verbose) {
        this.log('No archived posts without embeddings found');
      }
      return 0;
    }

    if (options.dryRun) {
      if (options.verbose) {
        this.log(`Would process ${posts.length} archived posts`);
      }
      return posts.length;
    }

    if (options.verbose) {
      this.log(`Processing ${posts.length} archived posts...`);
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

  private async processArchivedBets(options: JobOptions): Promise<number> {
    // Find archived bets without embeddings
    const limit = options.limit || 50;

    const { data: bets, error } = await supabase
      .from('bets')
      .select(
        `
        *,
        game:games(*)
      `
      )
      .eq('archived', true)
      .is('embedding', null)
      .limit(limit);

    if (error) {
      console.error('Failed to fetch archived bets:', error);
      return 0;
    }

    if (!bets || bets.length === 0) {
      if (options.verbose) {
        this.log('No archived bets without embeddings found');
      }
      return 0;
    }

    if (options.dryRun) {
      if (options.verbose) {
        this.log(`Would process ${bets.length} archived bets`);
      }
      return bets.length;
    }

    if (options.verbose) {
      this.log(`Processing ${bets.length} archived bets...`);
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

  private async updateUserProfiles(options: JobOptions): Promise<number> {
    // Find users with stale or missing profile embeddings
    const limit = options.limit || 20;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .not('username', 'is', null)
      .or(`profile_embedding.is.null,last_embedding_update.lt.${sevenDaysAgo.toISOString()}`)
      .limit(limit);

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
    for (const user of users) {
      try {
        await embeddingPipeline.updateUserProfile(user.id);
        processed++;
      } catch (error) {
        console.error(`Failed to update profile for user ${user.id}:`, error);
        // Continue with other users
      }
    }

    if (options.verbose) {
      this.log(`✅ Updated ${processed} user profiles`);
    }

    return processed;
  }
}

// Support direct execution
if (process.argv[1] === import.meta.url.slice(7)) {
  const job = new EmbeddingGenerationJob();
  const options: JobOptions = {
    verbose: true,
    dryRun: process.argv.includes('--dry-run'),
    limit: process.argv.includes('--limit')
      ? parseInt(process.argv[process.argv.indexOf('--limit') + 1])
      : undefined,
  };

  await job.execute(options);
  process.exit(0);
}
