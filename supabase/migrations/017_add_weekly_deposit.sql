-- Migration: Add weekly deposit tracking and atomic bet placement
-- Sprint: 05.05 - Bankroll Management
-- Date: 2025-01-10
-- Description: Adds weekly deposit tracking and atomic bet placement function

-- Add weekly_deposit column to bankrolls table
ALTER TABLE bankrolls 
ADD COLUMN weekly_deposit INTEGER DEFAULT 100000; -- Amount given at start of week (base + referral bonus)

-- Update existing rows to set weekly_deposit to current balance (for consistency)
UPDATE bankrolls 
SET weekly_deposit = balance 
WHERE weekly_deposit IS NULL;

-- Add comment explaining the column
COMMENT ON COLUMN bankrolls.weekly_deposit IS 'Total amount given at start of week including base ($1000) and referral bonuses ($100 per referral)';

-- Create function to calculate potential win (helper for RPC)
CREATE OR REPLACE FUNCTION calculate_potential_win(p_stake INTEGER, p_odds INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_decimal NUMERIC;
BEGIN
  -- Convert American odds to decimal
  IF p_odds > 0 THEN
    v_decimal := (p_odds::NUMERIC / 100) + 1;
  ELSE
    v_decimal := (100::NUMERIC / ABS(p_odds)) + 1;
  END IF;
  
  -- Calculate win amount (profit only, not including stake)
  RETURN FLOOR(p_stake * (v_decimal - 1));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create atomic bet placement function
CREATE OR REPLACE FUNCTION place_bet_with_bankroll_check(
  p_user_id UUID,
  p_game_id TEXT,
  p_bet_type bet_type,
  p_bet_details JSONB,
  p_stake INTEGER,
  p_odds INTEGER,
  p_expires_at TIMESTAMPTZ,
  p_is_tail BOOLEAN DEFAULT FALSE,
  p_is_fade BOOLEAN DEFAULT FALSE,
  p_original_pick_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_bet_id UUID;
  v_current_balance INTEGER;
  v_pending_total INTEGER;
  v_available_balance INTEGER;
BEGIN
  -- Lock the bankroll row to prevent concurrent modifications
  SELECT balance INTO v_current_balance
  FROM bankrolls
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Calculate total stake of pending bets
  SELECT COALESCE(SUM(stake), 0) INTO v_pending_total
  FROM bets
  WHERE user_id = p_user_id
  AND status = 'pending';
  
  -- Calculate available balance
  v_available_balance := v_current_balance - v_pending_total;
  
  -- Check if user has sufficient available balance
  IF v_available_balance < p_stake THEN
    RAISE EXCEPTION 'Insufficient funds. Available: %, Required: %', 
      v_available_balance, p_stake;
  END IF;
  
  -- Place the bet
  INSERT INTO bets (
    user_id, 
    game_id, 
    bet_type, 
    bet_details, 
    stake, 
    odds, 
    potential_win, 
    expires_at,
    is_tail,
    is_fade,
    original_pick_id
  ) VALUES (
    p_user_id, 
    p_game_id, 
    p_bet_type, 
    p_bet_details,
    p_stake, 
    p_odds, 
    calculate_potential_win(p_stake, p_odds), 
    p_expires_at,
    p_is_tail,
    p_is_fade,
    p_original_pick_id
  ) RETURNING id INTO v_bet_id;
  
  -- Note: We don't update the balance here anymore since we're tracking
  -- available balance as (balance - sum of pending bets)
  -- Balance only changes when bets are settled
  
  RETURN v_bet_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise the exception with proper error handling
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the reset_bankroll function to properly set weekly_deposit
CREATE OR REPLACE FUNCTION reset_bankroll(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_referral_bonus INTEGER;
  v_weekly_deposit INTEGER;
  v_old_stats bankrolls%ROWTYPE;
  v_metadata JSONB;
  v_weekly_snapshot JSONB;
BEGIN
  -- Get current stats before reset
  SELECT * INTO v_old_stats FROM bankrolls WHERE user_id = p_user_id;
  
  -- Calculate referral bonus
  v_referral_bonus := calculate_referral_bonus(p_user_id);
  
  -- Calculate total weekly deposit (base + bonus)
  v_weekly_deposit := 100000 + v_referral_bonus; -- $1000 base + bonuses
  
  -- Create weekly snapshot for history
  v_weekly_snapshot := jsonb_build_object(
    'weekEnding', NOW()::TEXT,
    'startBalance', v_old_stats.weekly_deposit,
    'endBalance', v_old_stats.balance,
    'totalBets', v_old_stats.win_count + v_old_stats.loss_count + v_old_stats.push_count,
    'totalWins', v_old_stats.win_count,
    'totalLosses', v_old_stats.loss_count,
    'netPL', v_old_stats.balance - v_old_stats.weekly_deposit,
    'roi', CASE 
      WHEN v_old_stats.total_wagered > 0 
      THEN ROUND(((v_old_stats.total_won - v_old_stats.total_wagered)::NUMERIC / v_old_stats.total_wagered) * 100, 2)
      ELSE 0 
    END
  );
  
  -- Update metadata with weekly history
  v_metadata := COALESCE(v_old_stats.stats_metadata, '{}'::JSONB);
  v_metadata := jsonb_set(
    v_metadata,
    '{weeklyHistory}',
    COALESCE(
      jsonb_build_array(v_weekly_snapshot) || 
      (v_metadata->'weeklyHistory')[0:11], -- Keep last 12 weeks
      jsonb_build_array(v_weekly_snapshot)
    )
  );
  
  -- Reset bankroll with new weekly deposit
  UPDATE bankrolls 
  SET 
    balance = v_weekly_deposit,
    weekly_deposit = v_weekly_deposit,
    referral_bonus = v_referral_bonus,
    total_wagered = 0,
    total_won = 0,
    win_count = 0,
    loss_count = 0,
    push_count = 0,
    biggest_win = 0,
    biggest_loss = 0,
    season_high = v_weekly_deposit,
    season_low = v_weekly_deposit,
    last_reset = NOW(),
    reset_count = COALESCE(reset_count, 0) + 1,
    stats_metadata = v_metadata,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Cancel any pending bets
  UPDATE bets
  SET 
    status = 'cancelled',
    settled_at = NOW()
  WHERE user_id = p_user_id 
  AND status = 'pending';
  
  -- Log the reset as a transaction in metadata
  PERFORM log_bankroll_transaction(
    p_user_id,
    'weekly_reset',
    v_weekly_deposit,
    NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Create function to log bankroll transactions
CREATE OR REPLACE FUNCTION log_bankroll_transaction(
  p_user_id UUID,
  p_type TEXT,
  p_amount INTEGER,
  p_bet_id UUID DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  v_metadata JSONB;
  v_transaction JSONB;
BEGIN
  -- Get current metadata
  SELECT COALESCE(stats_metadata, '{}'::JSONB) INTO v_metadata
  FROM bankrolls
  WHERE user_id = p_user_id;
  
  -- Create transaction record
  v_transaction := jsonb_build_object(
    'type', p_type,
    'amount', p_amount,
    'betId', p_bet_id,
    'timestamp', NOW()::TEXT
  );
  
  -- Add to transactions array (keep last 50)
  v_metadata := jsonb_set(
    v_metadata,
    '{transactions}',
    COALESCE(
      jsonb_build_array(v_transaction) || 
      (v_metadata->'transactions')[0:49],
      jsonb_build_array(v_transaction)
    )
  );
  
  -- Update metadata
  UPDATE bankrolls
  SET stats_metadata = v_metadata
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION place_bet_with_bankroll_check TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_potential_win TO authenticated;
GRANT EXECUTE ON FUNCTION log_bankroll_transaction TO authenticated; 