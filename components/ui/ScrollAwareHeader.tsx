import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Header } from './Header';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { eventEmitter, FeedEvents } from '@/utils/eventEmitter';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/theme';

type DrawerParamList = {
  '(tabs)': undefined;
  camera: undefined;
  notifications: undefined;
  'profile/[username]': { username: string };
};

type DrawerNavProp = DrawerNavigationProp<DrawerParamList>;

interface ScrollAwareHeaderProps {
  notificationCount?: number;
}

export function ScrollAwareHeader({ notificationCount = 0 }: ScrollAwareHeaderProps) {
  const navigation = useNavigation<DrawerNavProp>();
  const insets = useSafeAreaInsets();
  const lastScrollY = useRef(0);
  const headerHeight = useRef(new Animated.Value(56 + insets.top)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const handleScroll = (data: { contentOffset: { y: number } }) => {
      const currentScrollY = data.contentOffset.y;
      const diff = currentScrollY - lastScrollY.current;

      // Only hide/show after scrolling past a threshold
      if (Math.abs(diff) < 5) return;

      // Scrolling down - hide header
      if (diff > 0 && currentScrollY > 50) {
        Animated.parallel([
          Animated.timing(headerHeight, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(headerOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
      // Scrolling up - show header
      else if (diff < 0) {
        Animated.parallel([
          Animated.timing(headerHeight, {
            toValue: 56 + insets.top,
            duration: 200,
            useNativeDriver: false,
          }),
          Animated.timing(headerOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }

      lastScrollY.current = currentScrollY;
    };

    // Subscribe to scroll events from feed
    const subscription = eventEmitter.addListener(FeedEvents.FEED_SCROLL, handleScroll);

    return () => {
      subscription.remove();
    };
  }, [headerHeight, headerOpacity, insets.top]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          height: headerHeight,
        },
      ]}
    >
      <Animated.View style={[styles.innerContainer, { opacity: headerOpacity }]}>
        <Header
          onProfilePress={() => navigation.openDrawer()}
          onNotificationPress={() => navigation.navigate('notifications')}
          notificationCount={notificationCount}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  innerContainer: {
    flex: 1,
  },
});
