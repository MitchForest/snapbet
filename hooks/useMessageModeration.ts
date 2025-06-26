import { useState, useCallback } from 'react';
import { Message } from '@/types/messaging';
import { messagingPrivacyService } from '@/services/messaging/messagingPrivacyService';
import { shouldHideMessage, getFilteredText } from '@/utils/messaging/contentFilter';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';

export const useMessageModeration = () => {
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  const { blockedUserIds, isBlocked } = useBlockedUsers();

  /**
   * Filter a single message for display
   */
  const filterMessage = useCallback(
    (message: Message): Message => {
      // Check if sender is blocked
      if (isBlocked(message.sender_id)) {
        return {
          ...message,
          content: '[Blocked User]',
          media_url: null,
          is_blocked: true,
        };
      }

      // Check if message should be hidden based on reports or content
      if (shouldHideMessage(message.content || '', message.report_count || 0)) {
        return {
          ...message,
          content: '[Message hidden due to reports]',
          media_url: null,
        };
      }

      // Filter profanity
      return {
        ...message,
        content: getFilteredText(message.content || ''),
      };
    },
    [isBlocked]
  );

  /**
   * Filter an array of messages
   */
  const filterMessages = useCallback(
    (messages: Message[]): Message[] => {
      return messages.map(filterMessage);
    },
    [filterMessage]
  );

  /**
   * Start reporting a message
   */
  const startReporting = useCallback((messageId: string) => {
    setReportingMessageId(messageId);
  }, []);

  /**
   * Cancel reporting
   */
  const cancelReporting = useCallback(() => {
    setReportingMessageId(null);
  }, []);

  /**
   * Report a message
   */
  const reportMessage = useCallback(
    async (messageId: string, userId: string, reason: string, details?: string) => {
      const result = await messagingPrivacyService.reportMessage(
        messageId,
        userId,
        reason,
        details
      );

      if (result.success) {
        setReportingMessageId(null);
      }

      return result;
    },
    []
  );

  return {
    filterMessage,
    filterMessages,
    reportingMessageId,
    startReporting,
    cancelReporting,
    reportMessage,
    blockedUserIds,
    isBlocked,
  };
};
