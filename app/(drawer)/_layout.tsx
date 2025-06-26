import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '@/components/ui/DrawerContent';
import { useAuthStore } from '@/stores/authStore';
import { Ionicons } from '@expo/vector-icons';

const isAdmin = (userId: string): boolean => {
  const adminIds = process.env.EXPO_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
  return adminIds.includes(userId);
};

export default function DrawerLayout() {
  const user = useAuthStore((state) => state.user);
  const showAdminOptions = user && isAdmin(user.id);

  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#FAF9F5',
          width: 280,
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'SnapBet',
        }}
      />
      <Drawer.Screen
        name="camera"
        options={{
          drawerLabel: 'Camera',
          title: 'Camera',
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          drawerLabel: 'Notifications',
          title: 'Notifications',
        }}
      />
      <Drawer.Screen
        name="invite"
        options={{
          drawerLabel: 'Invite Friends',
          title: 'Invite Friends',
        }}
      />
      <Drawer.Screen
        name="how-to-play"
        options={{
          drawerLabel: 'How to Play',
          title: 'How to Play',
        }}
      />
      <Drawer.Screen
        name="settings/index"
        options={{
          drawerLabel: 'Settings',
          title: 'Settings',
        }}
      />
      <Drawer.Screen
        name="profile/[username]"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Profile',
        }}
      />
      <Drawer.Screen
        name="followers"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Followers',
        }}
      />
      <Drawer.Screen
        name="following"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Following',
        }}
      />
      <Drawer.Screen
        name="follow-requests"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Follow Requests',
        }}
      />
      <Drawer.Screen
        name="settings/profile"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Edit Profile',
        }}
      />
      <Drawer.Screen
        name="settings/notifications"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Notifications',
        }}
      />
      <Drawer.Screen
        name="settings/privacy"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Privacy',
        }}
      />
      <Drawer.Screen
        name="settings/stats-display"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Stats Display',
        }}
      />
      <Drawer.Screen
        name="settings/blocked"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Blocked Users',
        }}
      />
      <Drawer.Screen
        name="story/_layout"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Story',
        }}
      />
      <Drawer.Screen
        name="story/[id]"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Story',
        }}
      />

      {/* Admin screens - conditionally rendered */}
      {showAdminOptions && (
        <Drawer.Screen
          name="admin/moderation"
          options={{
            drawerLabel: 'Moderation',
            title: 'Moderation Panel',
            drawerIcon: ({ color, size }) => (
              <Ionicons name="shield-outline" size={size} color={color} />
            ),
          }}
        />
      )}
    </Drawer>
  );
}
