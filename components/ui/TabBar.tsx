import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

interface TabItem {
  route: string;
  label: string;
  icon: string;
  activeIcon?: string;
}

const tabs: TabItem[] = [
  { route: 'index', label: 'Feed', icon: '🏠' },
  { route: 'games', label: 'Games', icon: '🏀' },
  { route: 'messages', label: 'Chat', icon: '💬' },
  { route: 'search', label: 'Search', icon: '🔍' },
];

export const TabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();

  const renderTab = (route: { key: string; name: string }, index: number) => {
    const isFocused = state.index === index;
    const tabConfig = tabs.find((t) => t.route === route.name);

    const onPress = () => {
      const event = navigation.emit({
        type: 'tabPress',
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable key={route.key} onPress={onPress}>
        <View flex={1} alignItems="center" paddingVertical="$2">
          <Text fontSize={24} color={isFocused ? '$primary' : '$textSecondary'}>
            {tabConfig?.icon}
          </Text>
          <Text fontSize={10} color={isFocused ? '$primary' : '$textSecondary'} marginTop="$1">
            {tabConfig?.label}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View
      backgroundColor="$surface"
      borderTopWidth={1}
      borderTopColor="$divider"
      paddingBottom={insets.bottom}
    >
      <View flexDirection="row" height={56} alignItems="center" justifyContent="space-around">
        {state.routes.slice(0, 2).map(renderTab)}

        {/* Camera Button */}
        <View position="relative" top={-8}>
          <Pressable onPress={() => navigation.getParent()?.navigate('camera')}>
            <View
              width={56}
              height={56}
              borderRadius="$round"
              backgroundColor="$primary"
              justifyContent="center"
              alignItems="center"
              shadowColor="#000"
              shadowOffset={{ width: 0, height: 4 }}
              shadowOpacity={0.3}
              shadowRadius={12}
            >
              <Text fontSize={28} color="$textInverse">
                📸
              </Text>
            </View>
          </Pressable>
        </View>

        {state.routes.slice(2).map((route, index) => renderTab(route, index + 2))}
      </View>
    </View>
  );
};
