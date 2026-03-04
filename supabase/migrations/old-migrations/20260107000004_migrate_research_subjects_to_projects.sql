-- =========================================================
-- Migrate Research Subjects to Projects
-- =========================================================
-- This migration migrates all research_subjects to projects,
-- creates workspace KBs for each migrated project, and creates
-- a mapping table for tracking the migration.
-- This is Phase 2.1 of consolidating research_subjects into projects
-- =========================================================

-- =========================================================
-- 1) Create temporary mapping table
-- =========================================================
CREATE TABLE IF NOT EXISTS public.research_subject_to_project_mapping (
  research_subject_id UUID NOT NULL PRIMARY KEY REFERENCES public.research_subjects(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_subject_mapping_project_id 
  ON public.research_subject_to_project_mapping(project_id);

-- =========================================================
-- 2) Migrate research_subjects to projects
-- =========================================================
-- For each research_subject:
--   1. Map subject_type_id to project_type_id (by matching names)
--   2. Create workspace KB for the project
--   3. Create project with all fields
--   4. Store mapping

DO $$
DECLARE
  rs_record RECORD;
  pt_id UUID;
  kb_id UUID;
  new_project_id UUID;
BEGIN
  -- Loop through all research_subjects
  FOR rs_record IN 
    SELECT 
      rs.id,
      rs.name,
      rs.geography,
      rs.category,
      rs.description,
      rs.subject_type_id,
      rs.first_researched_at,
      rs.last_researched_at,
      rs.run_count,
      rs.created_at,
      rs.updated_at
    FROM public.research_subjects rs
  LOOP
    -- Map subject_type_id to project_type_id by matching names
    SELECT pt.id INTO pt_id
    FROM public.subject_types st
    JOIN public.project_types pt ON st.name = pt.name
    WHERE st.id = rs_record.subject_type_id;
    
    -- Skip if no matching project_type found
    IF pt_id IS NULL THEN
      RAISE NOTICE 'No matching project_type found for research_subject % (subject_type_id: %)', rs_record.id, rs_record.subject_type_id;
      CONTINUE;
    END IF;
    
    -- Create workspace KB for the project
    INSERT INTO public.rag_knowledge_bases (
      name,
      description,
      type,
      is_active,
      created_at,
      updated_at
    )
    VALUES (
      rs_record.name || ' Workspace',
      'Workspace for ' || rs_record.name || ' research project',
      'project',
      true,
      rs_record.created_at,
      rs_record.updated_at
    )
    ON CONFLICT (name) DO NOTHING
    RETURNING id INTO kb_id;
    
    -- If KB already exists, get its ID
    IF kb_id IS NULL THEN
      SELECT id INTO kb_id
      FROM public.rag_knowledge_bases
      WHERE name = rs_record.name || ' Workspace'
      LIMIT 1;
    END IF;
    
    -- Create project (check if it already exists first)
    SELECT id INTO new_project_id
    FROM public.projects
    WHERE name = rs_record.name
      AND project_type_id = pt_id
    LIMIT 1;
    
    -- Only create if it doesn't exist
    IF new_project_id IS NULL THEN
      -- Note: client_name is required (NOT NULL), so we use name for both fields
      INSERT INTO public.projects (
        name,
        client_name,
        project_type_id,
        type,
        geography,
        category,
        description,
        first_researched_at,
        last_researched_at,
        run_count,
        status,
        kb_id,
        created_at,
        updated_at
      )
      VALUES (
        rs_record.name,
        rs_record.name, -- client_name is required, use same as name
        pt_id,
        'niche_research',
        rs_record.geography,
        rs_record.category,
        rs_record.description,
        rs_record.first_researched_at,
        rs_record.last_researched_at,
        COALESCE(rs_record.run_count, 0),
        'active',
        kb_id,
        rs_record.created_at,
        rs_record.updated_at
      )
      RETURNING id INTO new_project_id;
    END IF;
    
    -- Store mapping
    IF new_project_id IS NOT NULL THEN
      INSERT INTO public.research_subject_to_project_mapping (
        research_subject_id,
        project_id
      )
      VALUES (
        rs_record.id,
        new_project_id
      )
      ON CONFLICT (research_subject_id) DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- =========================================================
-- Note: The mapping table will be kept for verification
-- and can be used in subsequent migrations. It will be
-- dropped in Phase 5 cleanup.

