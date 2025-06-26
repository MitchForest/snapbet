# Sprint 06.04: Real-time Infrastructure Tracker

## Sprint Overview

**Status**: NOT STARTED  
**Start Date**: [Date]  
**End Date**: [Date]  
**Epic**: Epic 6 - Messaging System & Automation

**Sprint Goal**: Implement robust real-time messaging infrastructure with Supabase channels, presence tracking, typing indicators, and offline queue management.

**User Story Contribution**: 
- Enables Story 4: The Isolation Problem - Real-time updates make conversations feel alive and connected
- Improves all messaging features with instant updates and presence awareness

## 🚨 Required Development Practices

### Database Management
- **Use Supabase MCP** to inspect current database state: `mcp_supabase_get_schemas`, `mcp_supabase_get_tables`, etc.
- **Keep types synchronized**: Run type generation after ANY schema changes
- **Migration files required**: Every database change needs a migration file
- **Test migrations**: Ensure migrations run cleanly on fresh database

### UI/UX Consistency
- **Use Tamagui components**: `View`, `Text`, `XStack`, `YStack`, `Stack`
- **Follow UI/UX rules**: See `.pm/process/ui-ux-consistency-rules.md`
- **Use Colors constant**: Import from `@/theme` - NEVER hardcode colors
- **Standard spacing**: Use Tamagui's `$1`, `$2`, `$3`, etc. tokens

### Code Quality
- **Zero tolerance**: No lint errors, no TypeScript errors
- **Type safety**: No `any` types without explicit justification
- **Run before handoff**: `bun run lint && bun run typecheck`

## Sprint Plan

### Objectives
1. Create centralized real-time subscription manager
2. Implement presence system for online/offline status
3. Build efficient channel management with cleanup
4. Add offline message queue with retry logic
5. Optimize subscription lifecycle management
6. Implement connection state handling
7. Add performance monitoring for real-time features

### Files to Create
| File Path | Purpose | Status |
|-----------|---------|--------|
| `services/realtime/realtimeManager.ts` | Central subscription management | NOT STARTED |
| `services/realtime/presenceService.ts` | Online/offline tracking | NOT STARTED |
| `services/realtime/offlineQueue.ts` | Message queue for offline | NOT STARTED |
| `hooks/useRealtimeConnection.ts` | Connection state management | NOT STARTED |
| `hooks/usePresence.ts` | User presence tracking | NOT STARTED |
| `hooks/useChannelSubscription.ts` | Generic channel hook | NOT STARTED |
| `components/messaging/ConnectionStatus.tsx` | Connection indicator | NOT STARTED |
| `utils/realtime/channelHelpers.ts` | Channel utility functions | NOT STARTED |
| `utils/realtime/retryStrategy.ts` | Exponential backoff logic | NOT STARTED |
| `stores/realtimeStore.ts` | Zustand store for state | NOT STARTED |

### Files to Modify  
| File Path | Changes Needed | Status |
|-----------|----------------|--------|
| `hooks/useMessages.ts` | Use centralized manager | NOT STARTED |
| `hooks/useTypingIndicator.ts` | Use centralized manager | NOT STARTED |
| `components/common/Avatar.tsx` | Add presence indicator | NOT STARTED |
| `app/(drawer)/(tabs)/messages.tsx` | Show connection status | NOT STARTED |
| `services/supabase/client.ts` | Configure realtime options | NOT STARTED |

### Implementation Approach

**1. Centralized Subscription Manager**:
```typescript
// services/realtime/realtimeManager.ts
class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  
  subscribe(
    channelName: string,
    subscriberId: string,
    config: ChannelConfig
  ): RealtimeChannel {
    // Get or create channel
    let channel = this.channels.get(channelName);
    
    if (!channel) {
      channel = supabase
        .channel(channelName, {
          config: {
            broadcast: { self: true },
            presence: { key: subscriberId },
          },
        });
        
      // Configure channel based on config
      if (config.postgres) {
        channel.on('postgres_changes', config.postgres, config.onPostgres);
      }
      
      if (config.broadcast) {
        channel.on('broadcast', config.broadcast, config.onBroadcast);
      }
      
      if (config.presence) {
        channel.on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState();
          config.onPresence?.(state);
        });
      }
      
      this.channels.set(channelName, channel);
    }
    
    // Track subscriber
    if (!this.subscriptions.has(channelName)) {
      this.subscriptions.set(channelName, new Set());
    }
    this.subscriptions.get(channelName)!.add(subscriberId);
    
    // Subscribe if first subscriber
    if (this.subscriptions.get(channelName)!.size === 1) {
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Channel ${channelName} subscribed`);
        }
      });
    }
    
    return channel;
  }
  
  unsubscribe(channelName: string, subscriberId: string) {
    const subscribers = this.subscriptions.get(channelName);
    if (!subscribers) return;
    
    subscribers.delete(subscriberId);
    
    // Cleanup if no more subscribers
    if (subscribers.size === 0) {
      const channel = this.channels.get(channelName);
      if (channel) {
        channel.unsubscribe();
        this.channels.delete(channelName);
      }
      this.subscriptions.delete(channelName);
    }
  }
}

