import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { OnboardingProgress } from '@/components/auth/OnboardingProgress';
import { FollowCard } from '@/components/auth/FollowCard';
import { useAuthStore } from '@/stores/authStore';
import { generateFollowSuggestions } from '@/utils/onboarding/suggestions';
import { followUser, unfollowUser } from '@/services/api/followUser';
import { supabase } from '@/services/supabase/client';
import { Colors } from '@/theme';

interface SuggestedUser {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  win_count?: number;
  loss_count?: number;
  total_wagered?: number;
  total_won?: number;
}

export default function FollowSuggestionsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      // Generate suggestions without team preference (removed from database)
      const suggestedUsers = await generateFollowSuggestions(null);
      setSuggestions(suggestedUsers);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = async (userId: string) => {
    const isFollowing = followingIds.has(userId);

    if (isFollowing) {
      const result = await unfollowUser(userId);
      if (result.success) {
        setFollowingIds((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    } else {
      const result = await followUser(userId);
      if (result.success) {
        setFollowingIds((prev) => new Set([...prev, userId]));
      }
    }
  };

  const handleContinue = async () => {
    if (followingIds.size < 3 || !user?.id) return;

    setSubmitting(true);

    try {
      // Initialize user's bankroll
      const { error } = await supabase.rpc('reset_bankroll', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error initializing bankroll:', error);
      }

      // For now, skip stats display initialization since table doesn't exist in types
      // This would be done in production with proper table setup

      // Navigate to main app
      router.replace('/(drawer)/(tabs)/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const followCount = followingIds.size;
  const canContinue = followCount >= 3;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackVisible: true,
        }}
      />

      <View style={styles.content}>
        <OnboardingProgress currentStep={3} />

        <View style={styles.header}>
          <Text style={styles.title}>Follow some bettors</Text>
          <Text style={styles.subtitle}>
            Follow at least 3 bettors to continue ({followCount}/3)
          </Text>
        </View>

        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FollowCard
              user={item}
              isFollowing={followingIds.has(item.id)}
              onToggle={handleToggleFollow}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <Pressable
            style={[styles.startButton, !canContinue && styles.startButtonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.startButtonText}>
                {canContinue ? 'Start Betting' : `Follow ${3 - followCount} more`}
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  listContent: {
    paddingBottom: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },
  startButton: {
    backgroundColor: Colors.primaryDark,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: Colors.border.medium,
  },
  startButtonText: {
    color: Colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
