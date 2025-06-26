import React, { useState } from 'react';
import { View, Text, Stack, TextArea, Button } from '@tamagui/core';
import { Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { BaseSheet } from '@/components/engagement/sheets/BaseSheet';
import { Colors } from '@/theme';
import { Message } from '@/types/messaging';
import { MessageReportReason } from '@/types/messaging';
import { messagingPrivacyService } from '@/services/messaging/messagingPrivacyService';
import { toastService } from '@/services/toastService';
import { useAuthStore } from '@/stores/authStore';

interface MessageReportModalProps {
  message: Message | null;
  isVisible: boolean;
  onClose: () => void;
}

const REPORT_REASONS: { id: MessageReportReason; label: string; description: string }[] = [
  { id: 'spam', label: 'Spam or scam', description: 'Unwanted commercial content or scams' },
  {
    id: 'harassment',
    label: 'Harassment or bullying',
    description: 'Targeted harassment or bullying behavior',
  },
  {
    id: 'inappropriate',
    label: 'Inappropriate content',
    description: 'Sexual, violent, or disturbing content',
  },
  {
    id: 'hate',
    label: 'Hate speech',
    description: 'Attacks based on race, religion, gender, etc.',
  },
  { id: 'other', label: 'Other', description: 'Something else not listed above' },
];

export const MessageReportModal: React.FC<MessageReportModalProps> = ({
  message,
  isVisible,
  onClose,
}) => {
  const user = useAuthStore((state) => state.user);
  const [selectedReason, setSelectedReason] = useState<MessageReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason || !message || !user) return;

    setIsSubmitting(true);
    try {
      const result = await messagingPrivacyService.reportMessage(
        message.id,
        user.id,
        selectedReason,
        selectedReason === 'other' ? details : undefined
      );

      if (result.success) {
        toastService.showSuccess("Message reported. We'll review it soon.");
        onClose();
        // Reset state
        setSelectedReason(null);
        setDetails('');
      } else {
        toastService.showError(result.error || 'Failed to report message');
      }
    } catch (error) {
      console.error('Error reporting message:', error);
      toastService.showError('Failed to report message');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RadioButton = ({ selected }: { selected: boolean }) => (
    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
      {selected && <View style={styles.radioInner} />}
    </View>
  );

  if (!message) return null;

  return (
    <BaseSheet isVisible={isVisible} onClose={onClose} height="auto">
      <Stack padding="$4" gap="$4">
        <Text fontSize="$6" fontWeight="bold" textAlign="center">
          Report Message
        </Text>

        <Stack gap="$2">
          <Text fontSize="$4" fontWeight="600">
            Why are you reporting this message?
          </Text>

          {REPORT_REASONS.map((reason) => (
            <Pressable
              key={reason.id}
              onPress={() => setSelectedReason(reason.id)}
              disabled={isSubmitting}
            >
              <Stack
                flexDirection="row"
                padding="$3"
                backgroundColor={selectedReason === reason.id ? '$surface3' : '$surface2'}
                borderRadius="$3"
                alignItems="center"
                gap="$3"
                opacity={isSubmitting ? 0.5 : 1}
              >
                <RadioButton selected={selectedReason === reason.id} />
                <Stack flex={1}>
                  <Text fontSize="$4" fontWeight="500">
                    {reason.label}
                  </Text>
                  <Text fontSize="$3" color="$gray11">
                    {reason.description}
                  </Text>
                </Stack>
              </Stack>
            </Pressable>
          ))}
        </Stack>

        {selectedReason === 'other' && (
          <Stack gap="$2">
            <Text fontSize="$4" fontWeight="600">
              Additional details
            </Text>
            <TextArea
              placeholder="Please provide more details..."
              value={details}
              onChangeText={setDetails}
              minHeight={100}
              maxHeight={150}
              disabled={isSubmitting}
              backgroundColor="$surface2"
              borderWidth={1}
              borderColor="$borderColor"
            />
            <Text fontSize="$2" color="$gray11" textAlign="right">
              {details.length}/500
            </Text>
          </Stack>
        )}

        <Stack flexDirection="row" gap="$3">
          <Button flex={1} size="$4" variant="outlined" onPress={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          <Button
            flex={1}
            size="$4"
            backgroundColor="$danger"
            disabled={!selectedReason || isSubmitting}
            onPress={handleSubmit}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              'Submit Report'
            )}
          </Button>
        </Stack>
      </Stack>
    </BaseSheet>
  );
};

const styles = StyleSheet.create({
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
});
