import React from 'react';
import { Tabs } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { TabBar } from '@/components/ui/TabBar';
import { Header } from '@/components/ui/Header';

type DrawerParamList = {
  '(tabs)': undefined;
  camera: undefined;
  notifications: undefined;
  'profile/[username]': { username: string };
};

type DrawerNavProp = DrawerNavigationProp<DrawerParamList>;

export default function TabsLayout() {
  const navigation = useNavigation<DrawerNavProp>();

  return (
    <>
      <Header
        onProfilePress={() => navigation.openDrawer()}
        onNotificationPress={() => navigation.navigate('notifications')}
        notificationCount={3}
      />
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Feed',
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: 'Games',
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: 'Messages',
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
          }}
        />
      </Tabs>
    </>
  );
}
