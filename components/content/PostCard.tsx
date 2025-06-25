import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Colors, OpacityColors } from '@/theme';
import { PostWithType, PostType, POST_TYPE_CONFIGS } from '@/types/content';
import { getTimeUntilExpiration } from '@/utils/content/postTypeHelpers';
import { Avatar } from '@/components/common/Avatar';
import { TailFadeButtons } from '@/components/engagement/buttons/TailFadeButtons';
import { EngagementCounts } from '@/components/engagement/display/EngagementCounts';
import { ReactionDisplay } from '@/components/engagement/display/ReactionDisplay';
import { ReactionPicker } from '@/components/engagement/ReactionPicker';
import { CommentSheet } from '@/components/engagement/sheets/CommentSheet';
import { useEngagement } from '@/hooks/useEngagement';
import { toastService } from '@/services/toastService';

interface PostCardProps {
  post: PostWithType;
  onPress?: () => void;
}

function PostTypeIndicator({ type }: { type: PostType }) {
  const config = POST_TYPE_CONFIGS[type];

  if (type === PostType.CONTENT) return null;

  return (
    <View style={styles.typeIndicator}>
      <Text style={styles.typeIcon}>{config.icon}</Text>
      <Text style={styles.typeLabel}>{config.label}</Text>
    </View>
  );
}

export function PostCard({ post, onPress }: PostCardProps) {
  const timeUntilExpiration = getTimeUntilExpiration(post.expires_at);
  const [showComments, setShowComments] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  // Get engagement data
  const engagement = useEngagement(post.id, post.post_type);

  // Check if post is expired
  const isExpired = new Date(post.expires_at) < new Date();

  const handleMediaPress = () => {
    if (post.media_type === 'video') {
      toastService.showComingSoon('Video playback');
    }
    onPress?.();
  };

  const handleReactionSelect = (_emoji: string) => {
    // Reactions are now handled by the ReactionPicker and useReactions hook
    setShowReactions(false);
  };

  return (
    <>
      <Pressable onPress={onPress} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar
              size={40}
              src={post.user?.avatar_url || undefined}
              fallback={post.user?.username?.[0]?.toUpperCase() || '?'}
            />
            <View style={styles.userText}>
              <Text style={styles.username}>@{post.user?.username || 'unknown'}</Text>
              <Text style={styles.timestamp}>{timeUntilExpiration}</Text>
            </View>
          </View>
          <PostTypeIndicator type={post.post_type} />
        </View>

        {/* Media */}
        <Pressable onPress={handleMediaPress} style={styles.mediaContainer}>
          {post.media_type === 'photo' && (
            <Image source={{ uri: post.media_url }} style={styles.media} resizeMode="cover" />
          )}
          {post.media_type === 'video' && post.thumbnail_url && (
            <View style={styles.videoContainer}>
              <Image source={{ uri: post.thumbnail_url }} style={styles.media} resizeMode="cover" />
              <View style={styles.playButton}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
            </View>
          )}

          {/* Placeholder for bet overlays */}
          {post.post_type !== PostType.CONTENT && (
            <View style={styles.overlayPlaceholder}>
              <Text style={styles.overlayText}>
                {post.post_type === PostType.PICK ? '🎯 Pick details' : '🏆 Outcome details'}
              </Text>
              <Text style={styles.overlayHint}>Coming soon</Text>
            </View>
          )}
        </Pressable>

        {/* Caption */}
        {post.caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{post.caption}</Text>
          </View>
        )}

        {/* Reactions Display */}
        <ReactionDisplay
          reactions={engagement.reactions}
          userReaction={engagement.userReaction}
          postId={post.id}
        />

        {/* Tail/Fade Buttons for Pick Posts */}
        {post.post_type === PostType.PICK && (
          <TailFadeButtons
            postId={post.id}
            tailCount={engagement.animatedCounts.tail}
            fadeCount={engagement.animatedCounts.fade}
            userAction={engagement.userAction}
            isExpired={isExpired}
          />
        )}

        {/* Reaction Picker */}
        {showReactions && (
          <ReactionPicker
            onSelect={handleReactionSelect}
            currentReaction={engagement.userReaction}
          />
        )}

        {/* Engagement Counts */}
        <EngagementCounts
          commentCount={post.comment_count}
          reactionCount={engagement.reactions.reduce((sum, r) => sum + r.count, 0)}
          tailCount={post.post_type === PostType.PICK ? engagement.animatedCounts.tail : undefined}
          fadeCount={post.post_type === PostType.PICK ? engagement.animatedCounts.fade : undefined}
          onCommentPress={() => setShowComments(true)}
          onReactionPress={() => setShowReactions(!showReactions)}
          postType={post.post_type}
        />
      </Pressable>

      {/* Comment Sheet */}
      <CommentSheet
        postId={post.id}
        isVisible={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userText: {
    marginLeft: 12,
  },
  username: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  timestamp: {
    color: Colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  typeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  typeLabel: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  mediaContainer: {
    position: 'relative',
    backgroundColor: Colors.black,
  },
  media: {
    width: '100%',
    aspectRatio: 4 / 5,
  },
  videoContainer: {
    position: 'relative',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: OpacityColors.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    color: Colors.white,
    fontSize: 20,
  },
  overlayPlaceholder: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: OpacityColors.overlay.dark,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  overlayText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  overlayHint: {
    color: Colors.gray[300],
    fontSize: 12,
  },
  captionContainer: {
    padding: 12,
  },
  caption: {
    color: Colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
});
