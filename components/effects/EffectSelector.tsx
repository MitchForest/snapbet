import React, { useState, useCallback } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { Stack, Text, View } from '@tamagui/core';
import * as Haptics from 'expo-haptics';
import { useEffects } from '@/hooks/useEffects';
import { EffectCategory, EmojiEffect } from '@/types/effects';
import { Colors } from '@/theme';

interface EffectSelectorProps {
  onSelectEffect: (effectId: string | null) => void;
  currentEffectId: string | null;
  userBadges: string[];
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

export function EffectSelector({
  onSelectEffect,
  currentEffectId,
  userBadges,
  onPreviewLocked,
}: EffectSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<EffectCategory | 'all'>('all');
  const { getAvailableEffects, isEffectUnlocked } = useEffects(userBadges);

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
      height={200}
      backgroundColor={Colors.surface}
      borderTopLeftRadius="$4"
      borderTopRightRadius="$4"
    >
      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 50 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
      >
        <Stack flexDirection="row" gap="$2">
          {CATEGORIES.map((category) => (
            <Pressable key={category.id} onPress={() => handleCategorySelect(category.id)}>
              <View
                paddingHorizontal="$3"
                paddingVertical="$2"
                borderRadius="$3"
                backgroundColor={
                  selectedCategory === category.id ? Colors.primary : Colors.gray[100]
                }
              >
                <Text
                  fontSize="$2"
                  color={selectedCategory === category.id ? Colors.white : Colors.text.primary}
                >
                  {category.emoji} {category.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </Stack>
      </ScrollView>

      {/* Effects Grid */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        <Stack flexDirection="row" flexWrap="wrap" gap="$2">
          {effects.map((effect) => {
            const isSelected = effect.id === currentEffectId;
            const isLocked = !effect.isUnlocked;

            return (
              <Pressable key={effect.id} onPress={() => handleSelectEffect(effect)}>
                <View
                  width={60}
                  height={60}
                  borderRadius="$3"
                  backgroundColor={isSelected ? Colors.primary : Colors.gray[100]}
                  borderWidth={isSelected ? 2 : 1}
                  borderColor={isSelected ? Colors.primary : Colors.border.light}
                  alignItems="center"
                  justifyContent="center"
                  position="relative"
                >
                  <Text fontSize={24}>{effect.preview}</Text>

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
        </Stack>
      </ScrollView>
    </Stack>
  );
}
