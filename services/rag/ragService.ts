import OpenAI from 'openai';
import { CaptionContext, EmbeddingResult, CaptionResult, RAGConfig } from './types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY,
});

export class RAGService {
  private static instance: RAGService;
  private captionRateLimit = new Map<string, number[]>();
  private readonly RATE_LIMIT = 20; // per day
  private readonly WINDOW = 24 * 60 * 60 * 1000; // 24 hours

  private config: RAGConfig = {
    embeddingModel: 'text-embedding-3-small',
    captionModel: 'gpt-4-turbo-preview',
    maxTokens: 150,
    temperature: 0.7,
  };

  private constructor() {}

  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    try {
      const truncatedText = text.slice(0, 8000); // Truncate to max length

      const response = await openai.embeddings.create({
        model: this.config.embeddingModel,
        input: truncatedText,
      });

      const embedding = response.data[0].embedding;
      const tokenCount = response.usage?.total_tokens || 0;

      return {
        embedding,
        tokenCount,
        modelVersion: this.config.embeddingModel,
      };
    } catch (error) {
      console.error('Failed to generate embedding:', error);

      // Implement exponential backoff for retries
      if (error instanceof OpenAI.APIError && error.status === 429) {
        // Rate limit error - could implement retry logic here
        throw new Error('OpenAI rate limit exceeded');
      }

      throw error;
    }
  }

  async generateCaption(userId: string, _context: CaptionContext): Promise<CaptionResult> {
    // Check rate limit
    const userRequests = this.captionRateLimit.get(userId) || [];
    const now = Date.now();
    const recentRequests = userRequests.filter((time) => now - time < this.WINDOW);

    if (recentRequests.length >= this.RATE_LIMIT) {
      throw new Error('Daily caption generation limit exceeded');
    }

    try {
      // Placeholder for caption generation
      // Full implementation will be in Sprint 8.05
      const caption = 'AI generated caption placeholder';
      const tokenCount = 10; // Placeholder

      // Update rate limit
      recentRequests.push(now);
      this.captionRateLimit.set(userId, recentRequests);

      return {
        caption,
        tokenCount,
        modelVersion: this.config.captionModel,
      };
    } catch (error) {
      console.error('Failed to generate caption:', error);
      throw error;
    }
  }

  async batchGenerateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
    if (!texts || texts.length === 0) {
      return [];
    }

    // Filter out empty texts
    const validTexts = texts.filter((text) => text && text.trim().length > 0);
    if (validTexts.length === 0) {
      return [];
    }

    try {
      const truncatedTexts = validTexts.map((text) => text.slice(0, 8000));

      const response = await openai.embeddings.create({
        model: this.config.embeddingModel,
        input: truncatedTexts,
      });

      const tokenCount = response.usage?.total_tokens || 0;
      const tokenPerText = Math.ceil(tokenCount / validTexts.length);

      return response.data.map((item) => ({
        embedding: item.embedding,
        tokenCount: tokenPerText,
        modelVersion: this.config.embeddingModel,
      }));
    } catch (error) {
      console.error('Failed to generate batch embeddings:', error);

      // Fall back to individual generation if batch fails
      console.log('Falling back to individual embedding generation');
      const results: EmbeddingResult[] = [];

      for (const text of validTexts) {
        try {
          const result = await this.generateEmbedding(text);
          results.push(result);
        } catch (err) {
          console.error('Failed to generate embedding for text:', err);
          // Continue with other texts
        }
      }

      return results;
    }
  }

  // Helper method to check if service is properly configured
  isConfigured(): boolean {
    return !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  }

  // Get current rate limit status for a user
  getRateLimitStatus(userId: string): { used: number; limit: number; resetsAt: Date } {
    const userRequests = this.captionRateLimit.get(userId) || [];
    const now = Date.now();
    const recentRequests = userRequests.filter((time) => now - time < this.WINDOW);

    const oldestRequest = recentRequests[0] || now;
    const resetsAt = new Date(oldestRequest + this.WINDOW);

    return {
      used: recentRequests.length,
      limit: this.RATE_LIMIT,
      resetsAt,
    };
  }
}

export const ragService = RAGService.getInstance();
