import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';

interface ProfileTabsProps {
  activeTab: 'posts' | 'bets';
  onTabChange: (tab: 'posts' | 'bets') => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <View
      flexDirection="row"
      backgroundColor="$surface"
      borderBottomWidth={1}
      borderBottomColor="$divider"
    >
      <Pressable style={{ flex: 1 }} onPress={() => onTabChange('posts')}>
        <View
          paddingVertical="$3"
          alignItems="center"
          borderBottomWidth={2}
          borderBottomColor={activeTab === 'posts' ? '$primary' : 'transparent'}
        >
          <Text
            fontSize={16}
            fontWeight={activeTab === 'posts' ? '600' : '400'}
            color={activeTab === 'posts' ? '$primary' : '$textSecondary'}
          >
            Posts
          </Text>
        </View>
      </Pressable>

      <Pressable style={{ flex: 1 }} onPress={() => onTabChange('bets')}>
        <View
          paddingVertical="$3"
          alignItems="center"
          borderBottomWidth={2}
          borderBottomColor={activeTab === 'bets' ? '$primary' : 'transparent'}
        >
          <Text
            fontSize={16}
            fontWeight={activeTab === 'bets' ? '600' : '400'}
            color={activeTab === 'bets' ? '$primary' : '$textSecondary'}
          >
            Bets
          </Text>
        </View>
      </Pressable>
    </View>
  );
};
