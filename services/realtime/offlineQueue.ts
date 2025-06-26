import NetInfo from '@react-native-community/netinfo';
import { MMKV } from 'react-native-mmkv';
import { messageService } from '@/services/messaging/messageService';
import { MessageContent } from '@/types/messaging';
import { useRealtimeStore } from '@/stores/realtimeStore';

const QUEUE_KEY = 'offline_queue_v1';
const MAX_QUEUE_SIZE = 50;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
const QUEUE_WARNING_THRESHOLD = 40;

export interface QueuedMessage {
  id: string;
  chatId: string;
  senderId: string;
  content: MessageContent;
  timestamp: Date;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'normal';
  expirationHours: number;
}

interface StoredQueue {
  messages: QueuedMessage[];
  version: number;
}

/**
 * Manages offline message queue with persistence
 */
class OfflineQueue {
  private queue: QueuedMessage[] = [];
  private processing = false;
  private storage: MMKV;
  private netInfoUnsubscribe: (() => void) | null = null;
  private isConnected = true;

  constructor() {
    this.storage = new MMKV({
      id: 'offline-queue-storage',
      encryptionKey: undefined, // Add encryption in production
    });

    this.loadQueue();
    this.setupNetworkListener();
    this.cleanupExpiredMessages();
  }

  /**
   * Load queue from persistent storage
   */
  private loadQueue() {
    try {
      const stored = this.storage.getString(QUEUE_KEY);
      if (stored) {
        const parsed: StoredQueue = JSON.parse(stored);
        // Convert date strings back to Date objects
        this.queue = parsed.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));

        // Update store with queue count
        useRealtimeStore.getState().setQueuedCount(this.queue.length);

        console.log(`[OfflineQueue] Loaded ${this.queue.length} messages from storage`);
      }
    } catch (error) {
      console.error('[OfflineQueue] Error loading queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to persistent storage
   */
  private async saveQueue() {
    try {
      const toStore: StoredQueue = {
        messages: this.queue,
        version: 1,
      };
      this.storage.set(QUEUE_KEY, JSON.stringify(toStore));

      // Update store with queue count
      useRealtimeStore.getState().setQueuedCount(this.queue.length);
    } catch (error) {
      console.error('[OfflineQueue] Error saving queue:', error);
    }
  }

  /**
   * Setup network connectivity listener
   */
  private setupNetworkListener() {
    this.netInfoUnsubscribe = NetInfo.addEventListener((state) => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? false;

      console.log(
        `[OfflineQueue] Network state changed: ${this.isConnected ? 'connected' : 'disconnected'}`
      );

      // Start processing when we regain connection
      if (!wasConnected && this.isConnected && this.queue.length > 0) {
        console.log('[OfflineQueue] Connection restored, processing queue');
        this.processQueue();
      }
    });
  }

  /**
   * Add a message to the offline queue
   */
  async addToQueue(
    chatId: string,
    senderId: string,
    content: MessageContent,
    expirationHours: number = 24,
    priority: 'high' | 'normal' = 'high'
  ) {
    // Check queue size limit
    if (this.queue.length >= MAX_QUEUE_SIZE) {
      console.warn('[OfflineQueue] Queue full, dropping oldest message');
      this.queue.shift(); // Remove oldest
    }

    // Show warning if approaching limit
    if (this.queue.length >= QUEUE_WARNING_THRESHOLD) {
      console.warn(
        `[OfflineQueue] Approaching queue limit: ${this.queue.length}/${MAX_QUEUE_SIZE}`
      );
      // TODO: Show user notification about approaching limit
    }

    const queuedMessage: QueuedMessage = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      senderId,
      content,
      timestamp: new Date(),
      retryCount: 0,
      maxRetries: 3,
      priority,
      expirationHours,
    };

    // Add to queue based on priority
    if (priority === 'high') {
      // Find the first normal priority message and insert before it
      const normalIndex = this.queue.findIndex((msg) => msg.priority === 'normal');
      if (normalIndex === -1) {
        this.queue.push(queuedMessage);
      } else {
        this.queue.splice(normalIndex, 0, queuedMessage);
      }
    } else {
      this.queue.push(queuedMessage);
    }

    await this.saveQueue();

    // Try to process immediately if connected
    if (this.isConnected) {
      this.processQueue();
    }

    return queuedMessage.id;
  }

  /**
   * Process queued messages with retry logic
   */
  async processQueue() {
    if (this.processing || this.queue.length === 0 || !this.isConnected) {
      return;
    }

    this.processing = true;
    console.log(`[OfflineQueue] Processing ${this.queue.length} queued messages`);

    while (this.queue.length > 0 && this.isConnected) {
      const message = this.queue[0];

      try {
        // Attempt to send the message
        await messageService.sendMessage(
          message.chatId,
          message.senderId,
          message.content,
          message.expirationHours
        );

        console.log(`[OfflineQueue] Successfully sent message ${message.id}`);

        // Remove from queue on success
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        console.error(`[OfflineQueue] Failed to send message ${message.id}:`, error);

        message.retryCount++;

        if (message.retryCount >= message.maxRetries) {
          console.error(`[OfflineQueue] Message ${message.id} exceeded max retries, removing`);
          this.queue.shift();
          await this.handleFailedMessage(message);
        } else {
          // Exponential backoff: 2^retryCount seconds
          const delay = Math.pow(2, message.retryCount) * 1000;
          console.log(`[OfflineQueue] Retrying message ${message.id} in ${delay}ms`);

          // Move to next message and retry this one later
          this.queue.push(this.queue.shift()!);
          await this.saveQueue();

          // Schedule retry
          setTimeout(() => {
            if (this.isConnected) {
              this.processQueue();
            }
          }, delay);

          // Stop processing for now
          break;
        }
      }
    }

    this.processing = false;
  }

  /**
   * Handle permanently failed messages
   */
  private async handleFailedMessage(message: QueuedMessage) {
    console.error('[OfflineQueue] Message permanently failed:', message);
    // TODO: Show user notification about failed message
    // Could store in a separate "failed" queue for user review
    await this.saveQueue();
  }

  /**
   * Clean up expired messages
   */
  private cleanupExpiredMessages() {
    const now = Date.now();
    const originalLength = this.queue.length;

    this.queue = this.queue.filter((message) => {
      const age = now - message.timestamp.getTime();
      return age < MAX_AGE_MS;
    });

    if (this.queue.length < originalLength) {
      console.log(
        `[OfflineQueue] Cleaned up ${originalLength - this.queue.length} expired messages`
      );
      this.saveQueue();
    }

    // Schedule next cleanup in 1 hour
    setTimeout(() => this.cleanupExpiredMessages(), 60 * 60 * 1000);
  }

  /**
   * Get current queue status
   */
  getQueueStatus() {
    return {
      count: this.queue.length,
      isProcessing: this.processing,
      isConnected: this.isConnected,
      oldestMessage: this.queue[0]?.timestamp || null,
    };
  }

  /**
   * Clear the entire queue
   */
  async clearQueue() {
    console.log('[OfflineQueue] Clearing queue');
    this.queue = [];
    await this.saveQueue();
  }

  /**
   * Remove a specific message from the queue
   */
  async removeFromQueue(messageId: string) {
    const index = this.queue.findIndex((msg) => msg.id === messageId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      await this.saveQueue();
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();
