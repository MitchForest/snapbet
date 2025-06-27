import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, Platform } from 'react-native';
import { Colors, OpacityColors } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { toastService } from '@/services/toastService';

interface PostOptionsMenuProps {
  postId: string;
  postUserId: string;
  onReport: () => void;
}

interface MenuOption {
  label: string;
  icon: string;
  action: () => void;
  destructive?: boolean;
}

export function PostOptionsMenu({ postId: _postId, postUserId, onReport }: PostOptionsMenuProps) {
  const { user } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<View>(null);

  const isOwnPost = user?.id === postUserId;

  const handleOpenMenu = () => {
    buttonRef.current?.measure(
      (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setMenuPosition({
          top: pageY + height + 8,
          right: 16, // 16px from right edge
        });
        setIsVisible(true);
      }
    );
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleDelete = () => {
    handleClose();
    toastService.showComingSoon('Delete post');
  };

  const handleEdit = () => {
    handleClose();
    toastService.showComingSoon('Edit post');
  };

  const handleReport = () => {
    handleClose();
    onReport();
  };

  const handleBlock = () => {
    handleClose();
    toastService.showComingSoon('Block user');
  };

  const menuOptions: MenuOption[] = isOwnPost
    ? [
        { label: 'Edit', icon: '✏️', action: handleEdit },
        { label: 'Delete', icon: '🗑️', action: handleDelete, destructive: true },
      ]
    : [
        { label: 'Report', icon: '🚩', action: handleReport },
        { label: 'Block User', icon: '🚫', action: handleBlock, destructive: true },
      ];

  return (
    <>
      <TouchableOpacity
        ref={buttonRef}
        onPress={handleOpenMenu}
        style={styles.moreButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.moreIcon}>⋯</Text>
      </TouchableOpacity>

      <Modal visible={isVisible} transparent animationType="fade" onRequestClose={handleClose}>
        <Pressable style={styles.overlay} onPress={handleClose}>
          <View style={[styles.menu, { top: menuPosition.top, right: menuPosition.right }]}>
            {menuOptions.map((option, index) => (
              <TouchableOpacity
                key={option.label}
                style={[styles.menuItem, index === menuOptions.length - 1 && styles.menuItemLast]}
                onPress={option.action}
                activeOpacity={0.7}
              >
                <Text style={styles.menuIcon}>{option.icon}</Text>
                <Text style={[styles.menuLabel, option.destructive && styles.menuLabelDestructive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  moreButton: {
    padding: 8,
  },
  moreIcon: {
    fontSize: 20,
    color: Colors.text.secondary,
  },
  overlay: {
    flex: 1,
    backgroundColor: OpacityColors.overlay.light,
  },
  menu: {
    position: 'absolute',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    minWidth: 180,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    flex: 1,
  },
  menuLabelDestructive: {
    color: Colors.error,
  },
});
