import type { Database } from '../../types/supabase';
import { NBA_TEAMS as TEAMS_NBA, NFL_TEAMS as TEAMS_NFL } from '../../data/teams';

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

// Convert teams array to object for easier access
const NBA_TEAMS = TEAMS_NBA.reduce(
  (acc, team) => {
    acc[team.abbreviation] = `${team.city} ${team.name}`;
    return acc;
  },
  {} as Record<string, string>
);

const NFL_TEAMS = TEAMS_NFL.reduce(
  (acc, team) => {
    acc[team.abbreviation] = `${team.city} ${team.name}`;
    return acc;
  },
  {} as Record<string, string>
);

// Generate realistic odds based on spread
function generateOddsFromSpread(spread: number, sport: 'NBA' | 'NFL'): OddsData {
  // Convert spread to moneyline
  let favoriteML: number;
  let underdogML: number;

  if (sport === 'NBA') {
    favoriteML = spread > 8 ? -400 : spread > 5 ? -250 : spread > 2 ? -150 : -120;
    underdogML = spread > 8 ? 320 : spread > 5 ? 200 : spread > 2 ? 130 : 100;
  } else {
    // NFL has different ML conversions
    favoriteML = spread > 10 ? -450 : spread > 7 ? -300 : spread > 3 ? -175 : -130;
    underdogML = spread > 10 ? 350 : spread > 7 ? 250 : spread > 3 ? 155 : 110;
  }

  // Generate total based on sport
  const baseTotal = sport === 'NBA' ? 225 : 45;
  const totalVariance =
    sport === 'NBA' ? Math.floor(Math.random() * 20) - 10 : Math.floor(Math.random() * 10) - 5;
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

// Get the current week's Thursday for NFL scheduling
function getThisWeekThursday(): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const thursday = new Date(now);

  // Calculate days until Thursday (4)
  const daysUntilThursday = (4 - dayOfWeek + 7) % 7;
  thursday.setDate(now.getDate() + daysUntilThursday);

  // If it's past Thursday, get next week's Thursday
  if (daysUntilThursday === 0 && now.getHours() >= 23) {
    thursday.setDate(thursday.getDate() + 7);
  }

  return thursday;
}

