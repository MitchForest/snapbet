-- Add archiving support to chat_members
ALTER TABLE chat_members 
ADD COLUMN is_archived boolean DEFAULT false;

-- Add index for efficient querying of archived chats
CREATE INDEX idx_chat_members_archived 
ON chat_members(user_id, is_archived);

-- Create RPC function to get user's chats with counts and details
CREATE OR REPLACE FUNCTION get_user_chats_with_counts(p_user_id uuid)
RETURNS TABLE (
  chat_id uuid,
  chat_type text,
  name text,
  avatar_url text,
  created_by uuid,
  created_at timestamptz,
  last_message_at timestamptz,
  settings jsonb,
  is_archived boolean,
  unread_count bigint,
  last_message_id uuid,
  last_message_content text,
  last_message_sender_id uuid,
  last_message_sender_username text,
  last_message_created_at timestamptz,
  other_member_id uuid,
  other_member_username text,
  other_member_avatar_url text,
  member_count bigint
) AS $$
BEGIN
  RETURN QUERY
  WITH user_chats AS (
    SELECT 
      c.*,
      cm.is_archived,
      cm.last_read_at
    FROM chats c
    INNER JOIN chat_members cm ON cm.chat_id = c.id
    WHERE cm.user_id = p_user_id
  ),
  last_messages AS (
    SELECT DISTINCT ON (m.chat_id)
      m.id,
      m.chat_id,
      m.content,
      m.sender_id,
      m.created_at,
      u.username as sender_username
    FROM messages m
    LEFT JOIN users u ON u.id = m.sender_id
    WHERE m.deleted_at IS NULL
      AND m.chat_id IN (SELECT chat_id FROM user_chats)
    ORDER BY m.chat_id, m.created_at DESC
  ),
  unread_counts AS (
    SELECT 
      m.chat_id,
      COUNT(*) as unread_count
    FROM messages m
    INNER JOIN user_chats uc ON uc.chat_id = m.chat_id
    WHERE m.created_at > COALESCE(uc.last_read_at, '1970-01-01'::timestamptz)
      AND m.sender_id != p_user_id
      AND m.deleted_at IS NULL
    GROUP BY m.chat_id
  ),
  dm_other_members AS (
    SELECT 
      cm.chat_id,
      u.id as other_member_id,
      u.username as other_member_username,
      u.avatar_url as other_member_avatar_url
    FROM chat_members cm
    INNER JOIN users u ON u.id = cm.user_id
    INNER JOIN user_chats uc ON uc.chat_id = cm.chat_id
    WHERE uc.chat_type = 'dm'
      AND cm.user_id != p_user_id
  ),
  member_counts AS (
    SELECT 
      cm.chat_id,
      COUNT(*) as member_count
    FROM chat_members cm
    GROUP BY cm.chat_id
  )
  SELECT 
    uc.id as chat_id,
    uc.chat_type::text,
    uc.name,
    uc.avatar_url,
    uc.created_by,
    uc.created_at,
    uc.last_message_at,
    uc.settings,
    uc.is_archived,
    COALESCE(urc.unread_count, 0) as unread_count,
    lm.id as last_message_id,
    lm.content as last_message_content,
    lm.sender_id as last_message_sender_id,
    lm.sender_username as last_message_sender_username,
    lm.created_at as last_message_created_at,
    dom.other_member_id,
    dom.other_member_username,
    dom.other_member_avatar_url,
    mc.member_count
  FROM user_chats uc
  LEFT JOIN last_messages lm ON lm.chat_id = uc.id
  LEFT JOIN unread_counts urc ON urc.chat_id = uc.id
  LEFT JOIN dm_other_members dom ON dom.chat_id = uc.id
  LEFT JOIN member_counts mc ON mc.chat_id = uc.id
  ORDER BY 
    uc.is_archived ASC,
    COALESCE(lm.created_at, uc.created_at) DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_chats_with_counts(uuid) TO authenticated; 