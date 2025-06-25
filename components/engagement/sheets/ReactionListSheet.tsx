import React from 'react';
import { View, Text, FlatList, StyleSheet, Pressable } from 'react-native';
import { BaseSheet } from './BaseSheet';
import { Colors } from '@/theme';

interface ReactionListSheetProps {
  isVisible: boolean;
  onClose: () => void;
  reactions: Array<{
    emoji: string;
    count: number;
  }>;
}

interface ReactionGroup {
  emoji: string;
  count: number;
  users: string[]; // Mock user list for now
}

function ReactionGroupItem({ reaction }: { reaction: ReactionGroup }) {
  return (
    <View style={styles.reactionItem}>
      <View style={styles.reactionHeader}>
        <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
        <Text style={styles.reactionCount}>{reaction.count}</Text>
      </View>

      <View style={styles.userList}>
        {reaction.users.slice(0, 3).map((user, index) => (
          <Text key={index} style={styles.username}>
            @{user}
            {index < reaction.users.length - 1 && ', '}
          </Text>
        ))}
        {reaction.users.length > 3 && (
          <Text style={styles.moreUsers}>and {reaction.users.length - 3} others</Text>
        )}
      </View>
    </View>
  );
}

export function ReactionListSheet({ isVisible, onClose, reactions }: ReactionListSheetProps) {
  // Generate mock user data for demo
  const reactionGroups: ReactionGroup[] = reactions.map((reaction) => {
    const mockUsers = generateMockUsers(reaction.emoji, reaction.count);
    return {
      ...reaction,
      users: mockUsers,
    };
  });

  const totalReactions = reactions.reduce((sum, r) => sum + r.count, 0);

  return (
    <BaseSheet isVisible={isVisible} onClose={onClose} height="50%">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reactions</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
          </Text>
        </View>

        {/* Reaction Groups */}
        <FlatList
          data={reactionGroups}
          keyExtractor={(item) => item.emoji}
          renderItem={({ item }) => <ReactionGroupItem reaction={item} />}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    </BaseSheet>
  );
}

// Mock user generator for demo
function generateMockUsers(emoji: string, count: number): string[] {
  const userPool = [
    'sportsfan22',
    'betmaster',
    'luckycharm',
    'thegoat',
    'rookie2024',
    'winner99',
    'cashking',
    'fademaster',
    'tailgod',
    'pickpro',
    'hoopsdream',
    'gridironking',
    'courtside',
    'fieldgoal',
    'slamjam',
  ];

  const hash = emoji.charCodeAt(0);
  const users: string[] = [];

  for (let i = 0; i < Math.min(count, userPool.length); i++) {
    users.push(userPool[(hash + i * 3) % userPool.length]);
  }

  return users;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  summary: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  listContent: {
    paddingVertical: 8,
  },
  reactionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  reactionEmoji: {
    fontSize: 32,
  },
  reactionCount: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  userList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 44,
  },
  username: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  moreUsers: {
    fontSize: 14,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginHorizontal: 16,
  },
});
