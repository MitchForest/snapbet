# Row Level Security (RLS) Testing Guide

## Overview

This guide provides test scenarios to verify that Row Level Security policies are working correctly in the SnapFade database.

## Prerequisites

1. Database migrations have been run
2. RLS is enabled on all tables
3. You have at least 2 test users created
4. Supabase SQL Editor is accessible

## Test Users Setup

Create test users for RLS testing:

```sql
-- Create test users
INSERT INTO users (email, username, oauth_provider, oauth_id, privacy_settings)
VALUES 
  ('user1@test.com', 'testuser1', 'google', 'google_123', '{"public_picks": true, "show_bankroll": true}'::jsonb),
  ('user2@test.com', 'testuser2', 'google', 'google_456', '{"public_picks": false, "show_bankroll": false}'::jsonb),
  ('user3@test.com', 'testuser3', 'google', 'google_789', '{"public_picks": true, "show_bankroll": false}'::jsonb);

-- Get their IDs for testing
SELECT id, username FROM users WHERE email LIKE '%@test.com';
```

## RLS Test Scenarios

### 1. Users Table

**Test: Users can view all users**
```sql
-- As authenticated user (any user)
SELECT * FROM users;
-- Expected: Should see all users
```

**Test: Users can only update their own profile**
```sql
-- As user1
UPDATE users SET bio = 'Updated bio' WHERE id = '[user1_id]';
-- Expected: Success

UPDATE users SET bio = 'Hacked!' WHERE id = '[user2_id]';
-- Expected: Failure - no rows updated
```

### 2. Bankrolls Table

**Test: Users can only see bankrolls based on privacy settings**
```sql
-- As user1
SELECT * FROM bankrolls;
-- Expected: Should see own bankroll + user3's (public bankroll)
-- Should NOT see user2's (private bankroll)
```

**Test: Users can only update their own bankroll**
```sql
-- As user1
UPDATE bankrolls SET balance = 200000 WHERE user_id = '[user1_id]';
-- Expected: Success (though normally done through functions)

UPDATE bankrolls SET balance = 0 WHERE user_id = '[user2_id]';
-- Expected: Failure - no rows updated
```

### 3. Bets Table

**Test: Users can see own bets and bets attached to visible posts**
```sql
-- Create a bet and post
INSERT INTO bets (user_id, game_id, bet_type, bet_details, stake, odds, potential_win, expires_at)
VALUES ('[user1_id]', 'nba_2024_lal_gsw_001', 'spread', '{"team": "Lakers", "line": -3.5}'::jsonb, 1000, -110, 909, NOW() + INTERVAL '2 hours');

-- Create a post with the bet
INSERT INTO posts (user_id, bet_id, media_url, media_type, caption, expires_at)
VALUES ('[user1_id]', '[bet_id]', 'https://example.com/image.jpg', 'photo', 'Lakers -3.5 🔒', NOW() + INTERVAL '24 hours');

-- As user2
SELECT * FROM bets WHERE user_id = '[user1_id]';
-- Expected: Should see the bet if user1 has public picks enabled
```

### 4. Posts Table

**Test: Post visibility based on privacy and follows**
```sql
-- Create follow relationship
INSERT INTO follows (follower_id, following_id) VALUES ('[user2_id]', '[user1_id]');

-- As user2
SELECT * FROM posts;
-- Expected: Should see:
-- - Own posts
-- - Posts from user1 (following)
-- - Posts from users with public_picks = true
-- Should NOT see posts from user3 (not following, private picks)
```

### 5. Chat & Messages

**Test: Users can only see chats they're members of**
```sql
-- Create a DM chat
INSERT INTO chats (chat_type, created_by) VALUES ('dm', '[user1_id]');
INSERT INTO chat_members (chat_id, user_id, role) VALUES ('[chat_id]', '[user1_id]', 'admin');
INSERT INTO chat_members (chat_id, user_id, role) VALUES ('[chat_id]', '[user2_id]', 'member');

-- As user3
SELECT * FROM chats WHERE id = '[chat_id]';
-- Expected: No results (not a member)

-- As user1 or user2
SELECT * FROM chats WHERE id = '[chat_id]';
-- Expected: Should see the chat
```

**Test: Only chat members can send messages**
```sql
-- As user3 (not a member)
INSERT INTO messages (chat_id, sender_id, content)
VALUES ('[chat_id]', '[user3_id]', 'Hello!');
-- Expected: Failure - violates RLS

-- As user1 (member)
INSERT INTO messages (chat_id, sender_id, content)
VALUES ('[chat_id]', '[user1_id]', 'Hello!');
-- Expected: Success
```

### 6. Pick Actions (Tail/Fade)

**Test: Users can tail/fade visible posts**
```sql
-- As user2, tail user1's post
SELECT tail_pick('[user2_id]', '[post_id]');
-- Expected: Success if post is visible to user2

-- Try to tail again
SELECT tail_pick('[user2_id]', '[post_id]');
-- Expected: Failure - already tailed
```

## Testing in Application

When testing RLS in the application:

1. **Authentication Context**: Ensure users are properly authenticated
2. **Error Handling**: Check for RLS policy violations in error messages
3. **Data Filtering**: Verify that queries return only authorized data
4. **Write Operations**: Test that inserts/updates respect RLS policies

## Common RLS Issues

1. **Missing auth.uid()**: Ensure authenticated users have proper JWT tokens
2. **Policy Conflicts**: Check for overlapping policies that might deny access
3. **Join Issues**: Complex queries with joins may need careful policy design
4. **Performance**: Monitor query performance with RLS enabled

## Debugging RLS

Enable RLS debugging in Supabase:

```sql
-- Check current user
SELECT auth.uid();

-- Test a specific policy
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = '[user_id]';
SELECT * FROM posts;
```

## Security Best Practices

1. **Default Deny**: Always start with restrictive policies
2. **Explicit Policies**: Be explicit about what's allowed
3. **Test Thoroughly**: Test all CRUD operations for each role
4. **Monitor Logs**: Watch for RLS policy violations in logs
5. **Regular Audits**: Periodically review and test policies 