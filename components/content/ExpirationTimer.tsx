import React, { useState, useEffect } from 'react';
import { Text } from '@tamagui/core';
import { Colors } from '@/theme';

interface ExpirationTimerProps {
  expiresAt: string;
}

export function ExpirationTimer({ expiresAt }: ExpirationTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setIsExpired(true);
        setTimeLeft('Expired');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      // Set urgent state when less than 1 hour
      setIsUrgent(hours < 1);

      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days}d`);
      } else if (hours >= 1) {
        setTimeLeft(`${hours}h`);
      } else if (minutes >= 5) {
        setTimeLeft(`${minutes}m`);
      } else {
        // Show exact minutes when less than 5 minutes
        setTimeLeft(`${minutes}m`);
      }
    };

    // Update immediately
    updateTimer();

    // Update every minute for normal times, every 10 seconds when urgent
    const interval = setInterval(updateTimer, isUrgent ? 10000 : 60000);

    return () => clearInterval(interval);
  }, [expiresAt, isUrgent]);

  if (isExpired) {
    return null; // Don't show expired posts
  }

  return (
    <Text
      fontSize="$2"
      color={isUrgent ? Colors.error : '$textSecondary'}
      fontWeight={isUrgent ? '600' : '400'}
    >
      {timeLeft}
    </Text>
  );
}
