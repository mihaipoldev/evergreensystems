-- =========================================================
-- RAG v2 continuation migration (run AFTER your initial one)
-- Adds: visibility + owner_user_id, notion_page_id + drive_file_id
-- Adds: rag_document_sections (optional but recommended)
-- Adds: RLS + policies for public vs private KBs
-- =========================================================

-- ---------------------------------------------------------
-- 1) Knowledge Bases: add visibility + owner_user_id
-- ---------------------------------------------------------
alter table public.rag_knowledge_bases
  add column if not exists visibility text not null default 'private',
  add column if not exists owner_user_id uuid;

-- Ensure only allowed visibility values
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'rag_knowledge_bases_visibility_chk'
  ) then
    alter table public.rag_knowledge_bases
      add constraint rag_knowledge_bases_visibility_chk
      check (visibility in ('public','private'));
  end if;
end $$;

create index if not exists rag_knowledge_bases_owner_idx
  on public.rag_knowledge_bases (owner_user_id);

create index if not exists rag_knowledge_bases_visibility_idx
  on public.rag_knowledge_bases (visibility);

-- ---------------------------------------------------------
-- 2) Documents: add Notion + Drive IDs (source-of-truth fields)
-- ---------------------------------------------------------
alter table public.rag_documents
  add column if not exists notion_page_id text,
  add column if not exists drive_file_id text;

-- Helpful indexes
create index if not exists rag_documents_notion_page_id_idx
  on public.rag_documents (notion_page_id);

create index if not exists rag_documents_drive_file_id_idx
  on public.rag_documents (drive_file_id);

-- Prevent duplicates inside the same KB (partial uniques)
create unique index if not exists rag_documents_kb_notion_page_id_uq
  on public.rag_documents (knowledge_base_id, notion_page_id)
  where notion_page_id is not null;

create unique index if not exists rag_documents_kb_drive_file_id_uq
  on public.rag_documents (knowledge_base_id, drive_file_id)
  where drive_file_id is not null;

-- ---------------------------------------------------------
-- 3) Optional: Document Sections (structured extraction layer)
-- ---------------------------------------------------------
create table if not exists public.rag_document_sections (
  id uuid primary key default gen_random_uuid(),
  knowledge_base_id uuid not null references public.rag_knowledge_bases(id) on delete cascade,
  document_id uuid not null references public.rag_documents(id) on delete cascade,

  section_index int not null,
  title text,
  content text not null,
  content_hash text not null,

  token_count int,
  char_start int,
  char_end int,

  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists rag_document_sections_doc_section_index_uq
  on public.rag_document_sections (document_id, section_index);

create index if not exists rag_document_sections_kb_doc_idx
  on public.rag_document_sections (knowledge_base_id, document_id);

-- ---------------------------------------------------------
-- 4) RLS: enable on all RAG tables
-- ---------------------------------------------------------
alter table public.rag_knowledge_bases enable row level security;
alter table public.rag_documents enable row level security;
alter table public.rag_chunks enable row level security;
alter table public.rag_document_sections enable row level security;

-- ---------------------------------------------------------
-- 5) RLS Policies
-- Rules:
-- - KB select:
--    * public => everyone can read
--    * private => only owner_user_id or created_by can read
-- - Docs/Chunks/Sections select: readable if their KB is readable
-- - Writes: only authenticated owner/creator can write (service_role bypasses anyway)
-- ---------------------------------------------------------

-- ---- KB: SELECT
drop policy if exists "rag_kb_select_public" on public.rag_knowledge_bases;
create policy "rag_kb_select_public"
on public.rag_knowledge_bases
for select
to anon, authenticated
using (visibility = 'public');

drop policy if exists "rag_kb_select_private_owner" on public.rag_knowledge_bases;
create policy "rag_kb_select_private_owner"
on public.rag_knowledge_bases
for select
to authenticated
using (
  visibility = 'private'
  and (
    owner_user_id = auth.uid()
    or created_by = auth.uid()
  )
);

-- ---- KB: WRITE (insert/update/delete) - owner/creator only
drop policy if exists "rag_kb_insert_owner" on public.rag_knowledge_bases;
create policy "rag_kb_insert_owner"
on public.rag_knowledge_bases
for insert
to authenticated
with check (
  created_by = auth.uid()
  or owner_user_id = auth.uid()
);

drop policy if exists "rag_kb_update_owner" on public.rag_knowledge_bases;
create policy "rag_kb_update_owner"
on public.rag_knowledge_bases
for update
to authenticated
using (
  owner_user_id = auth.uid()
  or created_by = auth.uid()
)
with check (
  owner_user_id = auth.uid()
  or created_by = auth.uid()
);

drop policy if exists "rag_kb_delete_owner" on public.rag_knowledge_bases;
create policy "rag_kb_delete_owner"
on public.rag_knowledge_bases
for delete
to authenticated
using (
  owner_user_id = auth.uid()
  or created_by = auth.uid()
);

-- ---- Documents: SELECT via KB visibility/ownership
drop policy if exists "rag_docs_select_via_kb" on public.rag_documents;
create policy "rag_docs_select_via_kb"
on public.rag_documents
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_documents.knowledge_base_id
      and (
        kb.visibility = 'public'
        or (
          kb.visibility = 'private'
          and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
        )
      )
  )
);

-- Documents: WRITE via KB ownership (authenticated only)
drop policy if exists "rag_docs_write_via_kb" on public.rag_documents;
create policy "rag_docs_write_via_kb"
on public.rag_documents
for all
to authenticated
using (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_documents.knowledge_base_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_documents.knowledge_base_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
);

-- ---- Chunks: SELECT via KB visibility/ownership
drop policy if exists "rag_chunks_select_via_kb" on public.rag_chunks;
create policy "rag_chunks_select_via_kb"
on public.rag_chunks
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_chunks.knowledge_base_id
      and (
        kb.visibility = 'public'
        or (
          kb.visibility = 'private'
          and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
        )
      )
  )
);

-- Chunks: WRITE via KB ownership (authenticated only)
drop policy if exists "rag_chunks_write_via_kb" on public.rag_chunks;
create policy "rag_chunks_write_via_kb"
on public.rag_chunks
for all
to authenticated
using (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_chunks.knowledge_base_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_chunks.knowledge_base_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
);

-- ---- Sections: SELECT via KB visibility/ownership
drop policy if exists "rag_sections_select_via_kb" on public.rag_document_sections;
create policy "rag_sections_select_via_kb"
on public.rag_document_sections
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_document_sections.knowledge_base_id
      and (
        kb.visibility = 'public'
        or (
          kb.visibility = 'private'
          and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
        )
      )
  )
);

-- Sections: WRITE via KB ownership (authenticated only)
drop policy if exists "rag_sections_write_via_kb" on public.rag_document_sections;
create policy "rag_sections_write_via_kb"
on public.rag_document_sections
for all
to authenticated
using (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_document_sections.knowledge_base_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.rag_knowledge_bases kb
    where kb.id = rag_document_sections.knowledge_base_id
      and (kb.owner_user_id = auth.uid() or kb.created_by = auth.uid())
  )
);

