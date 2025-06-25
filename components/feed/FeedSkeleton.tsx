import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/theme';

const { width } = Dimensions.get('window');
const POST_HEIGHT = 500; // Approximate height of PostCard

interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.postSkeleton}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.avatar} />
            <View style={styles.headerText}>
              <View style={styles.username} />
              <View style={styles.timestamp} />
            </View>
          </View>

          {/* Media */}
          <View style={styles.media} />

          {/* Caption */}
          <View style={styles.captionContainer}>
            <View style={styles.captionLine} />
            <View style={[styles.captionLine, styles.shortLine]} />
          </View>

          {/* Engagement */}
          <View style={styles.engagement}>
            <View style={styles.engagementButton} />
            <View style={styles.engagementButton} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  postSkeleton: {
    backgroundColor: Colors.surface,
    marginBottom: 8,
    height: POST_HEIGHT,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[200],
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    width: 120,
    height: 16,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginBottom: 4,
  },
  timestamp: {
    width: 80,
    height: 12,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
  },
  media: {
    width: width,
    aspectRatio: 4 / 5,
    backgroundColor: Colors.gray[200],
  },
  captionContainer: {
    padding: 12,
  },
  captionLine: {
    height: 14,
    backgroundColor: Colors.gray[200],
    borderRadius: 4,
    marginBottom: 6,
  },
  shortLine: {
    width: '60%',
  },
  engagement: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 12,
  },
  engagementButton: {
    width: 80,
    height: 32,
    backgroundColor: Colors.gray[200],
    borderRadius: 8,
  },
});
