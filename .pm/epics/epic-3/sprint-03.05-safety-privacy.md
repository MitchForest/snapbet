# Sprint 03.05: Safety & Privacy Features Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: TBD  
**End Date**: TBD  
**Epic**: Epic 3 - Social Feed & Content

**Sprint Goal**: Implement comprehensive user safety features including blocking, reporting, privacy settings, and content moderation to create a safe and controlled social environment.

**User Story Contribution**: 
- Enables all stories by providing safety controls
- Critical for user retention and platform trust
- Required for app store compliance

## Sprint Plan

### Objectives
1. Implement user blocking system with immediate effect
2. Create post reporting flow with auto-hide after 3 reports
3. Add privacy settings (public/private profiles)
4. Implement follow request system for private profiles
5. Create blocked users management in settings
6. Add content filtering based on blocks and privacy
7. Integrate report notifications for moderation
8. Add delete post functionality for own content

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `app/(drawer)/report/[postId].tsx` | Report post screen | NOT STARTED |
| `app/(drawer)/settings/blocked-users.tsx` | Blocked users list | NOT STARTED |
| `app/(drawer)/settings/privacy.tsx` | Privacy settings screen | NOT STARTED |
| `app/(drawer)/follow-requests.tsx` | Follow requests screen | NOT STARTED |
| `components/safety/ReportScreen.tsx` | Report form component | NOT STARTED |
| `components/safety/BlockedUserItem.tsx` | Blocked user list item | NOT STARTED |
| `components/safety/PrivacySettings.tsx` | Privacy options component | NOT STARTED |
| `components/safety/FollowRequestItem.tsx` | Follow request item | NOT STARTED |
| `hooks/useBlockUser.ts` | Block/unblock functionality | NOT STARTED |
| `hooks/useReportPost.ts` | Report post functionality | NOT STARTED |
| `hooks/usePrivacySettings.ts` | Privacy settings management | NOT STARTED |
| `hooks/useFollowRequests.ts` | Follow request management | NOT STARTED |
| `services/safety/blockService.ts` | Block operations | NOT STARTED |
| `services/safety/reportService.ts` | Report operations | NOT STARTED |
| `services/safety/privacyService.ts` | Privacy operations | NOT STARTED |
| `types/safety.ts` | TypeScript types for safety | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `app/(drawer)/settings/index.tsx` | Add links to new settings | NOT STARTED |
| `components/ui/DrawerContent.tsx` | Add follow requests badge | NOT STARTED |
| `hooks/useFeed.ts` | Already updated for blocking | DONE |
| `hooks/useStories.ts` | Already updated for blocking | DONE |
| `services/supabase/index.ts` | Add new table queries | NOT STARTED |

### Implementation Approach

#### 1. Database Schema
```sql
-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  text TEXT NOT NULL CHECK (char_length(text) <= 280),
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Reports table
CREATE TABLE post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id),
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'inappropriate', 'harassment', 'other')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, reporter_id)
);

-- Blocks table
CREATE TABLE user_blocks (
  blocker_id UUID REFERENCES users(id),
  blocked_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Privacy settings (add to users table)
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  is_private BOOLEAN DEFAULT FALSE,
  show_picks_to TEXT DEFAULT 'everyone' CHECK (show_picks_to IN ('everyone', 'followers', 'none')),
  show_outcomes_to TEXT DEFAULT 'everyone' CHECK (show_outcomes_to IN ('everyone', 'followers', 'none')),
  discoverable BOOLEAN DEFAULT TRUE;

-- Follow requests
CREATE TABLE follow_requests (
  requester_id UUID REFERENCES users(id),
  requested_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (requester_id, requested_id)
);

-- Add report count and hidden flag to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS 
  report_count INTEGER DEFAULT 0,
  hidden BOOLEAN DEFAULT FALSE;

-- Auto-hide posts with 3+ reports
CREATE OR REPLACE FUNCTION check_post_reports()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.report_count >= 3 THEN
    UPDATE posts SET hidden = true WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_report_check
AFTER UPDATE OF report_count ON posts
FOR EACH ROW
EXECUTE FUNCTION check_post_reports();

-- RPC function to increment report count
CREATE OR REPLACE FUNCTION increment_report_count(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET report_count = report_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Index for performance
CREATE INDEX idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX idx_user_blocks_blocked ON user_blocks(blocked_id);
CREATE INDEX idx_post_reports_post ON post_reports(post_id);
CREATE INDEX idx_follow_requests_requested ON follow_requests(requested_id);
```

