-- Add avatar URLs to notification data for better UI display
-- This migration updates the notification creation triggers to include avatar URLs

-- Function to get user avatar URL
CREATE OR REPLACE FUNCTION get_user_avatar_url(p_user_id UUID)
RETURNS TEXT AS $$
  SELECT avatar_url FROM users WHERE id = p_user_id;
$$ LANGUAGE sql STABLE;

-- Update the follow request notification trigger to include avatar URL
CREATE OR REPLACE FUNCTION notify_follow_request()
RETURNS TRIGGER AS $$
DECLARE
  v_requester users%ROWTYPE;
BEGIN
  -- Get requester info including avatar
  SELECT * INTO v_requester FROM users WHERE id = NEW.requester_id;
  
  -- Create notification for the requested user
  INSERT INTO notifications (user_id, type, data, read)
  VALUES (
    NEW.requested_id,
    'follow_request',
    jsonb_build_object(
      'requesterId', NEW.requester_id,
      'requesterUsername', v_requester.username,
      'requesterAvatarUrl', v_requester.avatar_url,
      'requestId', NEW.id
    ),
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update the follow acceptance notification trigger
CREATE OR REPLACE FUNCTION handle_follow_request_acceptance()
RETURNS TRIGGER AS $$
DECLARE
  v_requested_user users%ROWTYPE;
BEGIN
  -- When a request is accepted, create the follow relationship
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    INSERT INTO follows (follower_id, following_id)
    VALUES (NEW.requester_id, NEW.requested_id)
    ON CONFLICT DO NOTHING;
    
    -- Get the user who accepted the request
    SELECT * INTO v_requested_user FROM users WHERE id = NEW.requested_id;
    
    -- Create notification for the requester
    INSERT INTO notifications (user_id, type, data, read)
    VALUES (
      NEW.requester_id,
      'follow',
      jsonb_build_object(
        'followerId', NEW.requested_id,
        'followerUsername', v_requested_user.username,
        'followerAvatarUrl', v_requested_user.avatar_url,
        'accepted', true
      ),
      false
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update existing notifications to include avatar URLs
UPDATE notifications n
SET data = n.data || jsonb_build_object('followerAvatarUrl', u.avatar_url)
FROM users u
WHERE n.type = 'follow' 
  AND (n.data->>'followerId')::uuid = u.id
  AND n.data->>'followerAvatarUrl' IS NULL;

UPDATE notifications n
SET data = n.data || jsonb_build_object('requesterAvatarUrl', u.avatar_url)
FROM users u
WHERE n.type = 'follow_request' 
  AND (n.data->>'requesterId')::uuid = u.id
  AND n.data->>'requesterAvatarUrl' IS NULL;

UPDATE notifications n
SET data = n.data || jsonb_build_object('actorAvatarUrl', u.avatar_url)
FROM users u
WHERE n.type IN ('tail', 'fade', 'mention', 'tail_won', 'tail_lost', 'fade_won', 'fade_lost')
  AND (n.data->>'actorId')::uuid = u.id
  AND n.data->>'actorAvatarUrl' IS NULL;

UPDATE notifications n
SET data = n.data || jsonb_build_object('senderAvatarUrl', u.avatar_url)
FROM users u
WHERE n.type = 'message'
  AND (n.data->>'senderId')::uuid = u.id
  AND n.data->>'senderAvatarUrl' IS NULL;

-- Add comment documenting the enhanced data structure
COMMENT ON COLUMN notifications.data IS 'JSON data specific to notification type. Structure varies by type:
- tail/fade: {actorId, actorUsername, actorAvatarUrl, postId, betId, amount, gameInfo}
- bet_won/lost: {betId, amount, gameInfo}
- tail_won/lost, fade_won/lost: {actorId, actorUsername, actorAvatarUrl, betId, amount, gameInfo}
- follow: {followerId, followerUsername, followerAvatarUrl}
- follow_request: {requesterId, requesterUsername, requesterAvatarUrl, requestId}
- message: {chatId, senderId, senderUsername, senderAvatarUrl, preview}
- mention: {actorId, actorUsername, actorAvatarUrl, postId}
- milestone: {badgeId, badgeName, achievement}
- system: {message, action}'; 