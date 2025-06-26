-- Migration: Add media, bet, and message type support to messages
-- Description: Extends messages table to support media uploads, pick sharing, and message types

-- Add new columns to messages table
ALTER TABLE messages 
ADD COLUMN media_url TEXT,
ADD COLUMN bet_id UUID REFERENCES bets(id) ON DELETE SET NULL,
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'media', 'pick'));

-- Add index for bet_id lookups (for finding shared picks)
CREATE INDEX idx_messages_bet ON messages(bet_id) WHERE bet_id IS NOT NULL;

-- Add index for message type filtering (useful for analytics)
CREATE INDEX idx_messages_type ON messages(message_type);

-- Update RLS policies to ensure bet details are accessible
-- Users can see bet details for messages they can read
CREATE POLICY "Users can view bet details in messages"
  ON bets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON cm.chat_id = m.chat_id
      WHERE m.bet_id = bets.id
      AND cm.user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON COLUMN messages.media_url IS 'URL to media file in Supabase storage (photos/videos)';
COMMENT ON COLUMN messages.bet_id IS 'Reference to shared bet/pick';
COMMENT ON COLUMN messages.message_type IS 'Type of message content: text, media, or pick'; 