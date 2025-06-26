import React from 'react';
import { View, Text } from '@tamagui/core';
import { FlatList, Pressable, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Avatar } from '@/components/common/Avatar';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { Colors } from '@/theme';
import { router } from 'expo-router';

export default function FollowRequestsScreen() {
  const { requests, isLoading, isActioning, acceptRequest, rejectRequest, rejectAllRequests } =
    useFollowRequests();

  const handleClearAll = () => {
    if (requests.length === 0) return;

    Alert.alert('Reject All Requests', 'Are you sure you want to reject all follow requests?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject All',
        style: 'destructive',
        onPress: rejectAllRequests,
      },
    ]);
  };

  const renderRequest = ({ item }: { item: (typeof requests)[0] }) => {
    const isProcessing = isActioning === item.id;

    return (
      <View
        flexDirection="row"
        alignItems="center"
        paddingVertical="$3"
        paddingHorizontal="$4"
        borderBottomWidth={1}
        borderBottomColor={Colors.border.light}
      >
        <Pressable
          onPress={() => router.push(`/profile/${item.requester?.username}`)}
          style={styles.userPressable}
        >
          <View flexDirection="row" alignItems="center" flex={1}>
            <Avatar size={48} src={item.requester?.avatar_url || undefined} />
            <View marginLeft="$3" flex={1}>
              <Text fontSize={16} fontWeight="600" color="$textPrimary">
                @{item.requester?.username}
              </Text>
              {item.requester?.display_name && (
                <Text fontSize={14} color="$textSecondary">
                  {item.requester.display_name}
                </Text>
              )}
            </View>
          </View>
        </Pressable>

        <View flexDirection="row" gap="$2">
          <Pressable
            onPress={() => acceptRequest(item.id)}
            disabled={isProcessing || isActioning === 'all'}
          >
            <View
              backgroundColor={Colors.primary}
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$2"
              opacity={isProcessing || isActioning === 'all' ? 0.6 : 1}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text fontSize={14} fontWeight="600" color={Colors.white}>
                  Accept
                </Text>
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={() => rejectRequest(item.id)}
            disabled={isProcessing || isActioning === 'all'}
          >
            <View
              backgroundColor={Colors.border.default}
              paddingHorizontal="$3"
              paddingVertical="$2"
              borderRadius="$2"
              opacity={isProcessing || isActioning === 'all' ? 0.6 : 1}
            >
              <Text fontSize={14} fontWeight="600" color="$textPrimary">
                Reject
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View flex={1} alignItems="center" justifyContent="center" paddingTop="$10">
      <Text fontSize={20} marginBottom="$2">
        🤝
      </Text>
      <Text fontSize={18} fontWeight="600" color="$textPrimary" marginBottom="$1">
        No Follow Requests
      </Text>
      <Text fontSize={14} color="$textSecondary" textAlign="center" paddingHorizontal="$6">
        When someone requests to follow your private account, they&apos;ll appear here
      </Text>
    </View>
  );

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader
        title="Follow Requests"
        rightAction={
          requests.length > 0 ? (
            <Pressable onPress={handleClearAll} disabled={isActioning === 'all'}>
              <Text fontSize={14} color={Colors.error} opacity={isActioning === 'all' ? 0.6 : 1}>
                Clear All
              </Text>
            </Pressable>
          ) : undefined
        }
      />

      {isLoading ? (
        <View flex={1} alignItems="center" justifyContent="center">
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderRequest}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={requests.length === 0 ? styles.emptyContainer : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  userPressable: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
  },
});
