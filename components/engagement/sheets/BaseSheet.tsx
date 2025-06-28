import React, { useEffect, useRef, ReactNode, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { Colors } from '@/theme';

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
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Calculate snap points based on height prop
  const snapPoints = React.useMemo(() => {
    if (height === 'auto') {
      // For auto height, we use dynamic sizing
      return [-1];
    } else if (typeof height === 'string') {
      return [height];
    } else if (typeof height === 'number') {
      return [height];
    } else {
      return ['50%'];
    }
  }, [height]);

  // Handle visibility changes
  useEffect(() => {
    if (isVisible) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [isVisible]);

  // Handle backdrop press
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isVisible) {
    return null;
  }

  const content = (
    <>
      {showDragIndicator && (
        <View style={styles.dragIndicatorContainer}>
          <View style={styles.dragIndicator} />
        </View>
      )}
      {children}
    </>
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={enableSwipeToClose}
      handleIndicatorStyle={showDragIndicator ? styles.handleIndicator : styles.hiddenIndicator}
      backgroundStyle={styles.sheet}
      keyboardBehavior={keyboardAvoidingEnabled ? 'interactive' : 'fillParent'}
      keyboardBlurBehavior="restore"
      enableDynamicSizing={height === 'auto'}
    >
      {disableContentWrapper ? (
        <View style={[styles.flexContainer, { paddingBottom: SAFE_AREA_BOTTOM }]}>{children}</View>
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
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  handleIndicator: {
    backgroundColor: Colors.gray[300],
    width: 40,
    height: 4,
  },
  hiddenIndicator: {
    height: 0,
  },
});
