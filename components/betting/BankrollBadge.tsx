import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { useAvailableBalance } from '@/hooks/useBankroll';
import * as Haptics from 'expo-haptics';

interface BankrollBadgeProps {
  onPress?: () => void;
}

export function BankrollBadge({ onPress }: BankrollBadgeProps) {
  const balance = useAvailableBalance();

  const handlePress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <Text style={styles.label}>Bankroll</Text>
      <Text style={styles.amount}>${(balance / 100).toFixed(0)}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