#### 2. Blocking Flow
```
User taps ⋯ → Block @username
↓
Confirmation dialog
↓
Block created in DB
↓
Immediate effects:
- Feed refreshes (removes their posts)
- Stories refresh (removes their stories)
- They can't see your content
- They can't message you
- They can't follow you
```

#### 3. Reporting Flow
```
User taps ⋯ → Report Post
↓
Report screen with reasons:
- Spam
- Inappropriate content
- Harassment
- Other (with text input)
↓
Report submitted
↓
report_count incremented
↓
If count >= 3: post auto-hidden
↓
Notification to moderation queue
```

#### 4. Privacy Settings
```
Public Profile (default):
- Anyone can see posts
- Anyone can follow
- Discoverable in search

Private Profile:
- Only followers see posts
- Follow requests required
- Optional: Still discoverable
- Granular controls for picks/outcomes
```

**Key Technical Decisions**:
- Immediate blocking (no delay)
- 3 reports = auto-hide (adjustable)
- Privacy is profile-wide initially
- Follow requests expire after 30 days
- Blocked users can be unblocked
- Reports are permanent record

### Dependencies & Risks
**Dependencies**:
- User authentication system
- Feed and stories implementation
- Database migrations run

**Identified Risks**:
- Mass false reporting: Mitigation - Rate limiting, user reputation
- Privacy setting complexity: Mitigation - Simple on/off initially
- Performance with many blocks: Mitigation - Indexed queries

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

**Testing Performed**:
- [ ] Blocking works immediately
- [ ] Reports increment correctly
- [ ] Auto-hide at 3 reports
- [ ] Privacy settings apply

## Key Code Additions

### Block User Hook
```typescript
// hooks/useBlockUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { blockService } from '@/services/safety/blockService';
import { useAuth } from '@/hooks/useAuth';

export function useBlockUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const blockUserMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      return blockService.blockUser(blockedUserId);
    },
    onSuccess: () => {
      // Invalidate all queries that might contain blocked user's content
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
  
  const unblockUserMutation = useMutation({
    mutationFn: async (blockedUserId: string) => {
      return blockService.unblockUser(blockedUserId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
    },
  });
  
  return {
    blockUser: blockUserMutation.mutate,
    unblockUser: unblockUserMutation.mutate,
    isBlocking: blockUserMutation.isPending,
    isUnblocking: unblockUserMutation.isPending,
  };
}
```

### Block Service
```typescript
// services/safety/blockService.ts
import { supabase } from '@/services/supabase';

export const blockService = {
  async blockUser(blockedUserId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    // Create block record
    const { error } = await supabase
      .from('user_blocks')
      .insert({
        blocker_id: user.user.id,
        blocked_id: blockedUserId,
      });
    
    if (error && error.code !== '23505') { // Ignore duplicate key error
      throw error;
    }
    
    // Remove any existing follow relationships
    await supabase
      .from('follows')
      .delete()
      .or(`follower_id.eq.${user.user.id},following_id.eq.${user.user.id}`)
      .or(`follower_id.eq.${blockedUserId},following_id.eq.${blockedUserId}`);
    
    return { success: true };
  },
  
  async unblockUser(blockedUserId: string) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('user_blocks')
      .delete()
      .eq('blocker_id', user.user.id)
      .eq('blocked_id', blockedUserId);
    
    if (error) throw error;
    return { success: true };
  },
  
  async getBlockedUsers() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('user_blocks')
      .select(`
        blocked:users!blocked_id (
          id,
          username,
          avatar_url
        ),
        created_at
      `)
      .eq('blocker_id', user.user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};
```

