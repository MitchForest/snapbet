import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Colors, OpacityColors } from '@/theme';

interface BlockConfirmationProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
  isBlocking: boolean; // true for block, false for unblock
}

export function BlockConfirmation({
  isVisible,
  onClose,
  onConfirm,
  username,
  isBlocking,
}: BlockConfirmationProps) {
  return (
    <Modal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container} onPress={(e) => e.stopPropagation()}>
          <View style={styles.content}>
            <Text style={styles.title}>
              {isBlocking ? 'Block' : 'Unblock'} @{username}?
            </Text>

            <Text style={styles.description}>
              {isBlocking
                ? `You won't see posts, stories, or comments from @${username}. They won't be notified that you blocked them.`
                : `@${username} will be able to see your posts and stories again. You'll also see their content in your feed.`}
            </Text>

            <View style={styles.consequences}>
              {isBlocking && (
                <>
                  <Text style={styles.consequenceTitle}>This will:</Text>
                  <Text style={styles.consequenceItem}>• Remove their posts from your feed</Text>
                  <Text style={styles.consequenceItem}>• Hide their comments on all posts</Text>
                  <Text style={styles.consequenceItem}>
                    • Prevent them from seeing your content
                  </Text>
                  <Text style={styles.consequenceItem}>
                    • Remove any existing follow connections
                  </Text>
                </>
              )}
            </View>

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmButton, isBlocking && styles.confirmButtonDanger]}
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.confirmButtonText}>{isBlocking ? 'Block' : 'Unblock'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: OpacityColors.overlay.light,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 340,
  },
  content: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  consequences: {
    marginBottom: 24,
  },
  consequenceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  consequenceItem: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  confirmButtonDanger: {
    backgroundColor: Colors.error,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
