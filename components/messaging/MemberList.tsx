import React from 'react';
import { View, Text } from '@tamagui/core';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { GroupMember } from '@/types/messaging';
import { Colors } from '@/theme';
import { useRouter } from 'expo-router';

interface MemberListProps {
  members: GroupMember[];
  currentUserId: string;
  isAdmin: boolean;
  onRemoveMember: (memberId: string) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  currentUserId,
  isAdmin,
  onRemoveMember,
}) => {
  const router = useRouter();

  const renderMember = ({ item }: { item: GroupMember }) => {
    const isCurrentUser = item.user_id === currentUserId;
    const canRemove = isAdmin && !isCurrentUser && item.role !== 'admin';

    const handlePress = () => {
      if (!isCurrentUser) {
        router.push(`/profile/${item.user?.username}`);
      }
    };

    return (
      <Pressable onPress={handlePress} style={styles.memberItem}>
        <View flexDirection="row" alignItems="center" flex={1} gap="$3">
          <Avatar
            src={item.user?.avatar_url || undefined}
            fallback={item.user?.username?.[0]?.toUpperCase() || '?'}
            size={48}
          />

          <View flex={1}>
            <View flexDirection="row" alignItems="center" gap="$2">
              <Text fontSize="$4" fontWeight="600">
                {item.user?.display_name || item.user?.username}
                {isCurrentUser && ' (You)'}
              </Text>
              {item.role === 'admin' && (
                <View
                  backgroundColor="$primary"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text fontSize="$2" color="white" fontWeight="600">
                    Admin
                  </Text>
                </View>
              )}
              {item.isCreator && (
                <View
                  backgroundColor="$gray8"
                  paddingHorizontal="$2"
                  paddingVertical="$1"
                  borderRadius="$2"
                >
                  <Text fontSize="$2" color="white" fontWeight="600">
                    Creator
                  </Text>
                </View>
              )}
            </View>

            <Text fontSize="$3" color="$gray11">
              @{item.user?.username}
            </Text>
          </View>

          {canRemove && (
            <Pressable onPress={() => onRemoveMember(item.user_id)} style={styles.removeButton}>
              <Text color={Colors.error} fontSize="$3" fontWeight="600">
                Remove
              </Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View flex={1}>
      <View
        paddingHorizontal="$4"
        paddingVertical="$2"
        backgroundColor="$gray2"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        <Text fontSize="$3" color="$gray11" fontWeight="600">
          MEMBERS ({members.length})
        </Text>
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.user_id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => (
          <View height={1} backgroundColor="$borderColor" marginLeft={76} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  memberItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  listContent: {
    paddingBottom: 20,
  },
});