### Report Screen Component
```typescript
// components/safety/ReportScreen.tsx
import React, { useState } from 'react';
import { YStack, XStack, RadioGroup, Label, TextArea, Button, Text } from '@tamagui/core';
import { useRouter } from 'expo-router';
import { useReportPost } from '@/hooks/useReportPost';
import { useToast } from '@/hooks/useToast';
import { Colors } from '@/theme';

interface ReportScreenProps {
  postId: string;
}

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'inappropriate', label: 'Inappropriate content' },
  { value: 'harassment', label: 'Harassment or bullying' },
  { value: 'other', label: 'Other' },
];

export function ReportScreen({ postId }: ReportScreenProps) {
  const router = useRouter();
  const { reportPost, isReporting } = useReportPost();
  const { showToast } = useToast();
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  
  const handleSubmit = async () => {
    if (!reason) return;
    
    try {
      await reportPost({
        postId,
        reason,
        description: reason === 'other' ? description : undefined,
      });
      
      showToast({
        title: 'Report Submitted',
        message: 'Thank you for helping keep SnapBet safe',
        type: 'success',
      });
      
      router.back();
    } catch (error) {
      showToast({
        title: 'Report Failed',
        message: error.message || 'Please try again',
        type: 'error',
      });
    }
  };
  
  return (
    <YStack f={1} p="$4" gap="$4">
      <YStack gap="$2">
        <Text fontSize="$5" fontWeight="600" color={Colors.text}>
          Why are you reporting this post?
        </Text>
        <Text fontSize="$3" color={Colors.textSecondary}>
          Your report is anonymous and helps keep SnapBet safe.
        </Text>
      </YStack>
      
      <RadioGroup value={reason} onValueChange={setReason}>
        <YStack gap="$3">
          {REPORT_REASONS.map(({ value, label }) => (
            <XStack key={value} ai="center" gap="$3">
              <RadioGroup.Item value={value} id={value}>
                <RadioGroup.Indicator />
              </RadioGroup.Item>
              <Label htmlFor={value} fontSize="$4">
                {label}
              </Label>
            </XStack>
          ))}
        </YStack>
      </RadioGroup>
      
      {reason === 'other' && (
        <YStack gap="$2">
          <Label htmlFor="description">Please describe the issue</Label>
          <TextArea
            id="description"
            value={description}
            onChangeText={setDescription}
            placeholder="Tell us more..."
            minHeight={100}
            maxLength={500}
            bg={Colors.surfaceAlt}
            borderColor={Colors.border}
          />
        </YStack>
      )}
      
      <YStack gap="$2" mt="auto">
        <Button
          size="$4"
          bg={Colors.error}
          onPress={handleSubmit}
          disabled={!reason || isReporting}
          opacity={!reason || isReporting ? 0.5 : 1}
        >
          <Text color="white" fontSize="$4" fontWeight="600">
            Submit Report
          </Text>
        </Button>
        
        <Button
          size="$4"
          bg="transparent"
          borderWidth={1}
          borderColor={Colors.border}
          onPress={() => router.back()}
          disabled={isReporting}
        >
          <Text fontSize="$4" color={Colors.text}>Cancel</Text>
        </Button>
      </YStack>
    </YStack>
  );
}
```

### Privacy Settings Component
```typescript
// components/safety/PrivacySettings.tsx
import React from 'react';
import { YStack, XStack, Text, Switch, Separator, RadioGroup, Label } from '@tamagui/core';
import { usePrivacySettings } from '@/hooks/usePrivacySettings';
import { Colors } from '@/theme';

// Radio option component
function RadioOption({ value, label }: { value: string; label: string }) {
  return (
    <XStack ai="center" gap="$3">
      <RadioGroup.Item value={value} id={value}>
        <RadioGroup.Indicator />
      </RadioGroup.Item>
      <Label htmlFor={value} fontSize="$3">{label}</Label>
    </XStack>
  );
}

export function PrivacySettings() {
  const { settings, updateSettings, isUpdating } = usePrivacySettings();
  
  if (!settings) return null;
  
  return (
    <YStack gap="$4">
      {/* Private Profile */}
      <YStack gap="$2">
        <XStack jc="space-between" ai="center">
          <YStack f={1}>
            <Text fontSize="$4" fontWeight="600" color={Colors.text}>
              Private Profile
            </Text>
            <Text fontSize="$2" color={Colors.textSecondary}>
              Only approved followers can see your posts
            </Text>
          </YStack>
          <Switch
            checked={settings.is_private}
            onCheckedChange={(checked) => 
              updateSettings({ is_private: checked })
            }
            disabled={isUpdating}
          />
        </XStack>
      </YStack>
      
      <Separator />
      
      {/* Pick Visibility */}
      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="600" color={Colors.text}>
          Who can see your picks?
        </Text>
        <RadioGroup 
          value={settings.show_picks_to} 
          onValueChange={(value) => 
            updateSettings({ show_picks_to: value })
          }
          disabled={isUpdating}
        >
          <YStack gap="$2">
            <RadioOption value="everyone" label="Everyone" />
            <RadioOption value="followers" label="Followers only" />
            <RadioOption value="none" label="No one" />
          </YStack>
        </RadioGroup>
      </YStack>
      
      <Separator />
      
      {/* Outcome Visibility */}
      <YStack gap="$2">
        <Text fontSize="$4" fontWeight="600" color={Colors.text}>
          Who can see your outcomes?
        </Text>
        <RadioGroup 
          value={settings.show_outcomes_to} 
          onValueChange={(value) => 
            updateSettings({ show_outcomes_to: value })
          }
          disabled={isUpdating}
        >
          <YStack gap="$2">
            <RadioOption value="everyone" label="Everyone" />
            <RadioOption value="followers" label="Followers only" />
            <RadioOption value="none" label="No one" />
          </YStack>
        </RadioGroup>
      </YStack>
      
      <Separator />
      
      {/* Discoverability */}
      <YStack gap="$2">
        <XStack jc="space-between" ai="center">
          <YStack f={1}>
            <Text fontSize="$4" fontWeight="600" color={Colors.text}>
              Discoverable
            </Text>
            <Text fontSize="$2" color={Colors.textSecondary}>
              Others can find you in search
            </Text>
          </YStack>
          <Switch
            checked={settings.discoverable}
            onCheckedChange={(checked) => 
              updateSettings({ discoverable: checked })
            }
            disabled={isUpdating}
          />
        </XStack>
      </YStack>
    </YStack>
  );
}
```

