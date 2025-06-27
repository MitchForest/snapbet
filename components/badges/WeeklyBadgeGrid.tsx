import React from 'react';
import { View, Text } from '@tamagui/core';
import { WEEKLY_BADGES } from '@/data/weeklyBadges';
import { Colors } from '@/theme';

interface WeeklyBadgeGridProps {
  badges: string[];
  earnedDate?: Date;
}

export const WeeklyBadgeGrid: React.FC<WeeklyBadgeGridProps> = ({ badges }) => {
  console.log('[WeeklyBadgeGrid Debug] Received badges:', badges);
  console.log('[WeeklyBadgeGrid Debug] Available badge keys:', Object.keys(WEEKLY_BADGES));

  if (!badges || badges.length === 0) {
    return null;
  }

  return (
    <View flexDirection="row" flexWrap="wrap" gap="$2">
      {badges.map((badgeId) => {
        console.log(
          '[WeeklyBadgeGrid Debug] Looking up badge:',
          badgeId,
          'as',
          badgeId.toUpperCase()
        );
        const badge = WEEKLY_BADGES[badgeId.toUpperCase()];
        console.log('[WeeklyBadgeGrid Debug] Found badge:', badge);

        if (!badge) {
          console.warn('[WeeklyBadgeGrid Debug] Badge not found for ID:', badgeId);
          return null;
        }

        return (
          <View
            key={badge.id}
            backgroundColor={Colors.surface}
            borderRadius="$3"
            borderWidth={1}
            borderColor={Colors.border.light}
            paddingHorizontal="$3"
            paddingVertical="$2"
            minWidth={100}
            alignItems="center"
          >
            <Text fontSize={32} marginBottom="$1">
              {badge.emoji}
            </Text>
            <Text fontSize="$1" fontWeight="600" color={Colors.text.primary} textAlign="center">
              {badge.name}
            </Text>
            <Text fontSize="$1" color={Colors.text.secondary} textAlign="center" marginTop="$1">
              {badge.description}
            </Text>
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
