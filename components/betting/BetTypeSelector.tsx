import React from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import * as Haptics from 'expo-haptics';
import { BetType } from '@/stores/betSlipStore';

interface BetTypeSelectorProps {
  selected: BetType;
  onChange: (type: BetType) => void;
}

export function BetTypeSelector({ selected, onChange }: BetTypeSelectorProps) {
  const betTypes: { type: BetType; label: string }[] = [
    { type: 'spread', label: 'Spread' },
    { type: 'total', label: 'Total' },
    { type: 'moneyline', label: 'ML' },
  ];

  const handlePress = async (type: BetType) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(type);
  };

  return (
    <View backgroundColor={Colors.surfaceAlt} borderRadius={12} padding={4} marginBottom={16}>
      <Stack flexDirection="row" gap={4}>
        {betTypes.map(({ type, label }) => (
          <TouchableOpacity
            key={type}
            onPress={() => handlePress(type)}
            style={[styles.tab, selected === type && styles.selectedTab]}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              color={selected === type ? Colors.white : Colors.text.secondary}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTab: {
    backgroundColor: Colors.primary,
  },
});
