import React from 'react';
import { View } from '@tamagui/core';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export function Logo({ size = 80 }: LogoProps) {
  return (
    <View width={size} height={size}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Circle cx="40" cy="40" r="40" fill="#059669" />
        <SvgText
          x="40"
          y="40"
          fontSize="32"
          fontWeight="bold"
          fill="white"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          SB
        </SvgText>
      </Svg>
    </View>
  );
}
