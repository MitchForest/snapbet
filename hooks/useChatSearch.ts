import { useState, useMemo, useCallback } from 'react';
import { ChatWithDetails, ChatSearchResult } from '@/types/messaging';

export function useChatSearch(chats: ChatWithDetails[]) {
  const [searchQuery, setSearchQuery] = useState('');

  // Perform search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return chats;
    }

    const query = searchQuery.toLowerCase().trim();
    const results: ChatSearchResult[] = [];

    chats.forEach((chat) => {
      // Search in chat name (for groups)
      if (chat.name && chat.name.toLowerCase().includes(query)) {
        results.push({
          ...chat,
          matchType: 'name',
          matchedText: chat.name,
        });
        return;
      }

      // Search in other member's username (for DMs)
      if (chat.chat_type === 'dm' && chat.other_member_username) {
        if (chat.other_member_username.toLowerCase().includes(query)) {
          results.push({
            ...chat,
            matchType: 'username',
            matchedText: chat.other_member_username,
          });
          return;
        }
      }

      // Search in last message content
      if (chat.last_message_content) {
        if (chat.last_message_content.toLowerCase().includes(query)) {
          results.push({
            ...chat,
            matchType: 'message',
            matchedText: chat.last_message_content,
          });
        }
      }
    });

    return results;
  }, [chats, searchQuery]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    clearSearch,
    isSearching: searchQuery.length > 0,
  };
}
