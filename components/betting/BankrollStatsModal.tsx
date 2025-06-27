import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Colors, OpacityColors } from '@/theme';
import { useBankrollStats } from '@/hooks/useBankroll';
import { formatCentsToCurrency, formatTimeUntilReset } from '@/utils/bankroll/calculations';
import { format } from 'date-fns';

interface BankrollStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export function BankrollStatsModal({ isOpen, onClose }: BankrollStatsModalProps) {
  const { data: stats, isLoading } = useBankrollStats();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          damping: 20,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [isOpen, opacity, translateY]);

  if (!isVisible) return null;

  // Calculate safe values with defaults
  const weeklyPL = stats ? stats.weeklyPL : 0;
  const weeklyPLPercent = stats ? stats.weeklyPLPercent : 0;
  const winCount = stats ? stats.winCount || 0 : 0;
  const lossCount = stats ? stats.lossCount || 0 : 0;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isOpen ? 'auto' : 'none'}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity,
            },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY }],
          },
        ]}
      >
        <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
          <View style={styles.content}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Bankroll Details</Text>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
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
                    label="Win/Loss"
                    value={`${winCount}-${lossCount}`}
                    color={
                      winCount > lossCount
                        ? Colors.success
                        : winCount < lossCount
                          ? Colors.error
                          : Colors.text.secondary
                    }
                  />
                  <StatRow
                    label="Profit/Loss"
                    value={`${weeklyPL >= 0 ? '+' : ''}${formatCentsToCurrency(weeklyPL)}`}
                    color={
                      weeklyPL > 0
                        ? Colors.success
                        : weeklyPL < 0
                          ? Colors.error
                          : Colors.text.secondary
                    }
                  />
                  <StatRow
                    label="ROI"
                    value={`${weeklyPLPercent.toFixed(1)}%`}
                    color={
                      weeklyPLPercent > 0
                        ? Colors.success
                        : weeklyPLPercent < 0
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
      </Animated.View>
    </View>
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: OpacityColors.overlay.light,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border.light,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
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
