import { Database } from './database';

// Export commonly used table types
export type Game = Database['public']['Tables']['games']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Reaction = Database['public']['Tables']['reactions']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Bet = Database['public']['Tables']['bets']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Story = Database['public']['Tables']['stories']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Chat = Database['public']['Tables']['chats']['Row'];

// Export enum types
export type BetType = Database['public']['Enums']['bet_type'];
export type BetStatus = Database['public']['Enums']['bet_status'];
export type MediaType = Database['public']['Enums']['media_type'];
export type GameStatus = Database['public']['Enums']['game_status'];
export type ChatType = Database['public']['Enums']['chat_type'];
export type ChatRole = Database['public']['Enums']['chat_role'];
export type PickAction = Database['public']['Enums']['pick_action'];
export type StoryType = Database['public']['Enums']['story_type'];
export type OAuthProvider = Database['public']['Enums']['oauth_provider'];

// Re-export the Database type
export type { Database };
