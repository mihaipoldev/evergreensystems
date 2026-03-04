-- Add order field to pages table for custom ordering
ALTER TABLE public.pages 
ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0;

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_pages_order ON public.pages("order");

-- Set initial order values based on created_at (newest first gets lower order numbers)
-- This ensures existing pages have a sensible default order
UPDATE public.pages
SET "order" = subquery.row_number - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_number
  FROM public.pages
) AS subquery
WHERE public.pages.id = subquery.id;