### Blocked Users Screen
```typescript
// app/(drawer)/settings/blocked-users.tsx
import React from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, Text, Button, Separator } from '@tamagui/core';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useBlockUser } from '@/hooks/useBlockUser';
import { Avatar } from '@/components/common/Avatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { formatTimeAgo } from '@/utils/stories/helpers';
import { Colors } from '@/theme';

export default function BlockedUsersScreen() {
  const { blockedUsers, isLoading } = useBlockedUsers();
  const { unblockUser } = useBlockUser();
  
  const renderItem = ({ item }: any) => (
    <XStack p="$3" ai="center" gap="$3">
      <Avatar
        size="$4"
        source={{ uri: item.blocked.avatar_url }}
        fallback={item.blocked.username[0]}
      />
      
      <YStack f={1}>
        <Text fontSize="$4" fontWeight="600" color={Colors.text}>
          @{item.blocked.username}
        </Text>
        <Text fontSize="$2" color={Colors.textSecondary}>
          Blocked {formatTimeAgo(item.created_at)}
        </Text>
      </YStack>
      
      <Button
        size="$3"
        bg="transparent"
        borderWidth={1}
        borderColor={Colors.border}
        onPress={() => unblockUser(item.blocked.id)}
      >
        <Text fontSize="$3" color={Colors.text}>Unblock</Text>
      </Button>
    </XStack>
  );
  
  return (
    <YStack f={1} bg={Colors.background}>
      <ScreenHeader title="Blocked Users" showBack />
      
      <FlatList
        data={blockedUsers}
        renderItem={renderItem}
        keyExtractor={(item) => item.blocked.id}
        ItemSeparatorComponent={() => <Separator />}
        ListEmptyComponent={
          <YStack p="$6" ai="center">
            <Text fontSize="$4" color={Colors.textSecondary}>
              You haven't blocked anyone
            </Text>
          </YStack>
        }
      />
    </YStack>
  );
}
```

