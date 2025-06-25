import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import { PostType } from '@/types/content';

interface ExpirationInfoProps {
  postType: PostType;
}

export function ExpirationInfo({ postType }: ExpirationInfoProps) {
  const getExpirationText = () => {
    switch (postType) {
      case PostType.CONTENT:
        return 'Expires in 24 hours';
      case PostType.PICK:
        return 'Expires at game time'; // For now show 24h as per sprint
      case PostType.OUTCOME:
        return 'Expires in 24 hours';
      default:
        return 'Expires in 24 hours';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>⏱ {getExpirationText()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  text: {
    color: Colors.text.secondary,
    fontSize: 13,
  },
});
