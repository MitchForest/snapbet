import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { BaseSheet } from '@/components/engagement/sheets/BaseSheet';
import { Colors } from '@/theme';
import { ReportReason, ContentType } from '@/services/moderation/reportService';
import { useContentModeration } from '@/hooks/useContentModeration';

interface ReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  contentType: ContentType;
  contentId: string;
  contentOwnerName?: string;
}

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'spam',
    label: 'Spam',
    description: 'Unwanted commercial content or spam',
  },
  {
    value: 'inappropriate',
    label: 'Inappropriate',
    description: 'Contains inappropriate or offensive content',
  },
  {
    value: 'harassment',
    label: 'Harassment',
    description: 'Bullying or harassment',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other reason not listed above',
  },
];

export function ReportModal({
  isVisible,
  onClose,
  contentType,
  contentId,
  contentOwnerName,
}: ReportModalProps) {
  const { reportContent, hasReported } = useContentModeration();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);

  const alreadyReported = hasReported(contentType, contentId);

  const handleReasonSelect = (reason: ReportReason) => {
    setSelectedReason(reason);
    setShowAdditionalInfo(reason === 'other');
  };

  const handleSubmit = async () => {
    if (!selectedReason) return;

    setIsSubmitting(true);
    try {
      await reportContent(
        contentType,
        contentId,
        selectedReason,
        additionalInfo.trim() || undefined
      );
      onClose();
      // Reset state
      setSelectedReason(null);
      setAdditionalInfo('');
      setShowAdditionalInfo(false);
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'post':
        return 'post';
      case 'story':
        return 'story';
      case 'comment':
        return 'comment';
      case 'user':
        return 'user';
      default:
        return 'content';
    }
  };

  return (
    <BaseSheet isVisible={isVisible} onClose={onClose} height="auto" keyboardAvoidingEnabled>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Report {getContentTypeLabel()}</Text>
          {contentOwnerName && <Text style={styles.subtitle}>From @{contentOwnerName}</Text>}
        </View>

        {alreadyReported ? (
          <View style={styles.alreadyReported}>
            <Text style={styles.alreadyReportedText}>
              You&apos;ve already reported this {getContentTypeLabel()}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.reasonsContainer}>
              <Text style={styles.sectionTitle}>Why are you reporting this?</Text>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={[
                    styles.reasonOption,
                    selectedReason === reason.value && styles.reasonOptionSelected,
                  ]}
                  onPress={() => handleReasonSelect(reason.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reasonContent}>
                    <Text
                      style={[
                        styles.reasonLabel,
                        selectedReason === reason.value && styles.reasonLabelSelected,
                      ]}
                    >
                      {reason.label}
                    </Text>
                    <Text
                      style={[
                        styles.reasonDescription,
                        selectedReason === reason.value && styles.reasonDescriptionSelected,
                      ]}
                    >
                      {reason.description}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.radioOuter,
                      selectedReason === reason.value && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedReason === reason.value && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {showAdditionalInfo && (
              <View style={styles.additionalInfoContainer}>
                <Text style={styles.sectionTitle}>Additional information</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Please provide more details..."
                  placeholderTextColor={Colors.text.secondary}
                  value={additionalInfo}
                  onChangeText={setAdditionalInfo}
                  multiline
                  maxLength={500}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{additionalInfo.length}/500</Text>
              </View>
            )}

            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedReason || isSubmitting) && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={!selectedReason || isSubmitting}
                activeOpacity={0.7}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </BaseSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  alreadyReported: {
    backgroundColor: Colors.gray[100],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  alreadyReportedText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  reasonsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: 8,
  },
  reasonOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.lightGreen,
  },
  reasonContent: {
    flex: 1,
    marginRight: 12,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  reasonLabelSelected: {
    color: Colors.primary,
  },
  reasonDescription: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  reasonDescriptionSelected: {
    color: Colors.primary,
  },
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
  additionalInfoContainer: {
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Colors.text.primary,
    minHeight: 100,
    maxHeight: 150,
  },
  charCount: {
    fontSize: 12,
    color: Colors.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
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
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});
