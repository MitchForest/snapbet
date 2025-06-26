-- Add system message type to the enum
ALTER TYPE message_type ADD VALUE IF NOT EXISTS 'system';

-- Create a dedicated system user for system messages
INSERT INTO users (id, email, username, display_name, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'system@snapbet.internal',
  'system',
  'System',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Add metadata column to messages if it doesn't exist
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Create index for better group chat performance
CREATE INDEX IF NOT EXISTS idx_chat_members_chat_id ON chat_members(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created_at ON messages(chat_id, created_at DESC);

-- RPC function for atomic group chat creation
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
BEGIN
  -- Get the creator ID (use auth.uid() if not provided)
  v_creator_id := COALESCE(p_created_by, auth.uid());
  
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
  
  -- Create system message for group creation
  INSERT INTO messages (
    chat_id,
    sender_id,
    content,
    message_type,
    metadata
  )
  VALUES (
    v_chat_id,
    '00000000-0000-0000-0000-000000000000',
    'Group created',
    'system',
    jsonb_build_object(
      'action', 'group_created',
      'actor_id', v_creator_id
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

-- Function to handle member changes and create system messages
CREATE OR REPLACE FUNCTION handle_chat_member_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_actor_username TEXT;
  v_target_username TEXT;
BEGIN
  -- Only create system messages for group chats
  IF EXISTS (SELECT 1 FROM chats WHERE id = NEW.chat_id AND chat_type = 'group') THEN
    IF TG_OP = 'INSERT' THEN
      -- Get usernames for the message
      SELECT username INTO v_target_username FROM users WHERE id = NEW.user_id;
      
      -- Create system message for member added
      INSERT INTO messages (
        chat_id,
        sender_id,
        content,
        message_type,
        metadata
      )
      VALUES (
        NEW.chat_id,
        '00000000-0000-0000-0000-000000000000',
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
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member changes
DROP TRIGGER IF EXISTS chat_member_changes_trigger ON chat_members;
CREATE TRIGGER chat_member_changes_trigger
AFTER INSERT ON chat_members
FOR EACH ROW
EXECUTE FUNCTION handle_chat_member_changes();

-- Function to handle member removal
CREATE OR REPLACE FUNCTION handle_chat_member_removal()
RETURNS TRIGGER AS $$
DECLARE
  v_target_username TEXT;
  v_chat_type chat_type;
  v_remaining_admins INTEGER;
  v_oldest_member RECORD;
BEGIN
  -- Get chat type
  SELECT chat_type INTO v_chat_type FROM chats WHERE id = OLD.chat_id;
  
  -- Only process group chats
  IF v_chat_type = 'group' THEN
    -- Get username for the message
    SELECT username INTO v_target_username FROM users WHERE id = OLD.user_id;
    
    -- Create system message for member removed
    INSERT INTO messages (
      chat_id,
      sender_id,
      content,
      message_type,
      metadata
    )
    VALUES (
      OLD.chat_id,
      '00000000-0000-0000-0000-000000000000',
      v_target_username || ' left the group',
      'system',
      jsonb_build_object(
        'action', 'member_removed',
        'target_id', OLD.user_id,
        'target_username', v_target_username
      )
    );
    
    -- If removed member was admin, check if we need to assign a new admin
    IF OLD.role = 'admin' THEN
      -- Count remaining admins
      SELECT COUNT(*) INTO v_remaining_admins
      FROM chat_members
      WHERE chat_id = OLD.chat_id AND role = 'admin';
      
      -- If no admins left, make the oldest member an admin
      IF v_remaining_admins = 0 THEN
        SELECT user_id INTO v_oldest_member
        FROM chat_members
        WHERE chat_id = OLD.chat_id
        ORDER BY joined_at ASC
        LIMIT 1;
        
        IF v_oldest_member.user_id IS NOT NULL THEN
          UPDATE chat_members
          SET role = 'admin'
          WHERE chat_id = OLD.chat_id AND user_id = v_oldest_member.user_id;
        END IF;
      END IF;
    END IF;
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member removal
DROP TRIGGER IF EXISTS chat_member_removal_trigger ON chat_members;
CREATE TRIGGER chat_member_removal_trigger
AFTER DELETE ON chat_members
FOR EACH ROW
EXECUTE FUNCTION handle_chat_member_removal();

-- Add RLS policies for group chats
CREATE POLICY "Users can view groups they are members of"
  ON chats FOR SELECT
  USING (
    chat_type = 'group' AND
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Group admins can update group details"
  ON chats FOR UPDATE
  USING (
    chat_type = 'group' AND
    EXISTS (
      SELECT 1 FROM chat_members
      WHERE chat_members.chat_id = chats.id
      AND chat_members.user_id = auth.uid()
      AND chat_members.role = 'admin'
    )
  );

-- Grant execute permission on the RPC function
GRANT EXECUTE ON FUNCTION create_group_chat TO authenticated; 