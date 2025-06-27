import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, StyleSheet } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { Colors } from '@/theme';

interface StoryCircleProps {
  username: string;
  avatarUrl?: string | null;
  hasUnwatched: boolean;
  isOwn?: boolean;
  onPress: () => void;
}

export function StoryCircle({
  username,
  avatarUrl,
  hasUnwatched,
  isOwn = false,
  onPress,
}: StoryCircleProps) {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.storyWrapper}>
        <View
          style={[
            styles.ringContainer,
            hasUnwatched && styles.unwatchedRing,
            !hasUnwatched && styles.watchedRing,
          ]}
        >
          <Avatar
            size={64}
            src={avatarUrl || undefined}
            username={username}
            fallback={username?.[0]?.toUpperCase() || '?'}
          />
          {isOwn && !hasUnwatched && (
            <View style={styles.addButton}>
              <Text style={styles.addIcon}>+</Text>
            </View>
          )}
        </View>
        <Text
          style={[styles.username, hasUnwatched ? styles.unwatchedText : styles.watchedText]}
          numberOfLines={1}
        >
          {isOwn ? 'You' : username}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 12,
  },
  storyWrapper: {
    alignItems: 'center',
  },
  ringContainer: {
    padding: 3,
    borderRadius: 999,
    marginBottom: 4,
  },
  unwatchedRing: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  watchedRing: {
    borderWidth: 3,
    borderColor: Colors.border.light,
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: 999,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  addIcon: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  username: {
    fontSize: 12,
    width: 64,
    textAlign: 'center',
  },
  unwatchedText: {
    color: Colors.text.primary,
    fontWeight: '500',
  },
  watchedText: {
    color: Colors.text.secondary,
    fontWeight: '400',
  },
});
