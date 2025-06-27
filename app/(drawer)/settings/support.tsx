import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';
import { toastService } from '@/services/toastService';
import { router } from 'expo-router';

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  subjectInput: {
    backgroundColor: Colors.surface,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  messageInput: {
    backgroundColor: Colors.surface,
    minHeight: 120,
    padding: 16,
    borderRadius: 8,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.default,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
});

export default function ContactSupportScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      toastService.showError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toastService.showSuccess('Support ticket submitted successfully!');
      setIsSubmitting(false);
      router.back();
    }, 1500);
  };

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Contact Support" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <View padding="$4">
            {/* Contact Info Section */}
            <View
              backgroundColor="$backgroundSecondary"
              borderRadius="$4"
              padding="$4"
              marginBottom="$4"
            >
              <Text fontSize={16} fontWeight="600" color="$textPrimary" marginBottom="$3">
                Get in Touch
              </Text>

              <View marginBottom="$2">
                <Text fontSize={14} fontWeight="500" color="$textPrimary">
                  📧 Email
                </Text>
                <Text fontSize={14} color="$primary">
                  support@snapbet.com
                </Text>
              </View>

              <View marginBottom="$2">
                <Text fontSize={14} fontWeight="500" color="$textPrimary">
                  📞 Phone
                </Text>
                <Text fontSize={14} color="$primary">
                  1-800-SNAPBET (1-800-762-7238)
                </Text>
              </View>

              <View>
                <Text fontSize={14} fontWeight="500" color="$textPrimary">
                  ⏰ Hours
                </Text>
                <Text fontSize={14} color="$textSecondary">
                  Monday - Friday: 9AM - 6PM EST{'\n'}
                  Saturday - Sunday: 10AM - 4PM EST
                </Text>
              </View>
            </View>

            {/* Submit Ticket Section */}
            <View>
              <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$3">
                Submit a Support Ticket
              </Text>

              <Text fontSize={14} color="$textSecondary" marginBottom="$4">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
              </Text>

              {/* Subject Input */}
              <View marginBottom="$4">
                <Text fontSize={14} fontWeight="500" color="$textPrimary" marginBottom="$2">
                  Subject
                </Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  placeholder="Brief description of your issue"
                  style={styles.subjectInput}
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>

              {/* Message Input */}
              <View marginBottom="$4">
                <Text fontSize={14} fontWeight="500" color="$textPrimary" marginBottom="$2">
                  Message
                </Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Please describe your issue in detail..."
                  multiline
                  numberOfLines={6}
                  style={styles.messageInput}
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>

              {/* Common Issues */}
              <View
                backgroundColor="$backgroundSecondary"
                borderRadius="$4"
                padding="$4"
                marginBottom="$4"
              >
                <Text fontSize={14} fontWeight="600" color="$textPrimary" marginBottom="$2">
                  Common Issues
                </Text>
                <Text fontSize={12} color="$textSecondary" lineHeight={18}>
                  • Account access problems{'\n'}• Betting or pick issues{'\n'}• Technical
                  difficulties{'\n'}• Report inappropriate content{'\n'}• Feature requests{'\n'}•
                  General feedback
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isSubmitting || !subject.trim() || !message.trim()}
                style={[
                  styles.submitButton,
                  (isSubmitting || !subject.trim() || !message.trim()) &&
                    styles.submitButtonDisabled,
                ]}
              >
                <Text color="white" fontWeight="600">
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
