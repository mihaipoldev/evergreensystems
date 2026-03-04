-- Add performance indexes for sidebar queries
-- These indexes will significantly speed up the pages and sections queries used in the admin sidebar

-- Composite index for pages query ordering (order by "order", then created_at)
-- This matches the query: ORDER BY "order" ASC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_pages_order_created_at 
ON public.pages("order" ASC, created_at DESC);

-- Index on created_at for secondary sorting (if composite doesn't help enough)
CREATE INDEX IF NOT EXISTS idx_pages_created_at 
ON public.pages(created_at DESC);

-- Index on page_sections.page_id for fast joins
-- This is critical for the sections query that joins page_sections with sections
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id 
ON public.page_sections(page_id);

-- Composite index for page_sections ordering (page_id + position)
-- This optimizes: WHERE page_id = X ORDER BY position ASC
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id_position 
ON public.page_sections(page_id, position ASC);

-- Index on sections.id for faster joins (though primary key should already be indexed)
-- This ensures the join from page_sections to sections is fast
CREATE INDEX IF NOT EXISTS idx_sections_id 
ON public.sections(id);

-- Index on sections.type for filtering (if needed)
CREATE INDEX IF NOT EXISTS idx_sections_type 
ON public.sections(type);

-- Index on pages.status for filtering (if search includes status)
CREATE INDEX IF NOT EXISTS idx_pages_status 
ON public.pages(status);

-- Indexes for site_structure queries (used in sidebar)
-- These optimize the site-structure API queries
CREATE INDEX IF NOT EXISTS idx_site_structure_production_page_id 
ON public.site_structure(production_page_id);

CREATE INDEX IF NOT EXISTS idx_site_structure_development_page_id 
ON public.site_structure(development_page_id);

