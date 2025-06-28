import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Colors } from '@/theme';
import * as Haptics from 'expo-haptics';

interface StakeInputProps {
  value: number; // in cents
  onChange: (amount: number) => void;
  quickAmounts: number[]; // in dollars
  maxAmount: number; // in cents
}

export function StakeInput({ value, onChange, quickAmounts, maxAmount }: StakeInputProps) {
  const [inputValue, setInputValue] = useState(formatCentsToDisplay(value));

  const handleQuickAmount = async (dollars: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const cents = dollars * 100;
    onChange(cents);
    setInputValue(formatCentsToDisplay(cents));
  };

  const handleMax = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(maxAmount);
    setInputValue(formatCentsToDisplay(maxAmount));
  };

  const handleCustomAmount = (text: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = text.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = cleaned.split('.');
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : cleaned;

    // Limit to 2 decimal places
    const decimalIndex = formatted.indexOf('.');
    const finalValue = decimalIndex !== -1 ? formatted.substring(0, decimalIndex + 3) : formatted;

    setInputValue(finalValue);

    // Convert to cents
    const amount = parseFloat(finalValue || '0');
    if (!isNaN(amount)) {
      onChange(Math.round(amount * 100));
    }
  };

  return (
    <View>
      <Text style={styles.label}>Bet Amount</Text>

      {/* Quick Amounts */}
      <View style={styles.quickAmountsContainer}>
        {quickAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[styles.quickButton, value === amount * 100 && styles.selectedQuickButton]}
            onPress={() => handleQuickAmount(amount)}
          >
            <Text
              style={[
                styles.quickButtonText,
                value === amount * 100 && styles.quickButtonTextSelected,
              ]}
            >
              ${amount}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.quickButton,
            styles.maxButton,
            value === maxAmount && styles.selectedQuickButton,
          ]}
          onPress={handleMax}
        >
          <Text
            style={[
              styles.quickButtonText,
              styles.maxButtonText,
              value === maxAmount && styles.quickButtonTextSelected,
            ]}
          >
            MAX
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.dollarSign}>$</Text>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleCustomAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={Colors.text.tertiary}
          maxLength={10}
        />
      </View>

      {/* Min/Max Info */}
      <View style={styles.minMaxContainer}>
        <Text style={styles.minMaxText}>Min: $5</Text>
        <Text style={styles.minMaxText}>Max: ${(maxAmount / 100).toFixed(2)}</Text>
      </View>
    </View>
  );
}

// Helper functions
function formatCentsToDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border.default,
    alignItems: 'center',
  },
  selectedQuickButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  maxButton: {
    borderColor: Colors.primary,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  quickButtonTextSelected: {
    color: Colors.white,
  },
  maxButtonText: {
    color: Colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border.default,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: Colors.text.primary,
    padding: 0,
  },
  dollarSign: {
    fontSize: 20,
    color: Colors.text.primary,
    marginRight: 8,
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  minMaxText: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },
});
