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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSuggestions = async () => {
    try {
      // Get user's favorite team from database
      let favoriteTeam: string | null = null;
      if (user?.id) {
        const { data } = await supabase
          .from('users')
          .select('favorite_team')
          .eq('id', user.id)
          .single();

        favoriteTeam = data?.favorite_team || null;
      }

      const suggestedUsers = await generateFollowSuggestions(favoriteTeam);
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
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue || submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
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
    backgroundColor: '#FAF9F5',
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
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    paddingBottom: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#FAF9F5',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
