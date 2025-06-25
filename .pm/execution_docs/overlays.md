// ========================================
// SNAPBET CAMERA OVERLAY SYSTEM
// ========================================
// This implements the bet and outcome overlay cards that appear
// over the camera view with user-selected emoji effects
//
// Features:
// - Bet Card: Shows teams, game time, score, bet type, odds, pick
// - Outcome Card: Same as bet + win/loss result + profit/loss
// - Works with existing emoji effects system
// - Clean, minimal design for readability
// - Integrated with Tamagui design system
// - Context-aware defaults based on entry point
// - Smooth animations and transitions
// ========================================

// ========================================
// File: components/overlays/types.ts
// ========================================

import type { Game, Bet, Team } from '@/types/database';

// Extend existing types for UI-specific needs
export interface BetWithGame extends Bet {
  game: Game & {
    home_team: Team;
    away_team: Team;
  };
}

export interface BetOutcome extends BetWithGame {
  result: 'win' | 'loss' | 'push';
  profit: number;
}

// UI-specific types
export type OverlayTheme = 'dark' | 'light';
export type OverlayType = 'bet' | 'outcome' | null;

// ========================================
// File: components/overlays/BetOverlay.tsx
// ========================================

import React, { useEffect } from 'react';
import { YStack, XStack, Text, View, Image } from '@tamagui/core';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn, 
  SlideInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import type { BetWithGame, OverlayTheme } from './types';
import { formatOdds, formatGameTime, formatBetType } from '@/utils/betting';
import { Colors } from '@/theme';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedView = Animated.createAnimatedComponent(View);

interface BetOverlayProps {
  bet: BetWithGame;
  isVisible: boolean;
  theme?: OverlayTheme;
}

const LiveIndicator: React.FC = () => {
  const opacity = useSharedValue(1);
  
  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 1000 }),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));
  
  return (
    <XStack ai="center" gap="$2">
      <AnimatedView 
        style={animatedStyle}
        w={8} 
        h={8} 
        br={4} 
        bg="$red10" 
      />
      <Text color="$red10" fontSize="$1" fontWeight="700" letterSpacing={0.5}>
        LIVE
      </Text>
    </XStack>
  );
};

const TeamDisplay: React.FC<{
  team: Team;
  score?: number;
  isHome?: boolean;
}> = ({ team, score, isHome }) => (
  <YStack ai="center" f={1}>
    {team.logo_url && (
      <Image 
        source={{ uri: team.logo_url }} 
        w={40}
        h={40}
        mb="$2"
        br="$2"
      />
    )}
    <Text color="white" fontSize="$7" fontWeight="700">
      {team.abbreviation}
    </Text>
    {score !== undefined && (
      <Text color="white" fontSize="$8" fontWeight="800">
        {score}
      </Text>
    )}
  </YStack>
);

export const BetOverlay: React.FC<BetOverlayProps> = ({ 
  bet, 
  isVisible,
  theme = 'dark' 
}) => {
  if (!isVisible) return null;

  const isLive = bet.game.status === 'live';
  const gameTime = formatGameTime(bet.game);

  return (
    <BlurView 
      intensity={theme === 'dark' ? 80 : 60} 
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        margin: 20,
      }}
    >
      <AnimatedYStack
        entering={SlideInDown.springify()}
        exiting={FadeOut}
        bg="$backgroundTranslucent"
        p="$4"
      >
        {/* Game Status Bar */}
        <XStack jc="space-between" ai="center" mb="$3">
          {isLive ? (
            <LiveIndicator />
          ) : (
            <View />
          )}
          <Text color="$textSecondary" fontSize="$1" fontWeight="600">
            {gameTime}
          </Text>
        </XStack>

        {/* Teams Row */}
        <XStack jc="center" ai="center" mb="$4" gap="$4">
          <TeamDisplay 
            team={bet.game.away_team} 
            score={isLive ? bet.game.away_score : undefined}
          />
          
          <Text color="$textSecondary" fontSize="$4">@</Text>
          
          <TeamDisplay 
            team={bet.game.home_team} 
            score={isLive ? bet.game.home_score : undefined}
            isHome
          />
        </XStack>

        {/* Bet Details */}
        <YStack
          borderTopWidth={1}
          borderColor="$borderColorSubtle"
          pt="$3"
          ai="center"
        >
          <Text 
            color="$textSecondary" 
            fontSize="$1" 
            fontWeight="600"
            letterSpacing={1}
            mb="$2"
          >
            {formatBetType(bet.bet_type).toUpperCase()}
          </Text>
          
          <XStack ai="center" gap="$3">
            <Text color="white" fontSize="$5" fontWeight="600">
              {bet.selection}
            </Text>
            <Text color="$green10" fontSize="$5" fontWeight="700">
              {formatOdds(bet.odds)}
            </Text>
          </XStack>
        </YStack>
      </AnimatedYStack>
    </BlurView>
  );
};