### Follow Requests Screen
```typescript
// app/(drawer)/follow-requests.tsx
import React from 'react';
import { FlatList } from 'react-native';
import { YStack, XStack, Text, Button } from '@tamagui/core';
import { useFollowRequests } from '@/hooks/useFollowRequests';
import { Avatar } from '@/components/common/Avatar';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { formatTimeAgo } from '@/utils/stories/helpers';
import { Colors } from '@/theme';

export default function FollowRequestsScreen() {
  const { requests, acceptRequest, declineRequest, isAccepting, isDeclining } = useFollowRequests();
  
  const renderItem = ({ item }: any) => (
    <XStack p="$3" ai="center" gap="$3">
      <Avatar
        size="$4"
        source={{ uri: item.requester.avatar_url }}
        fallback={item.requester.username[0]}
      />
      
      <YStack f={1}>
        <Text fontSize="$4" fontWeight="600" color={Colors.text}>
          @{item.requester.username}
        </Text>
        <Text fontSize="$2" color={Colors.textSecondary}>
          {formatTimeAgo(item.created_at)}
        </Text>
      </YStack>
      
      <XStack gap="$2">
        <Button
          size="$3"
          bg={Colors.primary}
          onPress={() => acceptRequest(item.requester.id)}
          disabled={isAccepting || isDeclining}
        >
          <Text color="white" fontSize="$3">Accept</Text>
        </Button>
        
        <Button
          size="$3"
          bg="transparent"
          borderWidth={1}
          borderColor={Colors.border}
          onPress={() => declineRequest(item.requester.id)}
          disabled={isAccepting || isDeclining}
        >
          <Text fontSize="$3" color={Colors.text}>Decline</Text>
        </Button>
      </XStack>
    </XStack>
  );
  
  return (
    <YStack f={1} bg={Colors.background}>
      <ScreenHeader title="Follow Requests" showBack />
      
      <FlatList
        data={requests}
        renderItem={renderItem}
        keyExtractor={(item) => item.requester.id}
        ItemSeparatorComponent={() => <Separator />}
        ListEmptyComponent={
          <YStack p="$6" ai="center">
            <Text fontSize="$4" color={Colors.textSecondary}>
              No pending follow requests
            </Text>
          </YStack>
        }
      />
    </YStack>
  );
}
```

### Report Post Hook
```typescript
// hooks/useReportPost.ts
import { useMutation } from '@tanstack/react-query';
import { reportService } from '@/services/safety/reportService';

interface ReportParams {
  postId: string;
  reason: string;
  description?: string;
}

export function useReportPost() {
  const reportMutation = useMutation({
    mutationFn: async (params: ReportParams) => {
      return reportService.reportPost(params);
    },
  });
  
  return {
    reportPost: reportMutation.mutate,
    isReporting: reportMutation.isPending,
  };
}
```

### Report Service
```typescript
// services/safety/reportService.ts
import { supabase } from '@/services/supabase';

interface ReportParams {
  postId: string;
  reason: string;
  description?: string;
}

export const reportService = {
  async reportPost(params: ReportParams) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    // Check if user already reported this post
    const { data: existingReport } = await supabase
      .from('post_reports')
      .select('id')
      .eq('post_id', params.postId)
      .eq('reporter_id', user.user.id)
      .single();
    
    if (existingReport) {
      throw new Error('You have already reported this post');
    }
    
    // Create report
    const { error } = await supabase
      .from('post_reports')
      .insert({
        post_id: params.postId,
        reporter_id: user.user.id,
        reason: params.reason,
        description: params.description,
      });
    
    if (error) throw error;
    
    // Increment report count
    await supabase.rpc('increment_report_count', { post_id: params.postId });
    
    return { success: true };
  },
};
```

### Privacy Settings Hook
```typescript
// hooks/usePrivacySettings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { privacyService } from '@/services/safety/privacyService';
import { useAuth } from '@/hooks/useAuth';

export function usePrivacySettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const { data: settings } = useQuery({
    queryKey: ['privacy-settings', user?.id],
    queryFn: () => privacyService.getSettings(),
    enabled: !!user?.id,
  });
  
  const updateMutation = useMutation({
    mutationFn: privacyService.updateSettings,
    onMutate: async (newSettings) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['privacy-settings'] });
      const previousSettings = queryClient.getQueryData(['privacy-settings']);
      
      queryClient.setQueryData(['privacy-settings'], (old: any) => ({
        ...old,
        ...newSettings,
      }));
      
      return { previousSettings };
    },
    onError: (err, newSettings, context) => {
      // Rollback on error
      queryClient.setQueryData(['privacy-settings'], context?.previousSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-settings'] });
    },
  });
  
  return {
    settings,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
```

### Privacy Service
```typescript
// services/safety/privacyService.ts
import { supabase } from '@/services/supabase';

export const privacyService = {
  async getSettings() {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    const { data, error } = await supabase
      .from('users')
      .select('is_private, show_picks_to, show_outcomes_to, discoverable')
      .eq('id', user.user.id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  async updateSettings(settings: Partial<{
    is_private: boolean;
    show_picks_to: string;
    show_outcomes_to: string;
    discoverable: boolean;
  }>) {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('users')
      .update(settings)
      .eq('id', user.user.id);
    
    if (error) throw error;
    
    // If switching from private to public, auto-accept all follow requests
    if (settings.is_private === false) {
      const { data: requests } = await supabase
        .from('follow_requests')
        .select('requester_id')
        .eq('requested_id', user.user.id);
      
      if (requests && requests.length > 0) {
        // Batch insert follows
        await supabase
          .from('follows')
          .insert(
            requests.map(r => ({
              follower_id: r.requester_id,
              following_id: user.user.id,
            }))
          );
        
        // Delete all requests
        await supabase
          .from('follow_requests')
          .delete()
          .eq('requested_id', user.user.id);
      }
    }
    
    return { success: true };
  },
};
```

