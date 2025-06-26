import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import { Image, Pressable, TextInput, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ChatWithDetails } from '@/types/messaging';
import { groupService } from '@/services/messaging/groupService';
import { Colors } from '@/theme';

interface GroupInfoHeaderProps {
  chat: ChatWithDetails;
  memberCount: number;
  isAdmin: boolean;
  onUpdate: () => void;
}

export const GroupInfoHeader: React.FC<GroupInfoHeaderProps> = ({
  chat,
  memberCount,
  isAdmin,
  onUpdate,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [groupName, setGroupName] = useState(chat.name || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle photo update
  const handlePhotoUpdate = async () => {
    if (!isAdmin) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIsUpdating(true);
      const asset = result.assets[0];

      // Convert to File
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const file = new File([blob], 'group-photo.jpg', { type: 'image/jpeg' });

      const success = await groupService.updateGroupDetails(chat.chat_id, {
        photoFile: file,
      });

      if (success) {
        onUpdate();
      }
      setIsUpdating(false);
    }
  };

  // Handle name update
  const handleNameUpdate = async () => {
    if (!groupName.trim() || groupName === chat.name) {
      setIsEditingName(false);
      setGroupName(chat.name || '');
      return;
    }

    setIsUpdating(true);
    const success = await groupService.updateGroupDetails(chat.chat_id, {
      name: groupName.trim(),
    });

    if (success) {
      onUpdate();
      setIsEditingName(false);
    } else {
      setGroupName(chat.name || '');
    }
    setIsUpdating(false);
  };

  return (
    <View alignItems="center" paddingVertical="$4" gap="$3">
      {/* Group Photo */}
      <Pressable onPress={handlePhotoUpdate} disabled={!isAdmin || isUpdating}>
        <View position="relative">
          {chat.avatar_url ? (
            <Image source={{ uri: chat.avatar_url }} style={styles.groupPhoto} />
          ) : (
            <View style={[styles.groupPhoto, styles.photoPlaceholder]}>
              <Text fontSize="$10">👥</Text>
            </View>
          )}

          {isAdmin && (
            <View style={styles.editBadge}>
              <Text fontSize="$2">📷</Text>
            </View>
          )}
        </View>
      </Pressable>

      {/* Group Name */}
      {isEditingName && isAdmin ? (
        <TextInput
          style={styles.nameInput}
          value={groupName}
          onChangeText={setGroupName}
          onBlur={handleNameUpdate}
          onSubmitEditing={handleNameUpdate}
          autoFocus
          maxLength={50}
          editable={!isUpdating}
        />
      ) : (
        <Pressable
          onPress={() => isAdmin && setIsEditingName(true)}
          disabled={!isAdmin || isUpdating}
        >
          <View flexDirection="row" alignItems="center" gap="$2">
            <Text fontSize="$6" fontWeight="600" textAlign="center">
              {chat.name || 'Unnamed Group'}
            </Text>
            {isAdmin && <Text fontSize="$3">✏️</Text>}
          </View>
        </Pressable>
      )}

      {/* Member count */}
      <Text fontSize="$4" color="$gray11">
        {memberCount} {memberCount === 1 ? 'member' : 'members'}
      </Text>

      {/* Expiration info */}
      {chat.settings?.expiration_hours && (
        <View
          backgroundColor="$gray3"
          paddingHorizontal="$3"
          paddingVertical="$2"
          borderRadius="$3"
        >
          <Text fontSize="$3" color="$gray11">
            Messages expire after{' '}
            {chat.settings.expiration_hours === 1
              ? '1 hour'
              : chat.settings.expiration_hours === 168
                ? '7 days'
                : `${chat.settings.expiration_hours} hours`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  groupPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholder: {
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minWidth: 200,
  },
});
