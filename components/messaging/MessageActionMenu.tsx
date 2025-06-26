import React, { useState } from 'react';
import { Text, Stack } from '@tamagui/core';
import { Pressable, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { BaseSheet } from '@/components/engagement/sheets/BaseSheet';
import { ReactionPicker } from '@/components/engagement/ReactionPicker';
import { ReportModal } from '@/components/moderation/ReportModal';
import { Message, MessageAction } from '@/types/messaging';
import { Colors } from '@/theme';
import { toastService } from '@/services/toastService';
import { supabase } from '@/services/supabase/client';
import { useAuthStore } from '@/stores/authStore';

interface MessageActionMenuProps {
  message: Message;
  isVisible: boolean;
  onClose: () => void;
  onReactionSelect?: (emoji: string) => void;
}

export function MessageActionMenu({
  message,
  isVisible,
  onClose,
  onReactionSelect,
}: MessageActionMenuProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const { user } = useAuthStore();
  const isOwnMessage = message.sender_id === user?.id;

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(message.content || '');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toastService.showSuccess('Copied to clipboard');
      onClose();
    } catch (error) {
      console.error('Failed to copy:', error);
      toastService.showError('Failed to copy message');
    }
  };

  const handleReact = () => {
    setShowReactionPicker(true);
  };

  const handleDeleteForMe = async () => {
    try {
      // Soft delete by setting deleted_at
      const { error } = await supabase
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', message.id);

      if (error) throw error;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toastService.showSuccess('Message deleted');
      onClose();
    } catch (error) {
      console.error('Failed to delete message:', error);
      toastService.showError('Failed to delete message');
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const actions: MessageAction[] = [
    {
      label: 'Copy',
      icon: '📋',
      action: handleCopy,
    },
    {
      label: 'React',
      icon: '😊',
      action: handleReact,
    },
  ];

  // Add delete option for own messages
  if (isOwnMessage) {
    actions.push({
      label: 'Delete for me',
      icon: '🗑️',
      action: handleDeleteForMe,
      destructive: true,
    });
  } else {
    // Add report option for other's messages
    actions.push({
      label: 'Report',
      icon: '🚩',
      action: handleReport,
      destructive: true,
    });
  }

  return (
    <>
      <BaseSheet
        isVisible={isVisible && !showReactionPicker && !showReportModal}
        onClose={onClose}
        height={actions.length * 60 + 40}
      >
        <Stack padding="$2">
          {actions.map((action, index) => (
            <Pressable
              key={action.label}
              onPress={action.action}
              style={({ pressed }) => [
                styles.actionItem,
                pressed && styles.actionItemPressed,
                index < actions.length - 1 && styles.actionItemBorder,
              ]}
            >
              <Stack flexDirection="row" alignItems="center" gap="$3" padding="$3">
                <Text fontSize="$5">{action.icon}</Text>
                <Text
                  fontSize="$4"
                  color={action.destructive ? '$danger' : '$color'}
                  fontWeight="500"
                >
                  {action.label}
                </Text>
              </Stack>
            </Pressable>
          ))}
        </Stack>
      </BaseSheet>

      {/* Reaction Picker */}
      {showReactionPicker && (
        <ReactionPicker
          onSelect={(emoji) => {
            onReactionSelect?.(emoji);
            setShowReactionPicker(false);
            onClose();
          }}
          currentReaction={null}
          style={styles.reactionPicker}
        />
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          isVisible={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            onClose();
          }}
          contentType="comment"
          contentId={message.id}
          contentOwnerName={message.sender.username || undefined}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  actionItem: {
    borderRadius: 12,
  },
  actionItemPressed: {
    backgroundColor: Colors.gray[100],
  },
  actionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  reactionPicker: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: Colors.background,
    borderRadius: 16,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
