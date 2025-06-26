import { useEffect, useCallback, useId } from 'react';
import { realtimeManager, ChannelConfig } from '@/services/realtime/realtimeManager';

interface UseChannelSubscriptionOptions extends ChannelConfig {
  enabled?: boolean;
}

/**
 * Generic hook for subscribing to real-time channels
 * Automatically handles subscription lifecycle and cleanup
 */
export function useChannelSubscription(
  channelName: string,
  options: UseChannelSubscriptionOptions
) {
  const subscriberId = useId();
  const { enabled = true, ...config } = options;

  useEffect(() => {
    if (!enabled || !channelName) return;

    try {
      realtimeManager.subscribe(channelName, subscriberId, config);
    } catch (error) {
      console.error(`[useChannelSubscription] Error subscribing to ${channelName}:`, error);
    }

    return () => {
      realtimeManager.unsubscribe(channelName, subscriberId);
    };
  }, [channelName, subscriberId, enabled]);

  const broadcast = useCallback(
    (event: string, payload: unknown) => {
      const channel = realtimeManager.getChannel(channelName);
      if (channel) {
        channel.send({
          type: 'broadcast',
          event,
          payload,
        });
      } else {
        console.warn(`[useChannelSubscription] No channel found for ${channelName}`);
      }
    },
    [channelName]
  );

  return { broadcast };
}
