import * as Haptics from 'expo-haptics';

/**
 * Triggers haptic feedback for effect selection
 * Uses simple impact feedback for MVP
 * @param effectId - The effect ID being selected
 */
export async function triggerHaptic(_effectId?: string): Promise<void> {
  try {
    // Simple haptic on selection
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Fail silently - haptics are not critical
    console.log('Haptic feedback failed:', error);
  }
}

/**
 * Triggers success haptic when unlocking an effect
 */
export async function triggerUnlockHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.log('Unlock haptic failed:', error);
  }
}

/**
 * Triggers error haptic when trying to use a locked effect
 */
export async function triggerLockedHaptic(): Promise<void> {
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.log('Locked haptic failed:', error);
  }
}
