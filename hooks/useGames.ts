import { useState, useEffect, useCallback } from 'react';
import { Game } from '@/types/database-helpers';
import { gameService, Sport } from '@/services/games/gameService';
import * as Haptics from 'expo-haptics';

export function useGames(sport: Sport = 'all') {
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch games
  const fetchGames = useCallback(async () => {
    try {
      const data = await gameService.getGames({ sport });
      setGames(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError(err as Error);
    }
  }, [sport]);

  // Initial load
  useEffect(() => {
    const loadGames = async () => {
      setIsLoading(true);
      await fetchGames();
      setIsLoading(false);
    };

    loadGames();
  }, [fetchGames]);

  // Refresh with haptic feedback
  const refetch = useCallback(async () => {
    setRefreshing(true);

    // Haptic feedback for pull-to-refresh
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    await fetchGames();
    setRefreshing(false);
  }, [fetchGames]);

  // Auto-refresh for live games
  useEffect(() => {
    const checkLiveGames = async () => {
      const hasLive = await gameService.hasLiveGames();
      if (!hasLive) return;

      // Set up interval for live game updates
      const interval = setInterval(fetchGames, 60000); // 1 minute
      return () => clearInterval(interval);
    };

    checkLiveGames();
  }, [fetchGames]);

  // Group games by time section
  const groupedGames = useCallback(() => {
    const sections: Record<string, Game[]> = {};

    games.forEach((game) => {
      const section = getTimeSection(new Date(game.commence_time));
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(game);
    });

    // Convert to array format for FlashList
    return Object.entries(sections).map(([title, data]) => ({
      title,
      data: data.sort(
        (a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
      ),
    }));
  }, [games]);

  return {
    games,
    sections: groupedGames(),
    isLoading,
    error,
    refreshing,
    refetch,
  };
}

// Time section logic
function getTimeSection(gameTime: Date): string {
  const now = new Date();
  const hoursDiff = (gameTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 0 && hoursDiff > -3) return 'In Progress';
  if (hoursDiff < 0) return 'Final';
  if (hoursDiff < 1) return 'Starting Soon';
  if (isToday(gameTime)) return `Today ${format(gameTime, 'h:mm a')}`;
  if (isTomorrow(gameTime)) return `Tomorrow ${format(gameTime, 'h:mm a')}`;
  if (hoursDiff < 168) return format(gameTime, 'EEEE h:mm a'); // "Sunday 1:00 PM"
  return format(gameTime, 'MMM d h:mm a'); // "Dec 25 1:00 PM"
}

// Date helpers
function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return date.toDateString() === tomorrow.toDateString();
}

function format(date: Date, formatStr: string): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  if (formatStr === 'h:mm a') {
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  if (formatStr === 'EEEE h:mm a') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${days[date.getDay()]} ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  if (formatStr === 'MMM d h:mm a') {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getDate()} ${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  return date.toLocaleString();
}
