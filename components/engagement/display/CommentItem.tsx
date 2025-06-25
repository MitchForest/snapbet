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
      avatar_url?: string | null;
    };
    content: string;
    created_at: string | null;
    user_id?: string;
  };
  onDelete?: () => void;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
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
        src={comment.user.avatar_url || undefined}
        fallback={comment.user.username[0]?.toUpperCase() || '?'}
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>@{comment.user.username}</Text>
          <Text style={styles.dot}> • </Text>
          <Text style={styles.timestamp}>
            {comment.created_at ? getTimeAgo(comment.created_at) : ''}
          </Text>
        </View>

        <Text style={styles.text}>{comment.content}</Text>

        <View style={styles.actions}>
          <Pressable onPress={handleReply} style={styles.actionButton}>
            <Text style={styles.actionText}>Reply</Text>
          </Pressable>
          {onDelete && (
            <>
              <Text style={styles.separator}>•</Text>
              <Pressable onPress={onDelete} style={styles.actionButton}>
                <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
              </Pressable>
            </>
          )}
        </View>
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
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 2,
  },
  actionText: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  deleteText: {
    color: Colors.error,
  },
});
