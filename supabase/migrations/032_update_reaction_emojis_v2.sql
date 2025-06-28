-- Update reaction emoji constraints to match new set: fire, cry, laugh cry, skull, 100
-- Previous set: fire, money bag, laugh cry, cry, 100, target

-- Drop existing constraints
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_emoji_check;
ALTER TABLE message_reactions DROP CONSTRAINT IF EXISTS message_reactions_emoji_check;

-- Add new constraints with updated emoji set
ALTER TABLE reactions 
  ADD CONSTRAINT reactions_emoji_check 
  CHECK (emoji IN ('🔥', '😭', '😂', '💀', '💯'));

ALTER TABLE message_reactions 
  ADD CONSTRAINT message_reactions_emoji_check 
  CHECK (emoji IN ('🔥', '😭', '😂', '💀', '💯'));

-- Update any existing reactions that use old emojis to random new ones
UPDATE reactions 
SET emoji = CASE 
  WHEN emoji = '💰' THEN '🔥'  -- money bag -> fire
  WHEN emoji = '🎯' THEN '💀'  -- target -> skull
  ELSE emoji 
END
WHERE emoji IN ('💰', '🎯');

UPDATE message_reactions 
SET emoji = CASE 
  WHEN emoji = '💰' THEN '🔥'  -- money bag -> fire
  WHEN emoji = '🎯' THEN '💀'  -- target -> skull
  WHEN emoji = '😮' THEN '😂'  -- surprised -> laugh cry
  WHEN emoji = '🤝' THEN '💯'  -- handshake -> 100
  ELSE emoji 
END
WHERE emoji IN ('💰', '🎯', '😮', '🤝'); 