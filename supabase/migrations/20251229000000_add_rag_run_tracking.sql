-- =========================================================
-- RAG Run Tracking Tables
-- =========================================================
-- Tracks runs that generate niche_intelligence outputs
-- and links documents created during those runs

-- =========================================================
-- 1) Runs (one record per user-triggered run)
-- =========================================================
create table if not exists public.rag_runs (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.rag_knowledge_bases(id) on delete cascade,
  run_type text not null,                -- 'niche_intelligence' | 'kb_query' | 'doc_ingest'
  input jsonb not null default '{}'::jsonb,  -- stores { niche_name, geo, notes } and other inputs
  status text not null default 'queued' check (status in ('queued','collecting','ingesting','generating','complete','failed')),
  error text,                             -- error summary if failed
  metadata jsonb not null default '{}'::jsonb,  -- stores used_knowledge_base_ids array and other metadata
  created_by uuid,                        -- optional (auth.uid())
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rag_runs_kb_created_at_idx
  on public.rag_runs (knowledge_base_id, created_at desc);

create index if not exists rag_runs_status_idx
  on public.rag_runs (status);

create index if not exists rag_runs_run_type_idx
  on public.rag_runs (run_type);

create index if not exists rag_runs_created_at_idx
  on public.rag_runs (created_at desc);

-- =========================================================
-- 2) Run Outputs (store outputs/artifacts for a run)
-- =========================================================
create table if not exists public.rag_run_outputs (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.rag_runs(id) on delete cascade,
  output_json jsonb not null default '{}'::jsonb,  -- full final niche_intelligence output schema
  pdf_storage_path text,                  -- bunny path for pdf report (optional)
  created_at timestamptz not null default now()
);

create unique index if not exists rag_run_outputs_run_id_uq
  on public.rag_run_outputs (run_id);

-- =========================================================
-- 3) Run Documents (link documents created by collector during run)
-- =========================================================
create table if not exists public.rag_run_documents (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.rag_runs(id) on delete cascade,
  document_id uuid not null references public.rag_documents(id) on delete cascade,
  role text,                              -- optional tag: 'directory' | 'ranked_list' | 'company_site' | 'job_post' | 'kpi_reference' | 'other'
  metadata jsonb not null default '{}'::jsonb,  -- optional extra info (e.g., original URL, scrape tool)
  created_at timestamptz not null default now(),
  unique(run_id, document_id)
);

create index if not exists rag_run_documents_run_created_at_idx
  on public.rag_run_documents (run_id, created_at desc);

create index if not exists rag_run_documents_document_id_idx
  on public.rag_run_documents (document_id);

create index if not exists rag_run_documents_role_idx
  on public.rag_run_documents (role);

-- =========================================================
-- updated_at trigger for rag_runs
-- =========================================================
-- Note: set_updated_at() function already exists from initial RAG migration
drop trigger if exists trg_rag_runs_updated_at on public.rag_runs;
create trigger trg_rag_runs_updated_at
before update on public.rag_runs
for each row execute function public.set_updated_at();

-- =========================================================
-- 4) RLS: enable on all RAG run tracking tables
-- =========================================================
alter table public.rag_runs enable row level security;
alter table public.rag_run_outputs enable row level security;
alter table public.rag_run_documents enable row level security;

-- =========================================================
-- 5) RLS Policies
-- Rules:
-- - Runs select:
--    * anonymous => only if parent KB is public
--    * authenticated => can read all runs
-- - Runs write: only authenticated owner/creator of parent KB
-- - Outputs/Documents select: readable if their parent run is readable
-- - Outputs/Documents write: only authenticated owner/creator of parent KB (via run)
-- =========================================================

-- ---- Runs: SELECT
-- Anonymous: only if parent KB is public
drop policy if exists "rag_runs_select_public_kb" on public.rag_runs;
create policy "rag_runs_select_public_kb"
on public.rag_runs
for select
to anon
using (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_runs.knowledge_base_id
      and kb.visibility = 'public'
  )
);

-- Authenticated: can read all runs
drop policy if exists "rag_runs_select_authenticated" on public.rag_runs;
create policy "rag_runs_select_authenticated"
on public.rag_runs
for select
to authenticated
using (auth.uid() is not null);

-- ---- Runs: WRITE (insert/update/delete) - owner/creator of parent KB only
drop policy if exists "rag_runs_write_via_kb" on public.rag_runs;
create policy "rag_runs_write_via_kb"
on public.rag_runs
for all
to authenticated
using (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_runs.knowledge_base_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_runs.knowledge_base_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
);

-- ---- Run Outputs: SELECT via parent run access
-- Anonymous: only if parent run's KB is public
drop policy if exists "rag_run_outputs_select_public_kb" on public.rag_run_outputs;
create policy "rag_run_outputs_select_public_kb"
on public.rag_run_outputs
for select
to anon
using (
  exists (
    select 1
    from public.rag_runs r
    join public.rag_knowledge_bases kb on kb.id = r.knowledge_base_id
    where r.id = rag_run_outputs.run_id
      and kb.visibility = 'public'
  )
);

-- Authenticated: can read all outputs (since they can read all runs)
drop policy if exists "rag_run_outputs_select_authenticated" on public.rag_run_outputs;
create policy "rag_run_outputs_select_authenticated"
on public.rag_run_outputs
for select
to authenticated
using (auth.uid() is not null);

-- Run Outputs: WRITE via parent run KB ownership (authenticated only)
drop policy if exists "rag_run_outputs_write_via_run" on public.rag_run_outputs;
create policy "rag_run_outputs_write_via_run"
on public.rag_run_outputs
for all
to authenticated
using (
  exists (
    select 1
    from public.rag_runs r
    join public.rag_knowledge_bases kb on kb.id = r.knowledge_base_id
    where r.id = rag_run_outputs.run_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.rag_runs r
    join public.rag_knowledge_bases kb on kb.id = r.knowledge_base_id
    where r.id = rag_run_outputs.run_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
);

-- ---- Run Documents: SELECT via parent run access
-- Anonymous: only if parent run's KB is public
drop policy if exists "rag_run_documents_select_public_kb" on public.rag_run_documents;
create policy "rag_run_documents_select_public_kb"
on public.rag_run_documents
for select
to anon
using (
  exists (
    select 1
    from public.rag_runs r
    join public.rag_knowledge_bases kb on kb.id = r.knowledge_base_id
    where r.id = rag_run_documents.run_id
      and kb.visibility = 'public'
  )
);

-- Authenticated: can read all run documents (since they can read all runs)
drop policy if exists "rag_run_documents_select_authenticated" on public.rag_run_documents;
create policy "rag_run_documents_select_authenticated"
on public.rag_run_documents
for select
to authenticated
using (auth.uid() is not null);

-- Run Documents: WRITE via parent run KB ownership (authenticated only)
drop policy if exists "rag_run_documents_write_via_run" on public.rag_run_documents;
create policy "rag_run_documents_write_via_run"
on public.rag_run_documents
for all
to authenticated
using (
  exists (
    select 1
    from public.rag_runs r
    join public.rag_knowledge_bases kb on kb.id = r.knowledge_base_id
    where r.id = rag_run_documents.run_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.rag_runs r
    join public.rag_knowledge_bases kb on kb.id = r.knowledge_base_id
    where r.id = rag_run_documents.run_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
);

