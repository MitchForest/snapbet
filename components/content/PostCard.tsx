import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, OpacityColors } from '@/theme';
import { PostWithType, PostType, POST_TYPE_CONFIGS } from '@/types/content';
import { getTimeUntilExpiration } from '@/utils/content/postTypeHelpers';
import { Avatar } from '@/components/common/Avatar';

import { EngagementCounts } from '@/components/engagement/display/EngagementCounts';
import { ReactionDisplay } from '@/components/engagement/display/ReactionDisplay';
import { ReactionPicker } from '@/components/engagement/ReactionPicker';
import { CommentSheet } from '@/components/engagement/sheets/CommentSheet';
import { ReportModal } from '@/components/moderation/ReportModal';
import { PostOptionsMenu } from '@/components/content/PostOptionsMenu';
import { useEngagement } from '@/hooks/useEngagement';
import { toastService } from '@/services/toastService';
import { TailFadeButtons } from '@/components/engagement/buttons/TailFadeButtons';

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHiddenContent, setShowHiddenContent] = useState(false);

  // Get engagement data
  const engagement = useEngagement(post.id, post.post_type);

  // Check if post is auto-hidden due to reports
  const isAutoHidden = post.report_count && post.report_count >= 3 && !showHiddenContent;

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
          <Pressable
            style={styles.userInfo}
            onPress={() => {
              if (post.user?.username) {
                router.push(`/profile/${post.user.username}`);
              }
            }}
          >
            <Avatar
              size={40}
              src={post.user?.avatar_url || undefined}
              fallback={post.user?.username?.[0]?.toUpperCase() || '?'}
            />
            <View style={styles.userText}>
              <Text style={styles.username}>@{post.user?.username || 'unknown'}</Text>
              <Text style={styles.timestamp}>{timeUntilExpiration}</Text>
            </View>
          </Pressable>
          <View style={styles.headerRight}>
            <PostTypeIndicator type={post.post_type} />
            <PostOptionsMenu
              postId={post.id}
              postUserId={post.user_id}
              onReport={() => setShowReportModal(true)}
            />
          </View>
        </View>

        {/* Auto-hidden content warning */}
        {isAutoHidden ? (
          <View style={styles.hiddenContentContainer}>
            <Text style={styles.hiddenIcon}>⚠️</Text>
            <Text style={styles.hiddenTitle}>This content has been hidden</Text>
            <Text style={styles.hiddenDescription}>
              This post has been hidden due to multiple reports
            </Text>
            <TouchableOpacity
              style={styles.showAnywayButton}
              onPress={() => setShowHiddenContent(true)}
            >
              <Text style={styles.showAnywayText}>Show anyway</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Media */}
            <Pressable onPress={handleMediaPress} style={styles.mediaContainer}>
              {post.media_type === 'photo' && (
                <Image source={{ uri: post.media_url }} style={styles.media} resizeMode="cover" />
              )}
              {post.media_type === 'video' && post.thumbnail_url && (
                <View style={styles.videoContainer}>
                  <Image
                    source={{ uri: post.thumbnail_url }}
                    style={styles.media}
                    resizeMode="cover"
                  />
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
            {post.post_type === PostType.PICK && post.bet_id && (
              <View style={styles.tailFadeContainer}>
                {post.bet && post.bet.game ? (
                  <TailFadeButtons post={post} bet={post.bet} game={post.bet.game} />
                ) : (
                  <Text style={styles.tailFadeHint}>Loading bet details...</Text>
                )}
              </View>
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
              tailCount={
                post.post_type === PostType.PICK ? engagement.animatedCounts.tail : undefined
              }
              fadeCount={
                post.post_type === PostType.PICK ? engagement.animatedCounts.fade : undefined
              }
              onCommentPress={() => setShowComments(true)}
              onReactionPress={() => setShowReactions(!showReactions)}
              postType={post.post_type}
            />
          </>
        )}
      </Pressable>

      {/* Comment Sheet */}
      <CommentSheet
        postId={post.id}
        isVisible={showComments}
        onClose={() => setShowComments(false)}
      />

      {/* Report Modal */}
      <ReportModal
        isVisible={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentType="post"
        contentId={post.id}
        contentOwnerName={post.user?.username}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  hiddenContentContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    margin: 12,
    borderRadius: 12,
  },
  hiddenIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  hiddenTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  hiddenDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  showAnywayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray[300],
  },
  showAnywayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  mediaContainer: {
    position: 'relative',
    backgroundColor: Colors.black,
  },
  media: {
    width: '100%',
    aspectRatio: 1,
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
  tailFadeContainer: {
    padding: 16,
    alignItems: 'center',
  },
  tailFadeHint: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
});
