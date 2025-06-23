import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Avatar } from '@/components/common/Avatar';

interface MenuItemProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onPress }) => (
  <Pressable onPress={onPress}>
    <View flexDirection="row" alignItems="center" paddingVertical="$3" paddingHorizontal="$4">
      <Text fontSize={20} marginRight="$3">
        {icon}
      </Text>
      <Text fontSize={16} color="$textPrimary">
        {label}
      </Text>
    </View>
  </Pressable>
);

export const DrawerContent: React.FC<DrawerContentComponentProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView>
        <View paddingTop={insets.top + 20}>
          {/* Profile Section */}
          <View
            paddingHorizontal="$4"
            paddingBottom="$4"
            borderBottomWidth={1}
            borderBottomColor="$divider"
          >
            <Avatar size={64} />
            <Text fontSize={20} fontWeight="600" marginTop="$3" color="$textPrimary">
              @yourusername
            </Text>
            <Text fontSize={14} color="$textSecondary" marginTop="$1">
              45-35 • +$420 • 🔥3
            </Text>

            {/* Stats */}
            <View flexDirection="row" marginTop="$4" gap="$4">
              <View>
                <Text fontSize={20} fontWeight="600" color="$primary">
                  $1,420
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  Bankroll
                </Text>
              </View>
              <View>
                <Text fontSize={20} fontWeight="600" color="$textPrimary">
                  56.3%
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  Win Rate
                </Text>
              </View>
              <View>
                <Text fontSize={20} fontWeight="600" color="$win">
                  +12.5%
                </Text>
                <Text fontSize={12} color="$textSecondary">
                  ROI
                </Text>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View paddingTop="$4">
            <MenuItem
              icon="👤"
              label="View Profile"
              onPress={() => {
                navigation.navigate('profile', { username: 'yourusername' });
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="📜"
              label="Bet History"
              onPress={() => {
                // TODO: Navigate to bet history
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="👥"
              label="Find Friends"
              onPress={() => {
                // TODO: Navigate to find friends
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="⚙️"
              label="Settings"
              onPress={() => {
                // TODO: Navigate to settings
                navigation.closeDrawer();
              }}
            />
          </View>

          {/* Bottom Section */}
          <View marginTop="$8" paddingTop="$4" borderTopWidth={1} borderTopColor="$divider">
            <MenuItem
              icon="↻"
              label="Reset Bankroll"
              onPress={() => {
                // TODO: Reset bankroll
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="📖"
              label="How to Play"
              onPress={() => {
                // TODO: Show how to play
                navigation.closeDrawer();
              }}
            />
            <MenuItem
              icon="📧"
              label="Support"
              onPress={() => {
                // TODO: Open support
                navigation.closeDrawer();
              }}
            />
          </View>

          {/* Sign Out */}
          <View
            marginTop="$4"
            paddingTop="$4"
            borderTopWidth={1}
            borderTopColor="$divider"
            paddingBottom={insets.bottom + 20}
          >
            <MenuItem
              icon="🚪"
              label="Sign Out"
              onPress={() => {
                // TODO: Sign out
                navigation.closeDrawer();
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
