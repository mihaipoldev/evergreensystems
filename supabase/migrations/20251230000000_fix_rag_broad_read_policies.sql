-- =========================================================
-- Fix RLS Security: Remove Broad Authenticated Read Policies
-- =========================================================
-- This migration fixes security vulnerabilities where authenticated users
-- could read all private knowledge base data regardless of ownership.
--
-- Changes:
-- 1. Remove overly permissive "Authenticated admins can view all rag_documents" policy
-- 2. Replace broad authenticated read policies with KB ownership checks
-- 3. Ensure all authenticated reads respect KB visibility/ownership rules
-- =========================================================

-- =========================================================
-- 1) Fix rag_documents: Remove broad authenticated policy
-- =========================================================
-- The existing "rag_docs_select_via_kb" policy already handles access correctly
-- via KB ownership checks. The broad policy was added for Realtime but is too permissive.
DROP POLICY IF EXISTS "Authenticated admins can view all rag_documents" ON public.rag_documents;

-- =========================================================
-- 2) Fix rag_runs: Replace broad authenticated policy with KB ownership check
-- =========================================================
DROP POLICY IF EXISTS "rag_runs_select_authenticated" ON public.rag_runs;

-- Authenticated users can read runs if:
-- - Parent KB is public, OR
-- - Parent KB is private AND user is owner/creator
CREATE POLICY "rag_runs_select_authenticated"
ON public.rag_runs
FOR SELECT
TO authenticated
USING (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_runs.knowledge_base_id
      and (
        kb.visibility = 'public'
        or (
          kb.visibility = 'private'
          and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
        )
      )
  )
);

-- =========================================================
-- 3) Fix rag_run_outputs: Replace broad authenticated policy with KB ownership check
-- =========================================================
DROP POLICY IF EXISTS "rag_run_outputs_select_authenticated" ON public.rag_run_outputs;

-- Authenticated users can read outputs if:
-- - Parent run's KB is public, OR
-- - Parent run's KB is private AND user is owner/creator
CREATE POLICY "rag_run_outputs_select_authenticated"
ON public.rag_run_outputs
FOR SELECT
TO authenticated
USING (
  exists (
    select 1
    from public.rag_runs r
    join public.rag_knowledge_bases kb on kb.id = r.knowledge_base_id
    where r.id = rag_run_outputs.run_id
      and (
        kb.visibility = 'public'
        or (
          kb.visibility = 'private'
          and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
        )
      )
  )
);

-- =========================================================
-- 4) Fix rag_run_documents: Replace broad authenticated policy with KB ownership check
-- =========================================================
DROP POLICY IF EXISTS "rag_run_documents_select_authenticated" ON public.rag_run_documents;

-- Authenticated users can read run documents if:
-- - Parent run's KB is public, OR
-- - Parent run's KB is private AND user is owner/creator
CREATE POLICY "rag_run_documents_select_authenticated"
ON public.rag_run_documents
FOR SELECT
TO authenticated
USING (
  exists (
    select 1
    from public.rag_runs r
    join public.rag_knowledge_bases kb on kb.id = r.knowledge_base_id
    where r.id = rag_run_documents.run_id
      and (
        kb.visibility = 'public'
        or (
          kb.visibility = 'private'
          and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
        )
      )
  )
);

