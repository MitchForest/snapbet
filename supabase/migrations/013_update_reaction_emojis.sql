-- Migration: Update reaction emoji constraint to match UI/spec
-- Previous emojis: 🔥💯😬💰🎯🤝
-- New emojis: 🔥💰😂😭💯🎯

-- Drop the existing constraint
ALTER TABLE reactions 
DROP CONSTRAINT IF EXISTS reactions_emoji_check;

-- Add the new constraint with updated emoji set
ALTER TABLE reactions 
ADD CONSTRAINT reactions_emoji_check 
CHECK (emoji IN ('🔥', '💰', '😂', '😭', '💯', '🎯'));

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_user_id ON reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_user ON reactions(post_id, user_id);

-- Add indexes for comments if not exists
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);

-- Add notification types to the enum if using enum
-- Note: If notifications.type is using a check constraint instead of enum, 
-- we'll need to update that constraint 