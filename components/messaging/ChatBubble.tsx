import React, { useState } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme';
import { Message } from '@/types/messaging';
import { Avatar } from '@/components/common/Avatar';
import { MentionableText } from '@/components/messaging/MentionableText';
import { PickShareCard } from './PickShareCard';
import { MessageStatus } from './MessageStatus';
import { ExpirationTimer } from './ExpirationTimer';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';
import { MediaMessageDisplay } from './MediaMessageDisplay';
import { useMessageReactions } from '@/hooks/useMessageReactions';
import { MessageActionMenu } from './MessageActionMenu';
import { router } from 'expo-router';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  showSenderName?: boolean;
  chatType?: 'dm' | 'group';
  onResend?: () => void;
  onLongPress?: () => void;
}

export function ChatBubble({
  message,
  isOwn,
  showAvatar = false,
  showSenderName = false,
  chatType = 'dm',
  onResend,
  onLongPress,
}: ChatBubbleProps) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const { reactions, userReaction, toggleReaction } = useMessageReactions(message.id);

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowActionMenu(true);
    onLongPress?.();
  };

  const handleResend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onResend?.();
  };

  const handleAvatarPress = () => {
    if (message.sender.username) {
      router.push(`/profile/${message.sender.username}`);
    }
  };

  // Determine bubble styling based on ownership
  const bubbleStyle = {
    backgroundColor: isOwn ? Colors.primary : Colors.gray[200],
    borderRadius: 18,
    borderBottomRightRadius: isOwn ? 4 : 18,
    borderBottomLeftRadius: isOwn ? 18 : 4,
    maxWidth: '100%',
    minWidth: 60,
  };

  const textColor = isOwn ? Colors.white : Colors.text.primary;
  const timeColor = isOwn ? Colors.white + '99' : Colors.text.tertiary; // 60% opacity

  // Format timestamp
  const timestamp = formatDistanceToNow(new Date(message.created_at || Date.now()), {
    addSuffix: false,
    includeSeconds: true,
  }).replace('less than a minute', 'now');

  const renderContent = () => {
    // Extended message interface for optional fields
    interface ExtendedMessage extends Omit<Message, 'bet_id' | 'media_url' | 'media_type'> {
      bet_id?: string | null;
      media_url?: string | null;
      media_type?: 'photo' | 'video' | null;
    }

    const extMessage = message as ExtendedMessage;

    // Check if message is expired
    const isExpired = message.expires_at && new Date(message.expires_at) < new Date();

    if (message.message_type === 'media' && extMessage.media_url && extMessage.media_type) {
      return (
        <MediaMessageDisplay
          url={extMessage.media_url}
          type={extMessage.media_type}
          isOwn={isOwn}
          isExpired={isExpired || false}
        />
      );
    }
    if (message.message_type === 'pick' && extMessage.bet_id) {
      // Cast bet to match ExtendedBet interface
      const extendedBet = message.bet
        ? {
            ...message.bet,
            bet_details: message.bet.bet_details as {
              team?: string;
              line?: number;
              total_type?: string;
            },
            game: message.bet.game
              ? {
                  ...message.bet.game,
                  start_time: message.bet.game.commence_time,
                }
              : undefined,
          }
        : undefined;

      return <PickShareCard betId={extMessage.bet_id} bet={extendedBet} isOwn={isOwn} />;
    }

    // Extract mentions from metadata
    const mentions =
      typeof message.metadata === 'object' &&
      message.metadata !== null &&
      'mentions' in message.metadata
        ? (message.metadata.mentions as string[])
        : [];

    return (
      <MentionableText
        text={message.content || ''}
        mentions={mentions}
        color={textColor}
        fontSize="$4"
        fontWeight="400"
      />
    );
  };

  return (
    <>
      <Stack
        flexDirection={isOwn ? 'row-reverse' : 'row'}
        gap="$2"
        alignItems="flex-end"
        width="100%"
      >
        {/* Avatar for other users */}
        {!isOwn && showAvatar && (
          <Pressable onPress={handleAvatarPress}>
            <Avatar
              src={message.sender.avatar_url || undefined}
              username={message.sender.username || undefined}
              fallback={message.sender.username?.[0]?.toUpperCase() || '?'}
              size={28}
            />
          </Pressable>
        )}
        {!isOwn && !showAvatar && <View width={28} />}

        <Stack flex={1} maxWidth="85%">
          {/* Sender name for group chats */}
          {!isOwn && chatType === 'group' && showSenderName && message.sender.username && (
            <Text fontSize="$2" color="$gray11" marginBottom="$1" marginLeft="$3" fontWeight="500">
              {message.sender.username}
            </Text>
          )}

          {/* System messages */}
          {message.message_type === 'system' && (
            <View
              alignSelf="center"
              paddingHorizontal="$3"
              paddingVertical="$2"
              backgroundColor="$gray3"
              borderRadius="$3"
              marginVertical="$2"
            >
              <Text fontSize="$3" color="$gray11" textAlign="center">
                {message.content}
              </Text>
            </View>
          )}

          {/* Regular message bubble */}
          {message.message_type !== 'system' && (
            <Pressable onLongPress={handleLongPress} disabled={message.isOptimistic}>
              <View style={bubbleStyle} padding="$3">
                {/* Message content */}
                {renderContent()}

                {/* Footer with time and status */}
                <Stack
                  flexDirection="row"
                  marginTop="$1"
                  alignItems="center"
                  gap="$1"
                  justifyContent={isOwn ? 'flex-end' : 'flex-start'}
                >
                  <Text fontSize="$2" color={timeColor}>
                    {timestamp}
                  </Text>

                  {/* Expiration timer */}
                  {message.expires_at && (
                    <ExpirationTimer expiresAt={message.expires_at} color={timeColor} />
                  )}

                  {/* Status for own messages */}
                  {isOwn && (
                    <MessageStatus status={message.status || 'sent'} color={Colors.white} />
                  )}
                </Stack>

                {/* Failed state */}
                {message.status === 'failed' && (
                  <Pressable onPress={handleResend}>
                    <Stack flexDirection="row" marginTop="$2" alignItems="center" gap="$1">
                      <Text fontSize="$2" color={Colors.error} fontWeight="600">
                        Failed to send
                      </Text>
                      <Text fontSize="$2" color={Colors.error} textDecorationLine="underline">
                        Tap to retry
                      </Text>
                    </Stack>
                  </Pressable>
                )}

                {/* Sending state */}
                {message.status === 'sending' && (
                  <Stack
                    position="absolute"
                    top={0}
                    right={0}
                    bottom={0}
                    left={0}
                    backgroundColor={Colors.black + '33'} // 20% opacity
                    borderRadius={16}
                    justifyContent="center"
                    alignItems="center"
                  >
                    <ActivityIndicator size="small" color={Colors.white} />
                  </Stack>
                )}
              </View>
            </Pressable>
          )}

          {/* Reactions Display */}
          {reactions.length > 0 && (
            <Stack
              flexDirection="row"
              flexWrap="wrap"
              gap="$1"
              marginTop="$1"
              paddingHorizontal="$2"
            >
              {reactions.slice(0, 3).map((reaction: { emoji: string; count: number }) => (
                <Pressable
                  key={reaction.emoji}
                  onPress={() => toggleReaction(reaction.emoji)}
                  style={({ pressed }) => [
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor:
                        userReaction === reaction.emoji ? Colors.primary + '20' : Colors.gray[100],
                      borderRadius: 12,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  <Text fontSize="$3">{reaction.emoji}</Text>
                  <Text
                    fontSize="$2"
                    color={userReaction === reaction.emoji ? Colors.primary : Colors.text.secondary}
                    marginLeft="$1"
                  >
                    {reaction.count}
                  </Text>
                </Pressable>
              ))}
              {reactions.length > 3 && (
                <View
                  backgroundColor={Colors.gray[100]}
                  borderRadius={12}
                  paddingHorizontal={8}
                  paddingVertical={4}
                >
                  <Text fontSize="$2" color={Colors.text.secondary}>
                    +{reactions.length - 3}
                  </Text>
                </View>
              )}
            </Stack>
          )}
        </Stack>

        {/* Avatar for own messages */}
        {isOwn && showAvatar && (
          <Pressable onPress={handleAvatarPress}>
            <Avatar
              src={message.sender.avatar_url || undefined}
              username={message.sender.username || undefined}
              fallback={message.sender.username?.[0]?.toUpperCase() || '?'}
              size={28}
            />
          </Pressable>
        )}
        {isOwn && !showAvatar && <View width={28} />}
      </Stack>

      {/* Message Action Menu */}
      <MessageActionMenu
        message={message}
        isVisible={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        onReactionSelect={toggleReaction}
      />
    </>
  );
}
