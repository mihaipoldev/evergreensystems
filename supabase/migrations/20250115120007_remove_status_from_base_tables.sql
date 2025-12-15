-- Remove status from offer_features and faq_items base tables
-- Status is now managed at the junction table level (section_features, section_faq_items)

-- Step 1: Remove status from offer_features table
-- Drop RLS policy that depends on status
DROP POLICY IF EXISTS "Public can view active offer_features" ON public.offer_features;

-- Drop CHECK constraint
ALTER TABLE public.offer_features DROP CONSTRAINT IF EXISTS offer_features_status_check;

-- Drop index on status
DROP INDEX IF EXISTS public.idx_offer_features_status;

-- Drop the status column
ALTER TABLE public.offer_features DROP COLUMN IF EXISTS status;

-- Step 2: Remove status from faq_items table
-- Drop RLS policy that depends on status
DROP POLICY IF EXISTS "Public can view active faq_items" ON public.faq_items;

-- Drop CHECK constraint
ALTER TABLE public.faq_items DROP CONSTRAINT IF EXISTS faq_items_status_check;

-- Drop index on status
DROP INDEX IF EXISTS public.idx_faq_items_status;

-- Drop the status column
ALTER TABLE public.faq_items DROP COLUMN IF EXISTS status;
