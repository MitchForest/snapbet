import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

interface PayoutDisplayProps {
  stake: number; // in cents
  odds: number; // American odds
  potentialWin: number; // in cents
}

export function PayoutDisplay({ stake, odds, potentialWin }: PayoutDisplayProps) {
  const totalReturn = stake + potentialWin;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Odds</Text>
        <Text style={styles.value}>{formatOdds(odds)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>To Win</Text>
        <Text style={styles.winAmount}>${formatMoney(potentialWin)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.label}>Total Return</Text>
        <Text style={styles.totalAmount}>${formatMoney(totalReturn)}</Text>
      </View>
    </View>
  );
}

// Helper functions
function formatOdds(odds: number): string {
  if (odds === 0) return '—';
  if (odds > 0) return `+${odds}`;
  return odds.toString();
}

function formatMoney(cents: number): string {
  return (cents / 100).toFixed(2);
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  winAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.light,
    marginVertical: 8,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
});
