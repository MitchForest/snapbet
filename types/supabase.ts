export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      badge_history: {
        Row: {
          action: string
          badge_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          action: string
          badge_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          badge_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bankrolls: {
        Row: {
          balance: number
          biggest_loss: number | null
          biggest_win: number | null
          created_at: string | null
          last_reset: string | null
          loss_count: number
          push_count: number
          reset_count: number | null
          season_high: number | null
          season_low: number | null
          stats_metadata: Json | null
          total_wagered: number
          total_won: number
          updated_at: string | null
          user_id: string
          win_count: number
        }
        Insert: {
          balance?: number
          biggest_loss?: number | null
          biggest_win?: number | null
          created_at?: string | null
          last_reset?: string | null
          loss_count?: number
          push_count?: number
          reset_count?: number | null
          season_high?: number | null
          season_low?: number | null
          stats_metadata?: Json | null
          total_wagered?: number
          total_won?: number
          updated_at?: string | null
          user_id: string
          win_count?: number
        }
        Update: {
          balance?: number
          biggest_loss?: number | null
          biggest_win?: number | null
          created_at?: string | null
          last_reset?: string | null
          loss_count?: number
          push_count?: number
          reset_count?: number | null
          season_high?: number | null
          season_low?: number | null
          stats_metadata?: Json | null
          total_wagered?: number
          total_won?: number
          updated_at?: string | null
          user_id?: string
          win_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "bankrolls_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          actual_win: number | null
          bet_details: Json
          bet_type: Database["public"]["Enums"]["bet_type"]
          created_at: string | null
          expires_at: string | null
          game_id: string
          id: string
          is_fade: boolean | null
          is_tail: boolean | null
          odds: number
          original_pick_id: string | null
          potential_win: number
          settled_at: string | null
          stake: number
          status: Database["public"]["Enums"]["bet_status"]
          user_id: string
        }
        Insert: {
          actual_win?: number | null
          bet_details: Json
          bet_type: Database["public"]["Enums"]["bet_type"]
          created_at?: string | null
          expires_at?: string | null
          game_id: string
          id?: string
          is_fade?: boolean | null
          is_tail?: boolean | null
          odds: number
          original_pick_id?: string | null
          potential_win: number
          settled_at?: string | null
          stake: number
          status?: Database["public"]["Enums"]["bet_status"]
          user_id: string
        }
        Update: {
          actual_win?: number | null
          bet_details?: Json
          bet_type?: Database["public"]["Enums"]["bet_type"]
          created_at?: string | null
          expires_at?: string | null
          game_id?: string
          id?: string
          is_fade?: boolean | null
          is_tail?: boolean | null
          odds?: number
          original_pick_id?: string | null
          potential_win?: number
          settled_at?: string | null
          stake?: number
          status?: Database["public"]["Enums"]["bet_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_members: {
        Row: {
          chat_id: string
          joined_at: string | null
          last_read_at: string | null
          role: Database["public"]["Enums"]["chat_role"] | null
          user_id: string
        }
        Insert: {
          chat_id: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: Database["public"]["Enums"]["chat_role"] | null
          user_id: string
        }
        Update: {
          chat_id?: string
          joined_at?: string | null
          last_read_at?: string | null
          role?: Database["public"]["Enums"]["chat_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_members_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          avatar_url: string | null
          chat_type: Database["public"]["Enums"]["chat_type"]
          created_at: string | null
          created_by: string | null
          id: string
          last_message_at: string | null
          name: string | null
          settings: Json | null
        }
        Insert: {
          avatar_url?: string | null
          chat_type: Database["public"]["Enums"]["chat_type"]
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          settings?: Json | null
        }
        Update: {
          avatar_url?: string | null
          chat_type?: Database["public"]["Enums"]["chat_type"]
          created_at?: string | null
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          name?: string | null
          settings?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "chats_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string | null
          follower_id: string
          following_id: string
        }
        Insert: {
          created_at?: string | null
          follower_id: string
          following_id: string
        }
        Update: {
          created_at?: string | null
          follower_id?: string
          following_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          away_score: number | null
          away_team: string
          commence_time: string
          created_at: string | null
          home_score: number | null
          home_team: string
          id: string
          last_updated: string | null
          odds_data: Json | null
          sport: string
          sport_title: string
          status: Database["public"]["Enums"]["game_status"] | null
        }
        Insert: {
          away_score?: number | null
          away_team: string
          commence_time: string
          created_at?: string | null
          home_score?: number | null
          home_team: string
          id: string
          last_updated?: string | null
          odds_data?: Json | null
          sport: string
          sport_title: string
          status?: Database["public"]["Enums"]["game_status"] | null
        }
        Update: {
          away_score?: number | null
          away_team?: string
          commence_time?: string
          created_at?: string | null
          home_score?: number | null
          home_team?: string
          id?: string
          last_updated?: string | null
          odds_data?: Json | null
          sport?: string
          sport_title?: string
          status?: Database["public"]["Enums"]["game_status"] | null
        }
        Relationships: []
      }
      message_reads: {
        Row: {
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string
          content: string
          created_at: string | null
          deleted_at: string | null
          expires_at: string
          id: string
          sender_id: string
        }
        Insert: {
          chat_id: string
          content: string
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          chat_id?: string
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          read: boolean | null
          read_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json
          id?: string
          read?: boolean | null
          read_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          read?: boolean | null
          read_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_actions: {
        Row: {
          action_type: Database["public"]["Enums"]["pick_action"]
          created_at: string | null
          id: string
          post_id: string
          resulting_bet_id: string | null
          user_id: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["pick_action"]
          created_at?: string | null
          id?: string
          post_id: string
          resulting_bet_id?: string | null
          user_id: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["pick_action"]
          created_at?: string | null
          id?: string
          post_id?: string
          resulting_bet_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pick_actions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_actions_resulting_bet_id_fkey"
            columns: ["resulting_bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          bet_id: string | null
          caption: string | null
          created_at: string | null
          deleted_at: string | null
          expires_at: string
          fade_count: number | null
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          reaction_count: number | null
          tail_count: number | null
          thumbnail_url: string | null
          user_id: string
        }
        Insert: {
          bet_id?: string | null
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expires_at: string
          fade_count?: number | null
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          reaction_count?: number | null
          tail_count?: number | null
          thumbnail_url?: string | null
          user_id: string
        }
        Update: {
          bet_id?: string | null
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string
          fade_count?: number | null
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string
          reaction_count?: number | null
          tail_count?: number | null
          thumbnail_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reactions: {
        Row: {
          created_at: string | null
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          emoji: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string | null
          user_id: string
          uses_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          user_id: string
          uses_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          user_id?: string
          uses_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string | null
          id: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      stories: {
        Row: {
          caption: string | null
          created_at: string | null
          deleted_at: string | null
          expires_at: string
          id: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          metadata: Json | null
          story_type: Database["public"]["Enums"]["story_type"] | null
          user_id: string
          view_count: number | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string
          id?: string
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string
          metadata?: Json | null
          story_type?: Database["public"]["Enums"]["story_type"] | null
          user_id: string
          view_count?: number | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          deleted_at?: string | null
          expires_at?: string
          id?: string
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string
          metadata?: Json | null
          story_type?: Database["public"]["Enums"]["story_type"] | null
          user_id?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          id: string
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          id?: string
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          id?: string
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          lost_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          lost_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          lost_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats_display: {
        Row: {
          created_at: string | null
          primary_stat: string
          selected_badge: string | null
          show_badge: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          primary_stat?: string
          selected_badge?: string | null
          show_badge?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          primary_stat?: string
          selected_badge?: string | null
          show_badge?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_display_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          deleted_at: string | null
          display_name: string | null
          email: string
          favorite_team: string | null
          id: string
          is_mock: boolean | null
          mock_behavior_seed: number | null
          mock_personality_id: string | null
          notification_settings: Json | null
          oauth_id: string
          oauth_provider: Database["public"]["Enums"]["oauth_provider"]
          privacy_settings: Json | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email: string
          favorite_team?: string | null
          id?: string
          is_mock?: boolean | null
          mock_behavior_seed?: number | null
          mock_personality_id?: string | null
          notification_settings?: Json | null
          oauth_id: string
          oauth_provider: Database["public"]["Enums"]["oauth_provider"]
          privacy_settings?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          deleted_at?: string | null
          display_name?: string | null
          email?: string
          favorite_team?: string | null
          id?: string
          is_mock?: boolean | null
          mock_behavior_seed?: number | null
          mock_personality_id?: string | null
          notification_settings?: Json | null
          oauth_id?: string
          oauth_provider?: Database["public"]["Enums"]["oauth_provider"]
          privacy_settings?: Json | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      user_follower_counts: {
        Row: {
          follower_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      calculate_payout: {
        Args: { stake: number; odds: number }
        Returns: number
      }
      create_notification: {
        Args: { p_user_id: string; p_type: string; p_data: Json }
        Returns: string
      }
      fade_pick: {
        Args: { p_user_id: string; p_post_id: string }
        Returns: string
      }
      get_feed: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number }
        Returns: {
          post_id: string
          user_id: string
          username: string
          display_name: string
          avatar_url: string
          media_url: string
          media_type: Database["public"]["Enums"]["media_type"]
          thumbnail_url: string
          caption: string
          tail_count: number
          fade_count: number
          reaction_count: number
          created_at: string
          expires_at: string
          bet_id: string
          bet_type: Database["public"]["Enums"]["bet_type"]
          bet_details: Json
          stake: number
          odds: number
          game_id: string
          game_info: Json
          user_action: Database["public"]["Enums"]["pick_action"]
          user_reaction: string[]
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      place_bet: {
        Args: {
          p_user_id: string
          p_game_id: string
          p_bet_type: Database["public"]["Enums"]["bet_type"]
          p_bet_details: Json
          p_stake: number
          p_odds: number
          p_expires_at: string
          p_is_tail?: boolean
          p_is_fade?: boolean
          p_original_pick_id?: string
        }
        Returns: string
      }
      reset_bankroll: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      settle_game_bets: {
        Args: { p_game_id: string }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      tail_pick: {
        Args: { p_user_id: string; p_post_id: string }
        Returns: string
      }
    }
    Enums: {
      bet_status: "pending" | "won" | "lost" | "push" | "cancelled"
      bet_type: "spread" | "total" | "moneyline"
      chat_role: "admin" | "member"
      chat_type: "dm" | "group"
      game_status: "scheduled" | "live" | "completed" | "cancelled"
      media_type: "photo" | "video"
      oauth_provider: "google" | "twitter"
      pick_action: "tail" | "fade"
      story_type: "manual" | "auto_milestone" | "auto_recap"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      bet_status: ["pending", "won", "lost", "push", "cancelled"],
      bet_type: ["spread", "total", "moneyline"],
      chat_role: ["admin", "member"],
      chat_type: ["dm", "group"],
      game_status: ["scheduled", "live", "completed", "cancelled"],
      media_type: ["photo", "video"],
      oauth_provider: ["google", "twitter"],
      pick_action: ["tail", "fade"],
      story_type: ["manual", "auto_milestone", "auto_recap"],
    },
  },
} as const
