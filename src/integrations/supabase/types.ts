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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alert_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          new_value: Json | null
          old_value: Json | null
          seen: boolean
          tracked_channel_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          seen?: boolean
          tracked_channel_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          seen?: boolean
          tracked_channel_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "alert_events_tracked_channel_id_fkey"
            columns: ["tracked_channel_id"]
            isOneToOne: false
            referencedRelation: "tracked_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_scans: {
        Row: {
          channel_input: string
          created_at: string
          id: string
          niche: string | null
          results: Json
          score: number | null
          status: string
          summary: string | null
          user_id: string
        }
        Insert: {
          channel_input: string
          created_at?: string
          id?: string
          niche?: string | null
          results?: Json
          score?: number | null
          status?: string
          summary?: string | null
          user_id: string
        }
        Update: {
          channel_input?: string
          created_at?: string
          id?: string
          niche?: string | null
          results?: Json
          score?: number | null
          status?: string
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prepublish_checks: {
        Row: {
          breakdown: Json
          chapters: Json
          composite_score: number | null
          created_at: string
          description: string
          id: string
          thumbnail_text: string
          title: string
          user_id: string
        }
        Insert: {
          breakdown?: Json
          chapters?: Json
          composite_score?: number | null
          created_at?: string
          description?: string
          id?: string
          thumbnail_text?: string
          title?: string
          user_id: string
        }
        Update: {
          breakdown?: Json
          chapters?: Json
          composite_score?: number | null
          created_at?: string
          description?: string
          id?: string
          thumbnail_text?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          plan: Database["public"]["Enums"]["app_plan"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          plan?: Database["public"]["Enums"]["app_plan"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          plan?: Database["public"]["Enums"]["app_plan"]
          updated_at?: string
        }
        Relationships: []
      }
      tracked_channels: {
        Row: {
          channel_input: string
          created_at: string
          id: string
          is_competitor: boolean
          last_checked_at: string | null
          last_cited_models: string[]
          last_score: number | null
          niche: string
          user_id: string
        }
        Insert: {
          channel_input: string
          created_at?: string
          id?: string
          is_competitor?: boolean
          last_checked_at?: string | null
          last_cited_models?: string[]
          last_score?: number | null
          niche: string
          user_id: string
        }
        Update: {
          channel_input?: string
          created_at?: string
          id?: string
          is_competitor?: boolean
          last_checked_at?: string | null
          last_cited_models?: string[]
          last_score?: number | null
          niche?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_paid_plan: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_plan: "free" | "paid"
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
    Enums: {
      app_plan: ["free", "paid"],
    },
  },
} as const
