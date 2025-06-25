import React from 'react';
import { View, StyleSheet } from 'react-native';
import { EngagementButton } from './EngagementButton';
import { toastService } from '@/services/toastService';
import { Colors } from '@/theme';

interface TailFadeButtonsProps {
  postId: string;
  tailCount: number;
  fadeCount: number;
  userAction?: 'tail' | 'fade' | null;
  isExpired?: boolean;
}

export function TailFadeButtons({
  tailCount,
  fadeCount,
  userAction,
  isExpired = false,
}: TailFadeButtonsProps) {
  const handleTail = () => {
    toastService.showComingSoon('Tailing');
  };

  const handleFade = () => {
    toastService.showComingSoon('Fading');
  };

  return (
    <View style={styles.container}>
      <EngagementButton
        icon="👍"
        label="Tail"
        count={tailCount}
        onPress={handleTail}
        isActive={userAction === 'tail'}
        activeColor={Colors.primary}
        disabled={isExpired}
        size="large"
        style={styles.button}
      />

      <EngagementButton
        icon="👎"
        label="Fade"
        count={fadeCount}
        onPress={handleFade}
        isActive={userAction === 'fade'}
        activeColor="#F97316"
        disabled={isExpired}
        size="large"
        style={styles.button}
      />
    </View>
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
});
