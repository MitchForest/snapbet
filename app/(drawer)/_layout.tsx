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
    </Drawer>
  );
}
