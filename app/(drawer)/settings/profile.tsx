import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import {
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/theme';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [bio, setBio] = useState(user?.user_metadata?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { error } = await updateProfile({
        display_name: displayName.trim(),
        bio: bio.trim(),
      });

      if (error) {
        Alert.alert('Error', 'Failed to update profile');
      } else {
        Alert.alert('Success', 'Profile updated successfully');
        router.back();
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View flex={1} backgroundColor="$background">
        <ScrollView>
          <View padding="$4" gap="$4">
            {/* Display Name */}
            <View>
              <Text fontSize={14} color="$textSecondary" marginBottom="$2">
                Display Name
              </Text>
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter display name"
                placeholderTextColor={Colors.text.tertiary}
                maxLength={30}
              />
            </View>

            {/* Bio */}
            <View>
              <Text fontSize={14} color="$textSecondary" marginBottom="$2">
                Bio
              </Text>
              <TextInput
                style={[styles.input, styles.bioInput]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about yourself"
                placeholderTextColor={Colors.text.tertiary}
                multiline
                maxLength={140}
                textAlignVertical="top"
              />
              <Text fontSize={12} color="$textTertiary" marginTop="$1">
                {bio.length}/140
              </Text>
            </View>

            {/* Save Button */}
            <Pressable onPress={handleSave} disabled={isSaving}>
              <View
                backgroundColor="$primary"
                borderRadius="$2"
                paddingVertical="$3"
                alignItems="center"
                opacity={isSaving ? 0.5 : 1}
              >
                <Text fontSize={16} fontWeight="600" color="$textInverse">
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Text>
              </View>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.white,
    marginBottom: 12,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top' as const,
  },
});
