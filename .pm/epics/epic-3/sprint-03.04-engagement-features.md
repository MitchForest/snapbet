# Sprint 03.04: Engagement Features Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Add complete engagement features including emoji reactions, comments system, view tracking, share functionality, tail/fade mechanics with confirmation flows, and notification triggers, creating a fully interactive social experience.

**User Story Contribution**: 
- Enables Story 1: Social Pick Sharing - Full social interactions on shared picks
- Enables Story 2: Tail/Fade Decisions - Complete tail/fade implementation with UI
- Enables Story 5: Performance Tracking - Track influence through tails/fades

## Sprint Plan

### Objectives
1. Implement emoji reaction system with 6 reaction types
2. Implement full comments system with threading
3. Create tail/fade confirmation flows with bottom sheets
4. Add view count tracking for posts
5. Implement share to story functionality
6. Create optimistic updates for all interactions
7. Integrate with Epic 2's notification service
8. Add reaction picker UI and animations
9. Check post_type for tail/fade buttons

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
# Bottom sheet for confirmations - using Tamagui Sheet instead
# bun add @gorhom/bottom-sheet@~4.5.1 - NOT NEEDED, use Tamagui Sheet

# Haptic feedback
bun add expo-haptics@~12.8.0

# Intersection observer for view tracking
bun add react-intersection-observer@~9.5.3
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
- PostType enum from types/feed.ts

**Identified Risks**:
- Race conditions with optimistic updates: Mitigation - Proper rollback logic
- Notification spam: Mitigation - Debounce and batch
- Sheet performance: Mitigation - Use Tamagui Sheet (already in project)

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
import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Sheet, XStack, YStack, Text } from '@tamagui/core';
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
  
  const handleReactionSelect = useCallback((emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelectReaction(emoji);
    onClose();
  }, [onSelectReaction, onClose]);
  
  return (
    <Sheet
      modal
      open={isVisible}
      onOpenChange={onClose}
      snapPoints={[200]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame bg={Colors.surface}>
        <Sheet.Handle bg={Colors.border} />
        <YStack p="$4">
          <Text 
            fontSize="$5" 
            fontWeight="600" 
            textAlign="center" 
            color={Colors.text}
            mb="$4"
          >
            Choose Reaction
          </Text>
          <XStack flexWrap="wrap" jc="space-around">
            {REACTIONS.map(({ emoji, label }) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => handleReactionSelect(emoji)}
                style={{
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  minWidth: 80,
                  marginBottom: 8,
                  backgroundColor: currentReaction === emoji ? Colors.primaryLight : 'transparent',
                }}
              >
                <Text fontSize="$8" mb="$1">{emoji}</Text>
                <Text fontSize="$2" color={Colors.textSecondary}>{label}</Text>
              </TouchableOpacity>
            ))}
          </XStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
