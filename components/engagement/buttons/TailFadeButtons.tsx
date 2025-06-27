import React, { useState } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { TailFadeSheet } from '@/components/betting/TailFadeSheet';
import { WhoTailedModal } from '@/components/betting/WhoTailedModal';
import { useUserPickAction, usePickActionCounts } from '@/hooks/useTailFade';
import { Colors } from '@/theme';
import { PostWithType } from '@/types/content';
import { Bet } from '@/services/betting/types';
import * as Haptics from 'expo-haptics';

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

  const handleTail = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onTailFadePress) onTailFadePress();
    setSheetAction('tail');
  };

  const handleFade = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onTailFadePress) onTailFadePress();
    setSheetAction('fade');
  };

  const isTailed = userAction?.action_type === 'tail';
  const isFaded = userAction?.action_type === 'fade';

  return (
    <>
      <View style={styles.container}>
        <Pressable
          style={[
            styles.button,
            styles.tailButton,
            isTailed && styles.tailButtonActive
          ]}
          onPress={handleTail}
          disabled={isTailed || isFaded}
        >
          <Text style={[styles.buttonText, isTailed && styles.activeButtonText]}>
            TAIL
          </Text>
          {(counts?.tailCount || 0) > 0 && (
            <Text style={[styles.countText, isTailed && styles.activeButtonText]}>
              {counts?.tailCount}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={[
            styles.button,
            styles.fadeButton,
            isFaded && styles.fadeButtonActive
          ]}
          onPress={handleFade}
          disabled={isTailed || isFaded}
        >
          <Text style={[styles.buttonText, isFaded && styles.activeButtonText]}>
            FADE
          </Text>
          {(counts?.fadeCount || 0) > 0 && (
            <Text style={[styles.countText, isFaded && styles.activeButtonText]}>
              {counts?.fadeCount}
            </Text>
          )}
        </Pressable>
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
    gap: 16,
    paddingHorizontal: 32,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    maxWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    gap: 8,
  },
  tailButton: {
    borderColor: '#10B981',
    backgroundColor: Colors.white,
  },
  tailButtonActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  fadeButton: {
    borderColor: '#EF4444',
    backgroundColor: Colors.white,
  },
  fadeButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: Colors.text.primary,
  },
  activeButtonText: {
    color: Colors.white,
  },
  countText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '600',
  },
});