export const realtimeManager = new RealtimeManager();
```

**2. Presence Service**:
```typescript
// services/realtime/presenceService.ts
interface PresenceState {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  currentChatId?: string;
}

class PresenceService {
  private presenceChannel: RealtimeChannel | null = null;
  private updateInterval: NodeJS.Timer | null = null;
  
  async trackPresence(userId: string) {
    this.presenceChannel = realtimeManager.subscribe(
      'presence:global',
      userId,
      {
        presence: true,
        onPresence: (state) => {
          this.updatePresenceStore(state);
        },
      }
    );
    
    // Initial presence
    await this.presenceChannel.track({
      userId,
      status: 'online',
      lastSeen: new Date().toISOString(),
    });
    
    // Heartbeat every 30 seconds
    this.updateInterval = setInterval(() => {
      this.presenceChannel?.track({
        userId,
        status: 'online',
        lastSeen: new Date().toISOString(),
      });
    }, 30000);
  }
  
  async updateStatus(status: PresenceState['status']) {
    await this.presenceChannel?.track({
      status,
      lastSeen: new Date().toISOString(),
    });
  }
  
  cleanup() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    if (this.presenceChannel) {
      this.presenceChannel.untrack();
    }
  }
}
```

**3. Offline Queue Management**:
```typescript
// services/realtime/offlineQueue.ts
interface QueuedMessage {
  id: string;
  chatId: string;
  content: MessageContent;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
}

class OfflineQueue {
  private queue: QueuedMessage[] = [];
  private processing = false;
  
