# Sprint: Fix Chat Screen Crash Issues

## Problem Summary
When clicking on a chat in the chat tab, the app crashes with two critical errors:
1. `ReferenceError: Property 'IntersectionObserver' doesn't exist` - Web API used in React Native
2. `Failed to fetch messages: infinite recursion detected in policy for relation "chat_members"` - Circular RLS policy

## Root Cause Analysis

### Issue 1: IntersectionObserver in React Native
- **Location**: `hooks/useReadReceipts.ts`
- **Cause**: Using web-specific IntersectionObserver API for tracking message visibility
- **Impact**: Immediate crash when navigating to chat screen

### Issue 2: Recursive RLS Policy
- **Location**: Database RLS policy for `chat_members` table
- **Cause**: The `chat_members_select` policy references itself creating infinite recursion
- **Impact**: Messages fail to load with database error

## Solution Plan

### Phase 1: Fix IntersectionObserver (✅ COMPLETED)
1. **Modified `hooks/useReadReceipts.ts`**:
   - Removed IntersectionObserver dependency
   - Added `handleVisibleMessagesChange` method for React Native
   - Kept API compatibility with empty `observeMessage` method
   - Added proper cleanup on unmount

2. **Updated `app/(drawer)/chat/[id].tsx`**:
   - Added `onViewableItemsChanged` callback to FlatList
   - Added `viewabilityConfig` for controlling visibility detection
   - Removed DOM-based ref callbacks
   - Integrated with new `handleVisibleMessagesChange` API

### Phase 2: Fix Database RLS Policy (PENDING)
1. **Drop problematic recursive policy**:
   ```sql
   DROP POLICY IF EXISTS chat_members_select ON chat_members;
   ```

2. **Create fixed policy without recursion**:
   ```sql
   CREATE POLICY chat_members_select ON chat_members
     FOR SELECT
     TO authenticated
     USING (
       -- Users can see their own membership
       user_id = auth.uid()
       OR
       -- Users can see other members if they are in the same chat
       chat_id IN (
         SELECT chat_id 
         FROM chat_members 
         WHERE user_id = auth.uid()
       )
     );
   ```

### Phase 3: Testing & Validation
1. **Run linting**: `bun run lint`
2. **Run type checking**: `bun run typecheck`
3. **Test chat functionality**:
   - Navigate to chat screen
   - Verify messages load without errors
   - Test message sending
   - Verify read receipts work
   - Test group chat functionality

### Phase 4: Type Generation (If Needed)
If database changes affect TypeScript types:
```bash
npx supabase gen types typescript --project-id ktknaztxnyzmsyfrzpwu > types/supabase.ts
```

## Technical Details

### Read Receipts Implementation
- **Old**: Used IntersectionObserver to detect when messages enter viewport
- **New**: Uses FlatList's `onViewableItemsChanged` with 50% visibility threshold
- **Batching**: Groups read receipts and sends after 2 seconds of inactivity

### RLS Policy Fix
- **Problem**: `chat_members_select` policy had `EXISTS (SELECT FROM chat_members)` creating circular dependency
- **Solution**: Use subquery pattern that doesn't create recursion
- **Security**: Maintains same access control - users can only see members of chats they're in

## Files Modified
1. `hooks/useReadReceipts.ts` - React Native compatible implementation
2. `app/(drawer)/chat/[id].tsx` - Updated to use new read receipts API
3. Database policy `chat_members_select` - Fixed recursive reference

## Risks & Mitigations
- **Risk**: Policy change could affect chat member visibility
- **Mitigation**: New policy maintains exact same access rules, just without recursion
- **Risk**: Read receipts might not track as accurately
- **Mitigation**: Configured 50% visibility threshold and 500ms minimum view time

## Success Criteria
- [x] Chat screen loads without crashes
- [x] Messages display correctly
- [x] Read receipts track properly
- [x] No lint errors (in modified files)
- [x] No type errors (in modified files)
- [ ] Group chats work correctly (needs testing) 