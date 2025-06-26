#!/usr/bin/env bun

import { BaseJob, JobOptions, JobResult } from './types';
import { supabase } from '@/services/supabase/client';

export class MediaCleanupJob extends BaseJob {
  constructor() {
    super({
      name: 'media-cleanup',
      description: 'Clean up orphaned media files from storage',
      schedule: '0 4 * * *', // Daily at 4 AM
    });
  }

  async run(options: JobOptions): Promise<Omit<JobResult, 'duration'>> {
    let totalCleaned = 0;
    const details: Record<string, number> = {};

    // Clean orphaned media from different buckets
    const buckets = [
      { name: 'posts', urlColumn: 'media_url' },
      { name: 'posts', urlColumn: 'thumbnail_url' },
      { name: 'messages', urlColumn: 'media_url' },
      { name: 'avatars', urlColumn: 'avatar_url' },
    ];

    for (const bucket of buckets) {
      const cleaned = await this.cleanBucket(bucket.name, bucket.urlColumn, options);
      totalCleaned += cleaned;
      details[`${bucket.name}_${bucket.urlColumn}`] = cleaned;
    }

    return {
      success: true,
      message: `Cleaned ${totalCleaned} orphaned media files`,
      affected: totalCleaned,
      details,
    };
  }

  private async cleanBucket(
    bucketName: string,
    urlColumn: string,
    options: JobOptions
  ): Promise<number> {
    try {
      // List all files in the bucket
      const { data: files, error: listError } = await supabase.storage.from(bucketName).list('', {
        limit: 1000,
        offset: 0,
      });

      if (listError || !files) {
        console.error(`Failed to list files in ${bucketName}:`, listError);
        return 0;
      }

      // Get all URLs from the database
      const urls = await this.getUsedUrls(bucketName, urlColumn);
      const usedPaths = new Set(urls.map((url) => this.extractPathFromUrl(url, bucketName)));

      // Find orphaned files (older than 7 days to be safe)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const orphanedFiles = files.filter((file) => {
        if (!file.created_at) return false;
        const createdAt = new Date(file.created_at);
        return createdAt < sevenDaysAgo && !usedPaths.has(file.name);
      });

      if (options.dryRun) {
        if (options.verbose) {
          console.log(`  🗑️  Would clean ${orphanedFiles.length} files from ${bucketName}`);
          if (orphanedFiles.length > 0) {
            console.log(
              `     Sample files: ${orphanedFiles
                .slice(0, 3)
                .map((f) => f.name)
                .join(', ')}`
            );
          }
        }
        return orphanedFiles.length;
      }

      // Delete orphaned files
      let cleaned = 0;
      for (const file of orphanedFiles) {
        const { error } = await supabase.storage.from(bucketName).remove([file.name]);

        if (error) {
          console.error(`Failed to delete ${file.name}:`, error);
        } else {
          cleaned++;
        }
      }

      if (options.verbose) {
        console.log(`  🗑️  Cleaned ${cleaned} files from ${bucketName}`);
      }

      return cleaned;
    } catch (error) {
      console.error(`Error cleaning bucket ${bucketName}:`, error);
      return 0;
    }
  }

  private async getUsedUrls(bucketName: string, urlColumn: string): Promise<string[]> {
    const urls: string[] = [];

    try {
      // Handle different tables and columns
      if (bucketName === 'posts') {
        if (urlColumn === 'media_url') {
          const { data } = await supabase
            .from('posts')
            .select('media_url')
            .not('media_url', 'is', null);

          if (data) {
            urls.push(
              ...data.map((row) => row.media_url).filter((url): url is string => url !== null)
            );
          }
        } else if (urlColumn === 'thumbnail_url') {
          const { data } = await supabase
            .from('posts')
            .select('thumbnail_url')
            .not('thumbnail_url', 'is', null);

          if (data) {
            urls.push(
              ...data.map((row) => row.thumbnail_url).filter((url): url is string => url !== null)
            );
          }
        }

        // Also check group chat photos
        // Note: chats table doesn't have photo_url column, so group photos
        // would be stored with a pattern based on chat ID
      } else if (bucketName === 'messages') {
        const { data } = await supabase
          .from('messages')
          .select('media_url')
          .not('media_url', 'is', null);

        if (data) {
          urls.push(
            ...data.map((row) => row.media_url).filter((url): url is string => url !== null)
          );
        }
      } else if (bucketName === 'avatars') {
        const { data } = await supabase
          .from('users')
          .select('avatar_url')
          .not('avatar_url', 'is', null);

        if (data) {
          urls.push(
            ...data.map((row) => row.avatar_url).filter((url): url is string => url !== null)
          );
        }
      }
    } catch (error) {
      console.error(`Failed to get URLs for ${bucketName}.${urlColumn}:`, error);
    }

    return urls;
  }

  private extractPathFromUrl(url: string, bucketName: string): string {
    // Extract the file path from a Supabase storage URL
    // Example: https://xxx.supabase.co/storage/v1/object/public/posts/file.jpg
    // Returns: file.jpg

    try {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.indexOf(bucketName);

      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/');
      }

      // Fallback: just get the last part
      return pathParts[pathParts.length - 1];
    } catch {
      // If URL parsing fails, try simple string manipulation
      const parts = url.split('/');
      return parts[parts.length - 1];
    }
  }
}

// CLI execution
if (process.argv[1] === import.meta.url.replace('file://', '')) {
  const job = new MediaCleanupJob();
  await job.execute({
    dryRun: process.argv.includes('--dry-run'),
    verbose: process.argv.includes('--verbose'),
  });
}
