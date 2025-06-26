import { useState, useEffect, useCallback } from 'react';
import { useBlockedUsers } from './useBlockedUsers';
import { reportService, ContentType, ReportReason } from '@/services/moderation/reportService';
import { eventEmitter, ModerationEvents } from '@/utils/eventEmitter';

interface UseContentModerationResult {
  blockedUserIds: string[];
  isContentHidden: (contentType: ContentType, contentId: string) => boolean;
  shouldShowContent: (content: {
    user_id: string;
    report_count?: number;
    id?: string;
    post_type?: string;
  }) => boolean;
  filterContent: <T extends { user_id: string }>(content: T[]) => T[];
  reportContent: (
    contentType: ContentType,
    contentId: string,
    reason: string,
    additionalInfo?: string
  ) => Promise<void>;
  hasReported: (contentType: ContentType, contentId: string) => boolean;
  hiddenContent: Map<string, Set<string>>;
}

export function useContentModeration(): UseContentModerationResult {
  const { blockedUserIds } = useBlockedUsers();
  const [hiddenContent, setHiddenContent] = useState<Map<string, Set<string>>>(new Map());
  const [reportedContent, setReportedContent] = useState<Map<string, Set<string>>>(new Map());

  // Check if content is hidden (due to reports)
  const isContentHidden = useCallback(
    (contentType: ContentType, contentId: string) => {
      const typeSet = hiddenContent.get(contentType);
      return typeSet ? typeSet.has(contentId) : false;
    },
    [hiddenContent]
  );

  // Check if content should be shown (not blocked, not hidden)
  const shouldShowContent = useCallback(
    (content: { user_id: string; report_count?: number; id?: string; post_type?: string }) => {
      // Check if user is blocked
      if (content.user_id && blockedUserIds.includes(content.user_id)) {
        return false;
      }

      // Check if content has too many reports (client-side check)
      if (content.report_count && content.report_count >= 3) {
        return false;
      }

      // Check if content is hidden
      if (content.post_type && content.id) {
        const contentType = content.post_type === 'post' ? 'post' : 'story';
        if (isContentHidden(contentType, content.id)) {
          return false;
        }
      }

      return true;
    },
    [blockedUserIds, isContentHidden]
  );

  // Filter an array of content
  const filterContent = useCallback(
    <T extends { user_id: string }>(content: T[]): T[] => {
      return content.filter((item) => shouldShowContent(item));
    },
    [shouldShowContent]
  );

  // Report content
  const reportContent = useCallback(
    async (
      contentType: ContentType,
      contentId: string,
      reason: string,
      additionalInfo?: string
    ) => {
      const result = await reportService.reportContent(
        contentType,
        contentId,
        reason as ReportReason,
        additionalInfo
      );

      if (result.success) {
        // Mark as reported
        setReportedContent((prev) => {
          const newMap = new Map(prev);
          const typeSet = newMap.get(contentType) || new Set();
          typeSet.add(contentId);
          newMap.set(contentType, typeSet);
          return newMap;
        });
      }
    },
    []
  );

  // Check if user has reported content
  const hasReported = useCallback(
    (contentType: ContentType, contentId: string) => {
      const typeSet = reportedContent.get(contentType);
      return typeSet ? typeSet.has(contentId) : false;
    },
    [reportedContent]
  );

  // Listen for content hidden events
  useEffect(() => {
    const subscription = eventEmitter.addListener(
      ModerationEvents.CONTENT_HIDDEN,
      ({ contentType, contentId }: { contentType: string; contentId: string }) => {
        setHiddenContent((prev) => {
          const newMap = new Map(prev);
          const typeSet = newMap.get(contentType as ContentType) || new Set<string>();
          typeSet.add(contentId);
          newMap.set(contentType as ContentType, typeSet);
          return newMap;
        });
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return {
    blockedUserIds,
    isContentHidden,
    shouldShowContent,
    filterContent,
    reportContent,
    hasReported,
    hiddenContent,
  };
}
