import React, { useState, useEffect } from 'react';
import { Text } from '@tamagui/core';
import { differenceInHours, differenceInMinutes } from 'date-fns';

interface ExpirationTimerProps {
  expiresAt: string;
  color?: string;
}

export function ExpirationTimer({ expiresAt, color = '#666' }: ExpirationTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expiry = new Date(expiresAt);

      if (expiry <= now) {
        setTimeLeft('Expired');
        return;
      }

      const hoursLeft = differenceInHours(expiry, now);
      const minutesLeft = differenceInMinutes(expiry, now) % 60;

      if (hoursLeft > 0) {
        setTimeLeft(`${hoursLeft}h left`);
      } else if (minutesLeft > 0) {
        setTimeLeft(`${minutesLeft}m left`);
      } else {
        setTimeLeft('<1m left');
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every minute
    const interval = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (!timeLeft || timeLeft === 'Expired') {
    return null;
  }

  return (
    <Text fontSize="$2" color={color} opacity={0.8}>
      • {timeLeft}
    </Text>
  );
}
