import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, Animated, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { ChatWithDetails } from '@/types/messaging';
import { Colors } from '@/theme';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '@/components/common/Avatar';
import * as Haptics from 'expo-haptics';

interface ChatListItemProps {
  chat: ChatWithDetails;
  onPress: () => void;
  onArchive: () => void;
  onMute: () => void;
  isOnline?: boolean;
  typingUsers?: string[];
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  onPress,
  onArchive,
  onMute,
  isOnline = false,
  typingUsers = [],
}) => {
  const swipeableRef = React.useRef<Swipeable>(null);

  // Render right swipe actions
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const translateX = dragX.interpolate({
      inputRange: [-160, 0],
      outputRange: [0, 160],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={[
          styles.swipeContainer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <Pressable
          onPress={() => {
            swipeableRef.current?.close();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onMute();
          }}
          style={[styles.swipeAction, styles.muteAction]}
        >
          <Text color="white" fontWeight="600">
            Mute
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            swipeableRef.current?.close();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onArchive();
          }}
          style={[styles.swipeAction, styles.archiveAction]}
        >
          <Text color="white" fontWeight="600">
            Archive
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  // Get display info based on chat type
  const displayName =
    chat.chat_type === 'dm' ? chat.other_member_username : chat.name || 'Group Chat';
  const avatarUrl = chat.chat_type === 'dm' ? chat.other_member_avatar_url : chat.avatar_url;
  const avatarFallback = chat.chat_type === 'group' ? '👥' : displayName?.[0]?.toUpperCase() || '?';

  // Format last message
  const lastMessageText = typingUsers.length > 0 ? 'typing...' : chat.last_message_content;
  const lastMessageTime = chat.last_message_created_at
    ? formatDistanceToNow(new Date(chat.last_message_created_at), { addSuffix: true })
    : '';

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <Pressable onPress={onPress}>
        <View
          backgroundColor="$background"
          paddingHorizontal="$4"
          paddingVertical="$3"
          flexDirection="row"
          alignItems="center"
          gap="$3"
          borderBottomWidth={1}
          borderBottomColor="$border"
        >
          {/* Avatar with online indicator */}
          <View position="relative">
            <Avatar src={avatarUrl || undefined} fallback={avatarFallback} size={48} />
            {isOnline && chat.chat_type === 'dm' && (
              <View
                position="absolute"
                bottom={0}
                right={0}
                width={12}
                height={12}
                backgroundColor={Colors.success}
                borderRadius={6}
                borderWidth={2}
                borderColor="$background"
              />
            )}
          </View>

          {/* Chat info */}
          <View flex={1} gap="$1">
            <View flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text fontSize="$4" fontWeight="600" numberOfLines={1} flex={1}>
                {displayName}
                {chat.chat_type === 'group' && chat.member_count > 0 && (
                  <Text fontSize="$3" color="$gray11" fontWeight="400">
                    {' '}
                    ({chat.member_count})
                  </Text>
                )}
              </Text>
              {lastMessageTime && (
                <Text fontSize="$2" color="$gray11">
                  {lastMessageTime}
                </Text>
              )}
            </View>
            <View flexDirection="row" justifyContent="space-between" alignItems="center">
              <Text
                fontSize="$3"
                color={typingUsers.length > 0 ? '$gray11' : '$gray10'}
                numberOfLines={1}
                flex={1}
                fontStyle={typingUsers.length > 0 ? 'italic' : 'normal'}
              >
                {lastMessageText || 'No messages yet'}
              </Text>
              {chat.unread_count > 0 && (
                <View
                  backgroundColor="$primary"
                  borderRadius="$round"
                  paddingHorizontal="$2"
                  paddingVertical="$0.5"
                  minWidth={20}
                  alignItems="center"
                >
                  <Text fontSize="$2" color="white" fontWeight="600">
                    {chat.unread_count > 99 ? '99+' : chat.unread_count}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    flexDirection: 'row',
    width: 160,
  },
  swipeAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  muteAction: {
    backgroundColor: Colors.warning,
  },
  archiveAction: {
    backgroundColor: Colors.gray[500],
  },
});
