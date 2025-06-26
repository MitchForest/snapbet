-- Add media_type to messages table
ALTER TABLE messages
ADD COLUMN media_type TEXT CHECK (media_type IN ('photo', 'video'));

-- Create message reactions table
CREATE TABLE message_reactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (emoji IN ('🔥', '💯', '😂', '😮', '💀', '🤝')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Create message pick actions table (separate from post pick actions)
CREATE TABLE message_pick_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_type pick_action NOT NULL,
  resulting_bet_id UUID REFERENCES bets(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Add indexes for performance
CREATE INDEX idx_message_reactions_message ON message_reactions(message_id);
CREATE INDEX idx_message_pick_actions_message ON message_pick_actions(message_id);
CREATE INDEX idx_messages_media_type ON messages(chat_id, created_at DESC) 
WHERE media_type IS NOT NULL;

-- Enable RLS
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_pick_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for message_reactions
CREATE POLICY "Users can add their own reactions"
  ON message_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view reactions in their chats"
  ON message_reactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON m.chat_id = cm.chat_id
      WHERE m.id = message_reactions.message_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove their own reactions"
  ON message_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for message_pick_actions
CREATE POLICY "Users can add their own pick actions"
  ON message_pick_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view pick actions in their chats"
  ON message_pick_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages m
      JOIN chat_members cm ON m.chat_id = cm.chat_id
      WHERE m.id = message_pick_actions.message_id
      AND cm.user_id = auth.uid()
    )
  ); 