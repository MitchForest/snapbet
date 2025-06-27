import React, { useState, useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, OpacityColors } from '@/theme';
import { PostWithType, PostType, POST_TYPE_CONFIGS } from '@/types/content';
import { getTimeUntilExpiration } from '@/utils/content/postTypeHelpers';
import { Avatar } from '@/components/common/Avatar';

import { ReactionPicker } from '@/components/engagement/ReactionPicker';
import { CommentSheet } from '@/components/engagement/sheets/CommentSheet';
import { ReportModal } from '@/components/moderation/ReportModal';
import { PostOptionsMenu } from '@/components/content/PostOptionsMenu';
import { useEngagement } from '@/hooks/useEngagement';
import { toastService } from '@/services/toastService';
import { TailFadeButtons } from '@/components/engagement/buttons/TailFadeButtons';
import { useReactions } from '@/hooks/useReactions';
import { EngagementPill } from '../engagement/buttons/EngagementPill';
import { ReactionListSheet } from '../engagement/sheets/ReactionListSheet';

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
  const [showReactionList, setShowReactionList] = useState(false);

  // Get engagement data
  const engagement = useEngagement(post.id, post.post_type);
  const { toggleReaction } = useReactions(post.id);

  // Check if post is auto-hidden due to reports
  const isAutoHidden = post.report_count && post.report_count >= 3 && !showHiddenContent;

  // Sort and summarize reactions for stable, summarized display
  const sortedReactions = useMemo(
    () => [...engagement.reactions].sort((a, b) => b.count - a.count),
    [engagement.reactions]
  );
  const visibleReactions = sortedReactions.slice(0, 3);
  const remainingReactionsCount = sortedReactions.length - visibleReactions.length;

  const handleMediaPress = () => {
    if (post.media_type === 'video') {
      toastService.showComingSoon('Video playback');
    }
    onPress?.();
  };

  const handleReactionSelect = async (emoji: string) => {
    // Toggle the reaction
    await toggleReaction(emoji);
    // Close the reaction picker
    setShowReactions(false);
  };

  const handleProfilePress = () => {
    if (post.user?.username) {
      router.push(`/profile/${post.user.username}`);
    }
  };

  return (
    <>
      <Pressable onPress={onPress} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.userInfo} onPress={handleProfilePress}>
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

            {/* Engagement Section */}
            <View style={styles.engagementContainer}>
              <EngagementPill
                icon="💬"
                count={post.comment_count}
                onPress={() => setShowComments(true)}
              />
              <EngagementPill
                icon="❤️"
                count={sortedReactions.reduce((sum, r) => sum + r.count, 0)}
                onPress={() => setShowReactions(!showReactions)}
              />
              {visibleReactions.map((reaction) => (
                <EngagementPill
                  key={reaction.emoji}
                  icon={reaction.emoji}
                  count={reaction.count}
                  onPress={() => handleReactionSelect(reaction.emoji)}
                  isActive={engagement.userReaction === reaction.emoji}
                />
              ))}
              {remainingReactionsCount > 0 && (
                <EngagementPill
                  icon={`+${remainingReactionsCount}`}
                  onPress={() => setShowReactionList(true)}
                />
              )}
            </View>

            {/* Tail/Fade Buttons for Pick Posts */}
            {post.post_type === PostType.PICK && post.bet_id && (
              <View style={styles.tailFadeContainer}>
                {post.bet && post.bet.game ? (
                  <TailFadeButtons post={post} bet={post.bet} />
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

      {/* Reaction List Sheet */}
      <ReactionListSheet
        isVisible={showReactionList}
        onClose={() => setShowReactionList(false)}
        reactions={sortedReactions}
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
    paddingBottom: 8,
  },
  caption: {
    color: Colors.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  engagementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
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
