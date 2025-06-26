import React, { useRef, useState } from 'react';
import { View, Text } from '@tamagui/core';
import {
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { GroupMember } from '@/types/messaging';
import { useMentions } from '@/hooks/useMentions';
import { Colors } from '@/theme';

interface MentionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  members: GroupMember[];
  placeholder?: string;
  maxLength?: number;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChangeText,
  onSubmit,
  members,
  placeholder = 'Type a message...',
  maxLength = 500,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

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
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={handleChange}
          onSelectionChange={handleSelectionChange}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray[400]}
          maxLength={maxLength}
          multiline
          returnKeyType="send"
          blurOnSubmit={false}
        />
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
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  input: {
    fontSize: 16,
    color: Colors.text.primary,
    maxHeight: 100,
    minHeight: 40,
    paddingVertical: 8,
  },
});
