import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import {
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';

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
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View flex={1} backgroundColor="$background">
        <ScrollView>
          <View padding="$4">
            {/* Display Name */}
            <View marginBottom="$4">
              <Text fontSize={14} color="$textSecondary" marginBottom="$2">
                Display Name
              </Text>
              <View
                backgroundColor="$surface"
                borderWidth={1}
                borderColor="$divider"
                borderRadius="$2"
                paddingHorizontal="$3"
              >
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Enter display name"
                  placeholderTextColor="#666"
                  maxLength={30}
                  style={{
                    fontSize: 16,
                    paddingVertical: 12,
                    color: '#fff',
                  }}
                />
              </View>
              <Text fontSize={12} color="$textSecondary" marginTop="$1">
                {displayName.length}/30
              </Text>
            </View>

            {/* Bio */}
            <View marginBottom="$4">
              <Text fontSize={14} color="$textSecondary" marginBottom="$2">
                Bio
              </Text>
              <View
                backgroundColor="$surface"
                borderWidth={1}
                borderColor="$divider"
                borderRadius="$2"
                paddingHorizontal="$3"
              >
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell us about yourself"
                  placeholderTextColor="#666"
                  maxLength={140}
                  multiline
                  numberOfLines={3}
                  style={{
                    fontSize: 16,
                    paddingVertical: 12,
                    color: '#fff',
                    minHeight: 80,
                  }}
                />
              </View>
              <Text fontSize={12} color="$textSecondary" marginTop="$1">
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
