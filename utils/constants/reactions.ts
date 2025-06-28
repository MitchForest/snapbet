// Centralized reactions configuration
export const AVAILABLE_REACTIONS = ['🔥', '😭', '😂', '💀', '💯'] as const;

export type ReactionEmoji = (typeof AVAILABLE_REACTIONS)[number];
