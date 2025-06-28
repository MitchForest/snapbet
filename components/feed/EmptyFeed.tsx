import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme';

export function EmptyFeed() {
  const router = useRouter();

  const handleDiscoverPress = () => {
    router.push('/search');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.title}>Welcome to Snapbet!</Text>
      <Text style={styles.description}>
        Follow other bettors to see their picks and content in your feed
      </Text>
      <Pressable style={styles.button} onPress={handleDiscoverPress}>
        <Text style={styles.buttonText}>Discover People</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
    paddingTop: 60,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
