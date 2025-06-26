import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/services/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { ConnectionStatus, realtimeManager } from '@/services/realtime/realtimeManager';
import { useRealtimeStore } from '@/stores/realtimeStore';

interface ConnectionInfo {
  status: ConnectionStatus;
  latency: number | null;
  lastPing: Date | null;
}

/**
 * Hook for monitoring real-time connection status and latency
 */
export function useRealtimeConnection(): ConnectionInfo {
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
    status: 'disconnected',
    latency: null,
    lastPing: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingPingRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Subscribe to connection status changes from the manager
    const unsubscribeStatus = realtimeManager.onConnectionStatusChange((status) => {
      if (isMounted) {
        setConnectionInfo((prev) => ({ ...prev, status }));
        useRealtimeStore.getState().setConnectionStatus(status);
      }
    });

    // Set up latency monitoring channel
    const setupLatencyMonitoring = async () => {
      try {
        channelRef.current = supabase.channel('connection-check');

        // Listen for our own pong responses
        channelRef.current
          .on('broadcast', { event: 'pong' }, (payload) => {
            if (pendingPingRef.current && payload.payload?.timestamp === pendingPingRef.current) {
              const latency = Date.now() - pendingPingRef.current;

              if (isMounted) {
                setConnectionInfo((prev) => ({
                  ...prev,
                  latency,
                  lastPing: new Date(),
                }));
                useRealtimeStore.getState().setLatency(latency);
              }

              // Clear timeout since we got a response
              if (pingTimeoutRef.current) {
                clearTimeout(pingTimeoutRef.current);
                pingTimeoutRef.current = null;
              }

              pendingPingRef.current = null;
            }
          })
          .subscribe((status) => {
            if (status === 'SUBSCRIBED' && isMounted) {
              // Start ping interval
              startPingInterval();
            }
          });
      } catch (error) {
        console.error('[useRealtimeConnection] Error setting up latency monitoring:', error);
      }
    };

    const startPingInterval = () => {
      // Clear any existing interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      // Send ping every 5 seconds
      pingIntervalRef.current = setInterval(() => {
        sendPing();
      }, 5000);

      // Send first ping immediately
      sendPing();
    };

    const sendPing = () => {
      if (!channelRef.current || pendingPingRef.current) {
        return; // Skip if channel not ready or ping already pending
      }

      const timestamp = Date.now();
      pendingPingRef.current = timestamp;

      // Send ping
      channelRef.current.send({
        type: 'broadcast',
        event: 'ping',
        payload: { timestamp },
      });

      // Also broadcast pong to ourselves (since broadcast doesn't echo by default)
      setTimeout(() => {
        if (channelRef.current && pendingPingRef.current === timestamp) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'pong',
            payload: { timestamp },
          });
        }
      }, 10);

      // Set timeout for no response (consider disconnected after 3 seconds)
      pingTimeoutRef.current = setTimeout(() => {
        if (pendingPingRef.current === timestamp && isMounted) {
          setConnectionInfo((prev) => ({
            ...prev,
            latency: null,
          }));
          useRealtimeStore.getState().setLatency(null);
          pendingPingRef.current = null;
        }
      }, 3000);
    };

    setupLatencyMonitoring();

    // Cleanup
    return () => {
      isMounted = false;
      unsubscribeStatus();

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
      }

      if (channelRef.current) {
        channelRef.current.unsubscribe();
      }
    };
  }, []);

  return connectionInfo;
}
