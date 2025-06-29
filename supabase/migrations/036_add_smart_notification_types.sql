-- Add new notification types for AI-powered notifications
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'similar_user_bet';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'behavioral_consensus';
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'smart_alert';

-- Add index for finding recent bets by similar users (used by smart notifications job)
CREATE INDEX IF NOT EXISTS idx_bets_user_created_archived 
ON bets(user_id, created_at DESC, archived) 
WHERE archived = false;

-- Add index for finding consensus patterns
CREATE INDEX IF NOT EXISTS idx_bets_game_type_team 
ON bets(game_id, bet_type, (bet_details->>'team')) 
WHERE archived = false; 