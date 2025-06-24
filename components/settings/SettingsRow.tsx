import React from 'react';
import { View, Text } from '@tamagui/core';
import { Pressable } from 'react-native';

interface SettingsRowProps {
  icon?: string;
  label: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  showArrow?: boolean;
  disabled?: boolean;
  customRight?: React.ReactNode;
}

export const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  subtitle,
  value,
  onPress,
  showArrow,
  disabled,
  customRight,
}) => {
  const content = (
    <View
      flexDirection="row"
      alignItems="center"
      paddingVertical="$3"
      paddingHorizontal="$4"
      backgroundColor="$surface"
      borderBottomWidth={1}
      borderBottomColor="$divider"
      opacity={disabled ? 0.5 : 1}
    >
      {icon && (
        <Text fontSize={20} marginRight="$3">
          {icon}
        </Text>
      )}

      <View flex={1}>
        <Text fontSize={16} color="$textPrimary">
          {label}
        </Text>
        {subtitle && (
          <Text fontSize={14} color="$textSecondary" marginTop="$0.5">
            {subtitle}
          </Text>
        )}
      </View>

      {customRight || (
        <>
          {value && (
            <Text fontSize={14} color="$textSecondary" marginRight="$2">
              {value}
            </Text>
          )}
          {showArrow && (
            <Text fontSize={16} color="$textSecondary">
              →
            </Text>
          )}
        </>
      )}
    </View>
  );

  if (onPress && !disabled) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }

  return content;
};
