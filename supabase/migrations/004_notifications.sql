-- Migration: Add notification system and privacy settings
-- Sprint: 02.04 - User Profile, Settings & Drawer
-- Date: 2024-12-20

-- Add privacy_settings to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"show_bankroll": true, "show_win_rate": true, "public_picks": true}';

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'tail', 'fade', 'bet_won', 'bet_lost', 'tail_won', 'tail_lost',
    'fade_won', 'fade_lost', 'follow', 'message', 'mention', 'milestone'
  )),
  data JSONB NOT NULL DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
  ON notifications(user_id, created_at DESC) 
  WHERE read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_all 
  ON notifications(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY notifications_select ON notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid()); -- Users can only see their own notifications

CREATE POLICY notifications_update ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid()); -- Users can only update their own (mark as read)

CREATE POLICY notifications_insert ON notifications FOR INSERT TO authenticated
  WITH CHECK (false); -- Only system/triggers can create notifications

CREATE POLICY notifications_delete ON notifications FOR DELETE TO authenticated
  USING (false); -- Users cannot delete notifications

-- Comment on notification data structure
COMMENT ON COLUMN notifications.data IS 'JSON structure varies by type:
- tail/fade: {actorId, actorUsername, postId, betId, amount}
- bet_won/lost: {betId, amount, gameInfo}
- follow: {followerId, followerUsername}
- message: {chatId, senderId, senderUsername, preview}
- milestone: {badgeId, badgeName, achievement}';

-- Comment on privacy settings structure  
COMMENT ON COLUMN users.privacy_settings IS 'JSON structure: {
  show_bankroll: boolean,
  show_win_rate: boolean,
  public_picks: boolean
}';

-- Function to create a notification (for triggers/RPC calls)
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