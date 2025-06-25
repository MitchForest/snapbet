import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

interface ShareDestinationProps {
  toFeed: boolean;
  toStory: boolean;
  onFeedChange: (value: boolean) => void;
  onStoryChange: (value: boolean) => void;
}

export function ShareDestination({
  toFeed,
  toStory,
  onFeedChange,
  onStoryChange,
}: ShareDestinationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Share To:</Text>

      <View style={styles.option}>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Feed</Text>
          <Text style={styles.optionDescription}>Post disappears in 24 hours</Text>
        </View>
        <Switch
          value={toFeed}
          onValueChange={onFeedChange}
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

      <View style={styles.option}>
        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>Story</Text>
          <Text style={styles.optionDescription}>Visible for 24 hours at top</Text>
        </View>
        <Switch
          value={toStory}
          onValueChange={onStoryChange}
          trackColor={{ false: Colors.gray[300], true: Colors.primary }}
          thumbColor={Colors.white}
        />
      </View>

      {!toFeed && !toStory && (
        <Text style={styles.warning}>Please select at least one destination</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  title: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    color: Colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  optionDescription: {
    color: Colors.text.secondary,
    fontSize: 13,
    marginTop: 2,
  },
  warning: {
    color: Colors.error,
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