// ========================================
// File: components/overlays/OutcomeOverlay.tsx
// ========================================

import React from 'react';
import { YStack, XStack, Text, View, Image } from '@tamagui/core';
import { BlurView } from 'expo-blur';
import Animated, { 
  SlideInDown,
  FadeOut,
  ZoomIn
} from 'react-native-reanimated';
import type { BetOutcome, OverlayTheme } from './types';
import { formatOdds, formatBetType } from '@/utils/betting';
import { Colors } from '@/theme';

const AnimatedYStack = Animated.createAnimatedComponent(YStack);
const AnimatedText = Animated.createAnimatedComponent(Text);

interface OutcomeOverlayProps {
  outcome: BetOutcome;
  showProfit?: boolean;
  isVisible: boolean;
  theme?: OverlayTheme;
}

const PayoutDisplay: React.FC<{
  stake: number;
  profit: number;
  result: 'win' | 'loss' | 'push';
}> = ({ stake, profit, result }) => {
  if (result === 'push') {
    return (
      <Text color="$yellow10" fontSize="$5" fontWeight="700">
        Push - ${stake.toFixed(2)} returned
      </Text>
    );
  }
  
  const total = result === 'win' ? stake + profit : 0;
  
  return (
    <YStack ai="center">
      <AnimatedText
        entering={ZoomIn.delay(300)}
        color={result === 'win' ? '$green10' : '$red10'} 
        fontSize="$6"
        fontWeight="700"
      >
        {result === 'win' ? `+$${profit.toFixed(2)}` : `-$${stake.toFixed(2)}`}
      </AnimatedText>
      {result === 'win' && (
        <Text color="$textSecondary" fontSize="$3">
          Total: ${total.toFixed(2)}
        </Text>
      )}
    </YStack>
  );
};

const TeamResultDisplay: React.FC<{
  team: Team;
  score: number;
  isWinner: boolean;
}> = ({ team, score, isWinner }) => (
  <XStack jc="space-between" ai="center" mb="$2">
    <XStack ai="center" gap="$2" f={1}>
      {team.logo_url && (
        <Image 
          source={{ uri: team.logo_url }} 
          w={24}
          h={24}
          br="$1"
        />
      )}
      <Text 
        color="white" 
        fontSize="$5" 
        fontWeight="600"
        opacity={isWinner ? 1 : 0.7}
      >
        {team.abbreviation}
      </Text>
    </XStack>
    <Text 
      color={isWinner ? 'white' : '$textSecondary'} 
      fontSize="$6" 
      fontWeight="700"
    >
      {score}
    </Text>
  </XStack>
);

