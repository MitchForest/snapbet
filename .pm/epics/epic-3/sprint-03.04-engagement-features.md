# Sprint 03.04: Engagement Features Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Add complete engagement features including emoji reactions, view tracking, share functionality, tail/fade mechanics with confirmation flows, and notification triggers, creating a fully interactive social experience.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Full social interactions on shared picks
- Enables Story 2: Tail/Fade Decisions - Complete tail/fade implementation with UI
- Enables Story 5: Performance Tracking - Track influence through tails/fades

## Sprint Plan

### Objectives
1. Implement emoji reaction system with 6 reaction types
2. Create tail/fade confirmation flows with bottom sheets
3. Add view count tracking for posts
4. Implement share to story functionality
5. Create optimistic updates for all interactions
6. Integrate with Epic 2's notification service
7. Add reaction picker UI and animations

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `components/engagement/ReactionPicker.tsx` | Emoji reaction selector sheet | NOT STARTED |
| `components/engagement/ReactionButton.tsx` | Reaction button with animation | NOT STARTED |
| `components/engagement/TailConfirmation.tsx` | Tail confirmation bottom sheet | NOT STARTED |
| `components/engagement/FadeConfirmation.tsx` | Fade confirmation bottom sheet | NOT STARTED |
| `components/engagement/ShareSheet.tsx` | Share options bottom sheet | NOT STARTED |
| `components/engagement/ReactionList.tsx` | List of reactions on a post | NOT STARTED |
| `hooks/usePostInteractions.ts` | Post interaction logic | NOT STARTED |
| `hooks/useTailFade.ts` | Tail/fade specific logic | NOT STARTED |
| `services/engagement/reactionService.ts` | Reaction CRUD operations | NOT STARTED |
| `services/engagement/tailFadeService.ts` | Tail/fade operations | NOT STARTED |
| `utils/engagement/helpers.ts` | Engagement utility functions | NOT STARTED |
| `types/engagement.ts` | TypeScript types for engagement | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `components/feed/PostCard/PostActions.tsx` | Integrate new engagement components | NOT STARTED |
| `services/notifications/notificationService.ts` | Add engagement notifications | NOT STARTED |
| `package.json` | Add bottom sheet dependency | NOT STARTED |
| `hooks/usePostActions.ts` | Enhance with new features | NOT STARTED |

### Implementation Approach

#### 1. Dependencies Installation
```bash
# Bottom sheet for confirmations
bun add @gorhom/bottom-sheet@~4.5.1

# Haptic feedback
bun add expo-haptics@~12.8.0

# Toast notifications
bun add @tamagui/toast@~1.79.0
```

#### 2. Reaction System Design
```
Available Reactions:
🔥 Fire - "This is hot!"
💯 100 - "Perfect pick!"
😬 Nervous - "Risky..."
💰 Money - "Cash it!"
🎯 Target - "Nailed it!"
🤝 Handshake - "I'm with you!"

Reaction Rules:
- One reaction per user per post
- Tap to add/change reaction
- Long press to see who reacted
- Optimistic updates
- Real-time sync
```

#### 3. Tail/Fade Confirmation UI
```
Tail Confirmation:
┌─────────────────────────────────┐
│ ━━━━━                           │
│ Tail @mikebets' pick?          │
├─────────────────────────────────┤
│ Lakers -5.5 (-110)              │
│ Bet: $50 → Win: $45.45          │
│                                 │
│ You'll bet the same pick and    │
│ track results together          │
├─────────────────────────────────┤
│ [Confirm Tail - $50]            │
│ [Cancel]                        │
└─────────────────────────────────┘

Fade Confirmation:
┌─────────────────────────────────┐
│ ━━━━━                           │
│ Fade @mikebets' pick?          │
├─────────────────────────────────┤
│ Their pick: Lakers -5.5         │
│ Your fade: Celtics +5.5         │
│ Bet: $50 → Win: $45.45          │
│                                 │
│ ⚠️ You're betting AGAINST Mike  │
├─────────────────────────────────┤
│ [Confirm Fade - $50]            │
│ [Cancel]                        │
└─────────────────────────────────┘
```

#### 4. Share Functionality
```
Share Sheet:
┌─────────────────────────────────┐
│ ━━━━━                           │
│ Share Post                      │
├─────────────────────────────────┤
│ 📸 Add to Your Story            │
│ 💬 Send in Message              │
│ 🔗 Copy Link (Future)           │
│ 📱 Share Externally (Future)    │
└─────────────────────────────────┘
```

