import React, { ReactNode } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryViewerGesturesProps {
  children: ReactNode;
  onTapLeft: () => void;
  onTapRight: () => void;
  onLongPressStart: () => void;
  onLongPressEnd: () => void;
  onSwipeDown: () => void;
}

export function StoryViewerGestures({
  children,
  onTapLeft,
  onTapRight,
  onLongPressStart,
  onLongPressEnd,
  onSwipeDown,
}: StoryViewerGesturesProps) {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Tap gesture
  const tapGesture = Gesture.Tap().onEnd((event) => {
    'worklet';
    if (event.x < SCREEN_WIDTH / 3) {
      runOnJS(onTapLeft)();
    } else if (event.x > (SCREEN_WIDTH * 2) / 3) {
      runOnJS(onTapRight)();
    }
  });

  // Long press gesture
  const longPressGesture = Gesture.LongPress()
    .minDuration(200)
    .onStart(() => {
      'worklet';
      scale.value = withSpring(0.95);
      runOnJS(onLongPressStart)();
    })
    .onEnd(() => {
      'worklet';
      scale.value = withSpring(1);
      runOnJS(onLongPressEnd)();
    })
    .onFinalize(() => {
      'worklet';
      scale.value = withSpring(1);
      runOnJS(onLongPressEnd)();
    });

  // Pan gesture for swipe down
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      'worklet';
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (event.translationY > 50) {
        runOnJS(onSwipeDown)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(tapGesture, longPressGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT / 2],
      [1, 0.5],
      Extrapolate.CLAMP
    );

    return {
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
      opacity,
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>{children}</Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