export const OutcomeOverlay: React.FC<OutcomeOverlayProps> = ({ 
  outcome,
  showProfit = true,
  isVisible,
  theme = 'dark'
}) => {
  if (!isVisible) return null;

  const isWin = outcome.result === 'win';
  const isPush = outcome.result === 'push';
  const isHomeWinner = (outcome.game.home_score || 0) > (outcome.game.away_score || 0);
  
  const getResultColor = (): string => {
    if (isWin) return Colors.success;
    if (isPush) return Colors.warning;
    return Colors.error;
  };

  const getResultText = (): string => {
    if (isWin) return 'WIN';
    if (isPush) return 'PUSH';
    return 'LOSS';
  };

  const getResultEmoji = (): string => {
    if (isWin) return '✅';
    if (isPush) return '🤝';
    return '❌';
  };

  return (
    <BlurView 
      intensity={theme === 'dark' ? 80 : 60} 
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        margin: 20,
      }}
    >
      <AnimatedYStack
        entering={SlideInDown.springify()}
        exiting={FadeOut}
        bg="$backgroundTranslucent"
        overflow="hidden"
      >
        {/* Result Banner */}
        <XStack 
          bg={getResultColor()} 
          ai="center" 
          jc="center"
          py="$3"
          px="$4"
          gap="$2"
        >
          <Text fontSize="$6">{getResultEmoji()}</Text>
          <Text color="white" fontSize="$6" fontWeight="800" letterSpacing={1}>
            {getResultText()}
          </Text>
          {showProfit && !isPush && (
            <PayoutDisplay
              stake={outcome.stake}
              profit={outcome.profit}
              result={outcome.result}
            />
          )}
        </XStack>

        {/* Teams and Final Score */}
        <YStack p="$4" pb="$3">
          <TeamResultDisplay
            team={outcome.game.away_team}
            score={outcome.game.away_score || 0}
            isWinner={!isHomeWinner}
          />
          <TeamResultDisplay
            team={outcome.game.home_team}
            score={outcome.game.home_score || 0}
            isWinner={isHomeWinner}
          />
        </YStack>

        {/* Bet Details */}
        <YStack
          borderTopWidth={1}
          borderColor="$borderColorSubtle"
          py="$3"
          px="$4"
          ai="center"
        >
          <Text color="$textSecondary" fontSize="$3" mb="$1">
            {outcome.selection} {formatOdds(outcome.odds)}
          </Text>
          <Text color="$textSecondary" fontSize="$2">
            Bet: ${outcome.stake.toFixed(2)}
          </Text>
        </YStack>
      </AnimatedYStack>
    </BlurView>
  );
};

// ========================================
// File: hooks/useCameraContext.ts
// ========================================

import { useRoute } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { betService } from '@/services/betting/betService';

export function useCameraContext() {
  const route = useRoute();
  const { betId, source } = route.params || {};
  
  // Fetch bet if coming from bet history
  const { data: bet } = useQuery({
    queryKey: ['bet', betId],
    queryFn: () => betService.getBetWithGame(betId),
    enabled: !!betId && source === 'bet-history',
  });
  
  return {
    activeBet: source === 'bet-placement' ? route.params.bet : null,
    settledBet: source === 'bet-history' ? bet : null,
    defaultOverlay: source === 'bet-placement' ? 'bet' : 
                   source === 'bet-history' ? 'outcome' : null,
    source,
  };
}

// ========================================
// File: components/camera/CameraView.tsx (Updated)
// ========================================

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import { captureRef } from 'react-native-view-shot';
import { YStack, XStack, Button, Text } from '@tamagui/core';
import { EmojiEffectsManager } from '../effects/EmojiEffectsManager';
import { EffectSelector } from '../effects/EffectSelector';
import { BetOverlay } from '../overlays/BetOverlay';
import { OutcomeOverlay } from '../overlays/OutcomeOverlay';
import { useCameraContext } from '@/hooks/useCameraContext';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/theme';
import type { OverlayType } from '../overlays/types';

