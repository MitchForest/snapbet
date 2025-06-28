import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/common/Avatar';
import { ReactionPicker } from '@/components/engagement/ReactionPicker';
import { Colors, OpacityColors } from '@/theme';
import { StoryWithType } from '@/types/content';
import { formatDistanceToNow } from '@/utils/date';
import { chatService } from '@/services/messaging/chatService';
import { useAuthStore } from '@/stores/authStore';

interface StoryControlsProps {
  story: StoryWithType;
  viewCount: number;
  isOwner: boolean;
  userReaction: string | null;
  onClose: () => void;
  onReaction: (emoji: string) => void;
}

export function StoryControls({
  story,
  viewCount,
  isOwner,
  userReaction,
  onClose,
  onReaction,
}: StoryControlsProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const handleReplyPress = async () => {
    if (!user || !story.user_id) return;

    try {
      // Find or create DM chat with story owner
      const chatId = await chatService.getOrCreateDMChat(user.id, story.user_id);
      if (chatId) {
        // Navigate to chat with story context
        router.push({
          pathname: '/(drawer)/chat/[id]',
          params: {
            id: chatId,
            replyToStory: story.id, // Pass story context
          },
        });
        // Close the story viewer
        onClose();
      }
    } catch (error) {
      console.error('Error opening chat:', error);
    }
  };

  return (
    <>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.userInfo}>
          <Avatar
            size={32}
            src={story.user?.avatar_url || undefined}
            username={story.user?.username || undefined}
            fallback={story.user?.username?.[0]?.toUpperCase()}
          />
          <View style={styles.userText}>
            <Text style={styles.username}>{story.user?.username || 'Unknown'}</Text>
            <Text style={styles.timeAgo}>
              {story.created_at ? formatDistanceToNow(new Date(story.created_at)) : 'Just now'}
            </Text>
          </View>
        </View>

        <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </View>

      {/* Caption Overlay */}
      {story.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>{story.caption}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.footerLeft}>
          {isOwner && (
            <View style={styles.viewCount}>
              <Text style={styles.viewIcon}>👁</Text>
              <Text style={styles.viewCountText}>{viewCount} views</Text>
            </View>
          )}
        </View>

        <View style={styles.footerRight}>
          {!isOwner && (
            <>
              <Pressable onPress={handleReplyPress} style={styles.replyButton}>
                <Text style={styles.replyIcon}>💬</Text>
                <Text style={styles.replyText}>Reply</Text>
              </Pressable>

              <ReactionPicker currentReaction={userReaction} onSelect={onReaction} />
            </>
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userText: {
    gap: 2,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  timeAgo: {
    fontSize: 12,
    color: OpacityColors.white.high,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    backgroundColor: OpacityColors.overlay.medium,
    borderRadius: 8,
    padding: 12,
  },
  caption: {
    fontSize: 14,
    color: Colors.white,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  viewCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  viewCountText: {
    fontSize: 14,
    color: Colors.white,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: OpacityColors.overlay.lighter,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: OpacityColors.overlay.lighter,
  },
  replyText: {
    fontSize: 14,
    color: Colors.white,
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.white,
    fontWeight: '300',
  },
  viewIcon: {
    fontSize: 16,
  },
  replyIcon: {
    fontSize: 18,
  },
});
