import { supabase } from '@/services/supabase/client';
import type { Json } from '@/types/supabase-generated';

export interface JobConfig {
  name: string;
  description: string;
  schedule?: string; // Cron expression for documentation
  timeout?: number; // Max execution time in ms
}

export interface JobResult {
  success: boolean;
  message: string;
  affected: number;
  duration: number;
  details?: Json;
}

export interface JobOptions {
  dryRun?: boolean;
  verbose?: boolean;
  limit?: number;
}

export abstract class BaseJob {
  constructor(protected config: JobConfig) {}

  async execute(options: JobOptions = {}): Promise<JobResult> {
    const start = Date.now();
    console.log(`🚀 Starting job: ${this.config.name}`);

    if (options.dryRun) {
      console.log('🔍 Running in DRY RUN mode - no changes will be made');
    }

    try {
      const result = await this.run(options);
      const duration = Date.now() - start;

      console.log(`✅ Completed: ${result.message} (${duration}ms)`);

      // Track execution
      if (!options.dryRun) {
        await this.trackExecution({ ...result, duration });
      }

      return { ...result, duration };
    } catch (error) {
      const duration = Date.now() - start;
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ Failed: ${message}`);

      // Track failed execution
      if (!options.dryRun) {
        await this.trackExecution({
          success: false,
          message,
          affected: 0,
          duration,
        });
      }

      return {
        success: false,
        message,
        affected: 0,
        duration,
      };
    }
  }

  abstract run(options: JobOptions): Promise<Omit<JobResult, 'duration'>>;

  private async trackExecution(result: JobResult) {
    try {
      await supabase.from('job_executions').insert({
        job_name: this.config.name,
        success: result.success,
        message: result.message,
        affected_count: result.affected,
        duration_ms: result.duration,
        details: result.details,
        executed_by: 'local-script',
      });
    } catch (error) {
      console.warn('Failed to track job execution:', error);
    }
  }
}
