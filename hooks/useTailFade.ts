import { useState, useCallback, useEffect } from 'react';
import {
  tailFadeService,
  TailFadeInput,
  TailFadeResult,
  TailFadeCounts,
} from '@/services/betting/tailFadeService';
import { useAuth } from './useAuth';
import { toastService } from '@/services/toastService';
import { BettingError } from '@/services/betting/types';
import { eventEmitter, EngagementEvents } from '@/utils/eventEmitter';
import { Database } from '@/types/database-helpers';

type PickAction = Database['public']['Tables']['pick_actions']['Row'];

/**
 * Hook to tail a pick
 */
export function useTailPick() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const tailPick = useCallback(
    async (input: TailFadeInput): Promise<TailFadeResult | null> => {
      if (!user) {
        toastService.showError('Please sign in to tail picks');
        return null;
      }

      setIsLoading(true);
      try {
        const result = await tailFadeService.tailPick(input);
        return result;
      } catch (error) {
        if (error instanceof BettingError) {
          toastService.showError(error.message);
        } else {
          toastService.showError('Failed to tail pick');
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return { mutate: tailPick, isLoading };
}

/**
 * Hook to fade a pick
 */
export function useFadePick() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fadePick = useCallback(
    async (input: TailFadeInput): Promise<TailFadeResult | null> => {
      if (!user) {
        toastService.showError('Please sign in to fade picks');
        return null;
      }

      setIsLoading(true);
      try {
        const result = await tailFadeService.fadePick(input);
        return result;
      } catch (error) {
        if (error instanceof BettingError) {
          toastService.showError(error.message);
        } else {
          toastService.showError('Failed to fade pick');
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return { mutate: fadePick, isLoading };
}

/**
 * Hook to get user's pick action for a post
 */
export function useUserPickAction(postId: string) {
  const [data, setData] = useState<PickAction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !postId) return;

    const fetchUserAction = async () => {
      setIsLoading(true);
      try {
        const action = await tailFadeService.getUserPickAction(postId, user.id);
        setData(action);
      } catch (error) {
        console.error('Failed to fetch user pick action:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAction();

    // Listen for changes
    const subscription = eventEmitter.addListener(
      EngagementEvents.TAIL_FADE_CHANGED,
      ({ postId: changedPostId }) => {
        if (changedPostId === postId) {
          fetchUserAction();
        }
      }
    );

    return () => subscription.remove();
  }, [postId, user]);

  return { data, isLoading };
}

/**
 * Hook to get tail/fade counts for a post
 */
export function usePickActionCounts(postId: string) {
  const [data, setData] = useState<TailFadeCounts>({ tailCount: 0, fadeCount: 0 });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchCounts = async () => {
      setIsLoading(true);
      try {
        const counts = await tailFadeService.getPickActionCounts(postId);
        setData(counts);
      } catch (error) {
        console.error('Failed to fetch pick action counts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCounts();

    // Listen for changes
    const subscription = eventEmitter.addListener(
      EngagementEvents.TAIL_FADE_CHANGED,
      ({ postId: changedPostId }) => {
        if (changedPostId === postId) {
          fetchCounts();
        }
      }
    );

    return () => subscription.remove();
  }, [postId]);

  return { data, isLoading };
}

/**
 * Hook to get all pick actions with user details
 */
interface PickActionWithUser {
  id: string;
  action_type: 'tail' | 'fade';
  user: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
  bet: {
    id: string;
    stake: number;
    potential_win: number;
    status: string;
  } | null;
}

export function usePickActionsWithUsers(postId: string) {
  const [data, setData] = useState<PickActionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchActions = async () => {
      setIsLoading(true);
      try {
        const actions = await tailFadeService.getPickActionsWithUsers(postId);
        setData(actions);
      } catch (error) {
        console.error('Failed to fetch pick actions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActions();

    // Listen for changes
    const subscription = eventEmitter.addListener(
      EngagementEvents.TAIL_FADE_CHANGED,
      ({ postId: changedPostId }) => {
        if (changedPostId === postId) {
          fetchActions();
        }
      }
    );

    return () => subscription.remove();
  }, [postId]);

  return { data, isLoading };
}
