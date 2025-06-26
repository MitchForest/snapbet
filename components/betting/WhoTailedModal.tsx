import React from 'react';
import { View, Text, Modal, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Avatar } from '@/components/common/Avatar';
import { usePickActionsWithUsers } from '@/hooks/useTailFade';
import { Colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

interface WhoTailedModalProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WhoTailedModal({ postId, isOpen, onClose }: WhoTailedModalProps) {
  const { data: actions, isLoading } = usePickActionsWithUsers(postId);

  const tails = actions?.filter((a) => a.action_type === 'tail') || [];
  const fades = actions?.filter((a) => a.action_type === 'fade') || [];

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Tails & Fades</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </Pressable>
        </View>

        <ScrollView style={styles.content}>
          {tails.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.primary }]}>
                Tailed ({tails.length})
              </Text>
              {tails.map((action) => (
                <UserListItem
                  key={action.id}
                  user={action.user}
                  subtitle={`$${action.bet?.stake ? action.bet.stake / 100 : 0}`}
                />
              ))}
            </View>
          )}

          {fades.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: Colors.error }]}>
                Faded ({fades.length})
              </Text>
              {fades.map((action) => (
                <UserListItem
                  key={action.id}
                  user={action.user}
                  subtitle={`$${action.bet?.stake ? action.bet.stake / 100 : 0}`}
                />
              ))}
            </View>
          )}

          {tails.length === 0 && fades.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No tails or fades yet</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

interface UserListItemProps {
  user: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  subtitle: string;
}

function UserListItem({ user, subtitle }: UserListItemProps) {
  if (!user) return null;

  return (
    <View style={styles.userItem}>
      <Avatar src={user.avatar_url || undefined} size={40} fallback={user.username?.[0]?.toUpperCase() || '?'} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.display_name || user.username || 'Unknown'}</Text>
        <Text style={styles.userSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },
  userSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
});
