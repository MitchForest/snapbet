import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PostType, PendingShareBet } from '@/types/content';
import { PickOverlay } from './PickOverlay';
import { OutcomeOverlay } from './OutcomeOverlay';

interface OverlayContainerProps {
  postType: PostType;
  betData?: PendingShareBet;
  children: React.ReactNode;
}

export function OverlayContainer({ postType, betData, children }: OverlayContainerProps) {
  // Content posts don't need overlays
  if (postType === PostType.CONTENT) {
    return <>{children}</>;
  }

  return (
    <View style={styles.container}>
      {children}
      <View style={styles.overlay} pointerEvents="none">
        {postType === PostType.PICK && <PickOverlay bet={betData} />}
        {postType === PostType.OUTCOME && <OutcomeOverlay bet={betData} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