**Key Technical Decisions**:
- 6 emoji reactions only (keep it simple)
- Optimistic updates for instant feedback
- Haptic feedback on all interactions
- Toast notifications for confirmations
- Bottom sheets for all confirmations
- View counts increment on mount
- No comment system (by design)

### Dependencies & Risks
**Dependencies**:
- Posts from Sprint 03.02
- Notification service from Epic 2
- Betting system tables from Epic 1
- User authentication

**Identified Risks**:
- Race conditions with optimistic updates: Mitigation - Proper rollback logic
- Notification spam: Mitigation - Debounce and batch
- Bottom sheet performance: Mitigation - Lazy load content

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates
[To be filled during implementation]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: 0 errors, 0 warnings

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: 0 errors

**Interaction Testing**:
- [ ] All haptics work
- [ ] Optimistic updates smooth
- [ ] No double-tap issues

## Key Code Additions

### Reaction Picker Component
```typescript
// components/engagement/ReactionPicker.tsx
import React, { useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { XStack, YStack } from '@tamagui/core';
import { Colors } from '@/theme';

const REACTIONS = [
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💯', label: 'Perfect' },
  { emoji: '😬', label: 'Nervous' },
  { emoji: '💰', label: 'Money' },
  { emoji: '🎯', label: 'Target' },
  { emoji: '🤝', label: 'Together' },
];

interface ReactionPickerProps {
  isVisible: boolean;
  currentReaction?: string;
  onSelectReaction: (emoji: string) => void;
  onClose: () => void;
}

export function ReactionPicker({ 
  isVisible, 
  currentReaction, 
  onSelectReaction, 
  onClose 
}: ReactionPickerProps) {
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const handleReactionSelect = useCallback((emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectReaction(emoji);
    onClose();
  }, [onSelectReaction, onClose]);
  
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );
  
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isVisible ? 0 : -1}
      snapPoints={[200]}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.surface }}
      handleIndicatorStyle={{ backgroundColor: Colors.border }}
    >
      <YStack p="$4">
        <Text style={styles.title}>Choose Reaction</Text>
        <XStack flexWrap="wrap" jc="space-around" mt="$4">
          {REACTIONS.map(({ emoji, label }) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => handleReactionSelect(emoji)}
              style={[
                styles.reactionButton,
                currentReaction === emoji && styles.selectedReaction,
              ]}
            >
              <Text style={styles.emoji}>{emoji}</Text>
              <Text style={styles.label}>{label}</Text>
            </TouchableOpacity>
          ))}
        </XStack>
      </YStack>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.text,
  },
  reactionButton: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
    marginBottom: 8,
  },
  selectedReaction: {
    backgroundColor: Colors.primaryLight,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
```

### Tail Confirmation Component
```typescript
// components/engagement/TailConfirmation.tsx
import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { YStack, XStack, Button } from '@tamagui/core';
import * as Haptics from 'expo-haptics';
import { formatOdds, formatMoney, calculatePayout } from '@/utils/betting';
import { Colors } from '@/theme';
import { useTailFade } from '@/hooks/useTailFade';

interface TailConfirmationProps {
  isVisible: boolean;
  post: any;
  bet: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function TailConfirmation({ 
  isVisible, 
  post, 
  bet, 
  onClose,
  onSuccess 
}: TailConfirmationProps) {
  const { tailBet, isLoading } = useTailFade();
  
  const handleConfirm = useCallback(async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      await tailBet({
        originalBetId: bet.id,
        postId: post.id,
        amount: bet.amount,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Show error toast
    }
  }, [bet, post, tailBet, onSuccess, onClose]);
  
  const payout = calculatePayout(bet.amount, bet.odds);
  
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );
  
  return (
    <BottomSheet
      index={isVisible ? 0 : -1}
      snapPoints={[320]}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.surface }}
      handleIndicatorStyle={{ backgroundColor: Colors.border }}
    >
      <YStack p="$4" gap="$4">
        {/* Header */}
        <YStack ai="center">
          <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.text }}>
            Tail @{post.user.username}'s pick?
          </Text>
        </YStack>
        
        {/* Bet Details */}
        <YStack
          bg={Colors.surfaceAlt}
          p="$3"
          br="$3"
          gap="$2"
        >
          <Text style={{ fontSize: 16, fontWeight: '500', color: Colors.text }}>
            {bet.game.away_team} @ {bet.game.home_team}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.primary }}>
            {bet.selection} {formatOdds(bet.odds)}
          </Text>
          <XStack jc="space-between">
            <Text style={{ color: Colors.textSecondary }}>
              Bet: {formatMoney(bet.amount)}
            </Text>
            <Text style={{ color: Colors.textSecondary }}>
              To Win: {formatMoney(payout.toWin)}
            </Text>
          </XStack>
        </YStack>
        
        {/* Info Text */}
        <Text style={{ 
          textAlign: 'center', 
          color: Colors.textSecondary,
          fontSize: 14,
        }}>
          You'll bet the same pick and track results together
        </Text>
        
        {/* Actions */}
        <YStack gap="$2">
          <Button
            size="$4"
            bg={Colors.tail}
            onPress={handleConfirm}
            disabled={isLoading}
            pressStyle={{ opacity: 0.8 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Confirm Tail • {formatMoney(bet.amount)}
              </Text>
            )}
          </Button>
          
          <Button
            size="$4"
            bg="transparent"
            borderWidth={1}
            borderColor={Colors.border}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={{ color: Colors.text, fontSize: 16 }}>
              Cancel
            </Text>
          </Button>
        </YStack>
      </YStack>
    </BottomSheet>
  );
}
```