export const CameraScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedEffect, setSelectedEffect] = useState<string | null>(null);
  const [overlayType, setOverlayType] = useState<OverlayType>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const cameraRef = useRef<Camera | null>(null);
  const captureViewRef = useRef<View>(null);
  
  const { user } = useAuth();
  const { activeBet, settledBet, defaultOverlay, source } = useCameraContext();
  
  // Auto-select overlay based on context
  useEffect(() => {
    if (defaultOverlay) {
      setOverlayType(defaultOverlay);
    }
  }, [defaultOverlay]);

  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleEffectSelect = (effectId: string | null) => {
    setSelectedEffect(effectId);
  };

  const handleEffectComplete = () => {
    // Only clear if it's a one-time effect
    // This will be determined by the effect config
  };

  const capturePhoto = async () => {
    if (captureViewRef.current) {
      try {
        const uri = await captureRef(captureViewRef.current, {
          format: 'png',
          quality: 1,
        });
        
        // Navigate to share screen with captured media
        // Including effect and overlay metadata
        navigation.navigate('SharePost', {
          mediaUri: uri,
          mediaType: 'photo',
          effectUsed: selectedEffect,
          overlayType,
          betId: activeBet?.id || settledBet?.id,
          postType: overlayType ? (overlayType === 'bet' ? 'pick' : 'outcome') : 'content',
        });
      } catch (error) {
        console.error('Failed to capture:', error);
      }
    }
  };

  const toggleRecording = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync({
        maxDuration: 30,
      });
      
      // Navigate to share screen with video
      navigation.navigate('SharePost', {
        mediaUri: video.uri,
        mediaType: 'video',
        effectUsed: selectedEffect,
        overlayType,
        betId: activeBet?.id || settledBet?.id,
        postType: overlayType ? (overlayType === 'bet' ? 'pick' : 'outcome') : 'content',
      });
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  if (hasPermission === false) {
    return (
      <YStack f={1} jc="center" ai="center" bg="black">
        <Text color="white" fontSize="$4">No access to camera</Text>
      </YStack>
    );
  }

  // Check if user has required badges for selected effect
  const isEffectUnlocked = selectedEffect ? 
    isEffectUnlockedForUser(selectedEffect, user?.user_metadata?.badges || []) : 
    true;

  const canCapture = !selectedEffect || isEffectUnlocked;
  const showBetOverlay = !!activeBet || !!settledBet;
  const showOutcomeOverlay = !!settledBet;

  return (
    <View style={styles.container}>
      <View ref={captureViewRef} style={StyleSheet.absoluteFillObject}>
        {/* Camera */}
        <CameraView 
          style={StyleSheet.absoluteFillObject}
          ref={(ref) => (cameraRef.current = ref)}
        />
        
        {/* Effects Layer */}
        {selectedEffect && (
          <EmojiEffectsManager
            effectId={selectedEffect}
            onComplete={handleEffectComplete}
          />
        )}
        
        {/* Overlay Layer */}
        <View style={styles.overlayContainer} pointerEvents="none">
          {activeBet && (
            <BetOverlay 
              bet={activeBet} 
              isVisible={overlayType === 'bet'}
            />
          )}
          
          {settledBet && (
            <OutcomeOverlay 
              outcome={settledBet} 
              showProfit={true}
              isVisible={overlayType === 'outcome'}
            />
          )}
        </View>
      </View>

      {/* Controls */}
      <SafeAreaView style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
        {/* Overlay Toggle - Only show if we have bet data */}
        {(showBetOverlay || showOutcomeOverlay) && (
          <XStack 
            position="absolute" 
            top={60} 
            alignSelf="center" 
            gap="$2"
          >
            {showBetOverlay && (
              <Button
                size="$3"
                bg={overlayType === 'bet' ? '$primary' : '$backgroundTranslucent'}
                borderWidth={1}
                borderColor={overlayType === 'bet' ? '$primary' : '$borderColorSubtle'}
                onPress={() => setOverlayType(overlayType === 'bet' ? null : 'bet')}
                pressStyle={{ scale: 0.95 }}
                animation="quick"
                accessibilityLabel="Show bet details overlay"
                accessibilityRole="button"
                accessibilityState={{ selected: overlayType === 'bet' }}
              >
                <Text 
                  color={overlayType === 'bet' ? 'white' : '$text'}
                  fontSize="$3"
                  fontWeight="700"
                >
                  BET
                </Text>
              </Button>
            )}
            
            {showOutcomeOverlay && (
              <Button
                size="$3"
                bg={overlayType === 'outcome' ? 
                  (settledBet?.result === 'win' ? '$green10' : '$red10') : 
                  '$backgroundTranslucent'
                }
                borderWidth={1}
                borderColor={overlayType === 'outcome' ? 
                  (settledBet?.result === 'win' ? '$green10' : '$red10') : 
                  '$borderColorSubtle'
                }
                onPress={() => setOverlayType(overlayType === 'outcome' ? null : 'outcome')}
                pressStyle={{ scale: 0.95 }}
                animation="quick"
                accessibilityLabel="Show bet outcome overlay"
                accessibilityRole="button"
                accessibilityState={{ selected: overlayType === 'outcome' }}
              >
                <Text 
                  color={overlayType === 'outcome' ? 'white' : '$text'}
                  fontSize="$3"
                  fontWeight="700"
                >
                  {settledBet?.result === 'win' ? 'WIN 🎉' : 'RESULT'}
                </Text>
              </Button>
            )}
          </XStack>
        )}
        
        {/* Camera Controls */}
        <View style={styles.controls}>
          {/* Capture hint for locked effects */}
          {selectedEffect && !isEffectUnlocked && (
            <YStack mb="$4" px="$4" py="$2" bg="$backgroundTranslucent" br="$4">
              <Text color="$textSecondary" fontSize="$2" textAlign="center">
                Unlock this effect to capture
              </Text>
            </YStack>
          )}
          
          <TouchableOpacity 
            style={[
              styles.captureButton,
              isRecording && styles.recordingButton,
              !canCapture && styles.disabledButton,
            ]} 
            onPress={capturePhoto}
            onLongPress={toggleRecording}
            disabled={!canCapture}
            accessibilityLabel="Capture photo or hold to record video"
            accessibilityRole="button"
          >
            <View style={[
              styles.captureInner,
              isRecording && styles.recordingInner,
            ]} />
          </TouchableOpacity>
        </View>
        
        {/* Effect Selector */}
        <EffectSelector
          activeEffectId={selectedEffect}
          onSelectEffect={handleEffectSelect}
          userBadges={user?.user_metadata?.badges || []}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
  },
  disabledButton: {
    opacity: 0.5,
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
  recordingInner: {
    borderRadius: 8,
    backgroundColor: '#FF0000',
  },
});

