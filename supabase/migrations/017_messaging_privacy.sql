-- Migration: Add messaging privacy and safety features
-- Sprint 06.06: Privacy & Safety

-- Message privacy settings table
CREATE TABLE IF NOT EXISTS message_privacy_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  who_can_message TEXT DEFAULT 'everyone' 
    CHECK (who_can_message IN ('everyone', 'following', 'nobody')),
  read_receipts_enabled BOOLEAN DEFAULT true,
  typing_indicators_enabled BOOLEAN DEFAULT true,
  online_status_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message reports table
CREATE TABLE IF NOT EXISTS message_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'hate', 'other')),
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  action_taken TEXT CHECK (action_taken IN ('dismissed', 'content_removed', 'user_warned', 'user_banned')),
  UNIQUE(message_id, reporter_id)
);

-- Add report count to messages for efficient filtering
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;

-- Add is_blocked flag for client-side filtering
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- Function to update report count
CREATE OR REPLACE FUNCTION update_message_report_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE messages
  SET report_count = (
    SELECT COUNT(*) FROM message_reports
    WHERE message_id = NEW.message_id
  )
  WHERE id = NEW.message_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for report count
CREATE TRIGGER message_report_count_trigger
AFTER INSERT ON message_reports
FOR EACH ROW
EXECUTE FUNCTION update_message_report_count();

-- Function to check if user can message another user
CREATE OR REPLACE FUNCTION can_user_message(sender_id UUID, recipient_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  privacy_setting TEXT;
  is_following BOOLEAN;
  is_blocked BOOLEAN;
BEGIN
  -- Check if blocked
  SELECT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE blocker_id = recipient_id AND blocked_id = sender_id
  ) INTO is_blocked;
  
  IF is_blocked THEN
    RETURN FALSE;
  END IF;
  
  -- Get recipient's privacy setting
  SELECT who_can_message INTO privacy_setting
  FROM message_privacy_settings
  WHERE user_id = recipient_id;
  
  -- Default to 'everyone' if no setting exists
  IF privacy_setting IS NULL THEN
    privacy_setting := 'everyone';
  END IF;
  
  -- Check based on privacy setting
  CASE privacy_setting
    WHEN 'everyone' THEN
      RETURN TRUE;
    WHEN 'following' THEN
      SELECT EXISTS (
        SELECT 1 FROM follows
        WHERE follower_id = recipient_id AND following_id = sender_id
      ) INTO is_following;
      RETURN is_following;
    WHEN 'nobody' THEN
      RETURN FALSE;
    ELSE
      RETURN TRUE;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_reports_message_id ON message_reports(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reports_reporter_id ON message_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_message_privacy_settings_user_id ON message_privacy_settings(user_id);

-- RLS policies
ALTER TABLE message_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reports ENABLE ROW LEVEL SECURITY;

-- Users can only view and update their own privacy settings
CREATE POLICY "Users can view own privacy settings"
ON message_privacy_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings"
ON message_privacy_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings"
ON message_privacy_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can report messages they can see
CREATE POLICY "Users can report visible messages"
ON message_reports
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN chat_members cm ON m.chat_id = cm.chat_id
    WHERE m.id = message_id
    AND cm.user_id = auth.uid()
  )
);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
ON message_reports
FOR SELECT
USING (auth.uid() = reporter_id);

-- Admins can view all reports (requires admin check in app)
CREATE POLICY "Admins can view all reports"
ON message_reports
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()
    AND user_metadata->>'is_admin' = 'true'
  )
);

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_message_privacy_settings_updated_at
BEFORE UPDATE ON message_privacy_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 