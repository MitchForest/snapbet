import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { BaseSheet } from './BaseSheet';
import { CommentItem } from '../display/CommentItem';
import { Colors } from '@/theme';
import { useComments } from '@/hooks/useComments';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';

interface CommentSheetProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function CommentSheet({ postId, isVisible, onClose }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
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

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  return (
    <BaseSheet isVisible={isVisible} onClose={onClose} height="70%" keyboardAvoidingEnabled>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comments {total > 0 && `(${total})`}</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Comments List */}
        {isLoading && comments.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <CommentItem
                comment={item}
                onDelete={
                  user && item.user_id === user.id ? () => handleDelete(item.id) : undefined
                }
              />
            )}
            contentContainerStyle={styles.listContent}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💬</Text>
                <Text style={styles.emptyTitle}>No comments yet</Text>
                <Text style={styles.emptyText}>Be the first to share your thoughts!</Text>
              </View>
            }
          />
        )}

        {/* Comment Composer */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}
        >
          <View style={[styles.composer, { paddingBottom: insets.bottom || 16 }]}>
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                placeholder="Add a comment..."
                placeholderTextColor={Colors.text.tertiary}
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={300} // Allow slight overflow for UX
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
        </KeyboardAvoidingView>
      </View>
    </BaseSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flexGrow: 1,
    paddingVertical: 16,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
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
  composer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    backgroundColor: Colors.surface,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 14,
    color: Colors.text.primary,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
