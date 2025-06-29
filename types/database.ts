export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      badge_history: {
        Row: {
          action: string;
          badge_id: string;
          created_at: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          action: string;
          badge_id: string;
          created_at?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          action?: string;
          badge_id?: string;
          created_at?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'badge_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      bankrolls: {
        Row: {
          balance: number;
          biggest_loss: number | null;
          biggest_win: number | null;
          created_at: string | null;
          last_reset: string | null;
          loss_count: number;
          push_count: number;
          referral_bonus: number | null;
          reset_count: number | null;
          season_high: number | null;
          season_low: number | null;
          stats_metadata: Json | null;
          total_wagered: number;
          total_won: number;
          updated_at: string | null;
          user_id: string;
          weekly_deposit: number | null;
          win_count: number;
        };
        Insert: {
          balance?: number;
          biggest_loss?: number | null;
          biggest_win?: number | null;
          created_at?: string | null;
          last_reset?: string | null;
          loss_count?: number;
          push_count?: number;
          referral_bonus?: number | null;
          reset_count?: number | null;
          season_high?: number | null;
          season_low?: number | null;
          stats_metadata?: Json | null;
          total_wagered?: number;
          total_won?: number;
          updated_at?: string | null;
          user_id: string;
          weekly_deposit?: number | null;
          win_count?: number;
        };
        Update: {
          balance?: number;
          biggest_loss?: number | null;
          biggest_win?: number | null;
          created_at?: string | null;
          last_reset?: string | null;
          loss_count?: number;
          push_count?: number;
          referral_bonus?: number | null;
          reset_count?: number | null;
          season_high?: number | null;
          season_low?: number | null;
          stats_metadata?: Json | null;
          total_wagered?: number;
          total_won?: number;
          updated_at?: string | null;
          user_id?: string;
          weekly_deposit?: number | null;
          win_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'bankrolls_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      bets: {
        Row: {
          actual_win: number | null;
          archived: boolean | null;
          bet_details: Json;
          bet_type: Database['public']['Enums']['bet_type'];
          created_at: string | null;
          deleted_at: string | null;
          embedding: string | null;
          expires_at: string | null;
          game_id: string;
          id: string;
          is_fade: boolean | null;
          is_tail: boolean | null;
          odds: number;
          original_pick_id: string | null;
          potential_win: number;
          settled_at: string | null;
          stake: number;
          status: Database['public']['Enums']['bet_status'];
          user_id: string;
        };
        Insert: {
          actual_win?: number | null;
          archived?: boolean | null;
          bet_details: Json;
          bet_type: Database['public']['Enums']['bet_type'];
          created_at?: string | null;
          deleted_at?: string | null;
          embedding?: string | null;
          expires_at?: string | null;
          game_id: string;
          id?: string;
          is_fade?: boolean | null;
          is_tail?: boolean | null;
          odds: number;
          original_pick_id?: string | null;
          potential_win: number;
          settled_at?: string | null;
          stake: number;
          status?: Database['public']['Enums']['bet_status'];
          user_id: string;
        };
        Update: {
          actual_win?: number | null;
          archived?: boolean | null;
          bet_details?: Json;
          bet_type?: Database['public']['Enums']['bet_type'];
          created_at?: string | null;
          deleted_at?: string | null;
          embedding?: string | null;
          expires_at?: string | null;
          game_id?: string;
          id?: string;
          is_fade?: boolean | null;
          is_tail?: boolean | null;
          odds?: number;
          original_pick_id?: string | null;
          potential_win?: number;
          settled_at?: string | null;
          stake?: number;
          status?: Database['public']['Enums']['bet_status'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'bets_game_id_fkey';
            columns: ['game_id'];
            isOneToOne: false;
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'bets_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      blocked_users: {
        Row: {
          blocked_id: string;
          blocker_id: string;
          created_at: string | null;
        };
        Insert: {
          blocked_id: string;
          blocker_id: string;
          created_at?: string | null;
        };
        Update: {
          blocked_id?: string;
          blocker_id?: string;
          created_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'blocked_users_blocked_id_fkey';
            columns: ['blocked_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'blocked_users_blocker_id_fkey';
            columns: ['blocker_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      caption_generation_usage: {
        Row: {
          count: number | null;
          date: string;
          user_id: string;
        };
        Insert: {
          count?: number | null;
          date?: string;
          user_id: string;
        };
        Update: {
          count?: number | null;
          date?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'caption_generation_usage_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      chat_members: {
        Row: {
          chat_id: string;
          is_archived: boolean | null;
          joined_at: string | null;
          last_read_at: string | null;
          role: Database['public']['Enums']['chat_role'] | null;
          user_id: string;
        };
        Insert: {
          chat_id: string;
          is_archived?: boolean | null;
          joined_at?: string | null;
          last_read_at?: string | null;
          role?: Database['public']['Enums']['chat_role'] | null;
          user_id: string;
        };
        Update: {
          chat_id?: string;
          is_archived?: boolean | null;
          joined_at?: string | null;
          last_read_at?: string | null;
          role?: Database['public']['Enums']['chat_role'] | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_members_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      chats: {
        Row: {
          avatar_url: string | null;
          chat_type: Database['public']['Enums']['chat_type'];
          created_at: string | null;
          created_by: string | null;
          id: string;
          last_message_at: string | null;
          name: string | null;
          settings: Json | null;
        };
        Insert: {
          avatar_url?: string | null;
          chat_type: Database['public']['Enums']['chat_type'];
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          last_message_at?: string | null;
          name?: string | null;
          settings?: Json | null;
        };
        Update: {
          avatar_url?: string | null;
          chat_type?: Database['public']['Enums']['chat_type'];
          created_at?: string | null;
          created_by?: string | null;
          id?: string;
          last_message_at?: string | null;
          name?: string | null;
          settings?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chats_created_by_fkey';
            columns: ['created_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      comments: {
        Row: {
          content: string;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          post_id: string;
          report_count: number | null;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          post_id: string;
          report_count?: number | null;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          post_id?: string;
          report_count?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      embedding_metadata: {
        Row: {
          entity_id: string;
          entity_type: string;
          generated_at: string | null;
          id: string;
          model_version: string;
          token_count: number | null;
        };
        Insert: {
          entity_id: string;
          entity_type: string;
          generated_at?: string | null;
          id?: string;
          model_version?: string;
          token_count?: number | null;
        };
        Update: {
          entity_id?: string;
          entity_type?: string;
          generated_at?: string | null;
          id?: string;
          model_version?: string;
          token_count?: number | null;
        };
        Relationships: [];
      };
      follow_requests: {
        Row: {
          created_at: string | null;
          id: string;
          requested_id: string | null;
          requester_id: string | null;
          status: Database['public']['Enums']['follow_request_status'] | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          requested_id?: string | null;
          requester_id?: string | null;
          status?: Database['public']['Enums']['follow_request_status'] | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          requested_id?: string | null;
          requester_id?: string | null;
          status?: Database['public']['Enums']['follow_request_status'] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'follow_requests_requested_id_fkey';
            columns: ['requested_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follow_requests_requester_id_fkey';
            columns: ['requester_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      follows: {
        Row: {
          created_at: string | null;
          follower_id: string;
          following_id: string;
        };
        Insert: {
          created_at?: string | null;
          follower_id: string;
          following_id: string;
        };
        Update: {
          created_at?: string | null;
          follower_id?: string;
          following_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey';
            columns: ['follower_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'follows_following_id_fkey';
            columns: ['following_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      games: {
        Row: {
          away_score: number | null;
          away_team: string;
          commence_time: string;
          created_at: string | null;
          home_score: number | null;
          home_team: string;
          id: string;
          last_updated: string | null;
          odds_data: Json | null;
          sport: string;
          sport_title: string;
          status: Database['public']['Enums']['game_status'] | null;
        };
        Insert: {
          away_score?: number | null;
          away_team: string;
          commence_time: string;
          created_at?: string | null;
          home_score?: number | null;
          home_team: string;
          id: string;
          last_updated?: string | null;
          odds_data?: Json | null;
          sport: string;
          sport_title: string;
          status?: Database['public']['Enums']['game_status'] | null;
        };
        Update: {
          away_score?: number | null;
          away_team?: string;
          commence_time?: string;
          created_at?: string | null;
          home_score?: number | null;
          home_team?: string;
          id?: string;
          last_updated?: string | null;
          odds_data?: Json | null;
          sport?: string;
          sport_title?: string;
          status?: Database['public']['Enums']['game_status'] | null;
        };
        Relationships: [];
      };
      job_executions: {
        Row: {
          affected_count: number | null;
          details: Json | null;
          duration_ms: number | null;
          executed_at: string | null;
          executed_by: string | null;
          id: string;
          job_name: string;
          message: string | null;
          success: boolean;
        };
        Insert: {
          affected_count?: number | null;
          details?: Json | null;
          duration_ms?: number | null;
          executed_at?: string | null;
          executed_by?: string | null;
          id?: string;
          job_name: string;
          message?: string | null;
          success: boolean;
        };
        Update: {
          affected_count?: number | null;
          details?: Json | null;
          duration_ms?: number | null;
          executed_at?: string | null;
          executed_by?: string | null;
          id?: string;
          job_name?: string;
          message?: string | null;
          success?: boolean;
        };
        Relationships: [];
      };
      message_pick_actions: {
        Row: {
          action_type: Database['public']['Enums']['pick_action'];
          created_at: string | null;
          id: string;
          message_id: string;
          resulting_bet_id: string | null;
          user_id: string;
        };
        Insert: {
          action_type: Database['public']['Enums']['pick_action'];
          created_at?: string | null;
          id?: string;
          message_id: string;
          resulting_bet_id?: string | null;
          user_id: string;
        };
        Update: {
          action_type?: Database['public']['Enums']['pick_action'];
          created_at?: string | null;
          id?: string;
          message_id?: string;
          resulting_bet_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'message_pick_actions_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_pick_actions_resulting_bet_id_fkey';
            columns: ['resulting_bet_id'];
            isOneToOne: false;
            referencedRelation: 'bets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_pick_actions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      message_privacy_settings: {
        Row: {
          online_status_visible: boolean | null;
          read_receipts_enabled: boolean | null;
          typing_indicators_enabled: boolean | null;
          updated_at: string | null;
          user_id: string;
          who_can_message: string | null;
        };
        Insert: {
          online_status_visible?: boolean | null;
          read_receipts_enabled?: boolean | null;
          typing_indicators_enabled?: boolean | null;
          updated_at?: string | null;
          user_id: string;
          who_can_message?: string | null;
        };
        Update: {
          online_status_visible?: boolean | null;
          read_receipts_enabled?: boolean | null;
          typing_indicators_enabled?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
          who_can_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'message_privacy_settings_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      message_reactions: {
        Row: {
          created_at: string | null;
          emoji: string;
          id: string;
          message_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          emoji: string;
          id?: string;
          message_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          emoji?: string;
          id?: string;
          message_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'message_reactions_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_reactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      message_reads: {
        Row: {
          message_id: string;
          read_at: string | null;
          user_id: string;
        };
        Insert: {
          message_id: string;
          read_at?: string | null;
          user_id: string;
        };
        Update: {
          message_id?: string;
          read_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'message_reads_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_reads_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      message_reports: {
        Row: {
          action_taken: string | null;
          created_at: string | null;
          details: string | null;
          id: string;
          message_id: string | null;
          reason: string;
          reporter_id: string | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          action_taken?: string | null;
          created_at?: string | null;
          details?: string | null;
          id?: string;
          message_id?: string | null;
          reason: string;
          reporter_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          action_taken?: string | null;
          created_at?: string | null;
          details?: string | null;
          id?: string;
          message_id?: string | null;
          reason?: string;
          reporter_id?: string | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'message_reports_message_id_fkey';
            columns: ['message_id'];
            isOneToOne: false;
            referencedRelation: 'messages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'message_reports_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      messages: {
        Row: {
          archived: boolean | null;
          bet_id: string | null;
          chat_id: string;
          content: string;
          created_at: string | null;
          deleted_at: string | null;
          expires_at: string;
          id: string;
          is_blocked: boolean | null;
          media_type: string | null;
          media_url: string | null;
          message_type: string | null;
          metadata: Json | null;
          report_count: number | null;
          sender_id: string;
        };
        Insert: {
          archived?: boolean | null;
          bet_id?: string | null;
          chat_id: string;
          content: string;
          created_at?: string | null;
          deleted_at?: string | null;
          expires_at?: string;
          id?: string;
          is_blocked?: boolean | null;
          media_type?: string | null;
          media_url?: string | null;
          message_type?: string | null;
          metadata?: Json | null;
          report_count?: number | null;
          sender_id: string;
        };
        Update: {
          archived?: boolean | null;
          bet_id?: string | null;
          chat_id?: string;
          content?: string;
          created_at?: string | null;
          deleted_at?: string | null;
          expires_at?: string;
          id?: string;
          is_blocked?: boolean | null;
          media_type?: string | null;
          media_url?: string | null;
          message_type?: string | null;
          metadata?: Json | null;
          report_count?: number | null;
          sender_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'messages_bet_id_fkey';
            columns: ['bet_id'];
            isOneToOne: false;
            referencedRelation: 'bets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_chat_id_fkey';
            columns: ['chat_id'];
            isOneToOne: false;
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'messages_sender_id_fkey';
            columns: ['sender_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      notifications: {
        Row: {
          created_at: string | null;
          data: Json;
          id: string;
          read: boolean | null;
          read_at: string | null;
          type: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          data?: Json;
          id?: string;
          read?: boolean | null;
          read_at?: string | null;
          type: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          data?: Json;
          id?: string;
          read?: boolean | null;
          read_at?: string | null;
          type?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      pick_actions: {
        Row: {
          action_type: Database['public']['Enums']['pick_action'];
          archived: boolean | null;
          created_at: string | null;
          deleted_at: string | null;
          id: string;
          post_id: string;
          resulting_bet_id: string | null;
          user_id: string;
        };
        Insert: {
          action_type: Database['public']['Enums']['pick_action'];
          archived?: boolean | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          post_id: string;
          resulting_bet_id?: string | null;
          user_id: string;
        };
        Update: {
          action_type?: Database['public']['Enums']['pick_action'];
          archived?: boolean | null;
          created_at?: string | null;
          deleted_at?: string | null;
          id?: string;
          post_id?: string;
          resulting_bet_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'pick_actions_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pick_actions_resulting_bet_id_fkey';
            columns: ['resulting_bet_id'];
            isOneToOne: false;
            referencedRelation: 'bets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'pick_actions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      posts: {
        Row: {
          archived: boolean | null;
          bet_id: string | null;
          caption: string | null;
          comment_count: number | null;
          created_at: string | null;
          deleted_at: string | null;
          effect_id: string | null;
          embedding: string | null;
          expires_at: string;
          fade_count: number | null;
          id: string;
          media_type: Database['public']['Enums']['media_type'];
          media_url: string;
          post_type: string | null;
          reaction_count: number | null;
          report_count: number | null;
          settled_bet_id: string | null;
          tail_count: number | null;
          thumbnail_url: string | null;
          user_id: string;
        };
        Insert: {
          archived?: boolean | null;
          bet_id?: string | null;
          caption?: string | null;
          comment_count?: number | null;
          created_at?: string | null;
          deleted_at?: string | null;
          effect_id?: string | null;
          embedding?: string | null;
          expires_at: string;
          fade_count?: number | null;
          id?: string;
          media_type: Database['public']['Enums']['media_type'];
          media_url: string;
          post_type?: string | null;
          reaction_count?: number | null;
          report_count?: number | null;
          settled_bet_id?: string | null;
          tail_count?: number | null;
          thumbnail_url?: string | null;
          user_id: string;
        };
        Update: {
          archived?: boolean | null;
          bet_id?: string | null;
          caption?: string | null;
          comment_count?: number | null;
          created_at?: string | null;
          deleted_at?: string | null;
          effect_id?: string | null;
          embedding?: string | null;
          expires_at?: string;
          fade_count?: number | null;
          id?: string;
          media_type?: Database['public']['Enums']['media_type'];
          media_url?: string;
          post_type?: string | null;
          reaction_count?: number | null;
          report_count?: number | null;
          settled_bet_id?: string | null;
          tail_count?: number | null;
          thumbnail_url?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'posts_bet_id_fkey';
            columns: ['bet_id'];
            isOneToOne: false;
            referencedRelation: 'bets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_settled_bet_id_fkey';
            columns: ['settled_bet_id'];
            isOneToOne: false;
            referencedRelation: 'bets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'posts_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      reactions: {
        Row: {
          archived: boolean | null;
          created_at: string | null;
          deleted_at: string | null;
          emoji: string;
          id: string;
          post_id: string | null;
          story_id: string | null;
          user_id: string;
        };
        Insert: {
          archived?: boolean | null;
          created_at?: string | null;
          deleted_at?: string | null;
          emoji: string;
          id?: string;
          post_id?: string | null;
          story_id?: string | null;
          user_id: string;
        };
        Update: {
          archived?: boolean | null;
          created_at?: string | null;
          deleted_at?: string | null;
          emoji?: string;
          id?: string;
          post_id?: string | null;
          story_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reactions_post_id_fkey';
            columns: ['post_id'];
            isOneToOne: false;
            referencedRelation: 'posts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reactions_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reactions_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      referral_codes: {
        Row: {
          code: string;
          created_at: string | null;
          user_id: string;
          uses_count: number | null;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          user_id: string;
          uses_count?: number | null;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          user_id?: string;
          uses_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'referral_codes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      referrals: {
        Row: {
          code: string;
          created_at: string | null;
          id: string;
          referred_id: string;
          referrer_id: string;
        };
        Insert: {
          code: string;
          created_at?: string | null;
          id?: string;
          referred_id: string;
          referrer_id: string;
        };
        Update: {
          code?: string;
          created_at?: string | null;
          id?: string;
          referred_id?: string;
          referrer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'referrals_referred_id_fkey';
            columns: ['referred_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'referrals_referrer_id_fkey';
            columns: ['referrer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      reports: {
        Row: {
          action_taken: string | null;
          additional_info: string | null;
          content_id: string;
          content_type: string;
          created_at: string | null;
          id: string;
          reason: string;
          reporter_id: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          action_taken?: string | null;
          additional_info?: string | null;
          content_id: string;
          content_type: string;
          created_at?: string | null;
          id?: string;
          reason: string;
          reporter_id: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          action_taken?: string | null;
          additional_info?: string | null;
          content_id?: string;
          content_type?: string;
          created_at?: string | null;
          id?: string;
          reason?: string;
          reporter_id?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      stories: {
        Row: {
          archived: boolean | null;
          caption: string | null;
          created_at: string | null;
          deleted_at: string | null;
          expires_at: string;
          id: string;
          media_type: Database['public']['Enums']['media_type'];
          media_url: string;
          metadata: Json | null;
          report_count: number | null;
          story_content_type: string | null;
          story_type: Database['public']['Enums']['story_type'] | null;
          user_id: string;
          view_count: number | null;
        };
        Insert: {
          archived?: boolean | null;
          caption?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          expires_at?: string;
          id?: string;
          media_type: Database['public']['Enums']['media_type'];
          media_url: string;
          metadata?: Json | null;
          report_count?: number | null;
          story_content_type?: string | null;
          story_type?: Database['public']['Enums']['story_type'] | null;
          user_id: string;
          view_count?: number | null;
        };
        Update: {
          archived?: boolean | null;
          caption?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          expires_at?: string;
          id?: string;
          media_type?: Database['public']['Enums']['media_type'];
          media_url?: string;
          metadata?: Json | null;
          report_count?: number | null;
          story_content_type?: string | null;
          story_type?: Database['public']['Enums']['story_type'] | null;
          user_id?: string;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'stories_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      story_views: {
        Row: {
          id: string;
          story_id: string;
          viewed_at: string | null;
          viewer_id: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          viewed_at?: string | null;
          viewer_id: string;
        };
        Update: {
          id?: string;
          story_id?: string;
          viewed_at?: string | null;
          viewer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'story_views_story_id_fkey';
            columns: ['story_id'];
            isOneToOne: false;
            referencedRelation: 'stories';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'story_views_viewer_id_fkey';
            columns: ['viewer_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_badges: {
        Row: {
          badge_id: string;
          earned_at: string;
          lost_at: string | null;
          user_id: string;
          week_start_date: string | null;
          weekly_reset_at: string | null;
        };
        Insert: {
          badge_id: string;
          earned_at?: string;
          lost_at?: string | null;
          user_id: string;
          week_start_date?: string | null;
          weekly_reset_at?: string | null;
        };
        Update: {
          badge_id?: string;
          earned_at?: string;
          lost_at?: string | null;
          user_id?: string;
          week_start_date?: string | null;
          weekly_reset_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_badges_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      user_stats_display: {
        Row: {
          created_at: string | null;
          primary_stat: string;
          selected_badge: string | null;
          show_badge: boolean | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          primary_stat?: string;
          selected_badge?: string | null;
          show_badge?: boolean | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          primary_stat?: string;
          selected_badge?: string | null;
          show_badge?: boolean | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_stats_display_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          deleted_at: string | null;
          display_name: string | null;
          email: string | null;
          id: string;
          is_mock: boolean | null;
          is_private: boolean | null;
          last_embedding_update: string | null;
          mock_behavior_seed: number | null;
          mock_personality_id: string | null;
          notification_settings: Json | null;
          oauth_id: string;
          oauth_provider: Database['public']['Enums']['oauth_provider'];
          privacy_settings: Json | null;
          profile_embedding: string | null;
          referral_count: number | null;
          show_bankroll: boolean | null;
          show_picks: boolean | null;
          show_stats: boolean | null;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          is_mock?: boolean | null;
          is_private?: boolean | null;
          last_embedding_update?: string | null;
          mock_behavior_seed?: number | null;
          mock_personality_id?: string | null;
          notification_settings?: Json | null;
          oauth_id: string;
          oauth_provider: Database['public']['Enums']['oauth_provider'];
          privacy_settings?: Json | null;
          profile_embedding?: string | null;
          referral_count?: number | null;
          show_bankroll?: boolean | null;
          show_picks?: boolean | null;
          show_stats?: boolean | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          deleted_at?: string | null;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          is_mock?: boolean | null;
          is_private?: boolean | null;
          last_embedding_update?: string | null;
          mock_behavior_seed?: number | null;
          mock_personality_id?: string | null;
          notification_settings?: Json | null;
          oauth_id?: string;
          oauth_provider?: Database['public']['Enums']['oauth_provider'];
          privacy_settings?: Json | null;
          profile_embedding?: string | null;
          referral_count?: number | null;
          show_bankroll?: boolean | null;
          show_picks?: boolean | null;
          show_stats?: boolean | null;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      user_follower_counts: {
        Row: {
          follower_count: number | null;
          user_id: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'follows_following_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      binary_quantize: {
        Args: { '': string } | { '': unknown };
        Returns: unknown;
      };
      calculate_payout: {
        Args: { stake: number; odds: number };
        Returns: number;
      };
      calculate_potential_win: {
        Args: { p_stake: number; p_odds: number };
        Returns: number;
      };
      calculate_referral_bonus: {
        Args: { user_id: string };
        Returns: number;
      };
      can_user_message: {
        Args: { sender_id: string; recipient_id: string };
        Returns: boolean;
      };
      check_bet_consensus: {
        Args: {
          check_game_id: string;
          check_bet_details: Json;
          check_user_id: string;
          time_window?: unknown;
        };
        Returns: {
          consensus_count: number;
          user_ids: string[];
          usernames: string[];
          avg_odds: number;
          total_stake: number;
        }[];
      };
      check_perfect_nfl_sunday: {
        Args: { p_user_id: string; p_week_start?: string };
        Returns: boolean;
      };
      cleanup_old_job_executions: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      create_dm_chat: {
        Args: { other_user_id: string };
        Returns: string;
      };
      create_group_chat: {
        Args: {
          p_name: string;
          p_avatar_url?: string;
          p_created_by?: string;
          p_member_ids?: string[];
          p_settings?: Json;
        };
        Returns: {
          id: string;
          chat_type: Database['public']['Enums']['chat_type'];
          name: string;
          avatar_url: string;
          created_by: string;
          created_at: string;
          settings: Json;
        }[];
      };
      create_notification: {
        Args: { p_user_id: string; p_type: string; p_data: Json };
        Returns: string;
      };
      fade_pick: {
        Args: { p_user_id: string; p_post_id: string };
        Returns: string;
      };
      find_similar_posts: {
        Args: {
          user_embedding: string;
          p_user_id: string;
          exclude_user_ids: string[];
          time_window?: unknown;
          limit_count?: number;
        };
        Returns: {
          id: string;
          post_user_id: string;
          content: string;
          type: string;
          created_at: string;
          expires_at: string;
          view_count: number;
          reaction_count: number;
          comment_count: number;
          similarity: number;
        }[];
      };
      find_similar_users: {
        Args: {
          query_embedding: string;
          p_user_id: string;
          limit_count?: number;
        };
        Returns: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string;
          bio: string;
          similarity: number;
          win_rate: number;
          total_bets: number;
          common_sports: string[];
        }[];
      };
      get_blocked_user_ids: {
        Args: { p_user_id: string };
        Returns: {
          blocked_id: string;
        }[];
      };
      get_feed: {
        Args: { p_user_id: string; p_limit?: number; p_offset?: number };
        Returns: {
          post_id: string;
          user_id: string;
          username: string;
          display_name: string;
          avatar_url: string;
          media_url: string;
          media_type: Database['public']['Enums']['media_type'];
          thumbnail_url: string;
          caption: string;
          tail_count: number;
          fade_count: number;
          reaction_count: number;
          created_at: string;
          expires_at: string;
          bet_id: string;
          bet_type: Database['public']['Enums']['bet_type'];
          bet_details: Json;
          stake: number;
          odds: number;
          game_id: string;
          game_info: Json;
          user_action: Database['public']['Enums']['pick_action'];
          user_reaction: string[];
        }[];
      };
      get_user_avatar_url: {
        Args: { p_user_id: string };
        Returns: string;
      };
      get_user_chats_with_counts: {
        Args: { p_user_id: string };
        Returns: {
          chat_id: string;
          chat_type: string;
          name: string;
          avatar_url: string;
          created_by: string;
          created_at: string;
          last_message_at: string;
          settings: Json;
          is_archived: boolean;
          unread_count: number;
          last_message_id: string;
          last_message_content: string;
          last_message_sender_id: string;
          last_message_sender_username: string;
          last_message_created_at: string;
          other_member_id: string;
          other_member_username: string;
          other_member_avatar_url: string;
          member_count: number;
        }[];
      };
      get_user_weekly_stats: {
        Args: { p_user_id: string; p_week_start?: string };
        Returns: {
          user_id: string;
          week_start: string;
          total_bets: number;
          wins: number;
          losses: number;
          win_rate: number;
          total_wagered: number;
          total_won: number;
          profit: number;
          current_streak: number;
          picks_posted: number;
          days_since_last_post: number;
          tail_profit_generated: number;
          fade_profit_generated: number;
        }[];
      };
      get_week_end: {
        Args: { input_date?: string };
        Returns: string;
      };
      get_week_start: {
        Args: { input_date?: string };
        Returns: string;
      };
      get_weekly_profit_leader: {
        Args: { p_week_start?: string };
        Returns: string;
      };
      gtrgm_compress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_decompress: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_in: {
        Args: { '': unknown };
        Returns: unknown;
      };
      gtrgm_options: {
        Args: { '': unknown };
        Returns: undefined;
      };
      gtrgm_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      halfvec_avg: {
        Args: { '': number[] };
        Returns: unknown;
      };
      halfvec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      halfvec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      halfvec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      hnsw_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnsw_sparsevec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      hnswhandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      increment_counter: {
        Args: { table_name: string; column_name: string; row_id: string };
        Returns: undefined;
      };
      is_chat_admin: {
        Args: { p_chat_id: string; p_user_id: string };
        Returns: boolean;
      };
      is_chat_member: {
        Args: { p_chat_id: string; p_user_id: string };
        Returns: boolean;
      };
      ivfflat_bit_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflat_halfvec_support: {
        Args: { '': unknown };
        Returns: unknown;
      };
      ivfflathandler: {
        Args: { '': unknown };
        Returns: unknown;
      };
      l2_norm: {
        Args: { '': unknown } | { '': unknown };
        Returns: number;
      };
      l2_normalize: {
        Args: { '': string } | { '': unknown } | { '': unknown };
        Returns: string;
      };
      log_bankroll_transaction: {
        Args: {
          p_user_id: string;
          p_type: string;
          p_amount: number;
          p_bet_id?: string;
        };
        Returns: undefined;
      };
      place_bet: {
        Args: {
          p_user_id: string;
          p_game_id: string;
          p_bet_type: Database['public']['Enums']['bet_type'];
          p_bet_details: Json;
          p_stake: number;
          p_odds: number;
          p_expires_at: string;
          p_is_tail?: boolean;
          p_is_fade?: boolean;
          p_original_pick_id?: string;
        };
        Returns: string;
      };
      place_bet_with_bankroll_check: {
        Args: {
          p_user_id: string;
          p_game_id: string;
          p_bet_type: Database['public']['Enums']['bet_type'];
          p_bet_details: Json;
          p_stake: number;
          p_odds: number;
          p_expires_at: string;
          p_is_tail?: boolean;
          p_is_fade?: boolean;
          p_original_pick_id?: string;
        };
        Returns: string;
      };
      reset_bankroll: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      reset_weekly_badges: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      set_limit: {
        Args: { '': number };
        Returns: number;
      };
      settle_game_bets: {
        Args: { p_game_id: string };
        Returns: number;
      };
      show_limit: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      show_trgm: {
        Args: { '': string };
        Returns: string[];
      };
      sparsevec_out: {
        Args: { '': unknown };
        Returns: unknown;
      };
      sparsevec_send: {
        Args: { '': unknown };
        Returns: string;
      };
      sparsevec_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
      tail_pick: {
        Args: { p_user_id: string; p_post_id: string };
        Returns: string;
      };
      update_user_badges_batch: {
        Args: { p_user_id: string; p_badges: string[] };
        Returns: undefined;
      };
      users_blocked: {
        Args: { user1_id: string; user2_id: string };
        Returns: boolean;
      };
      vector_avg: {
        Args: { '': number[] };
        Returns: string;
      };
      vector_dims: {
        Args: { '': string } | { '': unknown };
        Returns: number;
      };
      vector_norm: {
        Args: { '': string };
        Returns: number;
      };
      vector_out: {
        Args: { '': string };
        Returns: unknown;
      };
      vector_send: {
        Args: { '': string };
        Returns: string;
      };
      vector_typmod_in: {
        Args: { '': unknown[] };
        Returns: number;
      };
    };
    Enums: {
      bet_status: 'pending' | 'won' | 'lost' | 'push' | 'cancelled';
      bet_type: 'spread' | 'total' | 'moneyline';
      chat_role: 'admin' | 'member';
      chat_type: 'dm' | 'group';
      follow_request_status: 'pending' | 'accepted' | 'rejected' | 'expired';
      game_status: 'scheduled' | 'live' | 'completed' | 'cancelled';
      media_type: 'photo' | 'video' | 'gif';
      oauth_provider: 'google' | 'twitter';
      pick_action: 'tail' | 'fade';
      story_type: 'manual' | 'auto_milestone' | 'auto_recap';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums'] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      bet_status: ['pending', 'won', 'lost', 'push', 'cancelled'],
      bet_type: ['spread', 'total', 'moneyline'],
      chat_role: ['admin', 'member'],
      chat_type: ['dm', 'group'],
      follow_request_status: ['pending', 'accepted', 'rejected', 'expired'],
      game_status: ['scheduled', 'live', 'completed', 'cancelled'],
      media_type: ['photo', 'video', 'gif'],
      oauth_provider: ['google', 'twitter'],
      pick_action: ['tail', 'fade'],
      story_type: ['manual', 'auto_milestone', 'auto_recap'],
    },
  },
} as const;
