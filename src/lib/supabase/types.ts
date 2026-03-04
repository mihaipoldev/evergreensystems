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
      analytics_events: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          entity_id: string
          entity_type: string
          event_type: string
          id: string
          metadata: Json | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          event_type: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      media: {
        Row: {
          created_at: string
          duration: number | null
          embed_id: string | null
          id: string
          name: string | null
          source_type: string
          thumbnail_url: string | null
          type: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          duration?: number | null
          embed_id?: string | null
          id?: string
          name?: string | null
          source_type: string
          thumbnail_url?: string | null
          type: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          duration?: number | null
          embed_id?: string | null
          id?: string
          name?: string | null
          source_type?: string
          thumbnail_url?: string | null
          type?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      website_colors: {
        Row: {
          created_at: string
          hex: string
          hsl_h: number
          hsl_l: number
          hsl_s: number
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hex: string
          hsl_h: number
          hsl_l: number
          hsl_s: number
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hex?: string
          hsl_h?: number
          hsl_l?: number
          hsl_s?: number
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          created_at: string
          environment: string
          id: string
          preset_id: string | null
          route: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment: string
          id?: string
          preset_id?: string | null
          route?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment?: string
          id?: string
          preset_id?: string | null
          route?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_settings_new_preset_id_fkey"
            columns: ["preset_id"]
            isOneToOne: false
            referencedRelation: "website_settings_presets"
            referencedColumns: ["id"]
          },
        ]
      }
      website_settings_presets: {
        Row: {
          created_at: string
          favorite: boolean
          font_family: string
          id: string
          name: string
          primary_color_h: number | null
          primary_color_hex: string | null
          primary_color_l: number | null
          primary_color_s: number | null
          secondary_color_h: number | null
          secondary_color_hex: string | null
          secondary_color_l: number | null
          secondary_color_s: number | null
          styling_options: Json | null
          theme: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          favorite?: boolean
          font_family?: string
          id?: string
          name: string
          primary_color_h?: number | null
          primary_color_hex?: string | null
          primary_color_l?: number | null
          primary_color_s?: number | null
          secondary_color_h?: number | null
          secondary_color_hex?: string | null
          secondary_color_l?: number | null
          secondary_color_s?: number | null
          styling_options?: Json | null
          theme?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          favorite?: boolean
          font_family?: string
          id?: string
          name?: string
          primary_color_h?: number | null
          primary_color_hex?: string | null
          primary_color_l?: number | null
          primary_color_s?: number | null
          secondary_color_h?: number | null
          secondary_color_hex?: string | null
          secondary_color_l?: number | null
          secondary_color_s?: number | null
          styling_options?: Json | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_event_counts: {
        Args: {
          p_end_date: string
          p_event_type?: string
          p_start_date: string
        }
        Returns: {
          count: number
          date: string
        }[]
      }
      get_event_counts_by_type: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          count: number
          event_type: string
        }[]
      }
      get_top_countries_by_event: {
        Args: {
          p_end_date: string
          p_event_type: string
          p_limit?: number
          p_start_date: string
        }
        Returns: {
          count: number
          country: string
        }[]
      }
      get_top_ctas: {
        Args: { p_end_date: string; p_limit?: number; p_start_date: string }
        Returns: {
          clicks: number
          entity_id: string
          location: string
        }[]
      }
      get_top_locations: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: {
          clicks: number
          location: string
        }[]
      }
      get_unique_sessions: {
        Args: { p_end_date: string; p_start_date: string }
        Returns: number
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
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
