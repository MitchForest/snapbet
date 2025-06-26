import React, { useState } from 'react';
import { View, Text } from '@tamagui/core';
import { FlatList, ActivityIndicator, RefreshControl, Pressable } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Avatar } from '@/components/common/Avatar';
import { BlockConfirmation } from '@/components/moderation/BlockConfirmation';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { Colors } from '@/theme';
import { router } from 'expo-router';

export default function BlockedUsersScreen() {
  const { blockedUsers, isLoading, error, unblockUser, refresh } = useBlockedUsers();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; username: string } | null>(null);
  const [showUnblockConfirm, setShowUnblockConfirm] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleUnblockPress = (userId: string, username: string) => {
    setSelectedUser({ id: userId, username });
    setShowUnblockConfirm(true);
  };

  const handleUnblockConfirm = async () => {
    if (selectedUser) {
      await unblockUser(selectedUser.id);
      setSelectedUser(null);
    }
  };

  const handleUserPress = (username: string) => {
    router.push(`/profile/${username}`);
  };

  if (isLoading && blockedUsers.length === 0) {
    return (
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader title="Blocked Users" />
        <View flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View flex={1} backgroundColor={Colors.background}>
        <ScreenHeader title="Blocked Users" />
        <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$4">
          <Text fontSize={16} color="$error" textAlign="center">
            Failed to load blocked users
          </Text>
          <Text fontSize={14} color="$textSecondary" textAlign="center" marginTop="$2">
            {error}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Blocked Users" />

      {blockedUsers.length === 0 ? (
        <View flex={1} justifyContent="center" alignItems="center" paddingHorizontal="$6">
          <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$2">
            No blocked users
          </Text>
          <Text fontSize={14} color="$textSecondary" textAlign="center">
            You haven&apos;t blocked anyone yet
          </Text>
        </View>
      ) : (
        <>
          <View paddingHorizontal="$4" paddingVertical="$2">
            <Text fontSize={12} color="$textSecondary">
              {blockedUsers.length} {blockedUsers.length === 1 ? 'USER' : 'USERS'}
            </Text>
          </View>

          <FlatList
            data={blockedUsers}
            keyExtractor={(item) => item.blocked_id}
            renderItem={({ item }) => (
              <Pressable onPress={() => handleUserPress(item.user?.username || '')}>
                <View
                  flexDirection="row"
                  alignItems="center"
                  paddingVertical="$3"
                  paddingHorizontal="$4"
                  backgroundColor="$surface"
                  borderBottomWidth={1}
                  borderBottomColor="$divider"
                >
                  <Avatar
                    size={48}
                    src={item.user?.avatar_url || undefined}
                    fallback={item.user?.username?.[0]?.toUpperCase() || '?'}
                  />

                  <View flex={1} marginLeft="$3">
                    <Text fontSize={16} fontWeight="600" color="$textPrimary">
                      @{item.user?.username || 'Unknown'}
                    </Text>
                    {item.user?.display_name && (
                      <Text fontSize={14} color="$textSecondary">
                        {item.user.display_name}
                      </Text>
                    )}
                  </View>

                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      handleUnblockPress(item.blocked_id, item.user?.username || 'this user');
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <Text fontSize={14} color="$primary" fontWeight="600">
                      Unblock
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
              />
            }
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        </>
      )}

      {selectedUser && (
        <BlockConfirmation
          isVisible={showUnblockConfirm}
          onClose={() => {
            setShowUnblockConfirm(false);
            setSelectedUser(null);
          }}
          onConfirm={handleUnblockConfirm}
          username={selectedUser.username}
          isBlocking={false}
        />
      )}
    </View>
  );
}
