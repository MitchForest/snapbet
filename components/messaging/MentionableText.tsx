import React from 'react';
import { Text } from '@tamagui/core';
import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme';

interface MentionableTextProps {
  text: string;
  mentions?: string[];
  color?: string;
  fontSize?: '$1' | '$2' | '$3' | '$4' | '$5' | '$6' | '$7' | '$8' | '$9' | '$10';
  fontWeight?: '400' | '500' | '600' | '700' | '800' | '900';
}

export const MentionableText: React.FC<MentionableTextProps> = ({
  text,
  mentions = [],
  color = Colors.text.primary,
  fontSize = '$4',
  fontWeight = '400',
}) => {
  const router = useRouter();

  // Split text into parts (regular text and mentions)
  const parts = text.split(/(@\w+)/g);

  const handleMentionPress = (username: string) => {
    // Navigate to user profile
    router.push(`/profile/${username}`);
  };

  return (
    <Text fontSize={fontSize} fontWeight={fontWeight}>
      {parts.map((part, index) => {
        if (part.startsWith('@')) {
          const username = part.slice(1);
          const isMentioned = mentions.includes(username);

          return (
            <Pressable
              key={index}
              onPress={() => handleMentionPress(username)}
              style={styles.mentionPressable}
            >
              <Text
                color={isMentioned ? Colors.primary : color}
                fontWeight={isMentioned ? '600' : fontWeight}
                fontSize={fontSize}
                textDecorationLine={isMentioned ? 'underline' : 'none'}
              >
                {part}
              </Text>
            </Pressable>
          );
        }

        return (
          <Text key={index} color={color} fontSize={fontSize} fontWeight={fontWeight}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  mentionPressable: {
    flexDirection: 'row' as const,
  },
});
