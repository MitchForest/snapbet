import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Colors } from '@/theme';

interface StoryProgressBarProps {
  stories: Array<{ id: string }>;
  currentIndex: number;
  progress: number;
}

export function StoryProgressBar({ stories, currentIndex, progress }: StoryProgressBarProps) {
  return (
    <View style={styles.container}>
      {stories.map((story, index) => (
        <ProgressSegment
          key={story.id}
          isActive={index === currentIndex}
          isCompleted={index < currentIndex}
          progress={index === currentIndex ? progress : 0}
        />
      ))}
    </View>
  );
}

interface ProgressSegmentProps {
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
}

function ProgressSegment({ isActive, isCompleted, progress }: ProgressSegmentProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const width = isCompleted ? 100 : isActive ? progress : 0;

    return {
      width: withTiming(`${width}%`, {
        duration: isCompleted ? 0 : 200,
        easing: Easing.linear,
      }),
    };
  });

  return (
    <View style={styles.segment}>
      <View style={styles.segmentBackground} />
      <Animated.View style={[styles.segmentProgress, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
  },
  segment: {
    flex: 1,
    height: 2,
    position: 'relative',
  },
  segmentBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  segmentProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderRadius: 1,
  },
});
