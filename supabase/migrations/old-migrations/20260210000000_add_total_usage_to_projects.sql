-- ============================================================================
-- Add total_usage column to projects and auto-accumulate from run outputs
-- ============================================================================
-- total_usage stores the cumulative cost (in USD) of all runs for a project.
-- A DB trigger on rag_run_outputs keeps it in sync automatically so that
-- deleting a run never reduces the recorded total.
-- ============================================================================

-- 1) Add the column
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS total_usage NUMERIC NOT NULL DEFAULT 0;

-- ============================================================================
-- 2) Helper: extract cost from an output_json JSONB value
-- ============================================================================
CREATE OR REPLACE FUNCTION public.extract_run_output_cost(output JSONB)
RETURNS NUMERIC
LANGUAGE sql IMMUTABLE AS $$
  SELECT COALESCE(
    -- primary path: meta.usage_metrics.costs.total
    (output -> 'meta' -> 'usage_metrics' -> 'costs' ->> 'total')::numeric,
    -- fallback: meta.usage_metrics.per_evaluation.total_cost
    (output -> 'meta' -> 'usage_metrics' -> 'per_evaluation' ->> 'total_cost')::numeric,
    0
  );
$$;

-- ============================================================================
-- 3) Trigger function: accumulate cost delta into projects.total_usage
-- ============================================================================
CREATE OR REPLACE FUNCTION public.trg_accumulate_project_usage()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
  v_project_id UUID;
  v_old_cost   NUMERIC := 0;
  v_new_cost   NUMERIC := 0;
  v_delta      NUMERIC;
BEGIN
  -- Resolve the project_id through rag_runs
  SELECT r.project_id INTO v_project_id
    FROM public.rag_runs r
   WHERE r.id = NEW.run_id;

  -- If the run has no project, nothing to do
  IF v_project_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate cost delta
  v_new_cost := public.extract_run_output_cost(NEW.output_json);

  IF TG_OP = 'UPDATE' THEN
    v_old_cost := public.extract_run_output_cost(OLD.output_json);
  END IF;

  v_delta := v_new_cost - v_old_cost;

  -- Only update if there is a positive delta (never subtract)
  IF v_delta > 0 THEN
    UPDATE public.projects
       SET total_usage = total_usage + v_delta
     WHERE id = v_project_id;
  END IF;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- 4) Attach trigger on INSERT and UPDATE of rag_run_outputs
-- ============================================================================
DROP TRIGGER IF EXISTS trg_rag_run_outputs_accumulate_usage ON public.rag_run_outputs;
CREATE TRIGGER trg_rag_run_outputs_accumulate_usage
  AFTER INSERT OR UPDATE OF output_json
  ON public.rag_run_outputs
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_accumulate_project_usage();

-- ============================================================================
-- 5) Backfill: set total_usage for all existing projects from their runs
-- ============================================================================
UPDATE public.projects p
   SET total_usage = sub.total_cost
  FROM (
    SELECT r.project_id,
           SUM(public.extract_run_output_cost(o.output_json)) AS total_cost
      FROM public.rag_runs r
      JOIN public.rag_run_outputs o ON o.run_id = r.id
     WHERE r.project_id IS NOT NULL
     GROUP BY r.project_id
  ) sub
WHERE p.id = sub.project_id
  AND sub.total_cost > 0;
