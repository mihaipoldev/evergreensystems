-- Update CTA buttons status from active/deactivated to published/draft/deactivated
-- Step 1: Drop the old CHECK constraint
ALTER TABLE public.cta_buttons DROP CONSTRAINT IF EXISTS cta_buttons_status_check;

-- Step 2: Update existing data
UPDATE public.cta_buttons 
SET status = CASE 
    WHEN status = 'active' THEN 'published'
    WHEN status = 'deactivated' THEN 'deactivated'
    ELSE 'draft'
END;

-- Step 3: Add new CHECK constraint for published/draft/deactivated
ALTER TABLE public.cta_buttons 
ADD CONSTRAINT cta_buttons_status_check 
CHECK (status IN ('published', 'draft', 'deactivated'));
