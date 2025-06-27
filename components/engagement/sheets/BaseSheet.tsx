import React, { useEffect, useRef, ReactNode, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, OpacityColors } from '@/theme';

interface BaseSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: ReactNode;
  height?: number | string;
  showDragIndicator?: boolean;
  enableSwipeToClose?: boolean;
  keyboardAvoidingEnabled?: boolean;
  disableContentWrapper?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const DISMISS_THRESHOLD = 0.3; // Dismiss when dragged 30% of sheet height
const SAFE_AREA_BOTTOM = 34; // Standard safe area bottom height

export function BaseSheet({
  isVisible,
  onClose,
  children,
  height = '50%',
  showDragIndicator = true,
  enableSwipeToClose = true,
  keyboardAvoidingEnabled = false,
  disableContentWrapper = false,
}: BaseSheetProps) {
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const lastGestureDy = useRef(0);
  const [isRendered, setIsRendered] = React.useState(false);

  // Calculate sheet height
  const sheetHeight =
    typeof height === 'string' ? (parseInt(height) / 100) * SCREEN_HEIGHT : height;

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enableSwipeToClose,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return enableSwipeToClose && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        lastGestureDy.current = gestureState.dy;
        translateY.setValue(gestureState.dy);

        // Update backdrop opacity based on drag distance
        const opacity = 1 - gestureState.dy / sheetHeight;
        backdropOpacity.setValue(Math.max(0, Math.min(1, opacity)));
      },
      onPanResponderRelease: () => {
        if (lastGestureDy.current > sheetHeight * DISMISS_THRESHOLD) {
          closeSheet();
        } else {
          // Snap back to open position
          Animated.parallel([
            Animated.spring(translateY, {
              toValue: 0,
              useNativeDriver: true,
              tension: 50,
              friction: 8,
            }),
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const openSheet = useCallback(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateY, backdropOpacity]);

  const closeSheet = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Delay unmounting to allow animation to complete
      setTimeout(() => setIsRendered(false), 50);
    });
  }, [translateY, backdropOpacity, onClose]);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
      // Small delay to ensure the sheet is rendered off-screen first
      setTimeout(() => {
        openSheet();
      }, 50);
    } else if (isRendered) {
      closeSheet();
    }
  }, [isVisible, openSheet, closeSheet, isRendered]);

  if (!isRendered) {
    return null;
  }

  const content = (
    <>
      {showDragIndicator && (
        <View style={styles.dragIndicatorContainer} {...panResponder.panHandlers}>
          <View style={styles.dragIndicator} />
        </View>
      )}
      {children}
    </>
  );

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isVisible ? 'auto' : 'none'}>
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          onPress={closeSheet}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            transform: [{ translateY }],
          },
        ]}
      >
        {disableContentWrapper ? (
          // For components with their own scrolling, don't wrap in additional containers
          <>
            {showDragIndicator && (
              <View style={styles.dragIndicatorContainer} {...panResponder.panHandlers}>
                <View style={styles.dragIndicator} />
              </View>
            )}
            <View style={[styles.flexContainer, { paddingBottom: SAFE_AREA_BOTTOM }]}>
              {children}
            </View>
          </>
        ) : keyboardAvoidingEnabled ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={[styles.contentContainer, { paddingBottom: SAFE_AREA_BOTTOM }]}
          >
            {content}
          </KeyboardAvoidingView>
        ) : (
          <View style={[styles.flexContainer, { paddingBottom: SAFE_AREA_BOTTOM }]}>{content}</View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OpacityColors.overlay.light,
    zIndex: 9999,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 10000,
    ...Platform.select({
      ios: {
        shadowColor: OpacityColors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  contentContainer: {
    flex: 1,
  },
  flexContainer: {
    flex: 1,
  },
  dragIndicatorContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
  },
});
