import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, StyleSheet } from 'react-native';
import { WEEKLY_BADGES } from '@/data/weeklyBadges';
import { Colors } from '@/theme';

interface WeeklyBadgeGridProps {
  badges: string[];
  earnedDate?: Date;
}

export const WeeklyBadgeGrid: React.FC<WeeklyBadgeGridProps> = ({ badges }) => {
  const [tooltipBadgeId, setTooltipBadgeId] = React.useState<string | null>(null);

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <View flexDirection="row" alignItems="center" gap="$1">
      {badges.map((badgeId) => {
        const badge = WEEKLY_BADGES[badgeId.toUpperCase()];

        if (!badge) {
          return null;
        }

        return (
          <View key={badge.id} position="relative">
            <Pressable
              onPressIn={() => setTooltipBadgeId(badge.id)}
              onPressOut={() => setTooltipBadgeId(null)}
              style={styles.badgeButton}
            >
              <Text fontSize={20}>{badge.emoji}</Text>
            </Pressable>

            {/* Tooltip */}
            {tooltipBadgeId === badge.id && (
              <View
                position="absolute"
                bottom="$8"
                left="50%"
                transform={[{ translateX: -100 }]}
                backgroundColor={Colors.gray[900]}
                borderRadius="$2"
                paddingHorizontal="$4"
                paddingVertical="$3"
                width={200}
                zIndex={1000}
                shadowColor={Colors.black}
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.25}
                shadowRadius={4}
              >
                <Text fontSize={14} fontWeight="600" color={Colors.white} textAlign="center">
                  {badge.name}
                </Text>
                <Text fontSize={12} color={Colors.gray[300]} textAlign="center" marginTop="$1">
                  {badge.description}
                </Text>
                {/* Tooltip arrow */}
                <View
                  position="absolute"
                  bottom={-6}
                  left="50%"
                  transform={[{ translateX: -6 }]}
                  width={0}
                  height={0}
                  borderLeftWidth={6}
                  borderRightWidth={6}
                  borderTopWidth={6}
                  borderLeftColor="transparent"
                  borderRightColor="transparent"
                  borderTopColor={Colors.gray[900]}
                />
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

interface BadgeProgressProps {
  userId: string;
}

export const BadgeProgress: React.FC<BadgeProgressProps> = ({ userId }) => {
  const [stats, setStats] = React.useState<{
    totalPossible: number;
    earned: number;
  }>({
    totalPossible: Object.keys(WEEKLY_BADGES).length,
    earned: 0,
  });

  React.useEffect(() => {
    const loadBadgeCount = async () => {
      try {
        const { getUserBadgeCount } = await import('@/services/badges/badgeService');
        const count = await getUserBadgeCount(userId);
        setStats((prev) => ({ ...prev, earned: count }));
      } catch (error) {
        console.error('Error loading badge count:', error);
      }
    };

    loadBadgeCount();
  }, [userId]);

  const percentage = (stats.earned / stats.totalPossible) * 100;

  return (
    <View marginTop="$3">
      <View flexDirection="row" justifyContent="space-between" marginBottom="$1">
        <Text fontSize="$2" color={Colors.text.secondary}>
          Badge Progress
        </Text>
        <Text fontSize="$2" color={Colors.text.primary} fontWeight="600">
          {stats.earned}/{stats.totalPossible}
        </Text>
      </View>

      {/* Progress bar */}
      <View height={8} backgroundColor={Colors.gray[200]} borderRadius="$2" overflow="hidden">
        <View height="100%" width={`${percentage}%`} backgroundColor={Colors.primary} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  badgeButton: {
    padding: 4,
  },
});
