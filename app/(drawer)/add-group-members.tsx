import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { MemberSelector } from '@/components/messaging/MemberSelector';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { Colors } from '@/theme';
import { toastService } from '@/services/toastService';

export default function AddGroupMembersScreen() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const router = useRouter();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const { members, addMember } = useGroupMembers(chatId);

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;

    setIsAdding(true);
    let successCount = 0;

    for (const userId of selectedUsers) {
      const success = await addMember(userId);
      if (success) successCount++;
    }

    if (successCount > 0) {
      toastService.showSuccess(
        `Added ${successCount} ${successCount === 1 ? 'member' : 'members'} to the group`
      );
      router.back();
    } else {
      toastService.showError('Failed to add members');
    }

    setIsAdding(false);
  };

  return (
    <View flex={1} backgroundColor="$background">
      <ScreenHeader
        title="Add Members"
        onBack={() => router.back()}
        rightAction={
          <Pressable onPress={handleAddMembers} disabled={selectedUsers.length === 0 || isAdding}>
            {isAdding ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <Text
                fontSize="$4"
                fontWeight="600"
                color={selectedUsers.length > 0 ? Colors.primary : Colors.gray[400]}
              >
                Add
              </Text>
            )}
          </Pressable>
        }
      />

      <MemberSelector
        selectedUsers={selectedUsers}
        onSelect={setSelectedUsers}
        maxMembers={50 - members.length}
      />
    </View>
  );
}
