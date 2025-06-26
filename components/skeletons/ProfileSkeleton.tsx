import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Colors } from '@/theme';
import { SKELETON_CONFIG } from '@/utils/constants/animations';

const PROFILE_HEADER_HEIGHT = 280;

export function ProfileSkeleton() {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: SKELETON_CONFIG.duration }), -1, false);
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shimmer.value,
      [0, 0.5, 1],
      [SKELETON_CONFIG.minOpacity, SKELETON_CONFIG.maxOpacity, SKELETON_CONFIG.minOpacity]
    );
    return { opacity };
  });

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        {/* Avatar */}
        <Animated.View style={[styles.avatar, animatedStyle]} />

        {/* Username */}
        <Animated.View style={[styles.username, animatedStyle]} />

        {/* Display Name */}
        <Animated.View style={[styles.displayName, animatedStyle]} />

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Animated.View style={[styles.statNumber, animatedStyle]} />
            <Animated.View style={[styles.statLabel, animatedStyle]} />
          </View>
          <View style={styles.statItem}>
            <Animated.View style={[styles.statNumber, animatedStyle]} />
            <Animated.View style={[styles.statLabel, animatedStyle]} />
          </View>
          <View style={styles.statItem}>
            <Animated.View style={[styles.statNumber, animatedStyle]} />
            <Animated.View style={[styles.statLabel, animatedStyle]} />
          </View>
        </View>

        {/* Bio */}
        <Animated.View style={[styles.bio, animatedStyle]} />
        <Animated.View style={[styles.bioLine2, animatedStyle]} />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Animated.View style={[styles.actionButton, animatedStyle]} />
          <Animated.View style={[styles.actionButton, animatedStyle]} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <Animated.View style={[styles.tab, animatedStyle]} />
        <Animated.View style={[styles.tab, animatedStyle]} />
      </View>

      {/* Content Placeholder */}
      <View style={styles.content}>
        {[...Array(3)].map((_, index) => (
          <Animated.View key={index} style={[styles.contentItem, animatedStyle]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    minHeight: PROFILE_HEADER_HEIGHT,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[200],
    marginBottom: 16,
  },
  username: {
    width: 120,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gray[200],
    marginBottom: 8,
  },
  displayName: {
    width: 160,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    width: 40,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gray[200],
    marginBottom: 4,
  },
  statLabel: {
    width: 60,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.gray[200],
  },
  bio: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginBottom: 8,
  },
  bioLine2: {
    width: '70%',
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 100,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  tab: {
    width: 60,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gray[200],
  },
  content: {
    padding: 16,
  },
  contentItem: {
    height: 100,
    borderRadius: 12,
    backgroundColor: Colors.gray[200],
    marginBottom: 12,
  },
});
