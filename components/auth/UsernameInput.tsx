import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text } from '@tamagui/core';
import { TextInput, ActivityIndicator } from 'react-native';
import { validateUsername } from '@/utils/validation/username';
import { checkUsernameAvailability } from '@/services/api/checkUsername';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation: (isValid: boolean) => void;
}

export function UsernameInput({ value, onChange, onValidation }: UsernameInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback(
    async (username: string) => {
      // First validate format
      const validation = validateUsername(username);

      if (!validation.valid) {
        setValidationError(validation.error || null);
        setIsAvailable(null);
        onValidation(false);
        return;
      }

      // Format is valid, now check availability
      setValidationError(null);
      setIsChecking(true);

      try {
        const available = await checkUsernameAvailability(username);
        setIsAvailable(available);
        onValidation(available);

        if (!available) {
          setValidationError('Username is already taken');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setValidationError('Unable to check username availability');
        onValidation(false);
      } finally {
        setIsChecking(false);
      }
    },
    [onValidation]
  );

  useEffect(() => {
    // Clear any existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Reset states if empty
    if (!value) {
      setValidationError(null);
      setIsAvailable(null);
      onValidation(false);
      return;
    }

    // Debounce the availability check
    checkTimeoutRef.current = setTimeout(() => {
      checkAvailability(value);
    }, 500);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [value, checkAvailability]);

  const handleChange = (text: string) => {
    // Only allow lowercase letters, numbers, and underscores
    const filtered = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    onChange(filtered);
  };

  return (
    <View gap="$2">
      <View position="relative">
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder="username"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={20}
          style={{
            paddingLeft: 32,
            paddingRight: 40,
            borderColor: validationError ? '#EF4444' : isAvailable ? '#10B981' : '#E5E7EB',
            borderWidth: 1,
            borderRadius: 8,
            height: 48,
            fontSize: 16,
            backgroundColor: 'white',
          }}
        />

        {/* @ Prefix */}
        <Text
          position="absolute"
          left="$3"
          top="50%"
          transform={[{ translateY: -8 }]}
          color="$textSecondary"
          fontSize={16}
        >
          @
        </Text>

        {/* Status indicator */}
        <View position="absolute" right="$3" top="50%" transform={[{ translateY: -12 }]}>
          {isChecking && <ActivityIndicator size="small" color="#059669" />}
          {!isChecking && isAvailable && (
            <Text fontSize={20} color="$success">
              ✓
            </Text>
          )}
          {!isChecking && validationError && (
            <Text fontSize={20} color="$error">
              ✗
            </Text>
          )}
        </View>
      </View>

      {/* Error message */}
      {validationError && (
        <Text fontSize={12} color="$error" marginLeft="$2">
          {validationError}
        </Text>
      )}
    </View>
  );
}
