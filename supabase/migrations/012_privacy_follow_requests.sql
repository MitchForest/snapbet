-- Migration: Add privacy system and follow requests
-- Epic: 04 - Feed & Social Engagement
-- Sprint: 04.04 - Privacy & Follow Requests

-- Create enum type for follow request status
CREATE TYPE follow_request_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');

-- Create follow_requests table
CREATE TABLE follow_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id uuid REFERENCES users(id) ON DELETE CASCADE,
  requested_id uuid REFERENCES users(id) ON DELETE CASCADE,
  status follow_request_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(requester_id, requested_id)
);

-- Add indexes for performance
CREATE INDEX idx_follow_requests_requested_status ON follow_requests(requested_id, status);
CREATE INDEX idx_follow_requests_created_at ON follow_requests(created_at) WHERE status = 'pending';
CREATE INDEX idx_follow_requests_requester ON follow_requests(requester_id, status);

-- Add privacy columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_private boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_bankroll boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_stats boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_picks boolean DEFAULT true;

-- Migrate existing JSONB data to new columns
UPDATE users 
SET 
  show_bankroll = COALESCE((privacy_settings->>'show_bankroll')::boolean, true),
  show_picks = COALESCE((privacy_settings->>'public_picks')::boolean, true)
WHERE privacy_settings IS NOT NULL;

-- Add RLS policies for follow_requests
ALTER TABLE follow_requests ENABLE ROW LEVEL SECURITY;

-- Users can see their own incoming requests
CREATE POLICY "Users can view their incoming follow requests"
  ON follow_requests FOR SELECT
  USING (requested_id = auth.uid());

-- Users can see their own outgoing requests
CREATE POLICY "Users can view their outgoing follow requests"
  ON follow_requests FOR SELECT
  USING (requester_id = auth.uid());

-- Users can create follow requests
CREATE POLICY "Users can create follow requests"
  ON follow_requests FOR INSERT
  WITH CHECK (requester_id = auth.uid());

-- Users can update their incoming requests (accept/reject)
CREATE POLICY "Users can update their incoming follow requests"
  ON follow_requests FOR UPDATE
  USING (requested_id = auth.uid());

-- Users can delete their outgoing requests (cancel)
CREATE POLICY "Users can delete their outgoing follow requests"
  ON follow_requests FOR DELETE
  USING (requester_id = auth.uid());

-- Function to automatically create follow on request acceptance
CREATE OR REPLACE FUNCTION handle_follow_request_acceptance()
RETURNS TRIGGER AS $$
BEGIN
  -- When a request is accepted, create the follow relationship
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO follows (follower_id, following_id)
    VALUES (NEW.requester_id, NEW.requested_id)
    ON CONFLICT DO NOTHING;
    
    -- Create notification for the requester
    INSERT INTO notifications (user_id, type, data, read)
    VALUES (
      NEW.requester_id,
      'follow',
      jsonb_build_object(
        'followerId', NEW.requested_id,
        'followerUsername', (SELECT username FROM users WHERE id = NEW.requested_id),
        'accepted', true
      ),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for follow request acceptance
CREATE TRIGGER on_follow_request_accepted
  AFTER UPDATE ON follow_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_follow_request_acceptance();

-- Function to create notification for new follow requests
CREATE OR REPLACE FUNCTION notify_follow_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for the requested user
  INSERT INTO notifications (user_id, type, data, read)
  VALUES (
    NEW.requested_id,
    'follow_request',
    jsonb_build_object(
      'requesterId', NEW.requester_id,
      'requesterUsername', (SELECT username FROM users WHERE id = NEW.requester_id),
      'requestId', NEW.id
    ),
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new follow requests
CREATE TRIGGER on_follow_request_created
  AFTER INSERT ON follow_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_follow_request();

-- Update existing notification type check constraint to include follow_request
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('tail', 'fade', 'bet_won', 'bet_lost', 'tail_won', 'tail_lost', 
                  'fade_won', 'fade_lost', 'follow', 'follow_request', 'message', 
                  'mention', 'milestone', 'system')); 