### Blocked Users Hook
```typescript
// hooks/useBlockedUsers.ts
import { useQuery } from '@tanstack/react-query';
import { blockService } from '@/services/safety/blockService';
import { useAuth } from '@/hooks/useAuth';

export function useBlockedUsers() {
  const { user } = useAuth();
  
  const { data: blockedUsers = [], isLoading } = useQuery({
    queryKey: ['blocked-users', user?.id],
    queryFn: () => blockService.getBlockedUsers(),
    enabled: !!user?.id,
  });
  
  return {
    blockedUsers,
    isLoading,
  };
}
```

### Safety Types
```typescript
// types/safety.ts
export interface BlockedUser {
  blocked_id: string;
  blocked: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
}

export interface FollowRequest {
  requester_id: string;
  requester: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  created_at: string;
}

export interface PostReport {
  id: string;
  post_id: string;
  reporter_id: string;
  reason: 'spam' | 'inappropriate' | 'harassment' | 'other';
  description?: string;
  created_at: string;
}

export interface PrivacySettings {
  is_private: boolean;
  show_picks_to: 'everyone' | 'followers' | 'none';
  show_outcomes_to: 'everyone' | 'followers' | 'none';
  discoverable: boolean;
}
```

### Options Menu Integration
```typescript
// In PostCard component, add to options menu:
const optionsMenuItems = [
  {
    label: 'Report Post',
    icon: '🚩',
    onPress: () => router.push(`/report/${post.id}`),
    show: post.user_id !== user?.id,
  },
  {
    label: 'Block @' + post.user.username,
    icon: '🚫',
    onPress: () => handleBlock(),
    show: post.user_id !== user?.id,
  },
  {
    label: 'Delete Post',
    icon: '🗑️',
    onPress: () => handleDelete(),
    show: post.user_id === user?.id,
    destructive: true,
  },
];
```

### Implementation Notes for Executor

#### 1. Route Setup
Create these new routes:
- `app/(drawer)/report/[postId].tsx` - Wrap ReportScreen component
- `app/(drawer)/settings/blocked-users.tsx` - Already shown above
- `app/(drawer)/settings/privacy.tsx` - Wrap PrivacySettings component
- `app/(drawer)/follow-requests.tsx` - Already shown above

#### 2. Settings Screen Updates
In `app/(drawer)/settings/index.tsx`, add new navigation items:
```typescript
const settingsItems = [
  // ... existing items
  {
    title: 'Privacy',
    icon: '🔒',
    route: '/settings/privacy',
  },
  {
    title: 'Blocked Users',
    icon: '🚫',
    route: '/settings/blocked-users',
  },
];
```

#### 3. Drawer Updates
In `components/ui/DrawerContent.tsx`, add follow requests badge:
```typescript
const { requests } = useFollowRequests();
const requestCount = requests?.length || 0;

// In drawer items
{requestCount > 0 && (
  <DrawerItem
    label="Follow Requests"
    icon="👥"
    badge={requestCount}
    onPress={() => router.push('/follow-requests')}
  />
)}
```

#### 4. Follow Button Logic Update
Update follow button to handle private profiles:
```typescript
// In follow button component
const handleFollow = async () => {
  if (userProfile.is_private && !isFollowing) {
    // Create follow request
    await followService.createFollowRequest(userProfile.id);
    setFollowStatus('requested');
  } else {
    // Normal follow
    await followService.followUser(userProfile.id);
    setIsFollowing(true);
  }
};
```

#### 5. Feed Query Updates
The feed and stories hooks already filter blocked users (mentioned as DONE in the sprint).

#### 6. Testing Checklist
- [ ] Block user from post options menu
- [ ] Block user from profile page
- [ ] Report post with each reason type
- [ ] Verify 3 reports auto-hides post
- [ ] Test private profile toggle
- [ ] Test follow request flow
- [ ] Test unblocking users
- [ ] Verify blocked content is hidden everywhere
- [ ] Test privacy settings persistence
- [ ] Check performance with many blocks

