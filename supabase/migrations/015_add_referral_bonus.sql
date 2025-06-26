-- Migration: Add referral bonus system
-- Sprint: 04.08 - Referral Rewards
-- Date: 2025-01-10
-- Description: Adds $100 weekly bankroll bonus per referral

-- Add referral bonus column to bankrolls
ALTER TABLE bankrolls 
ADD COLUMN referral_bonus INTEGER DEFAULT 0; -- in cents

-- Add referral count cache for performance
ALTER TABLE users
ADD COLUMN referral_count INTEGER DEFAULT 0;

-- Function to calculate referral bonus
CREATE OR REPLACE FUNCTION calculate_referral_bonus(user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_referral_count INTEGER;
BEGIN
  -- Count successful referrals
  SELECT COUNT(*) INTO v_referral_count
  FROM referrals
  WHERE referrer_id = user_id;
  
  -- Update cached count
  UPDATE users SET referral_count = v_referral_count WHERE id = user_id;
  
  -- Return bonus amount ($100 per referral in cents)
  RETURN v_referral_count * 10000;
END;
$$ LANGUAGE plpgsql;

-- Update the reset_bankroll function to include bonus
CREATE OR REPLACE FUNCTION reset_bankroll(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_bonus INTEGER;
  v_old_balance INTEGER;
  v_old_stats bankrolls%ROWTYPE;
BEGIN
  -- Get current stats before reset
  SELECT * INTO v_old_stats FROM bankrolls WHERE user_id = p_user_id;
  
  -- Calculate referral bonus
  v_bonus := calculate_referral_bonus(p_user_id);
  
  -- Reset to base + bonus
  UPDATE bankrolls 
  SET 
    balance = 100000 + v_bonus, -- $1000 base + bonus
    referral_bonus = v_bonus,
    total_wagered = 0,
    total_won = 0,
    win_count = 0,
    loss_count = 0,
    push_count = 0,
    biggest_win = 0,
    biggest_loss = 0,
    season_high = 100000 + v_bonus,
    season_low = 100000 + v_bonus,
    last_reset = NOW(),
    reset_count = COALESCE(reset_count, 0) + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Cancel pending bets
  UPDATE bets
  SET 
    status = 'cancelled',
    settled_at = NOW()
  WHERE user_id = p_user_id 
  AND status = 'pending';
END;
$$ LANGUAGE plpgsql;

-- Trigger to update referral count when new referral is added
CREATE OR REPLACE FUNCTION update_referral_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET referral_count = referral_count + 1 
  WHERE id = NEW.referrer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_referral_count
AFTER INSERT ON referrals
FOR EACH ROW EXECUTE FUNCTION update_referral_count();

-- Update existing users with their referral counts (retroactive bonus)
UPDATE users u
SET referral_count = (
  SELECT COUNT(*) 
  FROM referrals r 
  WHERE r.referrer_id = u.id
);

-- Update existing bankrolls with referral bonuses
UPDATE bankrolls b
SET 
  referral_bonus = u.referral_count * 10000,
  balance = balance + (u.referral_count * 10000)
FROM users u
WHERE b.user_id = u.id
AND u.referral_count > 0;

-- Create index for performance
CREATE INDEX idx_users_referral_count ON users(referral_count) WHERE referral_count > 0;

-- Add comment explaining the bonus system
COMMENT ON COLUMN bankrolls.referral_bonus IS 'Weekly referral bonus in cents ($100 per referral)';
COMMENT ON COLUMN users.referral_count IS 'Cached count of successful referrals for performance'; 