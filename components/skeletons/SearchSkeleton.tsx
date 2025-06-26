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

const USER_CARD_HEIGHT = 72;

function SkeletonItem() {
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
    <View style={styles.userCard}>
      <Animated.View style={[styles.avatar, animatedStyle]} />
      <View style={styles.userInfo}>
        <Animated.View style={[styles.username, animatedStyle]} />
        <Animated.View style={[styles.stats, animatedStyle]} />
      </View>
      <Animated.View style={[styles.followButton, animatedStyle]} />
    </View>
  );
}

export function SearchSkeleton() {
  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  userCard: {
    height: USER_CARD_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    marginBottom: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[200],
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    width: 120,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
    marginBottom: 6,
  },
  stats: {
    width: 180,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.gray[200],
  },
  followButton: {
    width: 80,
    height: 32,
    borderRadius: 8,
    backgroundColor: Colors.gray[200],
  },
});
