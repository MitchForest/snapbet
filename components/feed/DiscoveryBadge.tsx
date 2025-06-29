import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

interface DiscoveryBadgeProps {
  reason?: string;
}

export function DiscoveryBadge({ reason = 'Suggested for you' }: DiscoveryBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={styles.badgeRow}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiBadgeText}>✨ Powered by AI</Text>
        </View>
        <Text style={styles.separator}>•</Text>
        <Text style={styles.reasonText} numberOfLines={1}>
          {reason}
        </Text>
      </View>
    </View>
  );
}

const OVERLAY_BACKGROUND = 'rgba(0,0,0,0.75)';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: OVERLAY_BACKGROUND,
    borderRadius: 8,
    padding: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiBadge: {
    backgroundColor: Colors.ai, // #8B5CF6
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  separator: {
    color: Colors.white,
    marginHorizontal: 6,
    opacity: 0.6,
  },
  reasonText: {
    color: Colors.white,
    fontSize: 12,
    flex: 1,
  },
});
