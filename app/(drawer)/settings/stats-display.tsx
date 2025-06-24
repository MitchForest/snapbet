import React, { useState, useEffect } from 'react';
import { View, Text } from '@tamagui/core';
import { ScrollView, Alert } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/services/supabase/client';
import { SettingsRow } from '@/components/settings/SettingsRow';
import { BADGES } from '@/data/badges';

type PrimaryStat = 'winRate' | 'profit' | 'roi' | 'record' | 'streak';

const STAT_OPTIONS: { value: PrimaryStat; label: string; description: string }[] = [
  { value: 'winRate', label: 'Win Rate', description: 'Show your win percentage' },
  { value: 'profit', label: 'Profit', description: 'Show your total profit/loss' },
  { value: 'roi', label: 'ROI', description: 'Show your return on investment' },
  { value: 'record', label: 'Record', description: 'Show your W-L record' },
  { value: 'streak', label: 'Streak', description: 'Show your current streak' },
];

export default function StatsDisplayScreen() {
  const { user } = useAuthStore();
  const [primaryStat, setPrimaryStat] = useState<PrimaryStat>('record');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [userBadges, setUserBadges] = useState<string[]>([]);

  useEffect(() => {
    fetchUserStatsDisplay();
    fetchUserBadges();
  }, [user?.id]);

  const fetchUserStatsDisplay = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await (supabase as any)
        .from('user_stats_display')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setPrimaryStat(data.primary_stat as PrimaryStat);
        setSelectedBadge(data.selected_badge);
      }
    } catch (error) {
      console.error('Error fetching stats display settings:', error);
    }
  };

  const fetchUserBadges = async () => {
    if (!user?.id) return;

    try {
      const { calculateUserBadges } = await import('@/services/badges/badgeService');
      const badges = await calculateUserBadges(user.id);
      setUserBadges(badges);
    } catch (error) {
      console.error('Error fetching user badges:', error);
    }
  };

  const handleStatChange = async (stat: PrimaryStat) => {
    setPrimaryStat(stat);
    await saveSettings(stat, selectedBadge);
  };

  const handleBadgeChange = async (badgeId: string | null) => {
    setSelectedBadge(badgeId);
    await saveSettings(primaryStat, badgeId);
  };

  const saveSettings = async (stat: PrimaryStat, badge: string | null) => {
    if (!user?.id) return;

    try {
      const { error } = await (supabase as any).from('user_stats_display').upsert({
        user_id: user.id,
        primary_stat: stat,
        selected_badge: badge,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        Alert.alert('Error', 'Failed to update stats display settings');
      }
    } catch {
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <View flex={1} backgroundColor="$background">
      <ScrollView>
        {/* Primary Stat Selection */}
        <View marginTop="$3">
          <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            PRIMARY STAT
          </Text>
          <Text fontSize={14} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
            This stat will be shown next to your username throughout the app
          </Text>

          {STAT_OPTIONS.map((option) => (
            <SettingsRow
              key={option.value}
              label={option.label}
              subtitle={option.description}
              onPress={() => handleStatChange(option.value)}
              customRight={
                <View
                  width={20}
                  height={20}
                  borderRadius="$round"
                  borderWidth={2}
                  borderColor={primaryStat === option.value ? '$primary' : '$divider'}
                  backgroundColor={primaryStat === option.value ? '$primary' : 'transparent'}
                  justifyContent="center"
                  alignItems="center"
                >
                  {primaryStat === option.value && (
                    <View
                      width={8}
                      height={8}
                      borderRadius="$round"
                      backgroundColor="$textInverse"
                    />
                  )}
                </View>
              }
            />
          ))}
        </View>

        {/* Badge Selection */}
        {userBadges.length > 0 && (
          <View marginTop="$6" marginBottom="$6">
            <Text fontSize={12} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
              PRIMARY BADGE
            </Text>
            <Text fontSize={14} color="$textSecondary" paddingHorizontal="$4" marginBottom="$2">
              Choose which badge to display in the feed (auto-selects highest priority by default)
            </Text>

            <SettingsRow
              label="Automatic"
              subtitle="Always show your highest priority badge"
              onPress={() => handleBadgeChange(null)}
              customRight={
                <View
                  width={20}
                  height={20}
                  borderRadius="$round"
                  borderWidth={2}
                  borderColor={selectedBadge === null ? '$primary' : '$divider'}
                  backgroundColor={selectedBadge === null ? '$primary' : 'transparent'}
                  justifyContent="center"
                  alignItems="center"
                >
                  {selectedBadge === null && (
                    <View
                      width={8}
                      height={8}
                      borderRadius="$round"
                      backgroundColor="$textInverse"
                    />
                  )}
                </View>
              }
            />

            {userBadges.map((badgeId) => {
              const badge = BADGES[badgeId.toUpperCase()];
              if (!badge) return null;

              return (
                <SettingsRow
                  key={badgeId}
                  icon={badge.emoji}
                  label={badge.name}
                  subtitle={badge.description}
                  onPress={() => handleBadgeChange(badgeId)}
                  customRight={
                    <View
                      width={20}
                      height={20}
                      borderRadius="$round"
                      borderWidth={2}
                      borderColor={selectedBadge === badgeId ? '$primary' : '$divider'}
                      backgroundColor={selectedBadge === badgeId ? '$primary' : 'transparent'}
                      justifyContent="center"
                      alignItems="center"
                    >
                      {selectedBadge === badgeId && (
                        <View
                          width={8}
                          height={8}
                          borderRadius="$round"
                          backgroundColor="$textInverse"
                        />
                      )}
                    </View>
                  }
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
