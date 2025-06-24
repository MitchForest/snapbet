import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

interface ProfileTabsProps {
  activeTab: 'posts' | 'bets';
  onTabChange: (tab: 'posts' | 'bets') => void;
}

export function ProfileTabs({ activeTab, onTabChange }: ProfileTabsProps) {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeTab === 'posts' && styles.activeTab]}
        onPress={() => onTabChange('posts')}
      >
        <Text style={[styles.tabText, activeTab === 'posts' && styles.activeTabText]}>Posts</Text>
      </Pressable>

      <Pressable
        style={[styles.tab, activeTab === 'bets' && styles.activeTab]}
        onPress={() => onTabChange('bets')}
      >
        <Text style={[styles.tabText, activeTab === 'bets' && styles.activeTabText]}>Bets</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.default,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.transparent,
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.primary,
  },
});