### Fade Confirmation Component
```typescript
// components/engagement/FadeConfirmation.tsx
import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { YStack, XStack, Button } from '@tamagui/core';
import * as Haptics from 'expo-haptics';
import { formatOdds, formatMoney, calculatePayout, getOppositeBet } from '@/utils/betting';
import { Colors } from '@/theme';
import { useTailFade } from '@/hooks/useTailFade';

interface FadeConfirmationProps {
  isVisible: boolean;
  post: any;
  bet: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function FadeConfirmation({ 
  isVisible, 
  post, 
  bet, 
  onClose,
  onSuccess 
}: FadeConfirmationProps) {
  const { fadeBet, isLoading } = useTailFade();
  const oppositeBet = getOppositeBet(bet);
  
  const handleConfirm = useCallback(async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      
      await fadeBet({
        originalBetId: bet.id,
        postId: post.id,
        amount: bet.amount,
        oppositeBet,
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Show error toast
    }
  }, [bet, post, oppositeBet, fadeBet, onSuccess, onClose]);
  
  const payout = calculatePayout(bet.amount, oppositeBet.odds);
  
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );
  
  return (
    <BottomSheet
      index={isVisible ? 0 : -1}
      snapPoints={[380]}
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: Colors.surface }}
      handleIndicatorStyle={{ backgroundColor: Colors.border }}
    >
      <YStack p="$4" gap="$4">
        {/* Header */}
        <YStack ai="center">
          <Text style={{ fontSize: 20, fontWeight: '600', color: Colors.text }}>
            Fade @{post.user.username}'s pick?
          </Text>
        </YStack>
        
        {/* Original Bet */}
        <YStack gap="$2">
          <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
            Their pick:
          </Text>
          <YStack
            bg={Colors.surfaceAlt}
            p="$3"
            br="$3"
            opacity={0.6}
          >
            <Text style={{ fontSize: 16, color: Colors.text }}>
              {bet.selection} {formatOdds(bet.odds)}
            </Text>
          </YStack>
        </YStack>
        
        {/* Your Fade */}
        <YStack gap="$2">
          <Text style={{ fontSize: 14, color: Colors.textSecondary }}>
            Your fade:
          </Text>
          <YStack
            bg={Colors.fade}
            p="$3"
            br="$3"
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: 'white' }}>
              {oppositeBet.selection} {formatOdds(oppositeBet.odds)}
            </Text>
            <XStack jc="space-between" mt="$2">
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                Bet: {formatMoney(bet.amount)}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
                To Win: {formatMoney(payout.toWin)}
              </Text>
            </XStack>
          </YStack>
        </YStack>
        
        {/* Warning */}
        <XStack ai="center" jc="center" gap="$2">
          <Text style={{ fontSize: 16 }}>⚠️</Text>
          <Text style={{ 
            color: Colors.fade,
            fontSize: 14,
            fontWeight: '500',
          }}>
            You're betting AGAINST {post.user.username}
          </Text>
        </XStack>
        
        {/* Actions */}
        <YStack gap="$2">
          <Button
            size="$4"
            bg={Colors.fade}
            onPress={handleConfirm}
            disabled={isLoading}
            pressStyle={{ opacity: 0.8 }}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                Confirm Fade • {formatMoney(bet.amount)}
              </Text>
            )}
          </Button>
          
          <Button
            size="$4"
            bg="transparent"
            borderWidth={1}
            borderColor={Colors.border}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={{ color: Colors.text, fontSize: 16 }}>
              Cancel
            </Text>
          </Button>
        </YStack>
      </YStack>
    </BottomSheet>
  );
}
```

