-- Initial seed data for SnapBet

-- System user for testing and development
INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'system@snapbet.ai',
  '{"role": "system"}',
  '{"username": "system", "display_name": "System User", "oauth_provider": "google", "oauth_id": "system", "is_mock": false}',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Create bankroll for system user
INSERT INTO bankrolls (user_id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id) DO NOTHING;

-- Sample games for testing (NBA)
INSERT INTO games (id, sport, sport_title, home_team, away_team, commence_time, status, odds_data)
VALUES 
  (
    'nba_2024_lal_gsw_001',
    'basketball_nba',
    'NBA',
    'Los Angeles Lakers',
    'Golden State Warriors',
    NOW() + INTERVAL '2 hours',
    'scheduled',
    '{
      "bookmakers": [{
        "key": "draftkings",
        "title": "DraftKings",
        "markets": {
          "h2h": {
            "home": -150,
            "away": 130
          },
          "spreads": [{
            "line": -3.5,
            "home": -110,
            "away": -110
          }],
          "totals": [{
            "line": 225.5,
            "over": -110,
            "under": -110
          }]
        }
      }]
    }'::jsonb
  ),
  (
    'nba_2024_bos_mia_001',
    'basketball_nba',
    'NBA',
    'Boston Celtics',
    'Miami Heat',
    NOW() + INTERVAL '5 hours',
    'scheduled',
    '{
      "bookmakers": [{
        "key": "draftkings",
        "title": "DraftKings",
        "markets": {
          "h2h": {
            "home": -200,
            "away": 170
          },
          "spreads": [{
            "line": -5.5,
            "home": -110,
            "away": -110
          }],
          "totals": [{
            "line": 215.5,
            "over": -115,
            "under": -105
          }]
        }
      }]
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Sample games for testing (NFL)
INSERT INTO games (id, sport, sport_title, home_team, away_team, commence_time, status, odds_data)
VALUES 
  (
    'nfl_2024_kc_buf_001',
    'americanfootball_nfl',
    'NFL',
    'Kansas City Chiefs',
    'Buffalo Bills',
    NOW() + INTERVAL '3 days',
    'scheduled',
    '{
      "bookmakers": [{
        "key": "draftkings",
        "title": "DraftKings",
        "markets": {
          "h2h": {
            "home": -135,
            "away": 115
          },
          "spreads": [{
            "line": -2.5,
            "home": -110,
            "away": -110
          }],
          "totals": [{
            "line": 48.5,
            "over": -110,
            "under": -110
          }]
        }
      }]
    }'::jsonb
  ),
  (
    'nfl_2024_dal_phi_001',
    'americanfootball_nfl',
    'NFL',
    'Dallas Cowboys',
    'Philadelphia Eagles',
    NOW() + INTERVAL '3 days' + INTERVAL '3 hours',
    'scheduled',
    '{
      "bookmakers": [{
        "key": "draftkings",
        "title": "DraftKings",
        "markets": {
          "h2h": {
            "home": 120,
            "away": -140
          },
          "spreads": [{
            "line": 3,
            "home": -110,
            "away": -110
          }],
          "totals": [{
            "line": 51.5,
            "over": -105,
            "under": -115
          }]
        }
      }]
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- Note: Mock users will be created by the seed-mock-data.ts script in Sprint 01.03 