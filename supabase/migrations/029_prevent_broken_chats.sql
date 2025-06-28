-- Prevent broken chats by adding constraints and validation

-- Add a check constraint to ensure DM chats always have exactly 2 members
-- This requires a function to count members
CREATE OR REPLACE FUNCTION validate_chat_members()
RETURNS TRIGGER AS $$
DECLARE
  v_member_count INTEGER;
  v_chat_type chat_type;
BEGIN
  -- Get the chat type
  SELECT chat_type INTO v_chat_type
  FROM chats
  WHERE id = NEW.chat_id;
  
  -- Count members for this chat
  SELECT COUNT(*) INTO v_member_count
  FROM chat_members
  WHERE chat_id = NEW.chat_id;
  
  -- For DM chats, ensure exactly 2 members
  IF v_chat_type = 'dm' THEN
    -- If this is an INSERT and we already have 2 members, reject
    IF TG_OP = 'INSERT' AND v_member_count >= 2 THEN
      RAISE EXCEPTION 'DM chats can only have exactly 2 members';
    END IF;
  END IF;
  
  -- For group chats, ensure at least 2 members
  IF v_chat_type = 'group' THEN
    IF TG_OP = 'DELETE' AND v_member_count <= 2 THEN
      RAISE EXCEPTION 'Group chats must have at least 2 members';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for member validation
DROP TRIGGER IF EXISTS validate_chat_members_trigger ON chat_members;
CREATE TRIGGER validate_chat_members_trigger
BEFORE INSERT ON chat_members
FOR EACH ROW
EXECUTE FUNCTION validate_chat_members();

-- Add a function to clean up chats with no members after a delay
CREATE OR REPLACE FUNCTION cleanup_empty_chats()
RETURNS TRIGGER AS $$
BEGIN
  -- After deleting a member, check if the chat is now empty
  IF TG_OP = 'DELETE' THEN
    -- Schedule cleanup after a short delay to allow for batch operations
    PERFORM pg_sleep(0.1);
    
    -- Delete chats with no members
    DELETE FROM chats
    WHERE id = OLD.chat_id
      AND NOT EXISTS (
        SELECT 1 FROM chat_members
        WHERE chat_id = OLD.chat_id
      );
  END IF;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for cleanup
DROP TRIGGER IF EXISTS cleanup_empty_chats_trigger ON chat_members;
CREATE TRIGGER cleanup_empty_chats_trigger
AFTER DELETE ON chat_members
FOR EACH ROW
EXECUTE FUNCTION cleanup_empty_chats();

-- Create or replace the create_dm_chat function with proper validation
CREATE OR REPLACE FUNCTION create_dm_chat(other_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_chat_id UUID;
  v_user_id UUID;
BEGIN
  -- Get the current user ID
  v_user_id := auth.uid();
  
  -- Validate inputs
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;
  
  IF other_user_id IS NULL THEN
    RAISE EXCEPTION 'Other user ID is required';
  END IF;
  
  IF v_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot create DM with yourself';
  END IF;
  
  -- Check if DM already exists between these users
  SELECT cm1.chat_id INTO v_chat_id
  FROM chat_members cm1
  INNER JOIN chat_members cm2 ON cm1.chat_id = cm2.chat_id
  INNER JOIN chats c ON c.id = cm1.chat_id
  WHERE c.chat_type = 'dm'
    AND cm1.user_id = v_user_id
    AND cm2.user_id = other_user_id
  LIMIT 1;
  
  -- If DM exists, return it
  IF v_chat_id IS NOT NULL THEN
    RETURN v_chat_id;
  END IF;
  
  -- Create new DM chat
  INSERT INTO chats (chat_type, created_by)
  VALUES ('dm', v_user_id)
  RETURNING id INTO v_chat_id;
  
  -- Add both members in a single transaction
  INSERT INTO chat_members (chat_id, user_id, role)
  VALUES 
    (v_chat_id, v_user_id, 'member'),
    (v_chat_id, other_user_id, 'member');
  
  RETURN v_chat_id;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything fails, clean up the chat
    DELETE FROM chats WHERE id = v_chat_id;
    RAISE;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_dm_chat TO authenticated; 