export interface EmbeddingMetadata {
  entity_type: 'post' | 'bet' | 'user';
  entity_id: string;
  model_version: string;
  generated_at: string;
  token_count?: number;
}

export interface CaptionContext {
  bet?: {
    id: string;
    bet_type: string;
    bet_details: Record<string, unknown>;
    odds: number;
    stake: number;
  };
  postType: 'pick' | 'story' | 'post';
  previousCaptions?: string[];
}

export interface SimilarUser {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  similarity: number;
  win_rate: number;
  total_bets: number;
  favorite_teams: string[];
  common_sports: string[];
}

export interface RAGConfig {
  embeddingModel: string;
  captionModel: string;
  maxTokens: number;
  temperature: number;
}

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
  modelVersion: string;
}

export interface CaptionResult {
  caption: string;
  tokenCount: number;
  modelVersion: string;
}
