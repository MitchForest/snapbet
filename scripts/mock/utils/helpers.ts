import type { Database } from '@/types/database';

type Tables = Database['public']['Tables'];
type Game = Tables['games']['Row'];

export function generateBetDetails(betType: 'spread' | 'moneyline' | 'total', game: Game) {
  switch (betType) {
    case 'spread': {
      const team = Math.random() > 0.5 ? game.home_team : game.away_team;
      const line =
        Math.random() > 0.5
          ? Math.floor(Math.random() * 7) + 1 // +1 to +7
          : -(Math.floor(Math.random() * 7) + 1); // -1 to -7
      return { team, line };
    }
    case 'total': {
      const total_type = Math.random() > 0.5 ? 'over' : 'under';
      const line = Math.floor(Math.random() * 40) + 200; // 200-240
      return { total_type, line } as const;
    }
    case 'moneyline': {
      const team = Math.random() > 0.5 ? game.home_team : game.away_team;
      return { team };
    }
  }
}

export function getPersonalityFromBehavior(mockPersonalityId: string | null): string {
  if (!mockPersonalityId) return 'degen';

  const personalityMap: Record<string, string> = {
    'sharp-bettor': 'sharp-bettor',
    degen: 'degen',
    contrarian: 'contrarian',
    'live-bettor': 'live-bettor',
    'parlay-chaser': 'parlay-chaser',
    'value-hunter': 'sharp-bettor',
    'stats-guru': 'sharp-bettor',
    'line-watcher': 'sharp-bettor',
    'yolo-king': 'degen',
    'always-wrong': 'degen',
    'chasing-losses': 'degen',
    'late-night-degen': 'degen',
    'public-bettor': 'degen',
    'tout-follower': 'degen',
    'fade-the-public': 'contrarian',
    'dog-lover': 'contrarian',
    'under-god': 'contrarian',
  };

  return personalityMap[mockPersonalityId] || 'degen';
}

export function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

export function getDaysSinceMonday(): number {
  const today = new Date();
  const monday = getWeekStart(today);
  const diffTime = Math.abs(today.getTime() - monday.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
