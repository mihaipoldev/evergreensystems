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
      website_colors: {
        Row: {
          id: string;
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
          name?: string;
          hex?: string;
          hsl_h?: number;
          hsl_s?: number;
          hsl_l?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      website_settings: {
        Row: {
          id: string; // UUID
          environment: string; // 'production' or 'development'
          preset_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string; // UUID
          environment: string; // 'production' or 'development'
          preset_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          environment?: string; // 'production' or 'development'
          preset_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      website_settings_presets: {
        Row: {
          id: string; // UUID
          name: string;
          theme: string;
          primary_color_hex: string | null;
          primary_color_h: number | null;
          primary_color_s: number | null;
          primary_color_l: number | null;
          secondary_color_hex: string | null;
          secondary_color_h: number | null;
          secondary_color_s: number | null;
          secondary_color_l: number | null;
          font_family: string;
          styling_options: Json | null;
          favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string; // UUID
          name: string;
          theme?: string;
          primary_color_hex?: string | null;
          primary_color_h?: number | null;
          primary_color_s?: number | null;
          primary_color_l?: number | null;
          secondary_color_hex?: string | null;
          secondary_color_h?: number | null;
          secondary_color_s?: number | null;
          secondary_color_l?: number | null;
          font_family?: string;
          styling_options?: Json | null;
          favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string; // UUID
          name?: string;
          theme?: string;
          primary_color_hex?: string | null;
          primary_color_h?: number | null;
          primary_color_s?: number | null;
          primary_color_l?: number | null;
          secondary_color_hex?: string | null;
          secondary_color_h?: number | null;
          secondary_color_s?: number | null;
          secondary_color_l?: number | null;
          font_family?: string;
          styling_options?: Json | null;
          favorite?: boolean;
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
          header_title: string | null;
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
          header_title?: string | null;
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
          header_title?: string | null;
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
          subtitle: string | null;
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
          subtitle?: string | null;
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
          subtitle?: string | null;
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
      rag_runs: {
        Row: {
          id: string;
          knowledge_base_id: string;
          run_type: string;
          input: Record<string, any>;
          status: string;
          error: string | null;
          metadata: Record<string, any>;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          knowledge_base_id: string;
          run_type: string;
          input?: Record<string, any>;
          status?: string;
          error?: string | null;
          metadata?: Record<string, any>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          knowledge_base_id?: string;
          run_type?: string;
          input?: Record<string, any>;
          status?: string;
          error?: string | null;
          metadata?: Record<string, any>;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rag_run_outputs: {
        Row: {
          id: string;
          run_id: string;
          output_json: Record<string, any>;
          pdf_storage_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          output_json?: Record<string, any>;
          pdf_storage_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          output_json?: Record<string, any>;
          pdf_storage_path?: string | null;
          created_at?: string;
        };
      };
      rag_run_documents: {
        Row: {
          id: string;
          run_id: string;
          document_id: string;
          role: string | null;
          metadata: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          document_id: string;
          role?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          document_id?: string;
          role?: string | null;
          metadata?: Record<string, any>;
          created_at?: string;
        };
      };
      rag_knowledge_bases: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: string;
          is_active: boolean;
          metadata: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          visibility: string | null;
          owner_user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type?: string;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          visibility?: string | null;
          owner_user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: string;
          is_active?: boolean;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          visibility?: string | null;
          owner_user_id?: string | null;
        };
      };
      rag_documents: {
        Row: {
          id: string;
          knowledge_base_id: string;
          title: string | null;
          source_type: string;
          source_url: string | null;
          content: string;
          content_type: string | null;
          status: string;
          metadata: Json;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          knowledge_base_id: string;
          title?: string | null;
          source_type: string;
          source_url?: string | null;
          content: string;
          content_type?: string | null;
          status?: string;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          knowledge_base_id?: string;
          title?: string | null;
          source_type?: string;
          source_url?: string | null;
          content?: string;
          content_type?: string | null;
          status?: string;
          metadata?: Json;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          name: string;
          client_name: string;
          status: string;
          kb_id: string;
          description: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          client_name: string;
          status?: string;
          kb_id: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          client_name?: string;
          status?: string;
          kb_id?: string;
          description?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          archived_at?: string | null;
        };
      };
      project_documents: {
        Row: {
          id: string;
          project_id: string;
          document_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          document_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          document_id?: string;
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