// ========================================
// File: utils/betting.ts (Helper functions)
// ========================================

export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function formatBetType(type: string): string {
  const typeMap: Record<string, string> = {
    'moneyline': 'ML',
    'spread': 'SPREAD', 
    'total': 'TOTAL',
    'over_under': 'TOTAL',
    'prop': 'PROP',
  };
  return typeMap[type] || type.toUpperCase();
}

export function formatGameTime(game: Game): string {
  if (game.status === 'scheduled' && game.start_time) {
    const start = new Date(game.start_time);
    const now = new Date();
    const diffMinutes = Math.floor((start.getTime() - now.getTime()) / 60000);
    
    if (diffMinutes < 0) {
      return 'Starting soon';
    } else if (diffMinutes < 60) {
      return `Starts in ${diffMinutes}m`;
    } else {
      return start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
  }
  
  if (game.status === 'live') {
    if (game.game_time === 'Final') {
      return 'FINAL';
    }
    return game.game_time || 'LIVE';
  }
  
  if (game.status === 'final') {
    return 'FINAL';
  }
  
  return '';
}

// ========================================
// Example Usage
// ========================================

/*
// Entry from bet placement flow:
navigation.navigate('Camera', {
  source: 'bet-placement',
  bet: {
    id: 'temp-123',
    game: currentGame,
    bet_type: 'spread',
    selection: 'LAL -5.5',
    odds: -110,
    stake: 100,
    // ... other bet details
  }
});

// Entry from bet history:
navigation.navigate('Camera', {
  source: 'bet-history',
  betId: 'bet-456',
});

// Entry from camera tab (no bet context):
navigation.navigate('Camera', {
  source: 'camera-tab',
});
*/