import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { TeamCard } from './TeamCard';
import { NFL_TEAMS, NBA_TEAMS } from '@/data/teams';

interface TeamSelectorProps {
  selectedTeam?: string | null;
  onSelectTeam: (teamId: string | null) => void;
}

export const TeamSelector: React.FC<TeamSelectorProps> = ({ selectedTeam, onSelectTeam }) => {
  const [sport, setSport] = useState<'NFL' | 'NBA'>('NFL');
  const teams = sport === 'NFL' ? NFL_TEAMS : NBA_TEAMS;

  return (
    <View style={styles.container}>
      {/* Sport Toggle */}
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, sport === 'NFL' && styles.toggleButtonActive]}
          onPress={() => setSport('NFL')}
        >
          <Text style={[styles.toggleText, sport === 'NFL' && styles.toggleTextActive]}>NFL</Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, sport === 'NBA' && styles.toggleButtonActive]}
          onPress={() => setSport('NBA')}
        >
          <Text style={[styles.toggleText, sport === 'NBA' && styles.toggleTextActive]}>NBA</Text>
        </Pressable>
      </View>

      {/* Team Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {teams.map((team) => (
          <View key={team.id} style={styles.gridItem}>
            <TeamCard team={team} selected={selectedTeam === team.id} onPress={onSelectTeam} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#1F2937',
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 20,
  },
  gridItem: {
    width: '25%',
    padding: 4,
  },
});
