import React, { useState, useRef, useCallback } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { TextInput, Pressable, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Colors } from '@/theme';
import { MessageContent } from '@/types/messaging';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

interface MessageInputProps {
  onSendMessage: (content: MessageContent) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  chatExpiration: number;
}

export function MessageInput({ onSendMessage, onTyping, chatExpiration }: MessageInputProps) {
  const [text, setText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = useCallback(
    (newText: string) => {
      setText(newText);

      // Handle typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      if (newText.length > 0) {
        onTyping(true);
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 3000);
      } else {
        onTyping(false);
      }
    },
    [onTyping]
  );

  const handleSend = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || isSending) return;

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Clear input immediately for better UX
    setText('');
    onTyping(false);
    setIsSending(true);

    try {
      await onSendMessage({ text: trimmedText });
    } catch (error) {
      // Restore text on error
      setText(trimmedText);
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleMediaPress = async () => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to send photos!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.85,
      videoMaxDuration: 60, // 1 minute max for videos
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setIsUploading(true);

      try {
        // The actual upload will be handled by the message service
        await onSendMessage({
          mediaUrl: asset.uri,
          text: text.trim() || undefined,
        });
        setText('');
      } catch (error) {
        console.error('Failed to send media:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <View
      backgroundColor={Colors.background}
      borderTopWidth={1}
      borderTopColor={Colors.border.light}
      paddingHorizontal="$4"
      paddingTop="$3"
      paddingBottom={Platform.OS === 'ios' ? '$2' : '$3'}
    >
      <Stack flexDirection="row" alignItems="flex-end" gap="$2">
        {/* Media button */}
        <Pressable
          onPress={handleMediaPress}
          disabled={isUploading || isSending}
          style={({ pressed }) => [
            styles.mediaButton,
            pressed && styles.mediaButtonPressed,
            (isUploading || isSending) && styles.mediaButtonDisabled,
          ]}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Text fontSize={20}>📷</Text>
          )}
        </Pressable>

        {/* Text input */}
        <View flex={1} style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={handleTextChange}
            placeholder="Message..."
            placeholderTextColor={Colors.text.tertiary}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            editable={!isSending}
          />
        </View>

        {/* Send button */}
        {text.trim().length > 0 && (
          <Pressable
            onPress={handleSend}
            disabled={isSending}
            style={({ pressed }) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
              isSending && styles.sendButtonDisabled,
            ]}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text color={Colors.white} fontSize="$3" fontWeight="600">
                Send
              </Text>
            )}
          </Pressable>
        )}
      </Stack>

      {/* Expiration notice */}
      <Text fontSize="$2" color={Colors.text.tertiary} textAlign="center" marginTop="$2">
        Messages expire after {chatExpiration} hours
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: Colors.gray[100],
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 100,
  },
  input: {
    fontSize: 16,
    color: Colors.text.primary,
    lineHeight: 22,
    paddingTop: Platform.OS === 'ios' ? 2 : 0,
    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
  },
  mediaButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
  },
  mediaButtonPressed: {
    backgroundColor: Colors.gray[200],
  },
  mediaButtonDisabled: {
    opacity: 0.5,
  },
  sendButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonPressed: {
    backgroundColor: Colors.primaryDark,
  },
  sendButtonDisabled: {
    opacity: 0.7,
  },
});
