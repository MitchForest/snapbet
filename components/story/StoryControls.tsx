import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/common/Avatar';
import { ReactionPicker } from '@/components/engagement/ReactionPicker';
import { Colors, OpacityColors } from '@/theme';
import { StoryWithType } from '@/types/content';
import { formatDistanceToNow } from '@/utils/date';

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

        <Pressable onPress={onClose} style={styles.closeButton} hitSlop={16}>
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
          {!isOwner && <ReactionPicker currentReaction={userReaction} onSelect={onReaction} />}
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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: OpacityColors.overlay.medium,
    borderRadius: 20,
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
  closeIcon: {
    fontSize: 24,
    color: Colors.white,
    fontWeight: '400',
  },
  viewIcon: {
    fontSize: 16,
  },
});
