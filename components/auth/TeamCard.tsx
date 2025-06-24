import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Team } from '@/data/teams';

interface TeamCardProps {
  team: Team;
  selected: boolean;
  onPress: (teamId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ team, selected, onPress }) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(team.id)}
    >
      <View style={[styles.logo, { backgroundColor: team.primaryColor }]}>
        <View style={[styles.logoSecondary, { backgroundColor: team.secondaryColor }]} />
        <Text style={styles.abbreviation}>{team.abbreviation}</Text>
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {team.name}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FAF9F5',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: '#059669',
    backgroundColor: '#F0FDF4',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSecondary: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    transform: [{ rotate: '45deg' }, { translateX: 30 }],
  },
  abbreviation: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    zIndex: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  name: {
    marginTop: 4,
    fontSize: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
});
