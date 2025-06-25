import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { DrawerContent } from '@/components/ui/DrawerContent';

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'slide',
        drawerStyle: {
          width: '80%',
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
        }}
      />
      <Drawer.Screen
        name="camera"
        options={{
          drawerItemStyle: { display: 'none' },
        }}
      />
      <Drawer.Screen
        name="notifications"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Notifications',
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
        name="settings/index"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Settings',
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
          title: 'Notification Settings',
        }}
      />
      <Drawer.Screen
        name="settings/privacy"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Privacy Settings',
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
        name="following"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Following',
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
        name="invite"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Invite Friends',
        }}
      />
      <Drawer.Screen
        name="how-to-play"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'How to Play',
        }}
      />
    </Drawer>
  );
}
