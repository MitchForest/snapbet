export type PhysicsType =
  | 'float'
  | 'floatUp'
  | 'fall'
  | 'explode'
  | 'launch'
  | 'bounce'
  | 'spinAway'
  | 'zoomDance'
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
  | 'twinkle'
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

export type EffectDuration = number | 'continuous';
export type DeviceTier = 'low' | 'medium' | 'high';

export interface ParticleConfig {
  emoji: string;
  count: number;
  size?: { min: number; max: number };
  opacity?: { min: number; max: number };
  delay?: { min: number; max: number };
}

export interface UnlockRequirement {
  type: 'badge' | 'achievement' | 'time';
  value: string;
}

export interface EffectConfig {
  id: string;
  name: string;
  tier: 0 | 1 | 2 | 3 | 4;
  category: 'wins' | 'losses' | 'vibes' | 'hype' | 'wildcards' | 'limited' | 'betting';
  particles: ParticleConfig[];
  physics: PhysicsType;
  duration: EffectDuration;
  unlockRequirement?: UnlockRequirement;
}
