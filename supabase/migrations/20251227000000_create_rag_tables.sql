-- Enable extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- =========================================================
-- 1) Knowledge Bases
-- =========================================================
create table if not exists public.rag_knowledge_bases (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  -- optional: support | internal | workflow | etc
  kb_type text,
  -- optional: for future multi-tenant / RLS
  created_by uuid,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists rag_knowledge_bases_name_uq
  on public.rag_knowledge_bases (name);

-- =========================================================
-- 2) Documents (one row per file/page you ingest)
-- =========================================================
create table if not exists public.rag_documents (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.rag_knowledge_bases(id) on delete cascade,

  title text,
  source_type text not null,         -- 'notion' | 'gdrive' | 'upload' | 'url'
  external_id text,                  -- notion page id or drive file id, etc
  source_url text,                   -- share link / drive webViewLink / url

  -- what you extracted & embedded
  content text not null,
  content_type text,                 -- 'text/markdown', 'text/plain', etc
  content_hash text not null,         -- sha256 of content

  -- bookkeeping
  status text not null default 'ready',  -- 'ready' | 'processing' | 'failed'
  chunk_count int not null default 0,
  embedding_count int not null default 0,

  metadata jsonb not null default '{}'::jsonb,
  created_by uuid,                     -- optional (auth.uid())
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rag_documents_kb_idx
  on public.rag_documents (knowledge_base_id);

create index if not exists rag_documents_external_id_idx
  on public.rag_documents (external_id);

create unique index if not exists rag_documents_kb_content_hash_uq
  on public.rag_documents (knowledge_base_id, content_hash);

-- =========================================================
-- 3) Chunks (what you actually vector search over)
--    NOTE: set vector dimension to your embedding model dimension.
--    1536 is common, but adjust to your model.
-- =========================================================
create table if not exists public.rag_chunks (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.rag_knowledge_bases(id) on delete cascade,
  document_id uuid not null references public.rag_documents(id) on delete cascade,

  chunk_index int not null,
  content text not null,
  content_hash text not null,          -- sha256 of chunk content

  token_count int,
  char_start int,
  char_end int,

  embedding vector(1536),              -- CHANGE DIM if your model differs
  embedding_model text not null,       -- e.g. 'text-embedding-3-small'
  embedding_model_version text,        -- optional
  pipeline_version text,               -- your chunker/ingest version label

  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists rag_chunks_doc_chunk_index_uq
  on public.rag_chunks (document_id, chunk_index);

create index if not exists rag_chunks_kb_doc_idx
  on public.rag_chunks (knowledge_base_id, document_id);

-- Vector index (choose one)
-- Option A: ivfflat (classic)
create index if not exists rag_chunks_embedding_ivfflat
  on public.rag_chunks using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Option B: HNSW (if available in your Supabase setup)
-- create index if not exists rag_chunks_embedding_hnsw
--   on public.rag_chunks using hnsw (embedding vector_cosine_ops);

-- =========================================================
-- updated_at trigger helper
-- =========================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_rag_kb_updated_at on public.rag_knowledge_bases;
create trigger trg_rag_kb_updated_at
before update on public.rag_knowledge_bases
for each row execute function public.set_updated_at();

drop trigger if exists trg_rag_docs_updated_at on public.rag_documents;
create trigger trg_rag_docs_updated_at
before update on public.rag_documents
for each row execute function public.set_updated_at();
