import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { Colors } from '@/theme';
import { toastService } from '@/services/toastService';

interface CommentItemProps {
  comment: {
    id: string;
    user: {
      username: string;
      avatar_url?: string;
    };
    content: string;
    created_at: string;
  };
}

export function CommentItem({ comment }: CommentItemProps) {
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const handleReply = () => {
    toastService.showComingSoon('Replies');
  };

  return (
    <View style={styles.container}>
      <Avatar
        size={32}
        src={comment.user.avatar_url}
        fallback={comment.user.username[0]?.toUpperCase() || '?'}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>@{comment.user.username}</Text>
          <Text style={styles.dot}> • </Text>
          <Text style={styles.timestamp}>{getTimeAgo(comment.created_at)}</Text>
        </View>

        <Text style={styles.text}>{comment.content}</Text>

        <Pressable onPress={handleReply} style={styles.replyButton}>
          <Text style={styles.replyText}>Reply</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  dot: {
    color: Colors.text.tertiary,
    fontSize: 12,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  text: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 20,
  },
  replyButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  replyText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});
