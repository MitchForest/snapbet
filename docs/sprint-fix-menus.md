# Sprint Fix: UI/UX Issues

## Overview
This document tracks the UI/UX issues that need to be fixed, with a systematic approach to fixing each one.

## Issues to Fix

### 1. Notifications Page Issues ✅

#### Issue 1.1: No ability to scroll down ✅
- **Location**: `app/(drawer)/notifications.tsx`
- **Problem**: The ScrollView is not properly configured to allow scrolling
- **Root Cause**: The parent View doesn't have `flex={1}`, causing the ScrollView to not have proper height constraints
- **Fix**: Add proper flex styling to parent containers
- **Status**: FIXED - Wrapped ScrollView in a View with flex={1}

#### Issue 1.2: Notifications should have clickable usernames/navigation ✅
- **Location**: `components/notifications/NotificationItem.tsx`
- **Problem**: Notifications that mention users don't navigate to profiles, message notifications don't navigate to chats
- **Root Cause**: The `onPress` handler is only marking as read, not navigating based on notification type
- **Fix**: Implement proper navigation logic based on notification type
- **Status**: FIXED - Added navigation logic for all notification types and made usernames clickable

### 2. User Profile Menu Issues ✅

#### Issue 2.1: Remove "Reset Bankroll" option ✅
- **Location**: `components/ui/DrawerContent.tsx`
- **Problem**: Reset bankroll option should not be in the profile menu
- **Root Cause**: Legacy feature that should be removed
- **Fix**: Remove the reset bankroll menu item
- **Status**: FIXED - Removed reset bankroll menu item and its handler

#### Issue 2.2: "View Bet History" navigation ✅
- **Location**: `components/ui/DrawerContent.tsx`
- **Problem**: Clicking "View bet history" should navigate to profile bets tab
- **Root Cause**: Missing navigation implementation
- **Fix**: Add navigation to profile with bets tab selected
- **Status**: FIXED - Updated to navigate to profile with activeTab='bets'

#### Issue 2.3: Profile stats showing placeholders ✅
- **Location**: `components/profile/ProfileHeader.tsx`
- **Problem**: Stats are showing placeholder values or not displaying correctly
- **Root Cause**: Data fetching or display logic issues
- **Fix**: Ensure proper data fetching and conditional rendering
- **Status**: FIXED - Stats are properly fetched and displayed with correct formatting

#### Issue 2.4: Avatar placeholder showing instead of real picture ✅
- **Location**: `components/ui/DrawerContent.tsx`
- **Problem**: User avatars not loading properly
- **Root Cause**: Avatar URL not being passed to Avatar component
- **Fix**: Fetch and pass avatar_url to Avatar component
- **Status**: FIXED - Added avatar_url fetching and passing to Avatar component

#### Issue 2.5: Notification count placeholder ✅
- **Location**: `components/ui/DrawerContent.tsx`
- **Problem**: Notification count appears to be a placeholder
- **Root Cause**: Already properly implemented using useNotifications hook
- **Fix**: No fix needed - already working correctly
- **Status**: VERIFIED - Notification count is properly displayed

### 3. Invite Page Issues ✅

#### Issue 3.1: Unreadable white text ✅
- **Location**: `components/invite/InviteCard.tsx`, `components/referral/ReferralStatsCard.tsx`
- **Problem**: White text on light backgrounds making it unreadable
- **Root Cause**: Hardcoded "white" color instead of theme tokens, undefined $emerald tokens
- **Fix**: Update text colors to use proper theme tokens ($textInverse, $primary, etc.)
- **Status**: FIXED - Updated all hardcoded colors to use proper theme tokens

## Implementation Summary

### Phase 1: Notifications Page ✅
1. Fixed ScrollView scrolling issue ✅
2. Implemented navigation logic for different notification types ✅
3. Made usernames in notifications clickable ✅

### Phase 2: Profile Menu ✅
1. Removed reset bankroll option ✅
2. Implemented bet history navigation to profile bets tab ✅
3. Fixed avatar loading in DrawerContent ✅
4. Verified stats display is working correctly ✅
5. Verified notification count is working correctly ✅

### Phase 3: Invite Page ✅
1. Audited all text colors ✅
2. Updated to use proper theme tokens ✅
3. Ensured readability on all backgrounds ✅

## Testing Checklist
- [x] Notifications page scrolls properly
- [x] Clicking on notifications navigates correctly
- [x] Profile menu has correct options
- [x] Profile stats display real data
- [x] Avatars load correctly
- [x] Invite page text is readable
- [x] All lint checks pass
- [x] All type checks pass

## Changes Made

### Files Modified:
1. `app/(drawer)/notifications.tsx` - Added proper flex container for ScrollView
2. `components/notifications/NotificationItem.tsx` - Added navigation logic and clickable usernames
3. `components/ui/DrawerContent.tsx` - Removed reset bankroll, fixed bet history navigation, added avatar loading
4. `app/(drawer)/profile/[username].tsx` - Added support for activeTab parameter
5. `components/invite/InviteCard.tsx` - Fixed hardcoded white colors to use theme tokens
6. `components/referral/ReferralStatsCard.tsx` - Fixed hardcoded white colors to use theme tokens

### Key Improvements:
- Better navigation flow throughout the app
- Consistent use of theme tokens for colors
- Improved data fetching and display in profile components
- Removed unnecessary/confusing features (reset bankroll)
- Enhanced accessibility with proper color contrast 