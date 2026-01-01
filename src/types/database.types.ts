export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          liked_id: string
          liker_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          liked_id: string
          liker_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          liked_id?: string
          liker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_liked_id_fkey"
            columns: ["liked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_liker_id_fkey"
            columns: ["liker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          blur_points: number
          compatibility_breakdown: Json
          compatibility_score: number
          created_at: string | null
          id: string
          is_unblurred: boolean | null
          last_message_at: string | null
          matched_at: string | null
          total_messages: number
          user1_id: string
          user2_id: string
        }
        Insert: {
          blur_points?: number
          compatibility_breakdown?: Json
          compatibility_score: number
          created_at?: string | null
          id?: string
          is_unblurred?: boolean | null
          last_message_at?: string | null
          matched_at?: string | null
          total_messages?: number
          user1_id: string
          user2_id: string
        }
        Update: {
          blur_points?: number
          compatibility_breakdown?: Json
          compatibility_score?: number
          created_at?: string | null
          id?: string
          is_unblurred?: boolean | null
          last_message_at?: string | null
          matched_at?: string | null
          total_messages?: number
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          audio_duration_seconds: number | null
          audio_url: string | null
          content: string
          created_at: string | null
          id: string
          match_id: string
          points_awarded: number
          read_at: string | null
          sender_id: string
          type: string
        }
        Insert: {
          audio_duration_seconds?: number | null
          audio_url?: string | null
          content: string
          created_at?: string | null
          id?: string
          match_id: string
          points_awarded?: number
          read_at?: string | null
          sender_id: string
          type: string
        }
        Update: {
          audio_duration_seconds?: number | null
          audio_url?: string | null
          content?: string
          created_at?: string | null
          id?: string
          match_id?: string
          points_awarded?: number
          read_at?: string | null
          sender_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          read: boolean | null
          sent: boolean | null
          sent_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          sent?: boolean | null
          sent_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          read?: boolean | null
          sent?: boolean | null
          sent_at?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      personality_profiles: {
        Row: {
          agreeableness: number
          confidence_score: number | null
          conscientiousness: number
          created_at: string | null
          data_sources: string[]
          extraversion: number
          id: string
          interests: Json
          neuroticism: number
          openness: number
          summary: string | null
          traits: Json
          updated_at: string | null
          user_id: string
          values: Json
        }
        Insert: {
          agreeableness: number
          confidence_score?: number | null
          conscientiousness: number
          created_at?: string | null
          data_sources?: string[]
          extraversion: number
          id?: string
          interests?: Json
          neuroticism: number
          openness: number
          summary?: string | null
          traits?: Json
          updated_at?: string | null
          user_id: string
          values?: Json
        }
        Update: {
          agreeableness?: number
          confidence_score?: number | null
          conscientiousness?: number
          created_at?: string | null
          data_sources?: string[]
          extraversion?: number
          id?: string
          interests?: Json
          neuroticism?: number
          openness?: number
          summary?: string | null
          traits?: Json
          updated_at?: string | null
          user_id?: string
          values?: Json
        }
        Relationships: [
          {
            foreignKeyName: "personality_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          blurhash: string | null
          created_at: string | null
          height: number | null
          id: string
          is_primary: boolean | null
          position: number
          storage_path: string
          storage_url: string
          user_id: string
          width: number | null
        }
        Insert: {
          blurhash?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          position?: number
          storage_path: string
          storage_url: string
          user_id: string
          width?: number | null
        }
        Update: {
          blurhash?: string | null
          created_at?: string | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          position?: number
          storage_path?: string
          storage_url?: string
          user_id?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number
          bio: string | null
          consent_data_processing: boolean | null
          consent_digital_footprint: boolean | null
          consent_timestamp: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          gender: string
          id: string
          last_active_at: string | null
          location_city: string | null
          location_lat: number | null
          location_lng: number | null
          looking_for: string[]
          name: string
          occupation: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          push_enabled: boolean | null
          push_token: string | null
          spotify_connected: boolean | null
          spotify_user_id: string | null
          updated_at: string | null
          wants_kids: string | null
          drinking: string | null
          smoking: string | null
          marijuana_use: string | null
          religion: string[] | null
          politics: string | null
          youtube_channel_id: string | null
          youtube_connected: boolean | null
        }
        Insert: {
          age: number
          bio?: string | null
          consent_data_processing?: boolean | null
          consent_digital_footprint?: boolean | null
          consent_timestamp?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          gender: string
          id: string
          last_active_at?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          looking_for?: string[]
          name: string
          occupation?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          push_enabled?: boolean | null
          push_token?: string | null
          spotify_connected?: boolean | null
          spotify_user_id?: string | null
          updated_at?: string | null
          wants_kids?: string | null
          drinking?: string | null
          smoking?: string | null
          marijuana_use?: string | null
          religion?: string[] | null
          politics?: string | null
          youtube_channel_id?: string | null
          youtube_connected?: boolean | null
        }
        Update: {
          age?: number
          bio?: string | null
          consent_data_processing?: boolean | null
          consent_digital_footprint?: boolean | null
          consent_timestamp?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          gender?: string
          id?: string
          last_active_at?: string | null
          location_city?: string | null
          location_lat?: number | null
          location_lng?: number | null
          looking_for?: string[]
          name?: string
          occupation?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          push_enabled?: boolean | null
          push_token?: string | null
          spotify_connected?: boolean | null
          spotify_user_id?: string | null
          updated_at?: string | null
          wants_kids?: string | null
          drinking?: string | null
          smoking?: string | null
          marijuana_use?: string | null
          religion?: string[] | null
          politics?: string | null
          youtube_channel_id?: string | null
          youtube_connected?: boolean | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      typing_indicators: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          match_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          id?: string
          match_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          match_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "typing_indicators_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "typing_indicators_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_typing_indicators: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