// Generate NFL games with realistic weekly schedule
function generateNFLGames(): GameInsert[] {
  const games: GameInsert[] = [];
  const nflTeams = Object.keys(NFL_TEAMS);
  const thursday = getThisWeekThursday();

  // Shuffle teams for matchups
  const shuffledTeams = [...nflTeams].sort(() => Math.random() - 0.5);
  let teamIndex = 0;

  // Thursday Night Football - 1 game at 8:20 PM ET
  const thursdayGame = new Date(thursday);
  thursdayGame.setHours(20, 20, 0, 0);

  const thursdayHome = shuffledTeams[teamIndex++];
  const thursdayAway = shuffledTeams[teamIndex++];
  const thursdaySpread = [-3, -6.5, -7, -10, -2.5][Math.floor(Math.random() * 5)];

  games.push({
    id: `nfl_${thursdayGame.toISOString().split('T')[0]}_${thursdayAway}_${thursdayHome}`,
    sport: 'american_football_nfl',
    sport_title: 'NFL',
    home_team: NFL_TEAMS[thursdayHome as keyof typeof NFL_TEAMS],
    away_team: NFL_TEAMS[thursdayAway as keyof typeof NFL_TEAMS],
    commence_time: thursdayGame.toISOString(),
    odds_data: generateOddsFromSpread(
      thursdaySpread,
      'NFL'
    ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
    status: 'scheduled',
    home_score: null,
    away_score: null,
  });

  // Sunday games
  const sunday = new Date(thursday);
  sunday.setDate(thursday.getDate() + 3);

  // Early games - 5 games at 1:00 PM ET
  for (let i = 0; i < 5 && teamIndex + 1 < shuffledTeams.length; i++) {
    const gameTime = new Date(sunday);
    gameTime.setHours(13, 0, 0, 0);

    const homeTeam = shuffledTeams[teamIndex++];
    const awayTeam = shuffledTeams[teamIndex++];
    const spread = [-3, -6.5, -7, -10, -2.5, -13.5, -1][Math.floor(Math.random() * 7)];

    games.push({
      id: `nfl_${gameTime.toISOString().split('T')[0]}_${awayTeam}_${homeTeam}_early${i}`,
      sport: 'american_football_nfl',
      sport_title: 'NFL',
      home_team: NFL_TEAMS[homeTeam as keyof typeof NFL_TEAMS],
      away_team: NFL_TEAMS[awayTeam as keyof typeof NFL_TEAMS],
      commence_time: gameTime.toISOString(),
      odds_data: generateOddsFromSpread(
        spread,
        'NFL'
      ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
      status: 'scheduled',
      home_score: null,
      away_score: null,
    });
  }

  // Late games - 4 games at 4:05/4:25 PM ET
  for (let i = 0; i < 4 && teamIndex + 1 < shuffledTeams.length; i++) {
    const gameTime = new Date(sunday);
    const isLateLate = i % 2 === 0;
    gameTime.setHours(16, isLateLate ? 25 : 5, 0, 0);

    const homeTeam = shuffledTeams[teamIndex++];
    const awayTeam = shuffledTeams[teamIndex++];
    const spread = [-3, -6.5, -7, -10, -2.5, -14, -1.5][Math.floor(Math.random() * 7)];

    games.push({
      id: `nfl_${gameTime.toISOString().split('T')[0]}_${awayTeam}_${homeTeam}_late${i}`,
      sport: 'american_football_nfl',
      sport_title: 'NFL',
      home_team: NFL_TEAMS[homeTeam as keyof typeof NFL_TEAMS],
      away_team: NFL_TEAMS[awayTeam as keyof typeof NFL_TEAMS],
      commence_time: gameTime.toISOString(),
      odds_data: generateOddsFromSpread(
        spread,
        'NFL'
      ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
      status: 'scheduled',
      home_score: null,
      away_score: null,
    });
  }

  // Sunday Night Football - 1 game at 8:20 PM ET
  if (teamIndex + 1 < shuffledTeams.length) {
    const sundayNightGame = new Date(sunday);
    sundayNightGame.setHours(20, 20, 0, 0);

    const homeTeam = shuffledTeams[teamIndex++];
    const awayTeam = shuffledTeams[teamIndex++];
    const spread = [-3, -6.5, -7, -4.5][Math.floor(Math.random() * 4)];

    games.push({
      id: `nfl_${sundayNightGame.toISOString().split('T')[0]}_${awayTeam}_${homeTeam}_snf`,
      sport: 'american_football_nfl',
      sport_title: 'NFL',
      home_team: NFL_TEAMS[homeTeam as keyof typeof NFL_TEAMS],
      away_team: NFL_TEAMS[awayTeam as keyof typeof NFL_TEAMS],
      commence_time: sundayNightGame.toISOString(),
      odds_data: generateOddsFromSpread(
        spread,
        'NFL'
      ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
      status: 'scheduled',
      home_score: null,
      away_score: null,
    });
  }

  // Monday Night Football - 1 game at 8:15 PM ET
  if (teamIndex + 1 < shuffledTeams.length) {
    const monday = new Date(sunday);
    monday.setDate(sunday.getDate() + 1);
    monday.setHours(20, 15, 0, 0);

    const homeTeam = shuffledTeams[teamIndex++];
    const awayTeam = shuffledTeams[teamIndex++];
    const spread = [-3, -6.5, -7, -2.5][Math.floor(Math.random() * 4)];

    games.push({
      id: `nfl_${monday.toISOString().split('T')[0]}_${awayTeam}_${homeTeam}_mnf`,
      sport: 'american_football_nfl',
      sport_title: 'NFL',
      home_team: NFL_TEAMS[homeTeam as keyof typeof NFL_TEAMS],
      away_team: NFL_TEAMS[awayTeam as keyof typeof NFL_TEAMS],
      commence_time: monday.toISOString(),
      odds_data: generateOddsFromSpread(
        spread,
        'NFL'
      ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
      status: 'scheduled',
      home_score: null,
      away_score: null,
    });
  }

  // Add some completed games from last week for testing
  const lastSunday = new Date(sunday);
  lastSunday.setDate(sunday.getDate() - 7);

  games.push({
    id: `nfl_${lastSunday.toISOString().split('T')[0]}_KC_BUF`,
    sport: 'american_football_nfl',
    sport_title: 'NFL',
    home_team: NFL_TEAMS.BUF,
    away_team: NFL_TEAMS.KC,
    commence_time: lastSunday.toISOString(),
    odds_data: generateOddsFromSpread(
      -3,
      'NFL'
    ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
    status: 'completed',
    home_score: 24,
    away_score: 27,
  });

  return games;
}

// Generate games for the next N days
export function generateMockGames(daysAhead: number = 7): GameInsert[] {
  const games: GameInsert[] = [];
  const now = new Date();
  const teamKeys = Object.keys(NBA_TEAMS);

  // Track which teams have played to avoid duplicates
  const teamsPlayedByDay: Set<string>[] = [];

  // Generate NBA games
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
      const odds = generateOddsFromSpread(parseFloat(spread), 'NBA');

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
      -5.5,
      'NBA'
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
      -3.5,
      'NBA'
    ) as unknown as Database['public']['Tables']['games']['Insert']['odds_data'],
    status: 'completed',
    home_score: 125,
    away_score: 123,
  });

  // Add NFL games
  const nflGames = generateNFLGames();
  games.push(...nflGames);

  return games;
}
