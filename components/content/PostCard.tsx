import React, { useState, useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, OpacityColors } from '@/theme';
import { PostWithType, PostType, POST_TYPE_CONFIGS } from '@/types/content';
import { getTimeUntilExpiration } from '@/utils/content/postTypeHelpers';
import { Avatar } from '@/components/common/Avatar';
import { BetPickOverlay } from '@/components/overlays/BetPickOverlay';
import { BetOutcomeOverlay } from '@/components/overlays/BetOutcomeOverlay';
import { TailFadeSheet } from '@/components/betting/TailFadeSheet';

import { CommentSheet } from '@/components/engagement/sheets/CommentSheet';
import { ReportModal } from '@/components/moderation/ReportModal';
import { PostOptionsMenu } from '@/components/content/PostOptionsMenu';
import { toastService } from '@/services/toastService';
import { useReactions } from '@/hooks/useReactions';
import { EngagementPill } from '../engagement/buttons/EngagementPill';
import { AVAILABLE_REACTIONS } from '@/utils/constants/reactions';

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHiddenContent, setShowHiddenContent] = useState(false);
  const [tailFadeAction, setTailFadeAction] = useState<'tail' | 'fade' | null>(null);

  // Get engagement data including reactions
  const { reactions, userReactions, toggleReaction } = useReactions(post.id);

  // Check if post is auto-hidden due to reports
  const isAutoHidden = post.report_count && post.report_count >= 3 && !showHiddenContent;

  // Create reaction counts map from the reactions data
  const reactionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    // Initialize all reactions with 0
    AVAILABLE_REACTIONS.forEach((emoji) => {
      counts[emoji] = 0;
    });
    // Update with actual counts from reactions
    reactions.forEach((reaction) => {
      if (counts[reaction.emoji] !== undefined) {
        counts[reaction.emoji] = reaction.count;
      }
    });
    return counts;
  }, [reactions]);

  const handleMediaPress = () => {
    if (post.media_type === 'video') {
      toastService.showComingSoon('Video playback');
    }
    onPress?.();
  };

  const handleReactionPress = async (emoji: string) => {
    // Add haptic feedback for immediate response
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleReaction(emoji);
  };

  const handleProfilePress = () => {
    if (post.user?.username) {
      router.push(`/profile/${post.user.username}`);
    }
  };

  const handleTail = () => {
    setTailFadeAction('tail');
  };

  const handleFade = () => {
    setTailFadeAction('fade');
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
              username={post.user?.username}
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

              {/* Bet Overlays */}
              {post.post_type === PostType.PICK && post.bet && (
                <View style={styles.overlayContainer}>
                  <BetPickOverlay bet={post.bet} onTail={handleTail} onFade={handleFade} />
                </View>
              )}

              {post.post_type === PostType.OUTCOME && post.settled_bet && (
                <View style={styles.overlayContainer}>
                  <BetOutcomeOverlay bet={post.settled_bet} />
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
              {/* Comments button */}
              <EngagementPill
                icon="💬"
                count={post.comment_count}
                onPress={() => setShowComments(true)}
              />

              {/* Reaction buttons - always show all 4 */}
              {AVAILABLE_REACTIONS.map((emoji) => (
                <EngagementPill
                  key={emoji}
                  icon={emoji}
                  count={reactionCounts[emoji]}
                  onPress={() => handleReactionPress(emoji)}
                  isActive={userReactions.includes(emoji)}
                />
              ))}
            </View>
          </>
        )}
      </Pressable>

      {/* Modals and Sheets - Rendered outside of the list item */}
      {showComments && (
        <CommentSheet
          postId={post.id}
          isVisible={showComments}
          onClose={() => setShowComments(false)}
        />
      )}

      {showReportModal && (
        <ReportModal
          isVisible={showReportModal}
          onClose={() => setShowReportModal(false)}
          contentType="post"
          contentId={post.id}
          contentOwnerName={post.user?.username}
        />
      )}

      {/* Tail/Fade Sheet for Pick Posts */}
      {post.post_type === PostType.PICK && post.bet && (
        <TailFadeSheet
          isOpen={tailFadeAction !== null}
          onClose={() => setTailFadeAction(null)}
          action={tailFadeAction}
          originalBet={post.bet}
          originalPost={post}
          originalUser={
            post.user
              ? {
                  username: post.user.username || '',
                  display_name:
                    ((post.user as Record<string, unknown>).display_name as string | null) || null,
                }
              : null
          }
        />
      )}
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
  overlayContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 10,
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
    justifyContent: 'space-between',
  },
});
