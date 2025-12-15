-- Add status field to page_sections junction table
-- Status can be 'published', 'draft', or 'deactivated', default is 'draft'
-- This allows each page-section relationship to independently control visibility

ALTER TABLE public.page_sections 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Update existing rows to have 'published' status (since they were visible)
UPDATE public.page_sections 
SET status = 'published' 
WHERE status IS NULL OR status NOT IN ('published', 'draft', 'deactivated');

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_page_sections_status ON public.page_sections(page_id, status);
