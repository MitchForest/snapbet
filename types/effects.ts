// Types for the emoji-based effects system
export interface EmojiEffect {
  id: string;
  name: string;
  category: EffectCategory;
  tier: 0 | 1 | 2;
  physics: PhysicsType;
  emoji: string;
  count: number;
  duration: number;
  preview: string;
  requirement?: {
    type: 'badge' | 'multiple_badges';
    badges: string[];
  };
}

export type EffectCategory = 'WINS' | 'LOSSES' | 'VIBES' | 'HYPE' | 'WILDCARDS' | 'BETTING';

export type PhysicsType =
  // BaseParticle (5 types)
  | 'float'
  | 'floatUp'
  | 'fall'
  | 'explode'
  | 'launch'
  // AnimatedParticle (10 types)
  | 'bounce'
  | 'spinAway'
  | 'zoomDance'
  | 'swirl'
  | 'wave'
  | 'pulse'
  | 'shake'
  | 'rotate'
  | 'fadeIn'
  | 'slideIn'
  // ExpressiveParticle (11 types)
  | 'dance'
  | 'jitter'
  | 'heartbeat'
  | 'breathe'
  | 'wobble'
  | 'flutter'
  | 'twinkle'
  | 'glow'
  | 'throb'
  | 'shimmer'
  | 'sparkle'
  // ComplexParticle (14 types)
  | 'spiral'
  | 'orbit'
  | 'zigzag'
  | 'pendulum'
  | 'elastic'
  | 'magnetic'
  | 'gravity'
  | 'fountain'
  | 'fireworks'
  | 'confetti'
  | 'snow'
  | 'rain'
  | 'bubbles'
  | 'smoke'
  // EnhancedParticle (17 types - Tier 1)
  | 'tornado'
  | 'vortex'
  | 'helix'
  | 'lightning'
  | 'plasma'
  | 'matrix'
  | 'quantum'
  | 'ripple'
  | 'shockwave'
  | 'aurora'
  | 'galaxy'
  | 'supernova'
  | 'blackhole'
  | 'wormhole'
  | 'tessellation'
  | 'fractal'
  | 'kaleidoscope'
  // PremiumParticle (12 types - Tier 2)
  | 'hologram'
  | 'neon'
  | 'glitch'
  | 'pixelate'
  | 'morph'
  | 'liquify'
  | 'shatter'
  | 'dissolve'
  | 'crystallize'
  | 'energize'
  | 'teleport'
  | 'transcend'
  // Additional physics types from effect configs
  | 'gentleFloat'
  | 'explodeOut'
  | 'lookAround'
  | 'formLetter'
  | 'riseUp'
  | 'slideDown'
  | 'flexPump'
  | 'crashDown'
  | 'headExplode'
  | 'sweatDrop'
  | 'victoryDance'
  | 'angerBurst'
  | 'popIn'
  | 'formF'
  | 'sportsBounce'
  | 'chaosCircle'
  | 'temperatureFlux'
  | 'saltPour'
  | 'rainbowArc'
  | 'slideInLook'
  | 'kissMotion'
  | 'cameraFlash'
  | 'roboticMarch'
  | 'holdStrong'
  | 'intensifySweat'
  | 'spiralDown'
  | 'formAmount'
  | 'lightningStrike'
  | 'moonLaunch'
  | 'alertOpen'
  | 'clockCountdown'
  | 'enhancedFloat'
  | 'money3D'
  | 'multiExplode'
  | 'riverFlow'
  | 'iceCool'
  | 'sportsRain'
  | 'swirlPattern'
  | 'beastFlex'
  | 'diceRoll'
  | 'stormSystem'
  | 'freezeWind'
  | 'ratioOverwhelm'
  | 'grassGrow'
  | 'chadEnergy'
  | 'cameraFlashes'
  | 'diamondHold'
  | 'lastSecond'
  | 'infernoEruption'
  | 'moneyTornado'
  | 'fireworksShow'
  | 'floodingTears'
  | 'diamondAura'
  | 'championOrbit'
  | 'galaxySwirl'
  | 'slotSpin'
  | 'toxicBubble'
  | 'smoothCharm'
  | 'spotlight'
  | 'bagBurst';

export interface EffectWithUnlockStatus extends EmojiEffect {
  isUnlocked: boolean;
}

// Particle configuration for rendering
export interface ParticleConfig {
  emoji: string;
  startX: number;
  startY: number;
  physics: PhysicsType;
  duration: number;
  delay: number;
}
