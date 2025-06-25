import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Animated, StyleSheet, Platform } from 'react-native';
import { View, Text } from '@tamagui/core';
import { Colors, OpacityColors } from '@/theme';

interface ToastConfig {
  message: string;
  duration?: number;
  type?: 'info' | 'success' | 'error';
}

interface ToastHandle {
  show: (config: ToastConfig) => void;
}

export const Toast = forwardRef<ToastHandle>((_, ref) => {
  const [config, setConfig] = useState<ToastConfig | null>(null);
  const [visible, setVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useImperativeHandle(ref, () => ({
    show: (newConfig: ToastConfig) => {
      // Clear any existing timer
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }

      // Hide current toast if visible
      if (visible) {
        hideToast(() => {
          showToast(newConfig);
        });
      } else {
        showToast(newConfig);
      }
    },
  }));

  const showToast = (newConfig: ToastConfig) => {
    setConfig(newConfig);
    setVisible(true);

    // Animate in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide after duration
    const duration = newConfig.duration || 2000;
    hideTimer.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = (callback?: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setConfig(null);
      callback?.();
    });
  };

  useEffect(() => {
    return () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current);
      }
    };
  }, []);

  if (!visible || !config) return null;

  const getToastStyle = () => {
    switch (config.type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      default:
        return styles.infoToast;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={[styles.toast, getToastStyle()]}>
        <Text color="$textPrimary" fontSize="$3" fontWeight="500">
          {config.message}
        </Text>
      </View>
    </Animated.View>
  );
});

Toast.displayName = 'Toast';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 9999,
  },
  toast: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: OpacityColors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoToast: {
    backgroundColor: Colors.gray[800],
  },
  successToast: {
    backgroundColor: OpacityColors.success.light,
  },
  errorToast: {
    backgroundColor: OpacityColors.error.light,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoText: {
    color: Colors.white,
  },
  successText: {
    color: Colors.success,
  },
  errorText: {
    color: Colors.error,
  },
});
