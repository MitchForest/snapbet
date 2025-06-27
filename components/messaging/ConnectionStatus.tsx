import React from 'react';
import { View, Text } from '@tamagui/core';
import { useRealtimeConnection } from '@/hooks/useRealtimeConnection';
import { Colors } from '@/theme';
import { Animated } from 'react-native';

/**
 * Connection status indicator bar
 * Only shows when not connected
 */
const containerStyle = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1000,
};

export function ConnectionStatus() {
  const { status } = useRealtimeConnection();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (status !== 'connected') {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [status, fadeAnim]);

  if (status === 'connected') {
    return null;
  }

  const backgroundColor = status === 'connecting' ? Colors.warning : Colors.error;
  const message = status === 'connecting' ? 'Connecting...' : 'No connection';

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <View
        backgroundColor={backgroundColor}
        paddingVertical="$1"
        paddingHorizontal="$3"
        alignItems="center"
      >
        <Text fontSize="$2" color={Colors.white} fontWeight="500">
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}
