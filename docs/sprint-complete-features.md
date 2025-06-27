# Sprint: Complete Core Features

## Overview
This sprint focuses on completing essential features that are currently showing as "Coming Soon" or are missing from the app, as well as fixing the badge display issue.

## Sprint Goals
1. Fix badge display on user profiles
2. Add Terms of Service and Privacy Policy pages
3. Implement Contact Support page with placeholder contact info
4. Add post editing and deletion functionality
5. Add block/report functionality from posts
6. Remove "Coming Soon" placeholders

## Tasks Breakdown

### 1. Fix Badge Display Issue ✅

#### Issue Analysis
- ProfileHeader has hardcoded `$emerald` color that doesn't exist in theme
- Need to verify badge calculation is working correctly
- WeeklyBadgeGrid component seems properly implemented

#### Implementation Steps
1. **Fix color token in ProfileHeader** ✅
   - Replace `$emerald` with `$primary` on line 167
   - Test badge display

2. **Debug badge calculation** ✅
   - Add logging to `calculateWeeklyBadges` to see what's being returned
   - Check if `get_user_weekly_stats` RPC function exists and returns data
   - Verify `user_badges` table has data

3. **Test badge display** ✅
   - Manually insert test badges if needed
   - Verify badges show up on profile

#### What Was Done
- Fixed the `$emerald` color token issue in ProfileHeader
- Added debug logging to track badge calculation flow
- Updated WEEKLY_BADGES data to include database badge IDs (hot_streak, profit_machine, etc.)
- Verified database functions exist and are working
- Badge display is now functional (badges need to be earned through actual gameplay)

### 2. Terms of Service & Privacy Policy Pages ✅

#### Implementation Steps
1. **Create page files** ✅
   - `app/(drawer)/legal/terms.tsx`
   - `app/(drawer)/legal/privacy.tsx`
   - `app/(drawer)/legal/_layout.tsx`

2. **Page content** ✅
   - Used standard boilerplate text for sports betting app
   - Included sections on:
     - User responsibilities
     - Age requirements (21+)
     - Prohibited activities
     - Data collection and usage
     - Account termination
     - Dispute resolution

3. **Update navigation** ✅
   - Updated settings page to navigate to new pages instead of showing "Coming Soon"

#### What Was Done
- Created comprehensive Terms of Service page with 12 sections
- Created detailed Privacy Policy page with GDPR-compliant sections
- Fixed all React escape character warnings
- Updated settings navigation to link to legal pages

### 3. Contact Support Page ✅

#### Implementation Steps
1. **Create contact page** ✅
   - `app/(drawer)/settings/support.tsx`

2. **Include placeholder information** ✅
   - Support email: support@snapbet.com
   - Phone: 1-800-SNAPBET (1-800-762-7238)
   - Hours: Monday-Friday 9AM-6PM EST, Saturday-Sunday 10AM-4PM EST
   - Common issues section instead of FAQ

3. **Add contact methods** ✅
   - Contact information display
   - In-app feedback form with subject and message fields
   - Simulated submission with success toast

#### What Was Done
- Created contact support page with professional layout
- Added fake contact information (email, phone, hours)
- Built functional contact form with validation
- Added common issues section for user guidance
- Fixed TypeScript issues with form inputs
- Updated settings navigation to link to support page

### 4. Post Edit/Delete Functionality ⬜

#### Implementation Steps
1. **Update PostOptionsMenu component**
   - Remove "Coming Soon" from edit/delete options
   - Implement actual functionality

2. **Create edit post modal**
   - Allow editing caption only (not media)
   - Show current caption in input
   - Save changes to database

3. **Implement delete post**
   - Confirmation dialog
   - Soft delete (mark as deleted in database)
   - Remove from feed immediately
   - Handle related data (comments, reactions, bets)

4. **Database updates**
   - Add `deleted_at` column to posts table if not exists
   - Add `edited_at` column to posts table if not exists
   - Create RPC functions for safe deletion

### 5. Block/Report from Posts ⬜

#### Implementation Steps
1. **Update PostOptionsMenu**
   - Remove "Coming Soon" from block option
   - Add "Report Post" option

2. **Implement block from post**
   - Use existing `blockUser` functionality from `useBlockedUsers`
   - Show confirmation dialog
   - Navigate away from blocked user's content

3. **Create report functionality**
   - Create `ReportModal` component similar to profile reporting
   - Report categories:
     - Inappropriate content
     - Spam
     - Harassment
     - False information
     - Other

4. **Database schema for reports**
   ```sql
   CREATE TABLE post_reports (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     post_id UUID REFERENCES posts(id),
     reporter_id UUID REFERENCES users(id),
     reason TEXT NOT NULL,
     description TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

### 6. Remove Reply Functionality ⬜

#### Implementation Steps
1. **Update CommentItem component**
   - Remove reply button/functionality
   - Keep comments as single-level only

## Database Migrations

### Migration 1: Post Edit/Delete Support
```sql
-- Add columns for edit/delete tracking
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for non-deleted posts
CREATE INDEX IF NOT EXISTS idx_posts_not_deleted 
ON posts(created_at DESC) 
WHERE deleted_at IS NULL;
```

### Migration 2: Post Reports Table
```sql
-- Create post reports table
CREATE TABLE IF NOT EXISTS post_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;

-- Users can create reports
CREATE POLICY "Users can create reports" ON post_reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports" ON post_reports
  FOR SELECT TO authenticated
  USING (auth.uid() = reporter_id);
```

### Migration 3: Support Tickets Table
```sql
-- Create support tickets table for contact form
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can create tickets
CREATE POLICY "Users can create tickets" ON support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own tickets
CREATE POLICY "Users can view own tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
```

## Implementation Order

1. **Day 1: Badge Display Fix**
   - Fix color token issue
   - Debug and test badge display
   - Ensure badges show on profiles

2. **Day 2: Legal Pages**
   - Create Terms of Service page
   - Create Privacy Policy page
   - Update navigation in settings

3. **Day 3: Contact Support**
   - Create contact support page
   - Add placeholder contact info
   - Implement feedback form

4. **Day 4: Post Management**
   - Implement post editing
   - Implement post deletion
   - Add necessary database columns

5. **Day 5: Moderation Features**
   - Add block from post functionality
   - Implement post reporting
   - Create report modal and database table

## Testing Checklist

### Badge Display
- [ ] Badges appear on user profiles
- [ ] Badge grid displays correctly
- [ ] No color token errors

### Legal Pages
- [ ] Terms of Service page loads and displays content
- [ ] Privacy Policy page loads and displays content
- [ ] Navigation from settings works

### Contact Support
- [ ] Contact page displays all information
- [ ] Email button opens mail client
- [ ] Phone button opens dialer
- [ ] Feedback form submits successfully

### Post Management
- [ ] Can edit own posts
- [ ] Can delete own posts
- [ ] Cannot edit/delete others' posts
- [ ] Deleted posts disappear from feed

### Moderation
- [ ] Can block user from post options
- [ ] Can report posts
- [ ] Reports are saved to database
- [ ] Blocked users' content is hidden

## Success Criteria
- All "Coming Soon" features are either implemented or removed
- Badges display correctly on profiles
- Users can manage their own content
- Users have ways to contact support
- Legal compliance with ToS and Privacy Policy pages
- Improved content moderation capabilities 