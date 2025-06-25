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
} from 'react-native';
import { BaseSheet } from './BaseSheet';
import { CommentItem } from '../display/CommentItem';
import { toastService } from '@/services/toastService';
import { Colors } from '@/theme';
import { generateMockComments } from '@/hooks/useEngagement';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CommentSheetProps {
  postId: string;
  isVisible: boolean;
  onClose: () => void;
}

export function CommentSheet({ postId, isVisible, onClose }: CommentSheetProps) {
  const insets = useSafeAreaInsets();
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // For demo purposes, show some mock comments
  const mockComments = generateMockComments(postId, 0); // Start with 0, can change to show mock data

  const handleSubmit = () => {
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      toastService.showComingSoon('Comments');
      setComment('');
      setIsSubmitting(false);
    }, 300);
  };

  const remainingChars = 280 - comment.length;
  const isOverLimit = remainingChars < 0;

  return (
    <BaseSheet isVisible={isVisible} onClose={onClose} height="70%" keyboardAvoidingEnabled>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Comments</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        {/* Comments List */}
        <FlatList
          data={mockComments}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CommentItem comment={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>No comments yet</Text>
              <Text style={styles.emptyText}>Be the first to share your thoughts!</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </View>
          }
        />

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
              />
              <View style={styles.inputActions}>
                <Text style={[styles.charCount, isOverLimit && styles.charCountError]}>
                  {remainingChars}
                </Text>
                <Pressable
                  onPress={handleSubmit}
                  disabled={!comment.trim() || isOverLimit || isSubmitting}
                  style={[
                    styles.sendButton,
                    (!comment.trim() || isOverLimit) && styles.sendButtonDisabled,
                  ]}
                >
                  <Text
                    style={[
                      styles.sendText,
                      (!comment.trim() || isOverLimit) && styles.sendTextDisabled,
                    ]}
                  >
                    Send
                  </Text>
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
  listContent: {
    flexGrow: 1,
    paddingVertical: 16,
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
    marginBottom: 24,
  },
  comingSoonBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  comingSoonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
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
