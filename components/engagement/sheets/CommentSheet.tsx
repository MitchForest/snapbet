import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { BaseSheet } from './BaseSheet';
import { CommentItem } from '../display/CommentItem';
import { Colors } from '@/theme';
import { useComments } from '@/hooks/useComments';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';

interface CommentSheetProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function CommentSheet({ postId, isVisible, onClose }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Use the real comments hook
  const { comments, isLoading, isAdding, hasMore, total, addComment, deleteComment, loadMore } =
    useComments(postId);

  const handleSubmit = async () => {
    if (!comment.trim() || isAdding) return;

    try {
      await addComment(comment.trim());
      setComment('');
      // Keep keyboard open for multiple comments
      inputRef.current?.focus();
    } catch {
      // Error already handled by hook
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId);
    } catch {
      // Error already handled by hook
    }
  };

  const remainingChars = 280 - comment.length;
  const isOverLimit = remainingChars < 0;

  return (
    <BaseSheet
      isVisible={isVisible}
      onClose={onClose}
      height="70%"
      keyboardAvoidingEnabled={false}
      disableContentWrapper={true}
    >
      {/* Header - Fixed at top */}
      <View style={styles.header}>
        <Text style={styles.title}>Comments {total > 0 && `(${total})`}</Text>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      {/* Comments Section - Scrollable, fills remaining space */}
      {isLoading && comments.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : comments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>No comments yet</Text>
          <Text style={styles.emptyText}>Be the first to share your thoughts!</Text>
        </View>
      ) : (
        <View style={styles.commentsContainer}>
          {comments.map((item) => (
            <CommentItem
              key={item.id}
              comment={item}
              onDelete={user && item.user_id === user.id ? () => handleDelete(item.id) : undefined}
            />
          ))}
          {hasMore && (
            <Pressable onPress={loadMore} style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>Load more comments</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Comment Input - Fixed at bottom */}
      <View style={[styles.inputSection, { paddingBottom: insets.bottom || 8 }]}>
        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.text.tertiary}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={300}
            onSubmitEditing={handleSubmit}
            returnKeyType="send"
            editable={!isAdding}
          />
          <View style={styles.inputActions}>
            <Text style={[styles.charCount, isOverLimit && styles.charCountError]}>
              {remainingChars}
            </Text>
            <Pressable
              onPress={handleSubmit}
              disabled={!comment.trim() || isOverLimit || isAdding}
              style={[
                styles.sendButton,
                (!comment.trim() || isOverLimit || isAdding) && styles.sendButtonDisabled,
              ]}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text
                  style={[
                    styles.sendText,
                    (!comment.trim() || isOverLimit) && styles.sendTextDisabled,
                  ]}
                >
                  Send
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </BaseSheet>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  loadMoreButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  inputSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.white,
    paddingTop: 8,
    paddingHorizontal: 0,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
  charCountError: {
    color: Colors.error,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.gray[200],
  },
  sendText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sendTextDisabled: {
    color: Colors.gray[400],
  },
});
