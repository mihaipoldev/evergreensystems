-- Add status field to pages table
-- Status can be 'published', 'draft', or 'deactivated', default is 'draft'

ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft' 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Update existing rows to have 'draft' status (in case any exist)
UPDATE public.pages 
SET status = 'draft' 
WHERE status IS NULL OR status NOT IN ('published', 'draft', 'deactivated');

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_pages_status ON public.pages(status);
