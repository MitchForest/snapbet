import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BADGES, getHighestPriorityBadge } from '@/data/badges';

interface BadgeDisplayProps {
  badges: string[];
  size?: 'small' | 'medium' | 'large';
  showAll?: boolean;
  maxBadges?: number;
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  badges,
  size = 'medium',
  showAll = false,
  maxBadges = 3,
}) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  // Get badge objects
  const badgeObjects = badges.map((id) => BADGES[id.toUpperCase()]).filter(Boolean);

  // Sort by priority
  const sortedBadges = badgeObjects.sort((a, b) => b.priority - a.priority);

  // Determine which badges to show
  const badgesToShow = showAll ? sortedBadges : sortedBadges.slice(0, maxBadges);

  const fontSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;

  return (
    <View style={styles.container}>
      {badgesToShow.map((badge) => (
        <Text key={badge.id} style={[styles.badge, { fontSize }]}>
          {badge.emoji}
        </Text>
      ))}
    </View>
  );
};

interface SingleBadgeDisplayProps {
  badges: string[];
  size?: 'small' | 'medium' | 'large';
}

export const SingleBadgeDisplay: React.FC<SingleBadgeDisplayProps> = ({
  badges,
  size = 'medium',
}) => {
  if (!badges || badges.length === 0) {
    return null;
  }

  const highestBadge = getHighestPriorityBadge(badges);
  if (!highestBadge) {
    return null;
  }

  const fontSize = size === 'small' ? 16 : size === 'medium' ? 20 : 24;

  return <Text style={{ fontSize }}>{highestBadge.emoji}</Text>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    marginHorizontal: 2,
  },
});