### Enhanced Post Actions Component
```typescript
// components/feed/PostCard/PostActions.tsx (Enhanced)
import React, { useState, useCallback } from 'react';
import { XStack, Button, Text } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { ReactionPicker } from '@/components/engagement/ReactionPicker';
import { TailConfirmation } from '@/components/engagement/TailConfirmation';
import { FadeConfirmation } from '@/components/engagement/FadeConfirmation';
import { ShareSheet } from '@/components/engagement/ShareSheet';
import { Colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';

interface PostActionsProps {
  post: any;
  reactions: Array<{ emoji: string; user_id: string }>;
  tailCount: number;
  fadeCount: number;
  bet?: any;
}

export function PostActions({ 
  post,
  reactions, 
  tailCount, 
  fadeCount, 
  bet 
}: PostActionsProps) {
  const { user } = useAuth();
  const { addReaction, removeReaction } = usePostInteractions(post.id);
  
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showTailConfirm, setShowTailConfirm] = useState(false);
  const [showFadeConfirm, setShowFadeConfirm] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  
  const myReaction = reactions.find(r => r.user_id === user?.id);
  const hasReacted = !!myReaction;
  
  const handleReactionPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (hasReacted) {
      removeReaction();
    } else {
      setShowReactionPicker(true);
    }
  }, [hasReacted, removeReaction]);
  
  const handleReactionLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Show reaction list
  }, []);
  
  const handleTailPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTailConfirm(true);
  }, []);
  
  const handleFadePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFadeConfirm(true);
  }, []);
  
  const handleSharePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowShareSheet(true);
  }, []);
  
  return (
    <>
      <XStack p="$3" jc="space-between" ai="center">
        {/* Tail/Fade Buttons */}
        {bet && (
          <XStack gap="$2">
            <Button
              size="$3"
              bg={Colors.tail}
              onPress={handleTailPress}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontSize="$3" fontWeight="600">
                Tail {tailCount > 0 && `(${tailCount})`}
              </Text>
            </Button>
            
            <Button
              size="$3"
              bg={Colors.fade}
              onPress={handleFadePress}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="white" fontSize="$3" fontWeight="600">
                Fade {fadeCount > 0 && `(${fadeCount})`}
              </Text>
            </Button>
          </XStack>
        )}
        
        {/* Reaction and Share */}
        <XStack gap="$3" ai="center">
          <TouchableOpacity 
            onPress={handleReactionPress}
            onLongPress={handleReactionLongPress}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text fontSize="$5">
              {hasReacted ? myReaction.emoji : '🤍'}
            </Text>
            {reactions.length > 0 && (
              <Text fontSize="$2" color={Colors.textSecondary}>
                {reactions.length}
              </Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleSharePress}>
            <Text fontSize="$5">↗️</Text>
          </TouchableOpacity>
        </XStack>
      </XStack>
      
      {/* Bottom Sheets */}
      <ReactionPicker
        isVisible={showReactionPicker}
        currentReaction={myReaction?.emoji}
        onSelectReaction={(emoji) => {
          addReaction(emoji);
          setShowReactionPicker(false);
        }}
        onClose={() => setShowReactionPicker(false)}
      />
      
      {bet && (
        <>
          <TailConfirmation
            isVisible={showTailConfirm}
            post={post}
            bet={bet}
            onClose={() => setShowTailConfirm(false)}
            onSuccess={() => {
              // Show success toast
            }}
          />
          
          <FadeConfirmation
            isVisible={showFadeConfirm}
            post={post}
            bet={bet}
            onClose={() => setShowFadeConfirm(false)}
            onSuccess={() => {
              // Show success toast
            }}
          />
        </>
      )}
      
      <ShareSheet
        isVisible={showShareSheet}
        post={post}
        onClose={() => setShowShareSheet(false)}
      />
    </>
  );
}
```

