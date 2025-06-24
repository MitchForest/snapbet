-- Migration: Fix notification schema to match intended design
-- Sprint: 02.06 - Technical Debt Cleanup
-- Date: 2024-12-20
-- Purpose: Convert notifications table from title/body to type/data pattern

-- Since there are no existing notifications (verified), we can safely modify the structure

-- Drop existing constraints
ALTER TABLE notifications 
DROP CONSTRAINT IF EXISTS notifications_read_check;

-- Remove old columns and add new ones
ALTER TABLE notifications 
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS body;

-- Ensure type column exists with proper constraint
ALTER TABLE notifications 
ALTER COLUMN type SET NOT NULL;

-- Add check constraint for valid notification types
ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS valid_notification_type,
ADD CONSTRAINT valid_notification_type CHECK (type IN (
  'tail', 'fade', 'bet_won', 'bet_lost', 'tail_won', 'tail_lost',
  'fade_won', 'fade_lost', 'follow', 'message', 'mention', 'milestone', 'system'
));

-- Ensure data column exists with proper default
ALTER TABLE notifications
ALTER COLUMN data SET DEFAULT '{}',
ALTER COLUMN data SET NOT NULL;

-- Update column comments for documentation
COMMENT ON COLUMN notifications.type IS 'Notification type: tail, fade, bet_won, bet_lost, tail_won, tail_lost, fade_won, fade_lost, follow, message, mention, milestone, system';
COMMENT ON COLUMN notifications.data IS 'JSON data specific to notification type. Structure varies by type:
- tail/fade: {actorId, actorUsername, postId, betId, amount, gameInfo}
- bet_won/lost: {betId, amount, gameInfo}
- tail_won/lost, fade_won/lost: {actorId, actorUsername, betId, amount, gameInfo}
- follow: {followerId, followerUsername}
- message: {chatId, senderId, senderUsername, preview}
- mention: {actorId, actorUsername, postId}
- milestone: {badgeId, badgeName, achievement}
- system: {message, action}';

-- Re-add the read constraint
ALTER TABLE notifications
ADD CONSTRAINT notifications_read_check CHECK (
  (read = FALSE AND read_at IS NULL) OR
  (read = TRUE AND read_at IS NOT NULL)
);

-- Recreate the notification creation function with updated signature
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_data JSONB
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, data)
  VALUES (p_user_id, p_type, p_data)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_notification TO authenticated; 