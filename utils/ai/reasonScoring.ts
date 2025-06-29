import { Database } from '@/types/database';

type Bet = Database['public']['Tables']['bets']['Row'];
type Game = Database['public']['Tables']['games']['Row'];

export interface ScoredReason {
  text: string;
  score: number;
  category: 'team' | 'style' | 'time' | 'sport' | 'performance' | 'bet_type';
  specificity: number;
}

export interface UserMetrics {
  topTeams: string[];
  avgStake: number;
  activeHours: number[];
  favoriteSport?: string;
  dominantBetType?: string;
  stakeStyle?: string;
  winRate?: number | null;
}

export interface BetWithDetails extends Omit<Bet, 'created_at'> {
  created_at: string;
  bet_details: { team?: string; line?: number; total_type?: string } | null;
  game?: Game;
  user?: { username: string };
}

export class AIReasonScorer {
  static scoreReasons(
    targetBet: BetWithDetails,
    userMetrics: UserMetrics,
    authorUsername: string
  ): ScoredReason[] {
    const reasons: ScoredReason[] = [];

    // Team-based (Score: 100)
    if (targetBet.bet_details?.team && userMetrics.topTeams.includes(targetBet.bet_details.team)) {
      reasons.push({
        text: `${authorUsername} also bets ${targetBet.bet_details.team}`,
        score: 100,
        category: 'team',
        specificity: 0.8,
      });
    }

    // Style-based (Score: 90)
    const betStyle = this.categorizeStakeStyle(targetBet.stake);
    if (userMetrics.stakeStyle && betStyle === userMetrics.stakeStyle && betStyle !== 'varied') {
      reasons.push({
        text: `${betStyle} bettor like you`,
        score: 90,
        category: 'style',
        specificity: 0.7,
      });
    }

    // Time-based (Score: 85)
    if (targetBet.created_at) {
      const betHour = new Date(targetBet.created_at).getHours();
      if (userMetrics.activeHours.includes(betHour)) {
        reasons.push({
          text: `${this.getTimePattern(betHour)} bettor`,
          score: 85,
          category: 'time',
          specificity: 0.6,
        });
      }
    }

    // Sport-based (Score: 70)
    if (targetBet.game?.sport && userMetrics.favoriteSport === targetBet.game.sport) {
      reasons.push({
        text: `${targetBet.game.sport} specialist`,
        score: 70,
        category: 'sport',
        specificity: 0.5,
      });
    }

    // Bet type reasons (Score: 60)
    if (targetBet.bet_type && userMetrics.dominantBetType === targetBet.bet_type) {
      reasons.push({
        text: `Loves ${targetBet.bet_type} bets`,
        score: 60,
        category: 'bet_type',
        specificity: 0.5,
      });
    }

    // Apply scoring adjustments
    reasons.forEach((reason) => {
      // Boost high-specificity reasons
      reason.score *= 1 + reason.specificity * 0.3;

      // Penalize overly common patterns
      if (reason.text.includes('NBA') && reason.category === 'sport') {
        reason.score *= 0.6;
      }
    });

    return reasons.sort((a, b) => b.score - a.score);
  }

  static getTopReason(reasons: ScoredReason[]): string {
    return reasons[0]?.text || 'Similar betting style';
  }

  static categorizeStakeStyle(stakeCents: number): string {
    if (stakeCents <= 1000) return 'Conservative';
    if (stakeCents <= 5000) return 'Moderate';
    if (stakeCents <= 15000) return 'Aggressive';
    return 'High roller';
  }

  static getTimePattern(hour: number): string {
    if (hour >= 22 || hour < 4) return 'Night owl';
    if (hour >= 4 && hour < 9) return 'Early bird';
    if (hour >= 9 && hour < 17) return 'Day trader';
    return 'Prime time';
  }

  static calculateUserMetrics(userBehavior: {
    bets?: Array<{
      bet_type: string;
      bet_details: { team?: string } | null;
      stake: number;
      created_at: string;
      status?: string;
      game?: { sport: string };
    }> | null;
  }): UserMetrics {
    const bets = userBehavior.bets || [];

    // Extract top teams
    const teamCounts = new Map<string, number>();
    bets.forEach((bet) => {
      const team = bet.bet_details?.team;
      if (team) {
        teamCounts.set(team, (teamCounts.get(team) || 0) + 1);
      }
    });
    const topTeams = Array.from(teamCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([team]) => team);

    // Calculate average stake
    const avgStake =
      bets.length > 0 ? bets.reduce((sum, bet) => sum + bet.stake, 0) / bets.length : 0;

    // Get active hours
    const hourCounts = new Map<number, number>();
    bets.forEach((bet) => {
      const hour = new Date(bet.created_at).getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    });
    const activeHours = Array.from(hourCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([hour]) => hour);

    // Get favorite sport
    const sportCounts = new Map<string, number>();
    bets.forEach((bet) => {
      if (bet.game?.sport) {
        sportCounts.set(bet.game.sport, (sportCounts.get(bet.game.sport) || 0) + 1);
      }
    });
    const favoriteSport = Array.from(sportCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Get dominant bet type
    const betTypeCounts = new Map<string, number>();
    bets.forEach((bet) => {
      betTypeCounts.set(bet.bet_type, (betTypeCounts.get(bet.bet_type) || 0) + 1);
    });
    const dominantBetType = Array.from(betTypeCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Calculate win rate
    const wonBets = bets.filter((bet) => bet.status === 'won').length;
    const settledBets = bets.filter(
      (bet) => bet.status && ['won', 'lost'].includes(bet.status)
    ).length;
    const winRate = settledBets > 0 ? (wonBets / settledBets) * 100 : null;

    return {
      topTeams,
      avgStake,
      activeHours,
      favoriteSport,
      dominantBetType,
      stakeStyle: this.categorizeStakeStyle(avgStake),
      winRate,
    };
  }
}
