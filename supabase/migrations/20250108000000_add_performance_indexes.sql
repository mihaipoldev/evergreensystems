-- Add composite indexes for optimized admin queries
-- These indexes will significantly improve query performance for list views and filtered queries

-- ============================================================================
-- PAGES TABLE INDEXES
-- ============================================================================

-- Composite index for pages list views (ordered by created_at DESC)
CREATE INDEX IF NOT EXISTS idx_pages_created_at_desc 
ON public.pages(created_at DESC);

-- Composite index for pages search (title and slug)
CREATE INDEX IF NOT EXISTS idx_pages_title_slug_search 
ON public.pages(title, slug);

-- ============================================================================
-- SECTIONS TABLE INDEXES
-- ============================================================================

-- Composite index for sections list views (ordered by created_at DESC)
CREATE INDEX IF NOT EXISTS idx_sections_created_at_desc 
ON public.sections(created_at DESC);

-- ============================================================================
-- MEDIA TABLE INDEXES
-- ============================================================================

-- Composite index for media list views with filters (created_at DESC, type, source_type)
CREATE INDEX IF NOT EXISTS idx_media_created_at_type_source 
ON public.media(created_at DESC, type, source_type);

-- Composite index for media search (name and url)
CREATE INDEX IF NOT EXISTS idx_media_name_url_search 
ON public.media(name, url);

-- ============================================================================
-- TESTIMONIALS TABLE INDEXES
-- ============================================================================

-- Composite index for testimonials filtered by approved and ordered by position and created_at
CREATE INDEX IF NOT EXISTS idx_testimonials_approved_position_created 
ON public.testimonials(approved, position, created_at DESC);

-- Composite index for testimonials search (author_name and quote)
CREATE INDEX IF NOT EXISTS idx_testimonials_author_quote_search 
ON public.testimonials(author_name, quote);

-- ============================================================================
-- FAQ_ITEMS TABLE INDEXES
-- ============================================================================

-- Composite index for FAQ items ordered by position and created_at
CREATE INDEX IF NOT EXISTS idx_faq_items_position_created 
ON public.faq_items(position, created_at DESC);

-- ============================================================================
-- PAGE_SECTIONS TABLE INDEXES
-- ============================================================================

-- Composite index for page sections queries (page_id and position)
-- Note: idx_page_sections_position already exists, but we need composite for page_id + position
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id_position 
ON public.page_sections(page_id, position);

-- ============================================================================
-- SECTION_MEDIA TABLE INDEXES
-- ============================================================================

-- Composite index for section media queries (section_id and sort_order)
-- Note: idx_section_media_sort_order already exists with (section_id, sort_order)
-- This is already covered, but we'll keep it for clarity

-- ============================================================================
-- SECTION_CTA_BUTTONS TABLE INDEXES
-- ============================================================================

-- Composite index for section CTA buttons queries (section_id and position)
-- Note: idx_section_cta_buttons_position already exists with (section_id, position)
-- This is already covered, but we'll keep it for clarity

-- ============================================================================
-- CTA_BUTTONS TABLE INDEXES
-- ============================================================================

-- Composite index for CTA buttons list views (status and created_at)
CREATE INDEX IF NOT EXISTS idx_cta_buttons_status_created 
ON public.cta_buttons(status, created_at DESC);

-- ============================================================================
-- TEXT SEARCH INDEXES (GIN indexes for full-text search)
-- ============================================================================

-- Note: For advanced text search, we could add GIN indexes with pg_trgm extension
-- For now, we'll use the composite indexes above for basic search patterns
-- If full-text search is needed later, we can add:
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX idx_pages_title_trgm ON public.pages USING gin(title gin_trgm_ops);
-- CREATE INDEX idx_testimonials_quote_trgm ON public.testimonials USING gin(quote gin_trgm_ops);
