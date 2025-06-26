import { useState, useCallback, useMemo } from 'react';
import { GroupMember } from '@/types/messaging';

interface MentionState {
  isActive: boolean;
  query: string;
  startPosition: number;
  endPosition: number;
}

export function useMentions(members: GroupMember[]) {
  const [mentionState, setMentionState] = useState<MentionState>({
    isActive: false,
    query: '',
    startPosition: 0,
    endPosition: 0,
  });

  // Filter members based on query
  const suggestions = useMemo(() => {
    if (!mentionState.isActive || !mentionState.query) {
      return [];
    }

    const query = mentionState.query.toLowerCase();
    return members
      .filter((member) => {
        const username = member.user?.username?.toLowerCase() || '';
        const displayName = member.user?.display_name?.toLowerCase() || '';
        return username.includes(query) || displayName.includes(query);
      })
      .slice(0, 10); // Limit to 10 suggestions
  }, [members, mentionState.query, mentionState.isActive]);

  // Handle text input changes to detect @ mentions
  const handleTextChange = useCallback(
    (text: string, cursorPosition: number) => {
      // Check if we're starting a new mention
      const beforeCursor = text.slice(0, cursorPosition);
      const lastAtIndex = beforeCursor.lastIndexOf('@');

      if (lastAtIndex !== -1 && lastAtIndex === cursorPosition - 1) {
        // Just typed @
        setMentionState({
          isActive: true,
          query: '',
          startPosition: lastAtIndex,
          endPosition: cursorPosition,
        });
        return;
      }

      // Check if we're in an active mention
      if (mentionState.isActive) {
        const mentionText = text.slice(mentionState.startPosition + 1, cursorPosition);

        // Check if mention was cancelled (space, newline, or deleted @)
        if (
          text[mentionState.startPosition] !== '@' ||
          mentionText.includes(' ') ||
          mentionText.includes('\n')
        ) {
          setMentionState({
            isActive: false,
            query: '',
            startPosition: 0,
            endPosition: 0,
          });
        } else {
          // Update query
          setMentionState({
            ...mentionState,
            query: mentionText,
            endPosition: cursorPosition,
          });
        }
      }
    },
    [mentionState]
  );

  // Select a mention suggestion
  const selectMention = useCallback(
    (member: GroupMember) => {
      if (!member.user?.username) return null;

      return {
        username: member.user.username,
        userId: member.user_id,
        startPosition: mentionState.startPosition,
        endPosition: mentionState.endPosition,
      };
    },
    [mentionState]
  );

  // Cancel mention
  const cancelMention = useCallback(() => {
    setMentionState({
      isActive: false,
      query: '',
      startPosition: 0,
      endPosition: 0,
    });
  }, []);

  // Parse mentions from text
  const parseMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }

    return mentions;
  }, []);

  return {
    mentionState,
    suggestions,
    handleTextChange,
    selectMention,
    cancelMention,
    parseMentions,
  };
}
