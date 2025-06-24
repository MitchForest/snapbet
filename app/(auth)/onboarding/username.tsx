import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Stack } from '@tamagui/core';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable, Alert, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { OnboardingProgress } from '@/components/auth/OnboardingProgress';
import { UsernameInput } from '@/components/auth/UsernameInput';
import { UsernameSuggestions } from '@/components/auth/UsernameSuggestions';
import { generateUsernameSuggestions } from '@/utils/username/suggestions';
import { clearUsernameCache } from '@/services/api/checkUsername';

export default function UsernameSelectionScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, updateUsername } = useAuthStore();
  const [username, setUsername] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Memoize the validation callback
  const handleValidation = useCallback((valid: boolean) => {
    setIsValid(valid);
  }, []);

  // Get avatar URL from OAuth metadata
  const avatarUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  // Check if user already has username (shouldn't happen but safety check)
  useEffect(() => {
    if (user?.user_metadata?.username) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [user, router]);

  // Generate suggestions when username is taken
  useEffect(() => {
    if (!isValid && username.length >= 3) {
      const newSuggestions = generateUsernameSuggestions(username);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [isValid, username]);

  const handleSaveUsername = async () => {
    if (!isValid || isSaving) return;

    setIsSaving(true);

    try {
      const { error } = await updateUsername(username);

      if (error) {
        // Check if it's a race condition (username taken after validation)
        if ('code' in error && error.code === '23505') {
          // Unique constraint violation
          Alert.alert('Username Taken', 'That username was just taken. Please try another.', [
            { text: 'OK' },
          ]);
          setUsername('');
          clearUsernameCache();
        } else {
          Alert.alert('Error', 'Failed to save username. Please try again.');
        }
      } else {
        // Success - navigation will be handled by root layout
        clearUsernameCache();
      }
    } catch (error) {
      console.error('Error saving username:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setUsername(suggestion);
  };

  return (
    <View
      flex={1}
      backgroundColor="$background"
      paddingTop={insets.top}
      paddingBottom={insets.bottom}
    >
      {/* Header */}
      <Stack paddingHorizontal="$4" paddingVertical="$3">
        <OnboardingProgress currentStep={1} />
      </Stack>

      {/* Content */}
      <Stack flex={1} paddingHorizontal="$6" gap="$4">
        {/* Profile Picture */}
        {avatarUrl && (
          <View alignSelf="center" marginTop="$4">
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          </View>
        )}

        {/* Title */}
        <Stack gap="$2" alignItems="center">
          <Text fontSize={24} fontWeight="600" color="$textPrimary">
            Choose your username
          </Text>
          <Text fontSize={14} color="$textSecondary" textAlign="center">
            This is how other bettors will find you
          </Text>
        </Stack>

        {/* Username Input */}
        <UsernameInput value={username} onChange={setUsername} onValidation={handleValidation} />

        {/* Suggestions */}
        <UsernameSuggestions suggestions={suggestions} onSelect={handleSuggestionSelect} />

        {/* Spacer */}
        <View flex={1} />

        {/* Continue Button */}
        <Pressable
          onPress={handleSaveUsername}
          disabled={!isValid || isSaving}
          style={({ pressed }) => ({
            backgroundColor: !isValid || isSaving ? '#E5E7EB' : pressed ? '#047857' : '#059669',
            paddingVertical: 16,
            borderRadius: 8,
            marginBottom: 16,
            opacity: pressed && isValid && !isSaving ? 0.8 : 1,
          })}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text
              textAlign="center"
              fontSize={16}
              fontWeight="600"
              color={!isValid ? '$textTertiary' : 'white'}
            >
              Continue
            </Text>
          )}
        </Pressable>
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
