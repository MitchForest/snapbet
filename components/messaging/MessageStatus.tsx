import React from 'react';
import { Text } from '@tamagui/core';
import { MessageStatus as MessageStatusType } from '@/types/messaging';

interface MessageStatusProps {
  status: MessageStatusType;
  color: string;
}

export function MessageStatus({ status, color }: MessageStatusProps) {
  const renderCheckmarks = () => {
    switch (status) {
      case 'sending':
        // Clock icon for sending
        return '⏱';
      case 'sent':
        // Single checkmark
        return '✓';
      case 'delivered':
        // Double checkmark (not filled)
        return '✓✓';
      case 'read':
        // Double checkmark (could be styled differently)
        return '✓✓';
      case 'failed':
        // Error icon
        return '⚠️';
      default:
        return null;
    }
  };

  return (
    <Text
      fontSize="$2"
      color={color}
      fontWeight={status === 'read' ? 'bold' : '400'}
      opacity={status === 'read' ? 1 : 0.7}
    >
      {renderCheckmarks()}
    </Text>
  );
}
