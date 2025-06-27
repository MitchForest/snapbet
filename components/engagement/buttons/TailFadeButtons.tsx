import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { EngagementPill } from './EngagementPill';
import { TailFadeSheet } from '@/components/betting/TailFadeSheet';
import { WhoTailedModal } from '@/components/betting/WhoTailedModal';
import { useUserPickAction, usePickActionCounts } from '@/hooks/useTailFade';
import { Colors } from '@/theme';
import { PostWithType } from '@/types/content';
import { Bet } from '@/services/betting/types';

interface TailFadeButtonsProps {
  post: PostWithType;
  bet: Bet;
  onTailFadePress?: () => void;
}

export function TailFadeButtons({ post, bet, onTailFadePress }: TailFadeButtonsProps) {
  const [sheetAction, setSheetAction] = useState<'tail' | 'fade' | null>(null);
  const [showWhoModal, setShowWhoModal] = useState(false);

  const { data: userAction } = useUserPickAction(post.id);
  const { data: counts } = usePickActionCounts(post.id);

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
        <EngagementPill
          icon="👍"
          count={counts?.tailCount || 0}
          onPress={handleTail}
          isActive={userAction?.action_type === 'tail'}
          activeColor={Colors.primary}
          style={styles.button}
        />

        <EngagementPill
          icon="👎"
          count={counts?.fadeCount || 0}
          onPress={handleFade}
          isActive={userAction?.action_type === 'fade'}
          activeColor={Colors.error}
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
                display_name:
                  ((post.user as Record<string, unknown>).display_name as string | null) || null,
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
