import React from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { Pressable, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme';
import { Message } from '@/types/messaging';
import { Avatar } from '@/components/common/Avatar';
import { MediaMessage } from './MediaMessage';
import { PickShareCard } from './PickShareCard';
import { MessageStatus } from './MessageStatus';
import { ExpirationTimer } from './ExpirationTimer';
import { formatDistanceToNow } from 'date-fns';
import * as Haptics from 'expo-haptics';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onResend?: () => void;
  onLongPress?: () => void;
}

export function ChatBubble({
  message,
  isOwn,
  showAvatar = false,
  onResend,
  onLongPress,
}: ChatBubbleProps) {
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLongPress?.();
  };

  const handleResend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onResend?.();
  };

  // Determine bubble styling based on ownership
  const bubbleStyle = {
    backgroundColor: isOwn ? Colors.primary : Colors.gray[200],
    borderRadius: 16,
    borderBottomRightRadius: isOwn ? 4 : 16,
    borderBottomLeftRadius: isOwn ? 16 : 4,
    maxWidth: '75%',
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
    interface ExtendedMessage extends Omit<Message, 'bet_id' | 'media_url'> {
      bet_id?: string | null;
      media_url?: string | null;
    }

    const extMessage = message as ExtendedMessage;

    if (message.message_type === 'media' && extMessage.media_url) {
      return <MediaMessage url={extMessage.media_url} isOwn={isOwn} />;
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

    return (
      <Text fontSize="$4" color={textColor} lineHeight={22}>
        {message.content}
      </Text>
    );
  };

  return (
    <Stack
      flexDirection={isOwn ? 'row-reverse' : 'row'}
      gap="$2"
      alignItems="flex-end"
      maxWidth="75%"
    >
      {/* Avatar for other users */}
      {!isOwn && showAvatar && (
        <Avatar
          src={message.sender.avatar_url || undefined}
          fallback={message.sender.username?.[0]?.toUpperCase() || '?'}
          size={28}
        />
      )}
      {!isOwn && !showAvatar && <View width={28} />}

      <Pressable onLongPress={handleLongPress} disabled={message.isOptimistic}>
        <Stack maxWidth="75%">
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
              {isOwn && <MessageStatus status={message.status || 'sent'} color={Colors.white} />}
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
        </Stack>
      </Pressable>
    </Stack>
  );
}
