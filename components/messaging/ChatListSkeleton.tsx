import React from 'react';
import { View } from '@tamagui/core';
import { Colors } from '@/theme';

export const ChatListSkeleton: React.FC = () => {
  const SkeletonItem = () => (
    <View
      paddingHorizontal="$4"
      paddingVertical="$3"
      flexDirection="row"
      alignItems="center"
      gap="$3"
      borderBottomWidth={1}
      borderBottomColor="$border"
    >
      {/* Avatar skeleton */}
      <View
        width={48}
        height={48}
        borderRadius="$round"
        backgroundColor={Colors.gray[200]}
        opacity={0.7}
      />

      {/* Content skeleton */}
      <View flex={1} gap="$2">
        <View flexDirection="row" justifyContent="space-between" alignItems="center">
          <View
            width="40%"
            height={16}
            backgroundColor={Colors.gray[200]}
            borderRadius="$1"
            opacity={0.7}
          />
          <View
            width={50}
            height={12}
            backgroundColor={Colors.gray[200]}
            borderRadius="$1"
            opacity={0.5}
          />
        </View>
        <View
          width="70%"
          height={14}
          backgroundColor={Colors.gray[200]}
          borderRadius="$1"
          opacity={0.5}
        />
      </View>
    </View>
  );

  return (
    <View flex={1} backgroundColor="$background">
      {Array.from({ length: 8 }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </View>
  );
};
