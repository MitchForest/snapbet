import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { EngagementButton } from './EngagementButton';
import { TailFadeSheet } from '@/components/betting/TailFadeSheet';
import { WhoTailedModal } from '@/components/betting/WhoTailedModal';
import { useUserPickAction, usePickActionCounts } from '@/hooks/useTailFade';
import { Colors } from '@/theme';
import { PostWithType } from '@/types/content';
import { Bet } from '@/services/betting/types';
import { Game } from '@/types/database';

interface TailFadeButtonsProps {
  post: PostWithType;
  bet: Bet;
  game: Game;
  onTailFadePress?: () => void;
}

export function TailFadeButtons({ post, bet, game, onTailFadePress }: TailFadeButtonsProps) {
  const [sheetAction, setSheetAction] = useState<'tail' | 'fade' | null>(null);
  const [showWhoModal, setShowWhoModal] = useState(false);

  const { data: userAction } = useUserPickAction(post.id);
  const { data: counts } = usePickActionCounts(post.id);

  // Check if game has started
  const isExpired = useMemo(() => {
    return new Date(game.commence_time) <= new Date();
  }, [game.commence_time]);

  const handleTail = () => {
    if (onTailFadePress) onTailFadePress();
    setSheetAction('tail');
  };

  const handleFade = () => {
    if (onTailFadePress) onTailFadePress();
    setSheetAction('fade');
  };

  const handleCountPress = () => {
    if ((counts?.tailCount || 0) + (counts?.fadeCount || 0) > 0) {
      setShowWhoModal(true);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <EngagementButton
          icon="👍"
          label="Tail"
          count={counts?.tailCount || 0}
          onPress={handleTail}
          isActive={userAction?.action_type === 'tail'}
          activeColor={Colors.primary}
          disabled={isExpired || userAction !== null}
          size="large"
          style={styles.button}
        />

        <EngagementButton
          icon="👎"
          label="Fade"
          count={counts?.fadeCount || 0}
          onPress={handleFade}
          isActive={userAction?.action_type === 'fade'}
          activeColor={Colors.error}
          disabled={isExpired || userAction !== null}
          size="large"
          style={styles.button}
        />

        {(counts?.tailCount || 0) + (counts?.fadeCount || 0) > 0 && (
          <Pressable onPress={handleCountPress} style={styles.totalCount}>
            <Text style={styles.totalCountText}>
              {(counts?.tailCount || 0) + (counts?.fadeCount || 0)} total
            </Text>
          </Pressable>
        )}
      </View>

      <TailFadeSheet
        isOpen={sheetAction !== null}
        onClose={() => setSheetAction(null)}
        action={sheetAction}
        originalBet={bet}
        originalPost={post}
        originalUser={
          post.user
            ? {
                username: post.user.username || '',
                display_name: (post.user as Record<string, unknown>).display_name as string | null || null,
              }
            : null
        }
      />

      <WhoTailedModal
        postId={post.id}
        isOpen={showWhoModal}
        onClose={() => setShowWhoModal(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  button: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  totalCount: {
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  totalCountText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
});
