export const PARTICLE_LIMITS = {
  high: { base: 30, max: 60 },
  medium: { base: 20, max: 40 },
  low: { base: 10, max: 20 },
};

export type PerformanceTier = 'high' | 'medium' | 'low';

/**
 * Detects the device performance tier based on available capabilities
 * For MVP, returns 'medium' as default
 */
export async function getDevicePerformanceTier(): Promise<PerformanceTier> {
  // Simple heuristic based on device specs
  // Can be enhanced with actual FPS testing
  return 'medium'; // Default for MVP
}

/**
 * Gets the particle limit for a given performance tier and effect tier
 * @param performanceTier - The device performance tier
 * @param effectTier - The effect tier (0, 1, or 2)
 * @returns The maximum number of particles to render
 */
export function getParticleLimit(performanceTier: PerformanceTier, effectTier: number): number {
  const limits = PARTICLE_LIMITS[performanceTier];
  // Tier 0 gets base limit, higher tiers get max limit
  return effectTier === 0 ? limits.base : limits.max;
}

/**
 * Calculates adjusted particle count based on performance
 * @param originalCount - The original particle count from config
 * @param performanceTier - The device performance tier
 * @param effectTier - The effect tier
 * @returns The adjusted particle count
 */
export function getAdjustedParticleCount(
  originalCount: number,
  performanceTier: PerformanceTier,
  effectTier: number
): number {
  const limit = getParticleLimit(performanceTier, effectTier);
  const ratio = limit / 30; // Base ratio assuming 30 is the standard
  return Math.min(originalCount, Math.floor(originalCount * ratio));
}
