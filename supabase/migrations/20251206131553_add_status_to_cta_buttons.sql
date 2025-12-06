-- Add status field to cta_buttons table
-- Status can be 'active' or 'deactivated', default is 'active'

ALTER TABLE public.cta_buttons 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' 
CHECK (status IN ('active', 'deactivated'));

-- Update existing rows to have 'active' status (in case any exist)
UPDATE public.cta_buttons 
SET status = 'active' 
WHERE status IS NULL OR status NOT IN ('active', 'deactivated');

-- Create index on status for better query performance
CREATE INDEX IF NOT EXISTS idx_cta_buttons_status ON public.cta_buttons(status);
