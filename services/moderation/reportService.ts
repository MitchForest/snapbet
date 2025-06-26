import { supabase } from '@/services/supabase/client';
import { eventEmitter, ModerationEvents } from '@/utils/eventEmitter';
import { toastService } from '@/services/toastService';
import type { Database } from '@/types/supabase-generated';

// Types
export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'other';
export type ContentType = 'post' | 'story' | 'user' | 'comment';
export type ActionTaken = 'dismissed' | 'content_removed' | 'user_warned' | 'user_banned';

type ReportRow = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];

// Use type alias instead of empty interface
export type Report = ReportRow;

export interface ReportWithDetails extends Report {
  reporter?: {
    id: string;
    username: string | null;
    avatar_url: string | null;
  };
  content?: {
    user?: {
      id: string;
      username: string | null;
    };
  };
}

// Report threshold for auto-hide
const AUTO_HIDE_THRESHOLD = 3;

export class ReportService {
  /**
   * Report content for moderation
   */
  async reportContent(
    contentType: ContentType,
    contentId: string,
    reason: ReportReason,
    additionalInfo?: string
  ): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user has already reported this content
      const { data: existingReport } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .single();

      if (existingReport) {
        return { success: false, error: "You've already reported this content" };
      }

      // Create the report
      const reportData: ReportInsert = {
        reporter_id: user.id,
        content_type: contentType,
        content_id: contentId,
        reason,
        additional_info: additionalInfo || null,
      };

      const { data: report, error } = await supabase
        .from('reports')
        .insert(reportData)
        .select()
        .single();

      if (error) {
        // Check if it's a unique constraint violation
        if (error.code === '23505') {
          return { success: false, error: 'You have already reported this content' };
        }
        throw error;
      }

      // Check if content should be auto-hidden
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      const uniqueReporters = count || 0;

      if (uniqueReporters >= AUTO_HIDE_THRESHOLD) {
        // Emit event to hide content
        eventEmitter.emit(ModerationEvents.CONTENT_HIDDEN, {
          contentType,
          contentId,
        });
      }

      // Emit report event
      eventEmitter.emit(ModerationEvents.CONTENT_REPORTED, {
        contentType,
        contentId,
        reporterId: user.id,
      });

      return { success: true, reportId: report!.id };
    } catch (error) {
      console.error('Error reporting content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to report content',
      };
    }
  }

  /**
   * Get user's submitted reports
   */
  async getReportsByUser(userId?: string): Promise<Report[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const targetUserId = userId || user.id;

      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('reporter_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching user reports:', error);
      return [];
    }
  }

  /**
   * Get reports for specific content (admin only)
   */
  async getReportsForContent(
    contentType: ContentType,
    contentId: string
  ): Promise<ReportWithDetails[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      // Check if user is admin
      if (!this.isAdmin(user.id)) {
        console.warn('Non-admin attempted to access content reports');
        return [];
      }

      const { data, error } = await supabase
        .from('reports')
        .select(
          `
          *,
          reporter:users!reporter_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching content reports:', error);
      return [];
    }
  }

  /**
   * Get unreviewed reports (admin only)
   */
  async getUnreviewedReports(): Promise<ReportWithDetails[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is admin (using service role)
      const isUserAdmin = await this.isAdmin(user.id);
      if (!isUserAdmin) {
        throw new Error('Unauthorized: Admin access required');
      }

      const { data, error } = await supabase
        .from('reports')
        .select(
          `
          *,
          reporter:users!reporter_id (
            id,
            username,
            avatar_url
          )
        `
        )
        .is('reviewed_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching unreviewed reports:', error);
      return [];
    }
  }

  /**
   * Review a report (admin only)
   */
  async reviewReport(
    reportId: string,
    action: ActionTaken
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if user is admin
      const isUserAdmin = await this.isAdmin(user.id);
      if (!isUserAdmin) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }

      // Get the report details first
      const { data: report } = await supabase
        .from('reports')
        .select('*')
        .eq('id', reportId)
        .single();

      if (!report) {
        return { success: false, error: 'Report not found' };
      }

      // Update report
      const { error } = await supabase
        .from('reports')
        .update({
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          action_taken: action,
        })
        .eq('id', reportId);

      if (error) throw error;

      // Handle action
      if (action === 'content_removed') {
        await this.removeContent(report.content_type as ContentType, report.content_id);
      }

      return { success: true };
    } catch (error) {
      console.error('Error reviewing report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to review report',
      };
    }
  }

  /**
   * Check if content has been reported by current user
   */
  async hasUserReported(contentType: ContentType, contentId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { data } = await supabase
        .from('reports')
        .select('id')
        .eq('reporter_id', user.id)
        .eq('content_type', contentType)
        .eq('content_id', contentId)
        .single();

      return !!data;
    } catch {
      return false;
    }
  }

  /**
   * Get report count for content
   */
  async getReportCount(contentType: ContentType, contentId: string): Promise<number> {
    try {
      const { count } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', contentType)
        .eq('content_id', contentId);

      return count || 0;
    } catch (error) {
      console.error('Error getting report count:', error);
      return 0;
    }
  }

  /**
   * Check if user is admin
   */
  private isAdmin(userId: string): boolean {
    const adminIds = process.env.EXPO_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
    return adminIds.includes(userId);
  }

  /**
   * Remove content (soft delete)
   */
  private async removeContent(contentType: ContentType, contentId: string): Promise<void> {
    try {
      const table = contentType === 'user' ? 'users' : `${contentType}s`;

      // Dynamic table updates require runtime type checking
      if (table === 'users') {
        await supabase
          .from('users')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', contentId);
      } else if (table === 'posts') {
        await supabase
          .from('posts')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', contentId);
      } else if (table === 'stories') {
        await supabase
          .from('stories')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', contentId);
      } else if (table === 'comments') {
        await supabase
          .from('comments')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', contentId);
      }

      toastService.showSuccess('Content removed');
    } catch (error) {
      console.error('Error removing content:', error);
      toastService.showError('Failed to remove content');
    }
  }
}

// Export singleton instance
export const reportService = new ReportService();
