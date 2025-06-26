import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import {
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { GroupInfoHeader } from '@/components/messaging/GroupInfoHeader';
import { MemberList } from '@/components/messaging/MemberList';
import { useGroupMembers } from '@/hooks/useGroupMembers';
import { useChatDetails } from '@/hooks/useChatDetails';
import { useAuthStore } from '@/stores/authStore';
import { groupService } from '@/services/messaging/groupService';
import { Colors } from '@/theme';

export default function GroupInfoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [refreshing, setRefreshing] = useState(false);

  const { chat, isLoading: chatLoading } = useChatDetails({ chatId: id });
  const { members, isLoading: membersLoading, removeMember } = useGroupMembers(id);

  // Check if current user is admin
  const currentMember = members.find((m) => m.user_id === user?.id);
  const isAdmin = currentMember?.role === 'admin';
  const isCreator = chat?.created_by === user?.id;

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([chatLoading, membersLoading]);
    setRefreshing(false);
  };

  // Handle leave group
  const handleLeaveGroup = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          const success = await removeMember(user?.id || '');
          if (success) {
            router.replace('/messages');
          }
        },
      },
    ]);
  };

  // Handle delete group
  const handleDeleteGroup = () => {
    Alert.alert(
      'Delete Group',
      'This will permanently delete the group and all messages. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const success = await groupService.deleteGroup(id);
            if (success) {
              router.replace('/messages');
            }
          },
        },
      ]
    );
  };

  // Handle add member
  const handleAddMember = () => {
    router.push({
      pathname: '/add-group-members',
      params: { chatId: id },
    });
  };

  // Handle remove member
  const handleRemoveMember = (memberId: string) => {
    const member = members.find((m) => m.user_id === memberId);
    if (!member) return;

    Alert.alert('Remove Member', `Remove ${member.user?.username} from the group?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeMember(memberId),
      },
    ]);
  };

  if (chatLoading || membersLoading) {
    return (
      <View flex={1} backgroundColor="$background">
        <ScreenHeader title="Group Info" onBack={() => router.back()} />
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (!chat || chat.chat_type !== 'group') {
    return (
      <View flex={1} backgroundColor="$background">
        <ScreenHeader title="Group Info" onBack={() => router.back()} />
        <View flex={1} justifyContent="center" alignItems="center">
          <Text fontSize="$4" color="$gray11">
            Group not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor="$background">
      <ScreenHeader title="Group Info" onBack={() => router.back()} />

      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Group header with photo and name */}
        <GroupInfoHeader
          chat={chat}
          memberCount={members.length}
          isAdmin={isAdmin}
          onUpdate={handleRefresh}
        />

        {/* Group actions */}
        <View paddingHorizontal="$4" paddingVertical="$3" gap="$3">
          {/* Add members button (admin only) */}
          {isAdmin && (
            <Pressable onPress={handleAddMember} style={styles.addMembersButton}>
              <Text color="white" fontSize="$4" fontWeight="600">
                Add Members
              </Text>
            </Pressable>
          )}

          {/* Leave group button */}
          <Pressable onPress={handleLeaveGroup} style={styles.leaveGroupButton}>
            <Text color="white" fontSize="$4" fontWeight="600">
              Leave Group
            </Text>
          </Pressable>

          {/* Delete group button (creator only) */}
          {isCreator && (
            <Pressable onPress={handleDeleteGroup} style={styles.deleteGroupButton}>
              <Text color="white" fontSize="$4" fontWeight="600">
                Delete Group
              </Text>
            </Pressable>
          )}
        </View>

        {/* Member list */}
        <MemberList
          members={members}
          currentUserId={user?.id || ''}
          isAdmin={isAdmin}
          onRemoveMember={handleRemoveMember}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  addMembersButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  leaveGroupButton: {
    backgroundColor: Colors.warning,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
  deleteGroupButton: {
    backgroundColor: Colors.error,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
  },
});
