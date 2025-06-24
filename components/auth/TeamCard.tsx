import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Team } from '@/data/teams';
import { Colors } from '@/theme';

interface TeamCardProps {
  team: Team;
  selected: boolean;
  onPress: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, selected, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(team.id)}
    >
      <View style={[styles.logo, { backgroundColor: team.primaryColor }]}>
        <View style={[styles.logoDiagonal, { backgroundColor: team.secondaryColor }]} />
        <Text style={styles.abbreviation}>{team.abbreviation}</Text>
      </View>
      <Text style={styles.teamName} numberOfLines={1}>
        {team.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.transparent,
  },
  cardSelected: {
    borderColor: Colors.primaryDark,
    backgroundColor: Colors.lightGreen,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  logoDiagonal: {
    position: 'absolute' as const,
    width: 60,
    height: 60,
    transform: [{ rotate: '45deg' }],
  },
  abbreviation: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.inverse,
    textShadowColor: Colors.shadow,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  teamName: {
    fontSize: 12,
    textAlign: 'center',
    color: Colors.text.primary,
  },
});
