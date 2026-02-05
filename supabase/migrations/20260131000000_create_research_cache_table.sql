-- =========================================================
-- Create research_cache table
-- =========================================================
-- Caches Perplexity research responses during workflow execution.
-- Each entry stores results from a specific agent (e.g., "customer_intelligence",
-- "market_dynamics") for a given run, enabling deduplication and faster reruns.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.research_cache (
  id BIGSERIAL PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.rag_runs(id) ON DELETE CASCADE,
  agent_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  results TEXT NOT NULL,
  sources JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- Indexes
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_research_cache_run_id ON public.research_cache(run_id);
CREATE INDEX IF NOT EXISTS idx_research_cache_agent_name ON public.research_cache(agent_name);
CREATE INDEX IF NOT EXISTS idx_research_cache_created_at ON public.research_cache(created_at);

-- =========================================================
-- Enable Row Level Security
-- =========================================================
ALTER TABLE public.research_cache ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- RLS Policies
-- =========================================================
-- Following the pattern from rag_run_outputs: access is granted based on
-- the parent run's knowledge base visibility and ownership.

-- SELECT: Authenticated users can read cache entries if:
-- - Parent run's KB is public, OR
-- - Parent run's KB is private AND user is owner/creator
CREATE POLICY "research_cache_select_authenticated"
ON public.research_cache
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rag_runs r
    JOIN public.rag_knowledge_bases kb ON kb.id = r.knowledge_base_id
    WHERE r.id = research_cache.run_id
      AND (
        kb.visibility = 'public'
        OR (
          kb.visibility = 'private'
          AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
        )
      )
  )
);

-- INSERT: Authenticated users can insert cache entries if:
-- - Parent run's KB is public, OR
-- - Parent run's KB is private AND user is owner/creator
CREATE POLICY "research_cache_insert_authenticated"
ON public.research_cache
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rag_runs r
    JOIN public.rag_knowledge_bases kb ON kb.id = r.knowledge_base_id
    WHERE r.id = research_cache.run_id
      AND (
        kb.visibility = 'public'
        OR (
          kb.visibility = 'private'
          AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
        )
      )
  )
);

-- UPDATE: Authenticated users can update cache entries if:
-- - Parent run's KB is public, OR
-- - Parent run's KB is private AND user is owner/creator
CREATE POLICY "research_cache_update_authenticated"
ON public.research_cache
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rag_runs r
    JOIN public.rag_knowledge_bases kb ON kb.id = r.knowledge_base_id
    WHERE r.id = research_cache.run_id
      AND (
        kb.visibility = 'public'
        OR (
          kb.visibility = 'private'
          AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
        )
      )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.rag_runs r
    JOIN public.rag_knowledge_bases kb ON kb.id = r.knowledge_base_id
    WHERE r.id = research_cache.run_id
      AND (
        kb.visibility = 'public'
        OR (
          kb.visibility = 'private'
          AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
        )
      )
  )
);

-- DELETE: Authenticated users can delete cache entries if:
-- - Parent run's KB is public, OR
-- - Parent run's KB is private AND user is owner/creator
CREATE POLICY "research_cache_delete_authenticated"
ON public.research_cache
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.rag_runs r
    JOIN public.rag_knowledge_bases kb ON kb.id = r.knowledge_base_id
    WHERE r.id = research_cache.run_id
      AND (
        kb.visibility = 'public'
        OR (
          kb.visibility = 'private'
          AND (kb.owner_user_id = auth.uid() OR kb.created_by = auth.uid())
        )
      )
  )
);
