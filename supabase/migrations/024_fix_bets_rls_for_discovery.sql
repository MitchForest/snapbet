-- Fix RLS policy for bets to allow discovery features
-- This allows users to see settled bets for calculating hot bettors, etc.

-- Drop the existing select policy
DROP POLICY IF EXISTS bets_select ON bets;

-- Create a new select policy that allows viewing:
-- 1. Own bets (all statuses)
-- 2. Settled bets from other users (for discovery/stats)
-- 3. Bets attached to visible posts
CREATE POLICY bets_select ON bets FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR -- Own bets
    status IN ('won', 'lost', 'push') OR -- All settled bets are viewable for stats
    EXISTS ( -- Or if attached to a visible post
      SELECT 1 FROM posts p 
      WHERE p.bet_id = bets.id 
      AND p.deleted_at IS NULL
    )
  );

-- Add an index to improve performance of settled bets queries
CREATE INDEX IF NOT EXISTS idx_bets_settled_at ON bets(settled_at) 
  WHERE settled_at IS NOT NULL AND status IN ('won', 'lost'); 