  constructor() {
    // Load from MMKV on init
    this.loadQueue();
    
    // Listen for connection changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && this.queue.length > 0) {
        this.processQueue();
      }
    });
  }
  
  async addToQueue(message: Omit<QueuedMessage, 'id' | 'retryCount'>) {
    const queuedMessage: QueuedMessage = {
      ...message,
      id: `queue-${Date.now()}`,
      retryCount: 0,
      maxRetries: 3,
    };
    
    this.queue.push(queuedMessage);
    await this.saveQueue();
    
    // Try to process immediately
    this.processQueue();
  }
  
  async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const message = this.queue[0];
      
      try {
        await messageService.sendMessage(message.chatId, message.content);
        this.queue.shift(); // Remove on success
        await this.saveQueue();
      } catch (error) {
        message.retryCount++;
        
        if (message.retryCount >= message.maxRetries) {
          // Move to failed queue
          this.queue.shift();
          await this.handleFailedMessage(message);
        } else {
          // Exponential backoff
          const delay = Math.pow(2, message.retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    this.processing = false;
  }
}
```

**4. Connection State Management**:
```typescript
// hooks/useRealtimeConnection.ts
export const useRealtimeConnection = () => {
  const [connectionState, setConnectionState] = useState<
    'connecting' | 'connected' | 'disconnected' | 'error'
  >('connecting');
  
  const [latency, setLatency] = useState<number | null>(null);
  
  useEffect(() => {
    let pingInterval: NodeJS.Timer;
    
    const channel = supabase.channel('connection-check');
    
    channel
      .on('system', { event: '*' }, (payload) => {
        if (payload.event === 'connected') {
          setConnectionState('connected');
          
          // Start latency monitoring
          pingInterval = setInterval(() => {
            const start = Date.now();
            channel.send({
              type: 'broadcast',
              event: 'ping',
              payload: { timestamp: start },
            });
          }, 5000);
        } else if (payload.event === 'disconnected') {
          setConnectionState('disconnected');
        }
      })
      .on('broadcast', { event: 'pong' }, (payload) => {
        const latency = Date.now() - payload.payload.timestamp;
        setLatency(latency);
      })
      .subscribe();
      
    return () => {
      clearInterval(pingInterval);
      channel.unsubscribe();
    };
  }, []);
  
  return { connectionState, latency };
};
```

**Key Technical Decisions**:
- Centralize all subscriptions to prevent duplicates
- Use reference counting for channel lifecycle
- Implement exponential backoff for retries
- Store offline queue in MMKV for persistence
- Monitor latency for performance insights
- Batch presence updates to reduce traffic

### Dependencies & Risks
**Dependencies**:
- @react-native-community/netinfo (for offline detection)
- react-native-mmkv (for offline queue persistence)

**Identified Risks**:
- Channel limit per client (100 concurrent)
- Memory leaks from uncleaned subscriptions
- Battery drain from constant presence updates
- Message ordering with offline queue

**Mitigation**:
- Implement channel pooling and reuse
- Strict cleanup in useEffect returns
- Adaptive presence update frequency
- Timestamp-based message ordering

## Implementation Log

### Day-by-Day Progress
**[Date]**:
- Started: [What was begun]
- Completed: [What was finished]
- Blockers: [Any issues]
- Decisions: [Any changes to plan]

### Reality Checks & Plan Updates

**Reality Check 1** - [Date]
- Issue: [What wasn't working]
- Options Considered:
  1. [Option 1] - Pros/Cons
  2. [Option 2] - Pros/Cons
- Decision: [What was chosen]
- Plan Update: [How sprint plan changed]
- Epic Impact: [Any epic updates needed]

### Code Quality Checks

**Linting Results**:
- [ ] Initial run: [X errors, Y warnings]
- [ ] Final run: [Should be 0 errors]

**Type Checking Results**:
- [ ] Initial run: [X errors]
- [ ] Final run: [Should be 0 errors]

**Build Results**:
- [ ] Development build passes
- [ ] Production build passes

## Key Code Additions

### Realtime Store
```typescript
// stores/realtimeStore.ts
interface RealtimeState {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  activeChannels: string[];
  presenceMap: Map<string, PresenceState>;
  queuedMessages: number;
  latency: number | null;
  
  setConnectionStatus: (status: ConnectionStatus) => void;
  updatePresence: (userId: string, state: PresenceState) => void;
  setQueuedCount: (count: number) => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  connectionStatus: 'connecting',
  activeChannels: [],
  presenceMap: new Map(),
  queuedMessages: 0,
  latency: null,
  
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  
  updatePresence: (userId, state) => set((prev) => {
    const newMap = new Map(prev.presenceMap);
    newMap.set(userId, state);
    return { presenceMap: newMap };
  }),
  
  setQueuedCount: (count) => set({ queuedMessages: count }),
}));
```

### Channel Subscription Hook
```typescript
// hooks/useChannelSubscription.ts
export const useChannelSubscription = (
  channelName: string,
  config: ChannelConfig
) => {
  const subscriberId = useId();
  
  useEffect(() => {
    const channel = realtimeManager.subscribe(
      channelName,
      subscriberId,
      config
    );
    
    return () => {
      realtimeManager.unsubscribe(channelName, subscriberId);
    };
  }, [channelName, subscriberId]);
  
  const broadcast = useCallback(
    (event: string, payload: any) => {
      const channel = realtimeManager.getChannel(channelName);
      channel?.send({
        type: 'broadcast',
        event,
        payload,
      });
    },
    [channelName]
  );
  
  return { broadcast };
};
```

### API Endpoints Implemented
| Method | Path | Request | Response | Status |
|--------|------|---------|----------|--------|
| WS | /realtime/v1/websocket | Connection upgrade | WebSocket | WORKING |
| - | Presence channel | Track/untrack | Presence state | WORKING |
| - | Broadcast channel | Send event | Broadcast | WORKING |
| - | Postgres channel | Subscribe | Changes | WORKING |

### State Management
- Connection state in Zustand store
- Active channels tracked centrally
- Presence map for all online users
- Offline queue count for UI display
- Latency measurements for monitoring

## Testing Performed

### Manual Testing
- [ ] Channels subscribe/unsubscribe properly
- [ ] Presence updates work across devices
- [ ] Offline messages queue correctly
- [ ] Messages send when reconnected
- [ ] Typing indicators work smoothly
- [ ] No duplicate subscriptions
- [ ] Memory cleaned up on unmount
- [ ] Connection status accurate
- [ ] Latency measurements reasonable
- [ ] Battery usage acceptable

### Edge Cases Considered
- Rapid connect/disconnect → Debounce status changes
- Channel limit reached → Pool and reuse channels
- Large presence updates → Batch and throttle
- Network switching → Handle gracefully
- App background/foreground → Pause/resume presence
- Memory pressure → Clean up old channels

## Documentation Updates

- [ ] Subscription lifecycle documented
- [ ] Channel naming conventions defined
- [ ] Presence update strategy explained
- [ ] Offline queue behavior documented
- [ ] Performance best practices listed

## Handoff to Reviewer

### What Was Implemented
[Clear summary of all work completed]

### Files Modified/Created
**Created**:
- `services/realtime/realtimeManager.ts` - Central manager
- `services/realtime/presenceService.ts` - Presence tracking
- `services/realtime/offlineQueue.ts` - Offline handling
- `hooks/useRealtimeConnection.ts` - Connection state
- `hooks/usePresence.ts` - Presence hook
- `hooks/useChannelSubscription.ts` - Generic channel
- `components/messaging/ConnectionStatus.tsx` - UI indicator
- `utils/realtime/channelHelpers.ts` - Utilities
- `utils/realtime/retryStrategy.ts` - Retry logic
- `stores/realtimeStore.ts` - Global state

**Modified**:
- `hooks/useMessages.ts` - Use central manager
- `hooks/useTypingIndicator.ts` - Use central manager
- `components/common/Avatar.tsx` - Presence dot
- `app/(drawer)/(tabs)/messages.tsx` - Connection UI
- `services/supabase/client.ts` - Realtime config

### Key Decisions Made
1. **Centralized management**: All subscriptions through one manager
2. **Reference counting**: Channels shared between components
3. **Offline queue**: MMKV for persistence across app restarts
4. **Presence heartbeat**: 30-second intervals to balance freshness/battery
5. **Connection monitoring**: 5-second ping for latency tracking

### Deviations from Original Plan
- Added latency monitoring for performance insights
- Implemented channel pooling to avoid limits
- Added connection status UI component

### Known Issues/Concerns
- Channel limit (100) might be reached with many group chats
- Presence updates could impact battery on older devices
- Offline queue ordering needs careful handling
- WebSocket reconnection can be flaky on some networks

### Suggested Review Focus
- Subscription cleanup to prevent memory leaks
- Channel pooling implementation
- Offline queue retry logic
- Presence update frequency
- Error handling in connection states

**Sprint Status**: READY FOR REVIEW

---

## Reviewer Section

**Reviewer**: [R persona]  
**Review Date**: [Date]

### Review Checklist
- [ ] Code matches sprint objectives
- [ ] All planned files created/modified
- [ ] Follows established patterns
- [ ] No unauthorized scope additions
- [ ] Code is clean and maintainable
- [ ] No obvious bugs or issues
- [ ] Integrates properly with existing code
- [ ] No memory leaks
- [ ] Performance acceptable
- [ ] Battery usage reasonable

### Review Outcome

**Status**: APPROVED | NEEDS REVISION

### Feedback
[If NEEDS REVISION, specific feedback here]

**Required Changes**:
1. **File**: `[filename]`
   - Issue: [What's wrong]
   - Required Change: [What to do]
   - Reasoning: [Why it matters]

### Post-Review Updates
[Track changes made in response to review]

**Update 1** - [Date]
- Changed: [What was modified]
- Result: [New status]

---

## Sprint Metrics

**Duration**: Planned 2 days | Actual [Y] days  
**Scope Changes**: [Number of plan updates]  
**Review Cycles**: [Number of review rounds]  
**Files Touched**: 15  
**Lines Added**: ~[Estimate]  
**Lines Removed**: ~[Estimate]

## Learnings for Future Sprints

1. [Learning 1]: [How to apply in future]
2. [Learning 2]: [How to apply in future]

---

*Sprint Started: [Date]*  
*Sprint Completed: [Date]*  
*Final Status: [APPROVED/IN PROGRESS/BLOCKED]* 