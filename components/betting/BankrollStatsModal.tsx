import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors, OpacityColors } from '@/theme';
import { useBankrollStats } from '@/hooks/useBankroll';
import { formatCentsToCurrency, formatTimeUntilReset } from '@/utils/bankroll/calculations';
import { format } from 'date-fns';

interface BankrollStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BankrollStatsModal({ isOpen, onClose }: BankrollStatsModalProps) {
  const { data: stats, isLoading } = useBankrollStats();

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>Bankroll Details</Text>
                <TouchableOpacity onPress={onClose}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              {isLoading ? (
                <Text style={styles.loading}>Loading...</Text>
              ) : stats ? (
                <>
                  {/* Current Balance Section */}
                  <View style={styles.section}>
                    <StatRow
                      label="Current Balance"
                      value={formatCentsToCurrency(stats.currentBalance)}
                    />
                    <StatRow
                      label="Pending Bets"
                      value={`-${formatCentsToCurrency(stats.pendingBets)}`}
                      color={Colors.text.secondary}
                    />
                    <View style={styles.separator} />
                    <StatRow
                      label="Available to Bet"
                      value={formatCentsToCurrency(stats.available)}
                      bold
                    />
                  </View>

                  {/* Weekly Performance */}
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>This Week</Text>
                    <StatRow
                      label="Started With"
                      value={formatCentsToCurrency(stats.weeklyDeposit)}
                    />
                    <StatRow
                      label="Profit/Loss"
                      value={`${stats.weeklyPL >= 0 ? '+' : ''}${formatCentsToCurrency(stats.weeklyPL)}`}
                      color={
                        stats.weeklyPL > 0
                          ? Colors.success
                          : stats.weeklyPL < 0
                            ? Colors.error
                            : Colors.text.secondary
                      }
                    />
                    <StatRow
                      label="ROI"
                      value={`${stats.weeklyPLPercent.toFixed(1)}%`}
                      color={
                        stats.weeklyPLPercent > 0
                          ? Colors.success
                          : stats.weeklyPLPercent < 0
                            ? Colors.error
                            : Colors.text.secondary
                      }
                    />
                  </View>

                  {/* Reset Info */}
                  <View style={styles.section}>
                    <Text style={styles.resetInfo}>
                      Resets {format(stats.nextReset, 'EEEE')} at midnight (
                      {formatTimeUntilReset(stats.nextReset)})
                    </Text>
                    {stats.referralBonus > 0 && (
                      <Text style={styles.bonusInfo}>
                        +{formatCentsToCurrency(stats.referralBonus)} weekly from referrals
                      </Text>
                    )}
                  </View>
                </>
              ) : (
                <Text style={styles.error}>Failed to load bankroll data</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}

function StatRow({ label, value, color, bold }: StatRowProps) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text
        style={[styles.statValue, { color: color || Colors.text.primary }, bold && styles.boldText]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: OpacityColors.overlay.light,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.text.secondary,
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  boldText: {
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border.default,
    marginVertical: 8,
  },
  resetInfo: {
    fontSize: 14,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  bonusInfo: {
    fontSize: 14,
    color: Colors.success,
    textAlign: 'center',
    marginTop: 4,
  },
  loading: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    padding: 40,
  },
  error: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    padding: 40,
  },
});