```

### Tail Confirmation Component
```typescript
// components/engagement/TailConfirmation.tsx
import React, { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { Sheet, YStack, XStack, Button, Text } from '@tamagui/core';
import * as Haptics from 'expo-haptics';
import { formatOdds, formatMoney, calculatePayout } from '@/utils/betting/helpers';
import { Colors } from '@/theme';
import { useTailFade } from '@/hooks/useTailFade';
import { useToast } from '@/hooks/useToast';

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
  const { showToast } = useToast();
  
  const handleConfirm = useCallback(async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      await tailBet({
        originalBetId: bet.id,
        postId: post.id,
        amount: bet.amount,
      });
      
      showToast({
        title: 'Tail Confirmed!',
        message: `You're tailing @${post.user.username}'s pick`,
        type: 'success',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast({
        title: 'Tail Failed',
        message: error.message || 'Something went wrong',
        type: 'error',
      });
    }
  }, [bet, post, tailBet, onSuccess, onClose, showToast]);
  
  const payout = calculatePayout(bet.amount, bet.odds);
  
  return (
    <Sheet
      modal
      open={isVisible}
      onOpenChange={onClose}
      snapPoints={[320]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame bg={Colors.surface}>
        <Sheet.Handle bg={Colors.border} />
        <YStack p="$4" gap="$4">
          {/* Header */}
          <YStack ai="center">
            <Text fontSize="$6" fontWeight="600" color={Colors.text}>
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
            <Text fontSize="$4" fontWeight="500" color={Colors.text}>
              {bet.game.away_team} @ {bet.game.home_team}
            </Text>
            <Text fontSize="$5" fontWeight="600" color={Colors.primary}>
              {bet.selection} {formatOdds(bet.odds)}
            </Text>
            <XStack jc="space-between">
              <Text color={Colors.textSecondary}>
                Bet: {formatMoney(bet.amount)}
              </Text>
              <Text color={Colors.textSecondary}>
                To Win: {formatMoney(payout.toWin)}
              </Text>
            </XStack>
          </YStack>
          
          {/* Info Text */}
          <Text 
            textAlign="center" 
            color={Colors.textSecondary}
            fontSize="$3"
          >
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
                <Text color="white" fontSize="$4" fontWeight="600">
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
              <Text color={Colors.text} fontSize="$4">
                Cancel
              </Text>
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
```

### Fade Confirmation Component
```typescript
// components/engagement/FadeConfirmation.tsx
import React, { useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import { Sheet, YStack, XStack, Button, Text } from '@tamagui/core';
import * as Haptics from 'expo-haptics';
import { formatOdds, formatMoney, calculatePayout, getOppositeBet } from '@/utils/betting/helpers';
import { Colors } from '@/theme';
import { useTailFade } from '@/hooks/useTailFade';
import { useToast } from '@/hooks/useToast';

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
  const { showToast } = useToast();
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
      
      showToast({
        title: 'Fade Confirmed!',
        message: `You're fading @${post.user.username}'s pick`,
        type: 'warning',
      });
      
      onSuccess();
      onClose();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast({
        title: 'Fade Failed',
        message: error.message || 'Something went wrong',
        type: 'error',
      });
    }
  }, [bet, post, oppositeBet, fadeBet, onSuccess, onClose, showToast]);
  
  const payout = calculatePayout(bet.amount, oppositeBet.odds);
  
  return (
    <Sheet
      modal
      open={isVisible}
      onOpenChange={onClose}
      snapPoints={[380]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame bg={Colors.surface}>
        <Sheet.Handle bg={Colors.border} />
        <YStack p="$4" gap="$4">
          {/* Header */}
          <YStack ai="center">
            <Text fontSize="$6" fontWeight="600" color={Colors.text}>
              Fade @{post.user.username}'s pick?
            </Text>
          </YStack>
          
          {/* Original Bet */}
          <YStack gap="$2">
            <Text fontSize="$3" color={Colors.textSecondary}>
              Their pick:
            </Text>
            <YStack
              bg={Colors.surfaceAlt}
              p="$3"
              br="$3"
              opacity={0.6}
            >
              <Text fontSize="$4" color={Colors.text}>
                {bet.selection} {formatOdds(bet.odds)}
              </Text>
            </YStack>
          </YStack>
          
          {/* Your Fade */}
          <YStack gap="$2">
            <Text fontSize="$3" color={Colors.textSecondary}>
              Your fade:
            </Text>
            <YStack
              bg={Colors.fade}
              p="$3"
              br="$3"
            >
              <Text fontSize="$5" fontWeight="600" color="white">
                {oppositeBet.selection} {formatOdds(oppositeBet.odds)}
              </Text>
              <XStack jc="space-between" mt="$2">
                <Text color="rgba(255,255,255,0.8)">
                  Bet: {formatMoney(bet.amount)}
                </Text>
                <Text color="rgba(255,255,255,0.8)">
                  To Win: {formatMoney(payout.toWin)}
                </Text>
              </XStack>
            </YStack>
          </YStack>
          
          {/* Warning */}
          <XStack ai="center" jc="center" gap="$2">
            <Text fontSize="$4">⚠️</Text>
            <Text 
              color={Colors.fade}
              fontSize="$3"
              fontWeight="500"
            >
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
                <Text color="white" fontSize="$4" fontWeight="600">
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
              <Text color={Colors.text} fontSize="$4">
                Cancel
              </Text>
            </Button>
          </YStack>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
```

### Share Sheet Component
```typescript
// components/engagement/ShareSheet.tsx
import React, { useCallback } from 'react';
import { TouchableOpacity } from 'react-native';
import { Sheet, YStack, XStack, Text } from '@tamagui/core';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Colors } from '@/theme';
import { storyService } from '@/services/content/storyService';
import { useToast } from '@/hooks/useToast';

interface ShareSheetProps {
  isVisible: boolean;
  post: any;
  onClose: () => void;
}

export function ShareSheet({ isVisible, post, onClose }: ShareSheetProps) {
  const router = useRouter();
  const { showToast } = useToast();
  
  const handleShareToStory = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to camera with post data
    router.push({
      pathname: '/(drawer)/camera',
      params: {
        sharePostId: post.id,
        shareType: 'story',
      },
    });
    
    onClose();
  }, [post.id, router, onClose]);
  
  const handleSendInMessage = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Future: Navigate to messages with post
    showToast({
      title: 'Coming Soon',
      message: 'Direct messaging will be available soon!',
      type: 'info',
    });
    
    onClose();
  }, [showToast, onClose]);
  
  const shareOptions = [
    {
      icon: '📸',
      label: 'Add to Your Story',
      onPress: handleShareToStory,
    },
    {
      icon: '💬',
      label: 'Send in Message',
      onPress: handleSendInMessage,
      disabled: true,
    },
    {
      icon: '🔗',
      label: 'Copy Link',
      onPress: () => {},
      disabled: true,
    },
    {
      icon: '📱',
      label: 'Share Externally',
      onPress: () => {},
      disabled: true,
    },
  ];
  
  return (
    <Sheet
      modal
      open={isVisible}
      onOpenChange={onClose}
      snapPoints={[280]}
      dismissOnSnapToBottom
    >
      <Sheet.Overlay />
      <Sheet.Frame bg={Colors.surface}>
        <Sheet.Handle bg={Colors.border} />
        <YStack p="$4">
          <Text 
            fontSize="$5" 
            fontWeight="600" 
            textAlign="center" 
            color={Colors.text}
            mb="$4"
          >
            Share Post
          </Text>
          
          {shareOptions.map((option) => (
            <TouchableOpacity
              key={option.label}
              onPress={option.onPress}
              disabled={option.disabled}
              style={{
                opacity: option.disabled ? 0.5 : 1,
              }}
            >
              <XStack
                ai="center"
                gap="$3"
                p="$3"
                hoverStyle={{ bg: Colors.surfaceAlt }}
              >
                <Text fontSize="$6">{option.icon}</Text>
                <Text fontSize="$4" color={Colors.text}>
                  {option.label}
                </Text>
              </XStack>
            </TouchableOpacity>
          ))}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}
