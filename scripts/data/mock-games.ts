import type { Database } from '../../types/supabase';

type GameInsert = Database['public']['Tables']['games']['Insert'];

interface OddsData {
  bookmakers: Array<{
    key: string;
    markets: {
      h2h: { home: number; away: number };
      spreads: { line: number; home: number; away: number };
      totals: { line: number; over: number; under: number };
    };
  }>;
}

// NBA teams for realistic matchups
const NBA_TEAMS = {
  // Eastern Conference
  BOS: 'Boston Celtics',
  BKN: 'Brooklyn Nets',
  NYK: 'New York Knicks',
  PHI: 'Philadelphia 76ers',
  TOR: 'Toronto Raptors',
  CHI: 'Chicago Bulls',
  CLE: 'Cleveland Cavaliers',
  DET: 'Detroit Pistons',
  IND: 'Indiana Pacers',
  MIL: 'Milwaukee Bucks',
  ATL: 'Atlanta Hawks',
  CHA: 'Charlotte Hornets',
  MIA: 'Miami Heat',
  ORL: 'Orlando Magic',
  WAS: 'Washington Wizards',

  // Western Conference
  DEN: 'Denver Nuggets',
  MIN: 'Minnesota Timberwolves',
  OKC: 'Oklahoma City Thunder',
  POR: 'Portland Trail Blazers',
  UTA: 'Utah Jazz',
  GSW: 'Golden State Warriors',
  LAC: 'Los Angeles Clippers',
  LAL: 'Los Angeles Lakers',
  PHX: 'Phoenix Suns',
  SAC: 'Sacramento Kings',
  DAL: 'Dallas Mavericks',
  HOU: 'Houston Rockets',
  MEM: 'Memphis Grizzlies',
  NOP: 'New Orleans Pelicans',
  SAS: 'San Antonio Spurs',
};

// Generate realistic odds based on spread
function generateOddsFromSpread(spread: number): OddsData {
  // Convert spread to moneyline
  const favoriteML = spread > 8 ? -400 : spread > 5 ? -250 : spread > 2 ? -150 : -120;
  const underdogML = spread > 8 ? 320 : spread > 5 ? 200 : spread > 2 ? 130 : 100;

  // Generate total based on team styles (simplified)
  const baseTotal = 225;
  const totalVariance = Math.floor(Math.random() * 20) - 10;
  const total = baseTotal + totalVariance;

  return {
    bookmakers: [
      {
        key: 'draftkings',
        markets: {
          h2h: {
            home: spread < 0 ? favoriteML : underdogML,
            away: spread < 0 ? underdogML : favoriteML,
          },
          spreads: {
            line: spread,
            home: -110,
            away: -110,
          },
          totals: {
            line: total,
            over: -110,
            under: -110,
          },
        },
      },
    ],
  };
}

// Generate games for the next N days
export function generateMockGames(daysAhead: number = 7): GameInsert[] {
  const games: GameInsert[] = [];
  const now = new Date();
  const teamKeys = Object.keys(NBA_TEAMS);

  // Track which teams have played to avoid duplicates
  const teamsPlayedByDay: Set<string>[] = [];

  for (let day = 0; day < daysAhead; day++) {
    const gameDate = new Date(now);
    gameDate.setDate(gameDate.getDate() + day);
    teamsPlayedByDay[day] = new Set();

    // Generate 5-10 games per day
    const gamesPerDay = Math.floor(Math.random() * 6) + 5;

    for (let i = 0; i < gamesPerDay; i++) {
      // Find two teams that haven't played today
      let homeTeam: string, awayTeam: string;
      let attempts = 0;

      do {
        homeTeam = teamKeys[Math.floor(Math.random() * teamKeys.length)];
        awayTeam = teamKeys[Math.floor(Math.random() * teamKeys.length)];
        attempts++;
      } while (
        (homeTeam === awayTeam ||
          teamsPlayedByDay[day].has(homeTeam) ||
          teamsPlayedByDay[day].has(awayTeam)) &&
        attempts < 50
      );

      if (attempts >= 50) continue; // Skip if we can't find unique teams

      teamsPlayedByDay[day].add(homeTeam);
      teamsPlayedByDay[day].add(awayTeam);

      // Set game time (7:00, 7:30, 8:00, 10:00, 10:30 PM ET)
      const gameTimes = ['19:00', '19:30', '20:00', '22:00', '22:30'];
      const gameTime = gameTimes[i % gameTimes.length];
      const [hours, minutes] = gameTime.split(':').map(Number);

      gameDate.setHours(hours, minutes, 0, 0);

      // Generate spread based on "team strength" (random for now)
      const spread = (Math.random() * 20 - 10).toFixed(1);
      const odds = generateOddsFromSpread(parseFloat(spread));

      // Create game ID
      const gameId = `nba_${gameDate.toISOString().split('T')[0]}_${awayTeam}_${homeTeam}`;

      // Determine game status
      let status: Database['public']['Enums']['game_status'] = 'scheduled';
      let homeScore: number | null = null;
      let awayScore: number | null = null;

      // Make some games completed (for testing history)
      if (day < 0 || (day === 0 && i < 2)) {
        status = 'completed';
        // Generate realistic scores
        const baseScore = 105 + Math.floor(Math.random() * 20);
        const scoreDiff = Math.abs(parseFloat(spread)) + (Math.random() * 10 - 5);

        if (parseFloat(spread) < 0) {
          // Home team favored
          homeScore = baseScore + Math.floor(scoreDiff / 2);
          awayScore = baseScore - Math.floor(scoreDiff / 2);
        } else {
          // Away team favored
          awayScore = baseScore + Math.floor(scoreDiff / 2);
          homeScore = baseScore - Math.floor(scoreDiff / 2);
        }
      }

      games.push({
        id: gameId,
        sport: 'basketball_nba',
        sport_title: 'NBA',
        home_team: NBA_TEAMS[homeTeam as keyof typeof NBA_TEAMS],
        away_team: NBA_TEAMS[awayTeam as keyof typeof NBA_TEAMS],
        commence_time: gameDate.toISOString(),
        odds_data: odds as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
        status,
        home_score: homeScore,
        away_score: awayScore,
      });
    }
  }

  // Add a couple of recent completed games for testing
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(20, 0, 0, 0);

  games.push({
    id: `nba_${yesterday.toISOString().split('T')[0]}_LAL_BOS`,
    sport: 'basketball_nba',
    sport_title: 'NBA',
    home_team: NBA_TEAMS.BOS,
    away_team: NBA_TEAMS.LAL,
    commence_time: yesterday.toISOString(),
    odds_data: generateOddsFromSpread(
      -5.5
    ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
    status: 'completed',
    home_score: 118,
    away_score: 112,
  });

  games.push({
    id: `nba_${yesterday.toISOString().split('T')[0]}_GSW_DEN`,
    sport: 'basketball_nba',
    sport_title: 'NBA',
    home_team: NBA_TEAMS.DEN,
    away_team: NBA_TEAMS.GSW,
    commence_time: yesterday.toISOString(),
    odds_data: generateOddsFromSpread(
      -3.5
    ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
    status: 'completed',
    home_score: 125,
    away_score: 123,
  });

  return games;
}
