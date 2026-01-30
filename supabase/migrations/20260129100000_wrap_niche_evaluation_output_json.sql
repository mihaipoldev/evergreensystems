-- =========================================================
-- Wrap legacy niche_fit_evaluation output_json in { meta, data }
-- and backfill rag_runs.metadata.evaluation_result
-- =========================================================
-- Scope: Only niche_fit_evaluation workflow runs whose output_json
-- does NOT already have top-level meta and data (or first element for arrays).
-- Other workflows and report types are not modified.
-- =========================================================

-- Step 1: Wrap rag_run_outputs.output_json for legacy niche evaluation rows
UPDATE public.rag_run_outputs ro
SET output_json = (
  WITH payload AS (
    SELECT CASE
      WHEN jsonb_typeof(ro.output_json) = 'array' AND jsonb_array_length(ro.output_json) > 0
        THEN ro.output_json->0
      ELSE ro.output_json
    END AS p
  ),
  meta_obj AS (
    SELECT jsonb_build_object(
      'knowledge_base', 'niche_fit_evaluation',
      'mode', 'niche_fit_evaluation',
      'confidence', 0,
      'generated_at', COALESCE(
        nullif(trim(left((SELECT p FROM payload)->>'evaluation_timestamp', 10)), ''),
        to_char(current_date, 'YYYY-MM-DD')
      ),
      'sources_used', '[]'::jsonb,
      'input', jsonb_build_object(
        'niche_name', COALESCE((SELECT p FROM payload)->>'niche_name', ''),
        'geo', ''
      )
    ) AS m
  ),
  eval_payload AS (
    SELECT CASE
      WHEN jsonb_typeof(ro.output_json) = 'array' AND jsonb_array_length(ro.output_json) > 0
        THEN ro.output_json->0
      ELSE ro.output_json
    END AS ep
  )
  SELECT jsonb_build_object(
    'meta', (SELECT m FROM meta_obj),
    'data', (SELECT ep FROM eval_payload)
  )
)
FROM public.rag_runs r
JOIN public.workflows w ON w.id = r.workflow_id
WHERE ro.run_id = r.id
  AND w.slug = 'niche_fit_evaluation'
  AND (
    -- Object without both meta and data
    (jsonb_typeof(ro.output_json) = 'object'
     AND (ro.output_json->'meta' IS NULL OR ro.output_json->'data' IS NULL))
    OR
    -- Array with first element missing meta or data (or empty array)
    (jsonb_typeof(ro.output_json) = 'array'
     AND (
       jsonb_array_length(ro.output_json) = 0
       OR (ro.output_json->0->'meta' IS NULL OR ro.output_json->0->'data' IS NULL)
     ))
  );

-- Step 2: Backfill rag_runs.metadata.evaluation_result from migrated output
-- Only for niche_fit_evaluation runs where metadata.evaluation_result is null
-- Use a subquery (one output per run_id) and filter workflow in WHERE (not JOIN)
UPDATE public.rag_runs r
SET metadata = r.metadata || jsonb_build_object(
  'evaluation_result',
  jsonb_build_object(
    'verdict', lower(COALESCE(ro.output_json->'data'->'verdict'->>'label', '')),
    'score', COALESCE((ro.output_json->'data'->'verdict'->'score')::numeric, 0)
  )
)
FROM (
  SELECT DISTINCT ON (run_id) run_id, output_json
  FROM public.rag_run_outputs
  ORDER BY run_id, created_at DESC
) ro
WHERE r.id = ro.run_id
  AND r.workflow_id IN (SELECT id FROM public.workflows WHERE slug = 'niche_fit_evaluation')
  AND (r.metadata->'evaluation_result' IS NULL OR r.metadata->'evaluation_result' = 'null'::jsonb)
  AND ro.output_json->'data'->'verdict' IS NOT NULL;