```

### Enhanced Post Actions Component
```typescript
// components/feed/PostCard/PostActions.tsx (Enhanced)
import React, { useState, useCallback } from 'react';
import { XStack, YStack, Button, Text } from '@tamagui/core';
import { TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { usePostInteractions } from '@/hooks/usePostInteractions';
import { ReactionPicker } from '@/components/engagement/ReactionPicker';
import { TailConfirmation } from '@/components/engagement/TailConfirmation';
import { FadeConfirmation } from '@/components/engagement/FadeConfirmation';
import { ShareSheet } from '@/components/engagement/ShareSheet';
import { Colors } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { PostType } from '@/types/feed';

interface PostActionsProps {
  post: any;
  reactions: Array<{ emoji: string; user_id: string }>;
  commentCount: number;
  tailCount: number;
  fadeCount: number;
  bet?: any;
  onCommentPress: () => void;
}

export function PostActions({ 
  post,
  reactions,
  commentCount,
  tailCount, 
  fadeCount, 
  bet,
  onCommentPress
}: PostActionsProps) {
  const { user } = useAuth();
  const { addReaction, removeReaction } = usePostInteractions(post.id);
  
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showTailConfirm, setShowTailConfirm] = useState(false);
  const [showFadeConfirm, setShowFadeConfirm] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  
  const myReaction = reactions.find(r => r.user_id === user?.id);
  const hasReacted = !!myReaction;
  
  // Check if game has started for tail/fade
  const gameStarted = bet && new Date(bet.game.start_time) < new Date();
  const canTailFade = post.post_type === PostType.PICK && !gameStarted && post.user_id !== user?.id;
  
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
    // Future: Show reaction list
  }, []);
  
  const handleTailPress = useCallback(() => {
    if (!canTailFade) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowTailConfirm(true);
  }, [canTailFade]);
  
  const handleFadePress = useCallback(() => {
    if (!canTailFade) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowFadeConfirm(true);
  }, [canTailFade]);
  
  const handleSharePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowShareSheet(true);
  }, []);
  
  const handleCommentPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onCommentPress();
  }, [onCommentPress]);
  
  return (
    <>
      <YStack>
        <XStack p="$3" jc="space-between" ai="center">
          {/* Tail/Fade Buttons - Only on pick posts before game start */}
          {post.post_type === PostType.PICK && bet && (
            <XStack gap="$2">
              <Button
                size="$3"
                bg={canTailFade ? Colors.tail : Colors.disabled}
                onPress={handleTailPress}
                disabled={!canTailFade}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text color="white" fontSize="$3" fontWeight="600">
                  Tail {tailCount > 0 && `(${tailCount})`}
                </Text>
              </Button>
              
              <Button
                size="$3"
                bg={canTailFade ? Colors.fade : Colors.disabled}
                onPress={handleFadePress}
                disabled={!canTailFade}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text color="white" fontSize="$3" fontWeight="600">
                  Fade {fadeCount > 0 && `(${fadeCount})`}
                </Text>
              </Button>
            </XStack>
          )}
          
          {/* Comments, Reactions and Share */}
          <XStack gap="$3" ai="center" ml={post.post_type !== PostType.PICK ? 0 : 'auto'}>
            <TouchableOpacity onPress={handleCommentPress}>
              <XStack ai="center" gap="$1">
                <Text fontSize="$5">💬</Text>
                {commentCount > 0 && (
                  <Text fontSize="$2" color={Colors.textSecondary}>
                    {commentCount}
                  </Text>
                )}
              </XStack>
            </TouchableOpacity>
            
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
        
        {/* Game started message */}
        {post.post_type === PostType.PICK && gameStarted && (
          <XStack px="$3" pb="$2">
            <Text fontSize="$2" color={Colors.textSecondary} fontStyle="italic">
              Game has started - tail/fade closed
            </Text>
          </XStack>
        )}
      </YStack>
      
      {/* Sheets */}
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
              // Refresh feed to show updated counts
            }}
          />
          
          <FadeConfirmation
            isVisible={showFadeConfirm}
            post={post}
            bet={bet}
            onClose={() => setShowFadeConfirm(false)}
            onSuccess={() => {
              // Refresh feed to show updated counts
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

### Tail/Fade Hook
```typescript
// hooks/useTailFade.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tailFadeService } from '@/services/engagement/tailFadeService';

export function useTailFade() {
  const queryClient = useQueryClient();
  
  const tailMutation = useMutation({
    mutationFn: tailFadeService.tailBet,
    onSuccess: () => {
      // Invalidate feed and user bets
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-bets'] });
    },
  });
  
  const fadeMutation = useMutation({
    mutationFn: tailFadeService.fadeBet,
    onSuccess: () => {
      // Invalidate feed and user bets
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['user-bets'] });
    },
  });
  
  return {
    tailBet: tailMutation.mutate,
    fadeBet: fadeMutation.mutate,
    isLoading: tailMutation.isPending || fadeMutation.isPending,
  };
}
```

### Toast Hook
```typescript
// hooks/useToast.ts
import { useCallback } from 'react';
import { Toast } from '@tamagui/toast';

interface ToastOptions {
  title: string;
  message?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export function useToast() {
  const showToast = useCallback((options: ToastOptions) => {
    // Implementation depends on toast setup
    // For now, console.log
    console.log('Toast:', options);
  }, []);
  
  return { showToast };
}
```

### Betting Utility Functions
```typescript
// utils/betting/helpers.ts
export function formatOdds(odds: number): string {
  if (odds > 0) return `+${odds}`;
  return odds.toString();
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function calculatePayout(amount: number, odds: number): { total: number; toWin: number } {
  let toWin: number;
  
  if (odds > 0) {
    // Positive odds: amount * (odds/100)
    toWin = amount * (odds / 100);
  } else {
    // Negative odds: amount / (Math.abs(odds)/100)
    toWin = amount / (Math.abs(odds) / 100);
  }
  
  return {
    total: amount + toWin,
    toWin,
  };
}

export function getOppositeBet(bet: any): any {
  // For spread bets
  if (bet.bet_type === 'spread') {
    const oppositeTeam = bet.selection.includes(bet.game.home_team) 
      ? bet.game.away_team 
      : bet.game.home_team;
    const oppositeSpread = -parseFloat(bet.selection.match(/[+-]?\d+\.?\d*/)[0]);
    const oppositeSpreadStr = oppositeSpread > 0 ? `+${oppositeSpread}` : oppositeSpread.toString();
    
    return {
      ...bet,
      selection: `${oppositeTeam} ${oppositeSpreadStr}`,
      odds: -110, // Standard opposite odds
    };
  }
  
  // For totals
  if (bet.bet_type === 'total') {
    const oppositeType = bet.selection.includes('Over') ? 'Under' : 'Over';
    const totalValue = bet.selection.match(/\d+\.?\d*/)[0];
    
    return {
      ...bet,
      selection: `${oppositeType} ${totalValue}`,
      odds: -110,
    };
  }
  
  // For moneyline
  if (bet.bet_type === 'moneyline') {
    const oppositeTeam = bet.selection === bet.game.home_team 
      ? bet.game.away_team 
      : bet.game.home_team;
    
    return {
      ...bet,
      selection: oppositeTeam,
      odds: bet.game.home_team === bet.selection 
        ? bet.game.away_ml_odds 
        : bet.game.home_ml_odds,
    };
  }
  
  return bet;
}
```

### Engagement Types
```typescript
// types/engagement.ts
export interface Reaction {
  id: string;
  post_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
}

export interface PickAction {
  id: string;
  post_id: string;
  user_id: string;
  action_type: 'tail' | 'fade';
  resulting_bet_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}
```

### Database Schema Requirements
```sql
-- Reactions table
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  emoji TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Pick actions table
CREATE TABLE pick_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action_type TEXT CHECK (action_type IN ('tail', 'fade')),
  resulting_bet_id UUID REFERENCES bets(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL CHECK (char_length(content) <= 280),
  created_at TIMESTAMP DEFAULT NOW()
);

-- RPC functions
CREATE OR REPLACE FUNCTION increment_tail_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET tail_count = tail_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_fade_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET fade_count = fade_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET view_count = view_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;
```

### View Tracking Implementation
```typescript
// In components/feed/PostCard/PostCard.tsx
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { supabase } from '@/services/supabase';

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
    <YStack ref={ref} bg={Colors.surface} mb="$2">
      {/* Post content */}
    </YStack>
  );
});
```

### Implementation Notes for Executor

#### 1. Dependencies
- Use Tamagui Sheet instead of @gorhom/bottom-sheet (already in project)
- Install expo-haptics for feedback
- Install react-intersection-observer for view tracking
- PostType enum should be imported from types/feed.ts

#### 2. Color Constants
Ensure these colors are in theme/index.ts:
```typescript
export const Colors = {
  // ... existing colors
  tail: '#4CAF50',  // Green for tail
  fade: '#F44336',  // Red for fade
  disabled: '#9E9E9E', // Gray for disabled
  primaryLight: 'rgba(0, 122, 255, 0.1)', // Light primary for selection
};
```

#### 3. Integration Points
- Comments system: Full implementation in comments section of PostCard
- Notifications: Already integrated in services
- Feed updates: Handled by React Query invalidation
- Toast system: Basic implementation provided, enhance as needed

#### 4. Edge Cases to Handle
- User can't tail/fade their own posts
- Game start time check for tail/fade availability
- Optimistic update rollback on error
- Double-tap prevention with loading states
- Network errors with proper toast messages

#### 5. Testing Checklist
- [ ] All 6 reactions selectable
- [ ] Can remove reaction by tapping again
- [ ] Tail/fade only shows on pick posts
- [ ] Tail/fade disabled after game start
- [ ] Tail/fade disabled on own posts
- [ ] Haptic feedback on all interactions
- [ ] View count increments on scroll
- [ ] Share to story navigation works
- [ ] All sheets open/close properly
- [ ] Loading states during async operations

#### 6. Comments Integration
In PostCard component, add state for showing comments:
```typescript
const [showComments, setShowComments] = useState(false);

// In PostActions onCommentPress
onCommentPress={() => setShowComments(!showComments)}

// Below PostActions
{showComments && (
  <Comments postId={post.id} isVisible={showComments} />
)}
```

#### 7. API Endpoints Summary
All these endpoints are created automatically by Supabase based on table definitions:
- POST /rest/v1/reactions - Add reaction
- DELETE /rest/v1/reactions - Remove reaction
- POST /rest/v1/comments - Add comment
- POST /rest/v1/bets - Create tail/fade bet
- POST /rest/v1/pick_actions - Record tail/fade action
- RPC functions for incrementing counts

#### 8. Real-time Subscriptions (Future Enhancement)
Consider adding real-time subscriptions for:
- New reactions appearing instantly
- Comments updating in real-time
- Tail/fade counts updating live

#### 9. Performance Considerations
- Debounce reaction changes to prevent spam
- Lazy load comments (only fetch when opened)
- Cache reaction state locally
- Use React.memo for PostActions component

#### 10. Accessibility
- Add accessibility labels to all touchable elements
- Ensure haptic feedback has visual feedback too
- Make sure all interactive elements are keyboard accessible

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
2. Full comments system with 280 char limit
3. Optimistic updates everywhere
4. Haptic feedback on all touches
5. Bottom sheets for confirmations
6. View tracking on 50% visibility
7. Tail/fade only on pick posts
8. Game time check for tail/fade

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