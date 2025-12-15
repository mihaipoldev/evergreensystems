-- Move status from testimonials base table to section_testimonials junction table
-- Add status to section_timeline and section_media junction tables

-- ============================================================================
-- 1. Add status to section_testimonials junction table
-- ============================================================================

-- Add status column with default 'draft'
ALTER TABLE public.section_testimonials 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Migrate existing data: Copy status from testimonials.status to section_testimonials.status
-- For existing rows, set to 'published' if testimonial was published, otherwise 'draft'
UPDATE public.section_testimonials st
SET status = COALESCE(
    (SELECT t.status FROM public.testimonials t WHERE t.id = st.testimonial_id),
    'published'
)
WHERE st.status = 'draft' OR st.status IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_section_testimonials_status 
ON public.section_testimonials(section_id, status);

-- ============================================================================
-- 2. Remove status from testimonials base table
-- ============================================================================

-- Drop RLS policy that depends on status column
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;

-- Drop CHECK constraint
ALTER TABLE public.testimonials DROP CONSTRAINT IF EXISTS testimonials_status_check;

-- Drop index
DROP INDEX IF EXISTS idx_testimonials_status;

-- Drop status column
ALTER TABLE public.testimonials DROP COLUMN IF EXISTS status;

-- ============================================================================
-- 3. Add status to section_timeline junction table
-- ============================================================================

-- Add status column with default 'draft'
ALTER TABLE public.section_timeline 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Set existing rows to 'published' status
UPDATE public.section_timeline 
SET status = 'published'
WHERE status = 'draft' OR status IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_section_timeline_status 
ON public.section_timeline(section_id, status);

-- ============================================================================
-- 4. Add status to section_media junction table
-- ============================================================================

-- Add status column with default 'draft'
ALTER TABLE public.section_media 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Set existing rows to 'published' status
UPDATE public.section_media 
SET status = 'published'
WHERE status = 'draft' OR status IS NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_section_media_status 
ON public.section_media(section_id, status);

-- ============================================================================
-- 5. Update RLS policies for public view
-- ============================================================================

-- Update section_testimonials public view policy to filter by status
-- Note: Application-level filtering will handle environment-based logic
DROP POLICY IF EXISTS "Public can view section_testimonials" ON public.section_testimonials;
CREATE POLICY "Public can view section_testimonials"
    ON public.section_testimonials
    FOR SELECT
    USING (true); -- Application will filter by status based on environment

-- Update section_timeline public view policy (if it exists)
DROP POLICY IF EXISTS "Public can view section_timeline" ON public.section_timeline;
CREATE POLICY "Public can view section_timeline"
    ON public.section_timeline
    FOR SELECT
    USING (true); -- Application will filter by status based on environment

-- Update section_media public view policy (if it exists)
DROP POLICY IF EXISTS "Public can view section_media" ON public.section_media;
CREATE POLICY "Public can view section_media"
    ON public.section_media
    FOR SELECT
    USING (true); -- Application will filter by status based on environment