### Post Interactions Hook
```typescript
// hooks/usePostInteractions.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { reactionService } from '@/services/engagement/reactionService';
import { notificationService } from '@/services/notifications/notificationService';

export function usePostInteractions(postId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const addReactionMutation = useMutation({
    mutationFn: async (emoji: string) => {
      return reactionService.addReaction(postId, emoji);
    },
    onMutate: async (emoji) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousData = queryClient.getQueryData(['feed']);
      
      queryClient.setQueryData(['feed'], (old: any) => {
        // Update the specific post with new reaction
        return updatePostInFeed(old, postId, (post) => ({
          ...post,
          reactions: [
            ...post.reactions.filter(r => r.user_id !== user?.id),
            { emoji, user_id: user?.id },
          ],
        }));
      });
      
      return { previousData };
    },
    onError: (err, emoji, context) => {
      // Rollback on error
      queryClient.setQueryData(['feed'], context?.previousData);
    },
    onSuccess: async (data, emoji) => {
      // Send notification to post owner
      const post = getPostFromCache(postId);
      if (post && post.user_id !== user?.id) {
        await notificationService.create({
          userId: post.user_id,
          type: 'reaction',
          data: {
            postId,
            emoji,
            fromUserId: user?.id,
            fromUsername: user?.username,
          },
        });
      }
    },
  });
  
  const removeReactionMutation = useMutation({
    mutationFn: async () => {
      return reactionService.removeReaction(postId);
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      
      const previousData = queryClient.getQueryData(['feed']);
      
      queryClient.setQueryData(['feed'], (old: any) => {
        return updatePostInFeed(old, postId, (post) => ({
          ...post,
          reactions: post.reactions.filter(r => r.user_id !== user?.id),
        }));
      });
      
      return { previousData };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['feed'], context?.previousData);
    },
  });
  
  return {
    addReaction: addReactionMutation.mutate,
    removeReaction: removeReactionMutation.mutate,
    isAddingReaction: addReactionMutation.isPending,
    isRemovingReaction: removeReactionMutation.isPending,
  };
}
```

### Reaction Service
```typescript
// services/engagement/reactionService.ts
import { supabase } from '@/services/supabase';

export const reactionService = {
  async addReaction(postId: string, emoji: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('reactions')
      .upsert({
        post_id: postId,
        user_id: user.user.id,
        emoji,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async removeReaction(postId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.user.id);
    
    if (error) throw error;
  },
  
  async getReactions(postId: string) {
    const { data, error } = await supabase
      .from('reactions')
      .select(`
        emoji,
        user:users!user_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId);
    
    if (error) throw error;
    return data;
  },
};
```

### Tail/Fade Service
```typescript
// services/engagement/tailFadeService.ts
import { supabase } from '@/services/supabase';
import { notificationService } from '@/services/notifications/notificationService';

interface TailBetParams {
  originalBetId: string;
  postId: string;
  amount: number;
}

interface FadeBetParams extends TailBetParams {
  oppositeBet: any;
}

