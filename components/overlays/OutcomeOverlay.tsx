import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, OpacityColors } from '@/theme';

interface OutcomeOverlayProps {
  betData?: unknown; // Will be typed in Epic 5
}

export function OutcomeOverlay({ betData: _betData }: OutcomeOverlayProps) {
  return (
    <View style={styles.container}>
      <View style={styles.overlayContent}>
        <Text style={styles.overlayText}>🏆 Outcome</Text>
        <Text style={styles.overlayHint}>Result details will appear here</Text>
        <Text style={styles.comingSoon}>Coming in Epic 5</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: OpacityColors.overlay.dark,
    borderRadius: 12,
    padding: 16,
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  overlayHint: {
    color: Colors.gray[300],
    fontSize: 14,
    marginBottom: 4,
  },
  comingSoon: {
    color: Colors.primary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
