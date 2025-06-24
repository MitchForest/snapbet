-- Migration: Add referral system and badge history tables
-- Sprint: 02.05 - Referral System & Badge Automation
-- Date: 2024-12-20

-- Referral codes table
CREATE TABLE referral_codes (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals tracking table (simplified - no rewards)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referred_id) -- Each user can only be referred once
);

-- Badge history table (simplified)
CREATE TABLE badge_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('earned', 'lost')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX idx_badge_history_user ON badge_history(user_id, created_at DESC);

-- RLS Policies
ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own referral code
CREATE POLICY referral_codes_select ON referral_codes
  FOR SELECT USING (user_id = auth.uid());

-- Users can see referrals they made
CREATE POLICY referrals_select ON referrals
  FOR SELECT USING (referrer_id = auth.uid());

-- Users can see their own badge history
CREATE POLICY badge_history_select ON badge_history
  FOR SELECT USING (user_id = auth.uid());

-- System policies for inserts/updates (service role only)
CREATE POLICY referral_codes_insert ON referral_codes
  FOR INSERT WITH CHECK (false);

CREATE POLICY referral_codes_update ON referral_codes
  FOR UPDATE USING (false);

CREATE POLICY referrals_insert ON referrals
  FOR INSERT WITH CHECK (false);

CREATE POLICY badge_history_insert ON badge_history
  FOR INSERT WITH CHECK (false);

-- Comments for documentation
COMMENT ON TABLE referral_codes IS 'Stores unique referral codes for each user';
COMMENT ON TABLE referrals IS 'Tracks referral relationships between users';
COMMENT ON TABLE badge_history IS 'Tracks when badges are earned or lost';

COMMENT ON COLUMN referral_codes.code IS '6-character alphanumeric code (e.g., MIK2X9)';
COMMENT ON COLUMN referral_codes.uses_count IS 'Number of successful referrals using this code';
COMMENT ON COLUMN referrals.code IS 'The referral code used for this referral';
COMMENT ON COLUMN badge_history.action IS 'Either "earned" or "lost"'; 