#### 7. Edge Cases to Handle
- User can't report their own posts
- User can't block themselves
- Rate limit reports (1 per post per user)
- Handle switching privacy settings
- Clear follow requests when going public

#### 8. Performance Considerations
- Index all foreign keys in database
- Cache blocked users list
- Batch follow request operations
- Use optimistic updates for privacy settings

#### 9. Complete Implementation Checklist
- [ ] Database migrations run successfully
- [ ] All routes created and wired up
- [ ] Block functionality works bidirectionally
- [ ] Report system increments and auto-hides
- [ ] Privacy settings toggle and persist
- [ ] Follow requests flow complete
- [ ] Options menu integrated in PostCard
- [ ] Drawer shows follow request badge
- [ ] Settings screen has new options
- [ ] All hooks and services implemented

#### 10. Key Technical Notes

**Blocking Behavior**:
- Blocks are one-way in database but enforced bidirectionally in queries
- Removes any existing follow relationships
- Immediately refreshes all content feeds

**Report System**:
- One report per user per post (enforced by unique constraint)
- Auto-hide trigger at 3 reports
- Reports are permanent even if post deleted

**Privacy System**:
- Switching to public auto-accepts all pending requests
- Granular controls for picks vs outcomes
- Discoverable setting affects search only

**Follow Requests**:
- No expiration implemented yet (future enhancement)
- Notifications sent on accept only
- Can cancel pending requests

## Testing Performed

### Manual Testing
- [ ] Block user removes all their content
- [ ] Unblock user works
- [ ] Report post with all reasons
- [ ] 3 reports auto-hides post
- [ ] Private profile requires follow request
- [ ] Follow requests can be accepted/declined
- [ ] Privacy settings persist
- [ ] Blocked users list shows all blocks
- [ ] Can't see blocked user's content
- [ ] Blocked user can't see your content

### Edge Cases Considered
- Blocking someone who blocked you
- Reporting own post (prevented)
- Mass reporting by one user (rate limited)
- Follow request to public profile (auto-accept)
- Switching from private to public (requests cleared)

## Documentation Updates

- [ ] Document blocking behavior
- [ ] Add reporting guidelines
- [ ] Document privacy options
- [ ] Add moderation queue info

## Handoff to Reviewer

### What Was Implemented
[To be completed at sprint end]

### Files Modified/Created
**Created**:
[To be listed at sprint end]

**Modified**:
[To be listed at sprint end]

### Key Decisions Made
1. 3 reports = auto-hide (configurable)
2. Blocks are bidirectional for content
3. Privacy is all-or-nothing initially
4. Follow requests expire after 30 days
5. Reports are anonymous to users
6. Deleted posts remove all reports

### Deviations from Original Plan
[To be tracked during implementation]

### Known Issues/Concerns
[To be identified during implementation]

### Suggested Review Focus
- Database query performance
- Privacy setting edge cases
- Report abuse prevention
- UI/UX of blocking flow
- Follow request notifications

**Sprint Status**: NOT STARTED

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Blocking works immediately
- [ ] Reports tracked correctly
- [ ] Privacy settings enforced
- [ ] Follow requests functional
- [ ] No security vulnerabilities
- [ ] Performance acceptable
- [ ] UI intuitive

### Review Outcome

**Status**: PENDING

### Feedback
[Review feedback will go here]

---

## Sprint Metrics

**Duration**: Planned 2 days | Actual [TBD]  
**Scope Changes**: [TBD]  
**Review Cycles**: [TBD]  
**Files Touched**: ~20  
**Lines Added**: ~1500 (estimated)  
**Lines Removed**: ~0

## Learnings for Future Sprints

[To be added after sprint completion]

---

*Sprint Started: [TBD]*  
*Sprint Completed: [TBD]*  
*Final Status: NOT STARTED* 

### Toast Hook (Simple Implementation)
```typescript
// hooks/useToast.ts
import { useCallback } from 'react';
import { Alert } from 'react-native';

interface ToastOptions {
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info';
}

export function useToast() {
  const showToast = useCallback((options: ToastOptions) => {
    // Simple implementation using Alert
    // In production, use a proper toast library like react-native-toast-message
    Alert.alert(options.title, options.message);
  }, []);
  
  return { showToast };
}
``` 