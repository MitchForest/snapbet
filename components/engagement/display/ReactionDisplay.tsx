import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { ReactionListSheet } from '../sheets/ReactionListSheet';
import { WhoReactedModal } from '../WhoReactedModal';
import { Colors } from '@/theme';

interface ReactionDisplayProps {
  reactions: { emoji: string; count: number }[];
  userReaction: string | null;
  postId: string;
}

function ReactionBubble({
  emoji,
  count,
  isUserReaction,
  index,
  onPress,
}: {
  emoji: string;
  count: number;
  isUserReaction: boolean;
  index: number;
  onPress: () => void;
}) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    // Staggered entrance animation
    setTimeout(() => {
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 });
    }, index * 50);
  }, [index, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={[styles.reactionBubble, isUserReaction && styles.userReactionBubble, animatedStyle]}
      >
        <Text style={styles.reactionEmoji}>{emoji}</Text>
        <Text style={[styles.reactionCount, isUserReaction && styles.userReactionCount]}>
          {count}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function ReactionDisplay({ reactions, userReaction, postId }: ReactionDisplayProps) {
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

  // Show top 3 reactions
  const displayReactions = reactions.slice(0, 3);
  const hasMore = reactions.length > 3;
  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0);

  const handlePress = () => {
    if (hasMore) {
      setShowAllReactions(true);
    }
  };

  const handleReactionPress = (emoji: string) => {
    setSelectedEmoji(emoji);
  };

  if (reactions.length === 0) {
    return null;
  }

  return (
    <>
      <Pressable onPress={handlePress} style={styles.container}>
        {displayReactions.map((reaction, index) => (
          <ReactionBubble
            key={reaction.emoji}
            emoji={reaction.emoji}
            count={reaction.count}
            isUserReaction={userReaction === reaction.emoji}
            index={index}
            onPress={() => handleReactionPress(reaction.emoji)}
          />
        ))}

        {hasMore && (
          <View style={styles.moreIndicator}>
            <Text style={styles.moreText}>+{reactions.length - 3}</Text>
          </View>
        )}

        <Text style={styles.totalCount}>{totalCount}</Text>
      </Pressable>

      <ReactionListSheet
        isVisible={showAllReactions}
        onClose={() => setShowAllReactions(false)}
        reactions={reactions}
      />

      {selectedEmoji && (
        <WhoReactedModal
          postId={postId}
          emoji={selectedEmoji}
          isOpen={!!selectedEmoji}
          onClose={() => setSelectedEmoji(null)}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: -8, // Overlap bubbles slightly
  },
  reactionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border.light,
    gap: 4,
    zIndex: 1,
  },
  userReactionBubble: {
    backgroundColor: Colors.primary + '15',
    borderColor: Colors.primary,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  userReactionCount: {
    color: Colors.primary,
  },
  moreIndicator: {
    backgroundColor: Colors.gray[100],
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginLeft: 4,
  },
  moreText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  totalCount: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});
