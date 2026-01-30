-- =========================================================
-- Workflows: rename name → slug, label → name
-- =========================================================
-- Current: name (identifier), label (display)
-- After: slug (identifier), name (display)
-- =========================================================

-- 1) Rename columns (order matters to avoid conflict)
ALTER TABLE public.workflows RENAME COLUMN name TO slug;
ALTER TABLE public.workflows RENAME COLUMN label TO name;

-- 2) Rename index for clarity (index still exists on the column now named slug)
ALTER INDEX idx_workflows_name RENAME TO idx_workflows_slug;
