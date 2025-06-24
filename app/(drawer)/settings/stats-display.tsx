import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Alert, Pressable, StyleSheet } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Colors } from '@/theme';

type PrimaryStat = 'winRate' | 'profit' | 'roi' | 'record' | 'streak';

const STAT_OPTIONS = [
  {
    value: 'record' as PrimaryStat,
    label: 'Win-Loss Record',
    description: 'Show your total wins and losses',
  },
  {
    value: 'winRate' as PrimaryStat,
    label: 'Win Rate',
    description: 'Display your win percentage',
  },
  {
    value: 'profit' as PrimaryStat,
    label: 'Total Profit',
    description: 'Show your all-time profit/loss',
  },
  {
    value: 'roi' as PrimaryStat,
    label: 'Return on Investment',
    description: 'Display your ROI percentage',
  },
  {
    value: 'streak' as PrimaryStat,
    label: 'Current Streak',
    description: 'Show your current win/loss streak',
  },
];

export default function StatsDisplayScreen() {
  const user = useAuthStore((state) => state.user);
  const [primaryStat, setPrimaryStat] = useState<PrimaryStat>('record');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [showBadge, setShowBadge] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user?.id) return;

    const { data } = await supabase
      .from('user_stats_display')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setPrimaryStat(data.primary_stat as PrimaryStat);
      setShowBadge(data.show_badge ?? true);
      setSelectedBadge(data.selected_badge || null);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleStatChange = (stat: PrimaryStat) => {
    setPrimaryStat(stat);
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('user_stats_display')
        .upsert({
          user_id: user.id,
          primary_stat: primaryStat,
          show_badge: showBadge,
          selected_badge: selectedBadge,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving stats display settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const StatOptionCard = ({
    option,
  }: {
    option: { value: PrimaryStat; label: string; description: string };
  }) => (
    <Pressable onPress={() => handleStatChange(option.value)}>
      <View
        backgroundColor="$surface"
        padding="$4"
        borderRadius="$3"
        borderWidth={2}
        borderColor={primaryStat === option.value ? '$primary' : '$border'}
        marginBottom="$3"
      >
        <View flexDirection="row" alignItems="center" gap="$3">
          <Text fontSize={24}>{option.value.toUpperCase()}</Text>
          <View flex={1}>
            <Text fontSize={16} fontWeight="600" color="$textPrimary">
              {option.label}
            </Text>
            <Text fontSize={14} color="$textSecondary" marginTop="$1">
              {option.description}
            </Text>
          </View>
          {primaryStat === option.value && (
            <View
              width={24}
              height={24}
              borderRadius="$round"
              backgroundColor="$primary"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize={14} color="$textInverse">
                ✓
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );

  return (
    <View flex={1} backgroundColor={Colors.background}>
      <ScreenHeader title="Stats Display" />

      <ScrollView>
        <View padding="$4">
          <Text fontSize={14} color="$textSecondary" marginBottom="$3">
            Choose which stat to display next to your username throughout the app
          </Text>

          {STAT_OPTIONS.map((option) => (
            <StatOptionCard key={option.value} option={option} />
          ))}

          <View marginTop="$4">
            <Pressable onPress={() => setShowBadge(!showBadge)}>
              <View
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
                backgroundColor="$surface"
                padding="$4"
                borderRadius="$3"
              >
                <View flex={1}>
                  <Text fontSize={16} fontWeight="600" color="$textPrimary">
                    Show Badge
                  </Text>
                  <Text fontSize={14} color="$textSecondary" marginTop="$1">
                    Display your highest badge next to your name
                  </Text>
                </View>
                <View
                  width={24}
                  height={24}
                  borderRadius="$round"
                  borderWidth={2}
                  borderColor={showBadge ? '$primary' : '$border'}
                  backgroundColor={showBadge ? '$primary' : 'transparent'}
                  justifyContent="center"
                  alignItems="center"
                >
                  {showBadge && (
                    <Text fontSize={14} color="$textInverse">
                      ✓
                    </Text>
                  )}
                </View>
              </View>
            </Pressable>
          </View>

          <Pressable onPress={handleSave} disabled={isSaving} style={styles.saveButton}>
            <View
              backgroundColor="$primary"
              borderRadius="$3"
              paddingVertical="$3"
              alignItems="center"
              opacity={isSaving ? 0.5 : 1}
            >
              <Text fontSize={16} fontWeight="600" color="$textInverse">
                {isSaving ? 'Saving...' : 'Save Preferences'}
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  saveButton: {
    marginTop: 24,
  },
});