export const tailFadeService = {
  async tailBet(params: TailBetParams) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    // Get original bet details
    const { data: originalBet } = await supabase
      .from('bets')
      .select('*')
      .eq('id', params.originalBetId)
      .single();
    
    // Create tail bet
    const { data: tailBet, error } = await supabase
      .from('bets')
      .insert({
        user_id: user.user.id,
        game_id: originalBet.game_id,
        bet_type: originalBet.bet_type,
        selection: originalBet.selection,
        odds: originalBet.odds,
        amount: params.amount,
        potential_payout: calculatePayout(params.amount, originalBet.odds),
        status: 'pending',
        is_tail: true,
        original_bet_id: params.originalBetId,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create pick action
    await supabase
      .from('pick_actions')
      .insert({
        post_id: params.postId,
        user_id: user.user.id,
        action_type: 'tail',
        resulting_bet_id: tailBet.id,
      });
    
    // Update tail count
    await supabase.rpc('increment_tail_count', { post_id: params.postId });
    
    // Send notification
    await notificationService.create({
      userId: originalBet.user_id,
      type: 'tail',
      data: {
        postId: params.postId,
        fromUserId: user.user.id,
        fromUsername: user.user.user_metadata.username,
        betAmount: params.amount,
      },
    });
    
    return tailBet;
  },
  
  async fadeBet(params: FadeBetParams) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    // Create fade bet (opposite)
    const { data: fadeBet, error } = await supabase
      .from('bets')
      .insert({
        user_id: user.user.id,
        game_id: params.oppositeBet.game_id,
        bet_type: params.oppositeBet.bet_type,
        selection: params.oppositeBet.selection,
        odds: params.oppositeBet.odds,
        amount: params.amount,
        potential_payout: calculatePayout(params.amount, params.oppositeBet.odds),
        status: 'pending',
        is_fade: true,
        original_bet_id: params.originalBetId,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    // Create pick action
    await supabase
      .from('pick_actions')
      .insert({
        post_id: params.postId,
        user_id: user.user.id,
        action_type: 'fade',
        resulting_bet_id: fadeBet.id,
      });
    
    // Update fade count
    await supabase.rpc('increment_fade_count', { post_id: params.postId });
    
    // Send notification
    const { data: originalBet } = await supabase
      .from('bets')
      .select('user_id')
      .eq('id', params.originalBetId)
      .single();
    
    await notificationService.create({
      userId: originalBet.user_id,
      type: 'fade',
      data: {
        postId: params.postId,
        fromUserId: user.user.id,
        fromUsername: user.user.user_metadata.username,
        betAmount: params.amount,
      },
    });
    
    return fadeBet;
  },
};
```

### View Tracking Implementation
```typescript
// In components/feed/PostCard/PostCard.tsx
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export const PostCard = memo(({ post }: PostCardProps) => {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true,
  });
  
  useEffect(() => {
    if (inView) {
      // Increment view count
      supabase.rpc('increment_post_views', { post_id: post.id });
    }
  }, [inView, post.id]);
  
  return (
    <YStack ref={ref} ...>
      {/* Post content */}
    </YStack>
  );
});
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| POST | /rest/v1/reactions | `{ post_id, emoji }` | Reaction record | PLANNED |
| DELETE | /rest/v1/reactions | Query params | Success | PLANNED |
| POST | /rest/v1/bets | Tail/fade bet data | Created bet | PLANNED |
| POST | /rest/v1/pick_actions | Action record | Created action | PLANNED |
| POST | /rest/v1/rpc/increment_tail_count | `{ post_id }` | Updated count | PLANNED |
| POST | /rest/v1/rpc/increment_fade_count | `{ post_id }` | Updated count | PLANNED |
| POST | /rest/v1/rpc/increment_post_views | `{ post_id }` | Updated count | PLANNED |

### State Management
- Reactions use optimistic updates
- Tail/fade counts update optimistically
- View counts update on mount
- All managed through React Query

## Testing Performed

### Manual Testing
- [ ] All 6 reactions work
- [ ] Reaction picker opens/closes
- [ ] Can change reaction
- [ ] Can remove reaction
- [ ] Tail confirmation shows correct info
- [ ] Fade confirmation shows opposite bet
- [ ] Tail creates bet correctly
- [ ] Fade creates opposite bet
- [ ] Counts update immediately
- [ ] Notifications sent
- [ ] Share sheet works
- [ ] View counts increment
- [ ] Haptic feedback works
- [ ] Toast notifications show

### Edge Cases Considered
- Double-tap prevention: Disable during loading
- Network failure: Optimistic rollback
- Insufficient funds: Show error before confirmation
- Game started: Disable tail/fade
- Own post: Hide tail/fade buttons
- Already reacted: Show current reaction

## Documentation Updates

- [ ] Document reaction system
- [ ] Add tail/fade logic explanation
- [ ] Document notification triggers
- [ ] Add optimistic update patterns

## Handoff to Reviewer

### What Was Implemented
[To be completed at sprint end]

### Files Modified/Created
**Created**:
[To be listed at sprint end]

**Modified**:
[To be listed at sprint end]

### Key Decisions Made
1. 6 emoji reactions only
2. Optimistic updates everywhere
3. Haptic feedback on all touches
4. Bottom sheets for confirmations
5. View tracking on 50% visibility
6. No comment system

### Deviations from Original Plan
[To be tracked during implementation]

### Known Issues/Concerns
[To be identified during implementation]

### Suggested Review Focus
- Optimistic update rollback logic
- Notification trigger timing
- Bottom sheet performance
- Haptic feedback feel
- Toast notification UX

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] All interactions smooth
- [ ] Optimistic updates work
- [ ] Notifications trigger correctly
- [ ] Bottom sheets perform well
- [ ] No double-tap issues
- [ ] Haptics feel right
- [ ] Integration complete

### Review Outcome

**Status**: PENDING

### Feedback
[Review feedback will go here]

---

## Sprint Metrics

**Duration**: Planned 2.5 days | Actual [TBD]  
**Scope Changes**: [TBD]  
**Review Cycles**: [TBD]  
**Files Touched**: ~16  
**Lines Added**: ~1300 (estimated)  
**Lines Removed**: ~0

## Learnings for Future Sprints

[To be added after sprint completion]

---

*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]*  
*Final Status: NOT STARTED* 