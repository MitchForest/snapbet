import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, SafeAreaView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { TeamSelector } from '@/components/auth/TeamSelector';
import { OnboardingProgress } from '@/components/auth/OnboardingProgress';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';

export default function TeamSelectionScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);

    try {
      if (selectedTeam && user) {
        // Update user's favorite team
        const { error } = await supabase
          .from('users')
          .update({ favorite_team: selectedTeam })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating favorite team:', error);
        }
      }

      // Navigate to follow suggestions
      router.push('/onboarding/follow');
    } catch (error) {
      console.error('Error in team selection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/follow');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: '',
          headerBackVisible: false,
        }}
      />

      <View style={styles.content}>
        <OnboardingProgress currentStep={2} />

        <View style={styles.header}>
          <Text style={styles.title}>Pick your team</Text>
          <Text style={styles.subtitle}>Get personalized content based on your favorite team</Text>
        </View>

        <View style={styles.selectorContainer}>
          <TeamSelector selectedTeam={selectedTeam} onSelectTeam={setSelectedTeam} />
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.button, !selectedTeam && styles.buttonSecondary]}
            onPress={selectedTeam ? handleContinue : handleSkip}
            disabled={loading}
          >
            <Text style={[styles.buttonText, !selectedTeam && styles.buttonTextSecondary]}>
              {selectedTeam ? 'Continue' : 'Skip for now'}
            </Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
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
  selectorContainer: {
    flex: 1,
  },
  footer: {
    paddingVertical: 20,
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#6B7280',
  },
});
