-- Restructure analytics_events table to track user actions comprehensively
-- This migration drops the old table and creates a new structure with event types,
-- entity types, session tracking, and geographic data

-- ============================================================================
-- DROP EXISTING DEPENDENCIES
-- ============================================================================

-- Drop the trigger for updated_at (we're removing updated_at column)
DROP TRIGGER IF EXISTS update_analytics_events_updated_at ON public.analytics_events;

-- Drop existing indexes
DROP INDEX IF EXISTS idx_analytics_events_event_name;
DROP INDEX IF EXISTS idx_analytics_events_page;
DROP INDEX IF EXISTS idx_analytics_events_created_at;

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Authenticated users can view analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can update analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Authenticated users can delete analytics_events" ON public.analytics_events;
DROP POLICY IF EXISTS "Public can insert analytics_events" ON public.analytics_events;

-- Drop the old table
DROP TABLE IF EXISTS public.analytics_events;

-- ============================================================================
-- CREATE NEW TABLE STRUCTURE
-- ============================================================================

CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL CHECK (event_type IN ('page_view','link_click','section_view','session_start')),
  entity_type text NOT NULL CHECK (entity_type IN ('cta_button','site_section','page','testimonial','faq_item','media')),
  entity_id text NOT NULL,
  session_id text NULL,
  country text NULL,
  city text NULL,
  user_agent text NULL,
  referrer text NULL,
  metadata jsonb NULL
);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

-- Index on event_type for filtering by event type
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);

-- Index on entity_type and entity_id for entity lookups
CREATE INDEX idx_analytics_events_entity ON public.analytics_events(entity_type, entity_id);

-- Index on session_id for session analysis
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);

-- Index on created_at for time-based queries
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);

-- Composite index on event_type and created_at for common queries
CREATE INDEX idx_analytics_events_event_type_created_at ON public.analytics_events(event_type, created_at);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE RLS POLICIES
-- ============================================================================

-- Public can insert analytics events (anyone can track events)
CREATE POLICY "Public can insert analytics_events"
    ON public.analytics_events
    FOR INSERT
    WITH CHECK (true);

-- Authenticated users can view analytics_events (only authenticated users can view)
CREATE POLICY "Authenticated users can view analytics_events"
    ON public.analytics_events
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Authenticated users can update analytics_events (admin operations)
CREATE POLICY "Authenticated users can update analytics_events"
    ON public.analytics_events
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Authenticated users can delete analytics_events (admin operations)
CREATE POLICY "Authenticated users can delete analytics_events"
    ON public.analytics_events
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
