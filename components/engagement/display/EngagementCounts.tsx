import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EngagementButton } from '../buttons/EngagementButton';
import { toastService } from '@/services/toastService';
import { OpacityColors } from '@/theme';

interface EngagementCountsProps {
  commentCount: number;
  reactionCount: number;
  tailCount?: number;
  fadeCount?: number;
  onCommentPress?: () => void;
  onReactionPress?: () => void;
  postType?: 'content' | 'pick' | 'outcome';
}

export function EngagementCounts({
  commentCount,
  reactionCount,
  tailCount,
  fadeCount,
  onCommentPress,
  onReactionPress,
  postType = 'content',
}: EngagementCountsProps) {
  const handleCommentPress = () => {
    if (onCommentPress) {
      onCommentPress();
    } else {
      toastService.showComingSoon('Comments');
    }
  };

  const handleReactionPress = () => {
    if (onReactionPress) {
      onReactionPress();
    } else {
      toastService.showComingSoon('Reactions');
    }
  };

  const isPick = postType === 'pick';

  return (
    <View style={styles.container}>
      {/* Show tail/fade counts for pick posts */}
      {isPick && tailCount !== undefined && fadeCount !== undefined && (
        <>
          <View style={styles.countItem}>
            <EngagementButton
              icon="👍"
              count={tailCount}
              onPress={() => toastService.showInfo('Tail count')}
              size="small"
            />
          </View>

          <View style={styles.countItem}>
            <EngagementButton
              icon="👎"
              count={fadeCount}
              onPress={() => toastService.showInfo('Fade count')}
              size="small"
            />
          </View>

          <View style={styles.divider} />
        </>
      )}

      {/* Comment count */}
      <View style={styles.countItem}>
        <EngagementButton
          icon="💬"
          count={commentCount}
          onPress={handleCommentPress}
          size="small"
        />
      </View>

      {/* Reaction count */}
      <View style={styles.countItem}>
        <EngagementButton
          icon="❤️"
          count={reactionCount}
          onPress={handleReactionPress}
          size="small"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    gap: 12,
    flexWrap: 'wrap',
  },
  countItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: OpacityColors.gray.light,
    marginHorizontal: 8,
  },
});
