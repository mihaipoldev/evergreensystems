export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_colors: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          hex: string;
          hsl_h: number;
          hsl_s: number;
          hsl_l: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          hex: string;
          hsl_h: number;
          hsl_s: number;
          hsl_l: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          hex?: string;
          hsl_h?: number;
          hsl_s?: number;
          hsl_l?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_themes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          primary_color_id: string;
          secondary_color_id: string;
          accent_color_id: string;
          font_family: string; // JSON string: {"admin": {"heading": "font-id", "body": "font-id"}}
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          primary_color_id: string;
          secondary_color_id: string;
          accent_color_id: string;
          font_family: string; // JSON string: {"admin": {"heading": "font-id", "body": "font-id"}}
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          primary_color_id?: string;
          secondary_color_id?: string;
          accent_color_id?: string;
          font_family?: string; // JSON string: {"landing": {"heading": "roboto", "body": "open-sans"}, "admin": {"heading": "montserrat", "body": "dm-sans"}}
          created_at?: string;
          updated_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          active_theme_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          active_theme_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          active_theme_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          type: string | null;
          variant: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          type?: string | null;
          variant?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          description?: string | null;
          type?: string | null;
          variant?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_structure: {
        Row: {
          id: string;
          page_type: string;
          slug: string;
          production_page_id: string | null;
          development_page_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_type: string;
          slug: string;
          production_page_id?: string | null;
          development_page_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_type?: string;
          slug?: string;
          production_page_id?: string | null;
          development_page_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      sections: {
        Row: {
          id: string;
          type: string;
          title: string | null;
          admin_title: string | null;
          subtitle: string | null;
          eyebrow: string | null;
          content: Json | null;
          media_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          title?: string | null;
          admin_title?: string | null;
          subtitle?: string | null;
          eyebrow?: string | null;
          content?: Json | null;
          media_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          title?: string | null;
          admin_title?: string | null;
          subtitle?: string | null;
          eyebrow?: string | null;
          content?: Json | null;
          media_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      page_sections: {
        Row: {
          id: string;
          page_id: string;
          section_id: string;
          position: number;
          status: "published" | "draft" | "deactivated";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          section_id: string;
          position?: number;
          status?: "published" | "draft" | "deactivated";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          section_id?: string;
          position?: number;
          status?: "published" | "draft" | "deactivated";
          created_at?: string;
          updated_at?: string;
        };
      };
      cta_buttons: {
        Row: {
          id: string;
          label: string;
          url: string;
          style: string | null;
          icon: string | null;
          position: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          url: string;
          style?: string | null;
          icon?: string | null;
          position?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          label?: string;
          url?: string;
          style?: string | null;
          icon?: string | null;
          position?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      offer_features: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          icon: string | null;
          position: number;
          status: "active" | "inactive";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          icon?: string | null;
          position?: number;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          icon?: string | null;
          position?: number;
          status?: "active" | "inactive";
          created_at?: string;
          updated_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: string;
          author_name: string;
          author_role: string | null;
          company_name: string | null;
          headline: string | null;
          quote: string | null;
          avatar_url: string | null;
          rating: number | null;
          approved: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_name: string;
          author_role?: string | null;
          company_name?: string | null;
          headline?: string | null;
          quote?: string | null;
          avatar_url?: string | null;
          rating?: number | null;
          approved?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_name?: string;
          author_role?: string | null;
          company_name?: string | null;
          headline?: string | null;
          quote?: string | null;
          avatar_url?: string | null;
          rating?: number | null;
          approved?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      faq_items: {
        Row: {
          id: string;
          question: string;
          answer: string;
          position: number;
          status: Database["public"]["Enums"]["faq_status"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question: string;
          answer: string;
          position?: number;
          status?: Database["public"]["Enums"]["faq_status"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question?: string;
          answer?: string;
          position?: number;
          status?: Database["public"]["Enums"]["faq_status"];
          created_at?: string;
          updated_at?: string;
        };
      };
      media_assets: {
        Row: {
          id: string;
          url: string;
          type: string;
          alt: string | null;
          category: string | null;
          section_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          url: string;
          type: string;
          alt?: string | null;
          category?: string | null;
          section_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          url?: string;
          type?: string;
          alt?: string | null;
          category?: string | null;
          section_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      analytics_events: {
        Row: {
          id: string;
          created_at: string;
          event_type: string;
          entity_type: string;
          entity_id: string;
          session_id: string | null;
          country: string | null;
          city: string | null;
          user_agent: string | null;
          referrer: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          event_type: string;
          entity_type: string;
          entity_id: string;
          session_id?: string | null;
          country?: string | null;
          city?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          event_type?: string;
          entity_type?: string;
          entity_id?: string;
          session_id?: string | null;
          country?: string | null;
          city?: string | null;
          user_agent?: string | null;
          referrer?: string | null;
          metadata?: Json | null;
        };
      };
      media: {
        Row: {
          id: string;
          type: string;
          source_type: string;
          url: string;
          embed_id: string | null;
          name: string | null;
          thumbnail_url: string | null;
          duration: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          source_type: string;
          url: string;
          embed_id?: string | null;
          name?: string | null;
          thumbnail_url?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          source_type?: string;
          url?: string;
          embed_id?: string | null;
          name?: string | null;
          thumbnail_url?: string | null;
          duration?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      section_media: {
        Row: {
          id: string;
          section_id: string;
          media_id: string;
          role: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          media_id: string;
          role?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          media_id?: string;
          role?: string;
          sort_order?: number;
          created_at?: string;
        };
      };
      section_cta_buttons: {
        Row: {
          id: string;
          section_id: string;
          cta_button_id: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          section_id: string;
          cta_button_id: string;
          position?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          section_id?: string;
          cta_button_id?: string;
          position?: number;
          created_at?: string;
        };
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: string;
      faq_status: "active" | "inactive";
    };
  };
}

