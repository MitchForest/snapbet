import React, { useState, useCallback } from 'react';
import { ScrollView, Pressable, StyleSheet } from 'react-native';
import { Stack, Text, View } from '@tamagui/core';
import * as Haptics from 'expo-haptics';
import { useEffects } from '@/hooks/useEffects';
import { EffectCategory, EmojiEffect } from '@/types/effects';
import { Colors } from '@/theme';

interface EffectSelectorProps {
  onSelectEffect: (effectId: string | null) => void;
  currentEffectId: string | null;
  onPreviewLocked?: (effect: EmojiEffect) => void;
}

const CATEGORIES: { id: EffectCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'WINS', label: 'Wins', emoji: '🏆' },
  { id: 'LOSSES', label: 'Losses', emoji: '😢' },
  { id: 'VIBES', label: 'Vibes', emoji: '😎' },
  { id: 'HYPE', label: 'Hype', emoji: '🔥' },
  { id: 'WILDCARDS', label: 'Wild', emoji: '🎲' },
  { id: 'BETTING', label: 'Bets', emoji: '💰' },
];

const styles = StyleSheet.create({
  categoryScroll: {
    maxHeight: 60,
    flexGrow: 0,
  },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  effectsContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40, // Extra padding to ensure bottom effects are visible
    flexGrow: 1,
  },
});

export function EffectSelector({
  onSelectEffect,
  currentEffectId,
  onPreviewLocked,
}: EffectSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory | 'all'>('all');
  const { getAvailableEffects, isEffectUnlocked, weeklyBadgeCount } = useEffects();

  const effects = getAvailableEffects(selectedCategory);

  const handleSelectEffect = useCallback(
    async (effect: EmojiEffect) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (effect.id === currentEffectId) {
        // Deselect if tapping the same effect
        onSelectEffect(null);
      } else if (isEffectUnlocked(effect)) {
        // Select if unlocked
        onSelectEffect(effect.id);
      } else if (onPreviewLocked) {
        // Trigger preview for locked effects
        onPreviewLocked(effect);
      }
    },
    [currentEffectId, onSelectEffect, isEffectUnlocked, onPreviewLocked]
  );

  const handleCategorySelect = useCallback(async (category: EffectCategory | 'all') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(category);
  }, []);

  return (
    <Stack
      height={320}
      backgroundColor="rgba(0, 0, 0, 0.9)"
      borderTopLeftRadius="$4"
      borderTopRightRadius="$4"
      paddingBottom="$2"
    >
      {/* Badge Count Display */}
      <View
        paddingHorizontal="$4"
        paddingVertical="$3"
        borderBottomWidth={1}
        borderBottomColor="rgba(255, 255, 255, 0.1)"
      >
        <Text fontSize="$3" color="rgba(255, 255, 255, 0.8)" textAlign="center">
          {weeklyBadgeCount === 0
            ? 'Unlock effects by earning weekly badges'
            : `${weeklyBadgeCount} badge${weeklyBadgeCount === 1 ? '' : 's'} earned this week`}
        </Text>
      </View>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
        bounces={false}
        scrollEventThrottle={16}
      >
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => handleCategorySelect(category.id)}
            style={{ marginRight: 8 }}
          >
            <View
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$3"
              backgroundColor={
                selectedCategory === category.id ? Colors.primary : 'rgba(255, 255, 255, 0.1)'
              }
            >
              <Text
                fontSize="$3"
                color={selectedCategory === category.id ? Colors.white : 'rgba(255, 255, 255, 0.8)'}
              >
                {category.emoji} {category.label}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>

      {/* Effects Grid */}
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.effectsContent}
        style={{ flex: 1 }}
        bounces={true}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
          {effects.map((effect) => {
            const isSelected = effect.id === currentEffectId;
            const isLocked = !effect.isUnlocked;

            return (
              <Pressable
                key={effect.id}
                onPress={() => handleSelectEffect(effect)}
                style={{ marginBottom: 12, marginHorizontal: 6 }}
              >
                <View
                  width={65}
                  height={65}
                  borderRadius="$3"
                  backgroundColor={isSelected ? Colors.primary : 'rgba(255, 255, 255, 0.1)'}
                  borderWidth={isSelected ? 2 : 1}
                  borderColor={isSelected ? Colors.primary : 'rgba(255, 255, 255, 0.2)'}
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                >
                  <Text fontSize={26}>{effect.preview}</Text>

                  {/* Lock Icon for locked effects */}
                  {isLocked && (
                    <View
                      position="absolute"
                      bottom={2}
                      right={2}
                      backgroundColor="rgba(0,0,0,0.7)"
                      borderRadius="$2"
                      padding="$1"
                    >
                      <Text fontSize={10} color={Colors.white}>
                        🔒
                      </Text>
                    </View>
                  )}

                  {/* Tier indicator */}
                  {effect.tier > 0 && (
                    <View
                      position="absolute"
                      top={2}
                      right={2}
                      backgroundColor={effect.tier === 1 ? '#CD7F32' : '#FFD700'}
                      borderRadius="$1"
                      paddingHorizontal="$1"
                    >
                      <Text fontSize="$1" color={Colors.white} fontWeight="600">
                        T{effect.tier}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Stack>
  );
}
