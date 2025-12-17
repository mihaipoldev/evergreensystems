-- Remove step column from timeline table
-- Step numbers will now be derived from section_timeline.position + 1

ALTER TABLE public.timeline DROP COLUMN IF EXISTS step;
