-- =========================================================
-- Migrate workflow_subject_types.subject_type to Foreign Key
-- =========================================================
-- This migration replaces the TEXT `subject_type` column with a UUID
-- foreign key `subject_type_id` that references `subject_types.id`
-- This creates a proper referential integrity connection
-- =========================================================

-- =========================================================
-- 1) Add subject_type_id column (nullable initially)
-- =========================================================
ALTER TABLE public.workflow_subject_types
  ADD COLUMN IF NOT EXISTS subject_type_id UUID REFERENCES public.subject_types(id) ON DELETE CASCADE;

-- =========================================================
-- 2) Migrate existing data: match TEXT subject_type to subject_types.name
-- =========================================================
UPDATE public.workflow_subject_types wst
SET subject_type_id = st.id
FROM public.subject_types st
WHERE wst.subject_type = st.name
  AND wst.subject_type_id IS NULL;

-- =========================================================
-- 3) Drop old index on subject_type
-- =========================================================
DROP INDEX IF EXISTS idx_workflow_subject_type_order;

-- =========================================================
-- 4) Create new index on subject_type_id
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_workflow_subject_type_id_order 
  ON public.workflow_subject_types(subject_type_id, display_order);

-- =========================================================
-- 5) Update unique constraint to use subject_type_id
-- =========================================================
-- Drop old unique constraint
ALTER TABLE public.workflow_subject_types
  DROP CONSTRAINT IF EXISTS workflow_subject_types_workflow_id_subject_type_key;

-- Drop new unique constraint if it already exists (in case migration was partially run)
ALTER TABLE public.workflow_subject_types
  DROP CONSTRAINT IF EXISTS workflow_subject_types_workflow_id_subject_type_id_key;

-- Add new unique constraint
ALTER TABLE public.workflow_subject_types
  ADD CONSTRAINT workflow_subject_types_workflow_id_subject_type_id_key 
  UNIQUE(workflow_id, subject_type_id);

-- =========================================================
-- 6) Drop the old TEXT subject_type column
-- =========================================================
ALTER TABLE public.workflow_subject_types
  DROP COLUMN IF EXISTS subject_type;

-- =========================================================
-- 7) Set subject_type_id to NOT NULL after migration
-- =========================================================
ALTER TABLE public.workflow_subject_types
  ALTER COLUMN subject_type_id SET NOT NULL;

