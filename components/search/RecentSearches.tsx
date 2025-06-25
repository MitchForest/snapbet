import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '@/theme';
import { Storage } from '@/services/storage/storageService';
import * as Haptics from 'expo-haptics';

export interface RecentSearch {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  timestamp: number;
}

interface RecentSearchesProps {
  searches: RecentSearch[];
  onSearchSelect: (search: RecentSearch) => void;
  onClear: () => void;
}

const STORAGE_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 10;

export function RecentSearches({ searches, onSearchSelect, onClear }: RecentSearchesProps) {
  const handleSelect = async (search: RecentSearch) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSearchSelect(search);
  };

  const handleClear = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClear();
  };

  if (searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Searches</Text>
        <Pressable onPress={handleClear}>
          <Text style={styles.clearButton}>Clear</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {searches.map((search) => (
          <Pressable
            key={search.id}
            onPress={() => handleSelect(search)}
            style={({ pressed }) => [styles.searchChip, { opacity: pressed ? 0.8 : 1 }]}
          >
            <Text style={styles.searchText}>@{search.username}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// Helper functions for managing recent searches
export const recentSearchesHelpers = {
  load: (): RecentSearch[] => {
    try {
      return Storage.general.get<RecentSearch[]>(STORAGE_KEY) || [];
    } catch {
      return [];
    }
  },

  save: (searches: RecentSearch[]) => {
    Storage.general.set(STORAGE_KEY, searches);
  },

  add: (user: {
    id: string;
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  }) => {
    const searches = recentSearchesHelpers.load();

    // Remove if already exists
    const filtered = searches.filter((s) => s.id !== user.id);

    // Add to beginning
    const newSearch: RecentSearch = {
      ...user,
      timestamp: Date.now(),
    };

    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    recentSearchesHelpers.save(updated);

    return updated;
  },

  clear: () => {
    Storage.general.delete(STORAGE_KEY);
    return [];
  },
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  clearButton: {
    fontSize: 14,
    color: Colors.primary,
  },
  searchChip: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  searchText: {
    fontSize: 14,
    color: Colors.text.primary,
  },
});
