import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text } from '@tamagui/core';
import { TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { validateUsername } from '@/utils/validation/username';
import { checkUsernameAvailability } from '@/services/api/checkUsername';
import { Colors } from '@/theme';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidation: (isValid: boolean) => void;
}

export function UsernameInput({ value, onChange, onValidation }: UsernameInputProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [hasCheckedAvailability, setHasCheckedAvailability] = useState(false);
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback(
    async (username: string) => {
      // First validate format
      const validation = validateUsername(username);

      if (!validation.valid) {
        setValidationError(validation.error || null);
        setIsAvailable(null);
        setHasCheckedAvailability(false);
        onValidation(false);
        return;
      }

      // Format is valid, now check availability
      setValidationError(null);
      setIsChecking(true);

      try {
        const available = await checkUsernameAvailability(username);
        setIsAvailable(available);
        setHasCheckedAvailability(true);
        onValidation(available);

        if (!available) {
          setValidationError('Username is already taken');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setValidationError('Unable to check username availability');
        setHasCheckedAvailability(true);
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
      setHasCheckedAvailability(false);
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
  }, [value, checkAvailability, onValidation]);

  const handleChange = (text: string) => {
    // Only allow lowercase letters, numbers, and underscores
    const filtered = text.toLowerCase().replace(/[^a-z0-9_]/g, '');
    onChange(filtered);
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Text style={styles.inputPrefix}>@</Text>
        <TextInput
          style={[
            styles.input,
            validationError && styles.inputError,
            isAvailable && styles.inputSuccess,
          ]}
          value={value}
          onChangeText={handleChange}
          placeholder="username"
          placeholderTextColor={Colors.text.tertiary}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="username"
          maxLength={20}
        />
        {isChecking && (
          <ActivityIndicator style={styles.inputIcon} size="small" color={Colors.primaryDark} />
        )}
        {!isChecking && isAvailable && value && (
          <Text style={[styles.inputIcon, styles.checkmark]}>✓</Text>
        )}
      </View>

      {validationError && <Text style={styles.errorText}>{validationError}</Text>}

      {hasCheckedAvailability && !isAvailable && !validationError && value && (
        <Text style={styles.errorText}>Username is already taken</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  inputWrapper: {
    position: 'relative' as const,
  },
  inputPrefix: {
    position: 'absolute' as const,
    left: 16,
    top: 14,
    fontSize: 16,
    color: Colors.text.secondary,
    zIndex: 1,
  },
  input: {
    paddingLeft: 32,
    paddingRight: 40,
    borderColor: Colors.border.default,
    borderWidth: 1,
    borderRadius: 8,
    height: 48,
    fontSize: 16,
    backgroundColor: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputSuccess: {
    borderColor: Colors.success,
  },
  inputIcon: {
    position: 'absolute' as const,
    right: 16,
    top: 14,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.success,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
});
