import React, { useRef, useState } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import {
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { GroupMember } from '@/types/messaging';
import { useMentions } from '@/hooks/useMentions';
import { Colors } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  onMediaSelect?: (uri: string) => void;
  members: GroupMember[];
  placeholder?: string;
  maxLength?: number;
  chatExpiration?: number;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  onMediaSelect,
  members,
  placeholder = 'Type a message...',
  maxLength = 500,
  chatExpiration = 24,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const insets = useSafeAreaInsets();

  const { mentionState, suggestions, handleTextChange, selectMention, cancelMention } =
    useMentions(members);

  // Handle text changes
  const handleChange = (text: string) => {
    onChangeText(text);
    handleTextChange(text, cursorPosition);
  };

  // Handle selection change
  const handleSelectionChange = (event: {
    nativeEvent: { selection: { start: number; end: number } };
  }) => {
    setCursorPosition(event.nativeEvent.selection.start);
  };

  // Handle mention selection
  const handleMentionSelect = (member: GroupMember) => {
    const mention = selectMention(member);
    if (!mention) return;

    // Replace the partial mention with the full username
    const before = value.slice(0, mention.startPosition);
    const after = value.slice(mention.endPosition);
    const newText = `${before}@${mention.username} ${after}`;

    onChangeText(newText);
    cancelMention();

    // Set cursor position after the mention
    setTimeout(() => {
      const newPosition = mention.startPosition + mention.username.length + 2;
      inputRef.current?.setNativeProps({
        selection: { start: newPosition, end: newPosition },
      });
    }, 0);
  };

  const handleSend = async () => {
    const trimmedText = value.trim();
    if (!trimmedText || isSending) return;

    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setIsSending(true);
    try {
      await onSubmit();
    } finally {
      setIsSending(false);
    }
  };

  const handleMediaPress = async () => {
    if (!onMediaSelect) return;

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
        await onMediaSelect(asset.uri);
      } catch (error) {
        console.error('Failed to send media:', error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Render mention suggestion
  const renderSuggestion = ({ item }: { item: GroupMember }) => (
    <Pressable onPress={() => handleMentionSelect(item)} style={styles.suggestionItem}>
      <Avatar
        src={item.user?.avatar_url || undefined}
        fallback={item.user?.username?.[0]?.toUpperCase() || '?'}
        size={32}
      />
      <View flex={1} marginLeft="$2">
        <Text fontSize="$3" fontWeight="600">
          {item.user?.display_name || item.user?.username}
        </Text>
        <Text fontSize="$2" color="$gray11">
          @{item.user?.username}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Mention suggestions */}
      {mentionState.isActive && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.user_id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Input field */}
      <View
        style={[
          styles.inputContainer,
          Platform.OS === 'ios' && { paddingBottom: insets.bottom + 8 },
        ]}
      >
        <Stack flexDirection="row" alignItems="flex-end" gap="$2">
          {/* Media button - show when no text */}
          {!value.trim() && onMediaSelect && (
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
          )}

          {/* Text input */}
          <View flex={1} style={styles.textInputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={value}
              onChangeText={handleChange}
              onSelectionChange={handleSelectionChange}
              onSubmitEditing={handleSend}
              placeholder={placeholder}
              placeholderTextColor={Colors.gray[400]}
              maxLength={maxLength}
              multiline
              returnKeyType="send"
              blurOnSubmit={false}
              editable={!isSending}
            />
          </View>

          {/* Send button - show when text exists */}
          {value.trim().length > 0 && (
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  suggestionsContainer: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    maxHeight: 200,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'android' ? 12 : 8,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  textInputContainer: {
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
