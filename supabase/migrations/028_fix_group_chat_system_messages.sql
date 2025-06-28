-- Fix excessive system messages in group chats by making the trigger smarter about batch operations

-- First, clean up excessive system messages from existing group chats
-- Keep only the first few join messages and the most recent ones
WITH numbered_messages AS (
  SELECT 
    m.id,
    m.chat_id,
    m.created_at,
    ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.created_at ASC) as rn_asc,
    ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.created_at DESC) as rn_desc
  FROM messages m
  JOIN chats c ON c.id = m.chat_id
  WHERE m.message_type = 'system'
    AND m.content LIKE '% joined the group'
    AND c.chat_type = 'group'
)
DELETE FROM messages
WHERE id IN (
  SELECT id 
  FROM numbered_messages 
  WHERE rn_asc > 5 AND rn_desc > 5  -- Keep first 5 and last 5 join messages
);

-- Drop the existing trigger
DROP TRIGGER IF EXISTS chat_member_changes_trigger ON chat_members;

-- Create a smarter function that batches system messages
CREATE OR REPLACE FUNCTION handle_chat_member_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_chat_type chat_type;
  v_recent_system_message TIMESTAMPTZ;
  v_target_username TEXT;
BEGIN
  -- Only process group chats
  SELECT chat_type INTO v_chat_type FROM chats WHERE id = NEW.chat_id;
  
  IF v_chat_type = 'group' THEN
    -- Check if there was a recent system message (within 1 second)
    -- This helps detect batch operations
    SELECT MAX(created_at) INTO v_recent_system_message
    FROM messages
    WHERE chat_id = NEW.chat_id
      AND message_type = 'system'
      AND metadata->>'action' = 'member_added'
      AND created_at > NOW() - INTERVAL '1 second';
    
    -- Only create a system message if there wasn't a recent one
    -- This prevents spam when adding multiple members at once
    IF v_recent_system_message IS NULL THEN
      -- Get username
      SELECT username INTO v_target_username FROM users WHERE id = NEW.user_id;
      
      -- Check if this is part of initial group creation (chat created within last minute)
      IF EXISTS (
        SELECT 1 FROM chats 
        WHERE id = NEW.chat_id 
        AND created_at > NOW() - INTERVAL '1 minute'
      ) THEN
        -- During initial creation, only create a message for non-creator members
        IF NEW.user_id != (SELECT created_by FROM chats WHERE id = NEW.chat_id) THEN
          -- Don't create individual join messages during initial setup
          RETURN NEW;
        END IF;
      ELSE
        -- For members added after initial creation, create a system message
        INSERT INTO messages (
          chat_id,
          sender_id,
          content,
          message_type,
          metadata
        )
        VALUES (
          NEW.chat_id,
          '00000000-0000-0000-0000-000000000001',  -- Use the correct system user ID
          v_target_username || ' joined the group',
          'system',
          jsonb_build_object(
            'action', 'member_added',
            'target_id', NEW.user_id,
            'target_username', v_target_username
          )
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER chat_member_changes_trigger
AFTER INSERT ON chat_members
FOR EACH ROW
EXECUTE FUNCTION handle_chat_member_changes();

-- Also update the create_group_chat function to create a better initial message
CREATE OR REPLACE FUNCTION create_group_chat(
  p_name TEXT,
  p_avatar_url TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL,
  p_member_ids UUID[] DEFAULT '{}',
  p_settings JSONB DEFAULT '{}'
)
RETURNS TABLE (
  id UUID,
  chat_type chat_type,
  name TEXT,
  avatar_url TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ,
  settings JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chat_id UUID;
  v_member_id UUID;
  v_creator_id UUID;
  v_creator_username TEXT;
BEGIN
  -- Get the creator ID (use auth.uid() if not provided)
  v_creator_id := COALESCE(p_created_by, auth.uid());
  
  -- Get creator username
  SELECT username INTO v_creator_username FROM users WHERE id = v_creator_id;
  
  -- Validate member count (creator + members should be between 2 and 50)
  IF array_length(p_member_ids, 1) IS NULL OR array_length(p_member_ids, 1) < 1 THEN
    RAISE EXCEPTION 'At least one other member is required for a group chat';
  END IF;
  
  IF array_length(p_member_ids, 1) > 49 THEN
    RAISE EXCEPTION 'Group cannot have more than 50 members';
  END IF;
  
  -- Ensure creator is not in the member list
  IF v_creator_id = ANY(p_member_ids) THEN
    RAISE EXCEPTION 'Creator cannot be in the member list';
  END IF;
  
  -- Create the chat
  INSERT INTO chats (chat_type, name, avatar_url, created_by, settings)
  VALUES ('group', p_name, p_avatar_url, v_creator_id, p_settings)
  RETURNING chats.id INTO v_chat_id;
  
  -- Add creator as admin
  INSERT INTO chat_members (chat_id, user_id, role)
  VALUES (v_chat_id, v_creator_id, 'admin');
  
  -- Add other members
  FOREACH v_member_id IN ARRAY p_member_ids
  LOOP
    INSERT INTO chat_members (chat_id, user_id, role)
    VALUES (v_chat_id, v_member_id, 'member');
  END LOOP;
  
  -- Create a single system message for group creation
  INSERT INTO messages (
    chat_id,
    sender_id,
    content,
    message_type,
    metadata
  )
  VALUES (
    v_chat_id,
    '00000000-0000-0000-0000-000000000001',
    v_creator_username || ' created the group "' || p_name || '"',
    'system',
    jsonb_build_object(
      'action', 'group_created',
      'actor_id', v_creator_id,
      'member_count', array_length(p_member_ids, 1) + 1
    )
  );
  
  -- Return the created chat
  RETURN QUERY
  SELECT 
    c.id,
    c.chat_type,
    c.name,
    c.avatar_url,
    c.created_by,
    c.created_at,
    c.settings
  FROM chats c
  WHERE c.id = v_chat_id;
END;
$$; 