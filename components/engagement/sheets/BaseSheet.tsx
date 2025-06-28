import React, { useEffect, useRef, ReactNode, useCallback } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
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

const TRANSPARENT = 'transparent'; // Extract color literal as constant

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
  const bottomSheetRef = useRef<BottomSheetModal>(null);

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
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
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
    <BottomSheetModal
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={enableSwipeToClose}
      handleIndicatorStyle={styles.hiddenIndicator} // Always hide the built-in handle
      backgroundStyle={styles.sheet}
      keyboardBehavior={keyboardAvoidingEnabled ? 'interactive' : 'fillParent'}
      keyboardBlurBehavior="restore"
      enableDynamicSizing={height === 'auto'}
      detached={false}
      bottomInset={0}
    >
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {disableContentWrapper ? (
          children
        ) : keyboardAvoidingEnabled ? (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.contentContainer}
          >
            {content}
          </KeyboardAvoidingView>
        ) : (
          content
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
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
  hiddenIndicator: {
    height: 0,
    backgroundColor: TRANSPARENT,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
});
