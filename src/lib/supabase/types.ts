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
      cta_buttons: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label: string
          position: number
          style: string | null
          subtitle: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label: string
          position?: number
          style?: string | null
          subtitle?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label?: string
          position?: number
          style?: string | null
          subtitle?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      faq_items: {
        Row: {
          answer: string
          created_at: string
          id: string
          position: number
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          position?: number
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          position?: number
          question?: string
          updated_at?: string
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
      offer_features: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          position: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          position?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          position?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      page_sections: {
        Row: {
          created_at: string
          id: string
          page_id: string
          position: number
          section_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          position?: number
          section_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          position?: number
          section_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "page_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order: number
          status: string
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          status?: string
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order?: number
          status?: string
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          content: Json
          created_at: string
          id: string
          position: number
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          position?: number
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      section_cta_buttons: {
        Row: {
          created_at: string
          cta_button_id: string
          id: string
          position: number
          section_id: string
          status: string
        }
        Insert: {
          created_at?: string
          cta_button_id: string
          id?: string
          position?: number
          section_id: string
          status?: string
        }
        Update: {
          created_at?: string
          cta_button_id?: string
          id?: string
          position?: number
          section_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_cta_buttons_cta_button_id_fkey"
            columns: ["cta_button_id"]
            isOneToOne: false
            referencedRelation: "cta_buttons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_cta_buttons_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_faq_items: {
        Row: {
          created_at: string
          faq_item_id: string
          id: string
          position: number
          section_id: string
          status: string
        }
        Insert: {
          created_at?: string
          faq_item_id: string
          id?: string
          position?: number
          section_id: string
          status?: string
        }
        Update: {
          created_at?: string
          faq_item_id?: string
          id?: string
          position?: number
          section_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_faq_items_faq_item_id_fkey"
            columns: ["faq_item_id"]
            isOneToOne: false
            referencedRelation: "faq_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_faq_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_features: {
        Row: {
          created_at: string
          feature_id: string
          id: string
          position: number
          section_id: string
          status: string
        }
        Insert: {
          created_at?: string
          feature_id: string
          id?: string
          position?: number
          section_id: string
          status?: string
        }
        Update: {
          created_at?: string
          feature_id?: string
          id?: string
          position?: number
          section_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "offer_features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_features_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_media: {
        Row: {
          created_at: string
          id: string
          media_id: string
          role: string
          section_id: string
          sort_order: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          role?: string
          section_id: string
          sort_order?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          role?: string
          section_id?: string
          sort_order?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_media_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_results: {
        Row: {
          created_at: string
          id: string
          position: number
          result_id: string
          section_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          result_id: string
          section_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          result_id?: string
          section_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_results_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_results_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_socials: {
        Row: {
          created_at: string
          id: string
          order: number
          platform_id: string
          section_id: string
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          order?: number
          platform_id: string
          section_id: string
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          order?: number
          platform_id?: string
          section_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_socials_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "social_platforms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_socials_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      section_softwares: {
        Row: {
          created_at: string
          icon_override: string | null
          id: string
          order: number
          section_id: string
          software_id: string
          status: string
        }
        Insert: {
          created_at?: string
          icon_override?: string | null
          id?: string
          order?: number
          section_id: string
          software_id: string
          status?: string
        }
        Update: {
          created_at?: string
          icon_override?: string | null
          id?: string
          order?: number
          section_id?: string
          software_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_softwares_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_softwares_software_id_fkey"
            columns: ["software_id"]
            isOneToOne: false
            referencedRelation: "softwares"
            referencedColumns: ["id"]
          },
        ]
      }
      section_testimonials: {
        Row: {
          created_at: string
          id: string
          position: number
          section_id: string
          status: string
          testimonial_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          section_id: string
          status?: string
          testimonial_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          section_id?: string
          status?: string
          testimonial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_testimonials_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_testimonials_testimonial_id_fkey"
            columns: ["testimonial_id"]
            isOneToOne: false
            referencedRelation: "testimonials"
            referencedColumns: ["id"]
          },
        ]
      }
      section_timeline: {
        Row: {
          created_at: string
          id: string
          position: number
          section_id: string
          status: string
          timeline_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          section_id: string
          status?: string
          timeline_id: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          section_id?: string
          status?: string
          timeline_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_timeline_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_timeline_timeline_id_fkey"
            columns: ["timeline_id"]
            isOneToOne: false
            referencedRelation: "timeline"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          admin_title: string | null
          content: Json | null
          created_at: string
          eyebrow: string | null
          header_title: string | null
          icon: string | null
          id: string
          media_url: string | null
          subtitle: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          admin_title?: string | null
          content?: Json | null
          created_at?: string
          eyebrow?: string | null
          header_title?: string | null
          icon?: string | null
          id?: string
          media_url?: string | null
          subtitle?: string | null
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          admin_title?: string | null
          content?: Json | null
          created_at?: string
          eyebrow?: string | null
          header_title?: string | null
          icon?: string | null
          id?: string
          media_url?: string | null
          subtitle?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_structure: {
        Row: {
          created_at: string
          development_page_id: string | null
          id: string
          page_type: string
          production_page_id: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          development_page_id?: string | null
          id?: string
          page_type: string
          production_page_id?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          development_page_id?: string | null
          id?: string
          page_type?: string
          production_page_id?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "site_structure_development_page_id_fkey"
            columns: ["development_page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_structure_production_page_id_fkey"
            columns: ["production_page_id"]
            isOneToOne: false
            referencedRelation: "pages"
            referencedColumns: ["id"]
          },
        ]
      }
      social_platforms: {
        Row: {
          base_url: string | null
          created_at: string
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          base_url?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          base_url?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      softwares: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_name: string
          author_role: string | null
          avatar_url: string | null
          company_name: string | null
          created_at: string
          headline: string | null
          id: string
          position: number
          quote: string | null
          rating: number | null
          updated_at: string
        }
        Insert: {
          author_name: string
          author_role?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          headline?: string | null
          id?: string
          position?: number
          quote?: string | null
          rating?: number | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          author_role?: string | null
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          headline?: string | null
          id?: string
          position?: number
          quote?: string | null
          rating?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      timeline: {
        Row: {
          badge: string | null
          created_at: string
          icon: string | null
          id: string
          position: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          badge?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          position?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          badge?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          position?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_colors: {
        Row: {
          created_at: string
          hex: string
          hsl_h: number
          hsl_l: number
          hsl_s: number
          id: string
          name: string
          updated_at: string
          user_id: string
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
          user_id: string
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
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          active_theme_id: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active_theme_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active_theme_id?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_active_theme_id_fkey"
            columns: ["active_theme_id"]
            isOneToOne: false
            referencedRelation: "user_themes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_themes: {
        Row: {
          accent_color_id: string
          created_at: string
          font_family: string
          id: string
          name: string
          primary_color_id: string
          secondary_color_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accent_color_id: string
          created_at?: string
          font_family: string
          id?: string
          name: string
          primary_color_id: string
          secondary_color_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accent_color_id?: string
          created_at?: string
          font_family?: string
          id?: string
          name?: string
          primary_color_id?: string
          secondary_color_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_themes_accent_color_id_fkey"
            columns: ["accent_color_id"]
            isOneToOne: false
            referencedRelation: "user_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_themes_primary_color_id_fkey"
            columns: ["primary_color_id"]
            isOneToOne: false
            referencedRelation: "user_colors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_themes_secondary_color_id_fkey"
            columns: ["secondary_color_id"]
            isOneToOne: false
            referencedRelation: "user_colors"
            referencedColumns: ["id"]
          },
        ]
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
