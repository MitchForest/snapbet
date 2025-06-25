import AsyncStorage from '@react-native-async-storage/async-storage';
import { EmojiEffect } from '@/types/effects';

const PREVIEW_DURATION = 5000; // 5 seconds
const PREVIEW_STORAGE_KEY = 'effect_previews';

interface PreviewData {
  [effectId: string]: {
    lastPreviewDate: string; // ISO date string
  };
}

export class EffectPreviewManager {
  private static instance: EffectPreviewManager;
  private activePreview: { effectId: string; timeoutId: ReturnType<typeof setTimeout> } | null =
    null;
  private previewEndCallbacks: Map<string, () => void> = new Map();

  private constructor() {}

  static getInstance(): EffectPreviewManager {
    if (!this.instance) {
      this.instance = new EffectPreviewManager();
    }
    return this.instance;
  }

  async canPreview(effectId: string): Promise<boolean> {
    try {
      const data = await this.getPreviewData();
      const effectData = data[effectId];

      if (!effectData) {
        return true; // Never previewed before
      }

      // Check if it's been more than 24 hours
      const lastPreview = new Date(effectData.lastPreviewDate);
      const now = new Date();
      const hoursSinceLastPreview = (now.getTime() - lastPreview.getTime()) / (1000 * 60 * 60);

      return hoursSinceLastPreview >= 24;
    } catch (error) {
      console.error('Error checking preview availability:', error);
      return true; // Allow preview on error
    }
  }

  async startPreview(effect: EmojiEffect, onEnd?: () => void): Promise<boolean> {
    // Check if can preview
    const canPreview = await this.canPreview(effect.id);
    if (!canPreview) {
      return false;
    }

    // Clear any existing preview
    this.endPreview();

    // Store callback if provided
    if (onEnd) {
      this.previewEndCallbacks.set(effect.id, onEnd);
    }

    // Set up auto-end timer
    const timeoutId = setTimeout(() => {
      this.endPreview();
    }, PREVIEW_DURATION);

    this.activePreview = {
      effectId: effect.id,
      timeoutId,
    };

    // Mark as previewed
    await this.markAsPreviewed(effect.id);

    return true;
  }

  endPreview(): void {
    if (this.activePreview) {
      clearTimeout(this.activePreview.timeoutId);

      // Call the end callback if exists
      const callback = this.previewEndCallbacks.get(this.activePreview.effectId);
      if (callback) {
        callback();
        this.previewEndCallbacks.delete(this.activePreview.effectId);
      }

      this.activePreview = null;
    }
  }

  isPreviewActive(effectId: string): boolean {
    return this.activePreview?.effectId === effectId;
  }

  private async getPreviewData(): Promise<PreviewData> {
    try {
      const data = await AsyncStorage.getItem(PREVIEW_STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error reading preview data:', error);
      return {};
    }
  }

  private async markAsPreviewed(effectId: string): Promise<void> {
    try {
      const data = await this.getPreviewData();
      data[effectId] = {
        lastPreviewDate: new Date().toISOString(),
      };
      await AsyncStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error marking effect as previewed:', error);
    }
  }

  // Clean up old preview data (optional maintenance method)
  async cleanupOldPreviews(): Promise<void> {
    try {
      const data = await this.getPreviewData();
      const now = new Date();
      const cleaned: PreviewData = {};

      for (const [effectId, previewData] of Object.entries(data)) {
        const lastPreview = new Date(previewData.lastPreviewDate);
        const daysSinceLastPreview =
          (now.getTime() - lastPreview.getTime()) / (1000 * 60 * 60 * 24);

        // Keep data for last 7 days
        if (daysSinceLastPreview < 7) {
          cleaned[effectId] = previewData;
        }
      }

      await AsyncStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(cleaned));
    } catch (error) {
      console.error('Error cleaning up preview data:', error);
    }
  }
}
