-- Fix message_type constraint to include 'system' type
-- This was causing issues when triggers tried to create system messages

-- Drop the existing constraint
ALTER TABLE messages 
DROP CONSTRAINT IF EXISTS messages_message_type_check;

-- Add the updated constraint that includes 'system'
ALTER TABLE messages 
ADD CONSTRAINT messages_message_type_check 
CHECK (message_type IN ('text', 'media', 'pick', 'system'));

-- Update the comment to reflect all valid types
COMMENT ON COLUMN messages.message_type IS 'Type of message content: text, media, pick, or system'; 