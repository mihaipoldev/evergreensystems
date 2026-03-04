-- =========================================================
-- Fix Missing Research Subject Migrations
-- =========================================================
-- This migration fixes research_subjects that were not
-- migrated to projects in Phase 2.1
-- =========================================================

DO $$
DECLARE
  rs_record RECORD;
  pt_id UUID;
  kb_id UUID;
  new_project_id UUID;
  fixed_count INTEGER := 0;
  skipped_count INTEGER := 0;
BEGIN
  -- Loop through research_subjects that don't have a mapping entry
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
    LEFT JOIN public.research_subject_to_project_mapping m ON rs.id = m.research_subject_id
    WHERE m.project_id IS NULL
  LOOP
    -- Map subject_type_id to project_type_id by matching names
    SELECT pt.id INTO pt_id
    FROM public.subject_types st
    JOIN public.project_types pt ON st.name = pt.name
    WHERE st.id = rs_record.subject_type_id;
    
    -- Skip if no matching project_type found
    IF pt_id IS NULL THEN
      RAISE NOTICE 'Skipping research_subject % (name: %) - No matching project_type found for subject_type_id: %', 
        rs_record.id, rs_record.name, rs_record.subject_type_id;
      skipped_count := skipped_count + 1;
      CONTINUE;
    END IF;
    
    -- Check if project already exists
    SELECT id INTO new_project_id
    FROM public.projects
    WHERE name = rs_record.name
      AND project_type_id = pt_id
    LIMIT 1;
    
    -- If project doesn't exist, create it
    IF new_project_id IS NULL THEN
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
      
      -- If KB creation failed, skip
      IF kb_id IS NULL THEN
        RAISE NOTICE 'Skipping research_subject % (name: %) - Failed to create or find KB', 
          rs_record.id, rs_record.name;
        skipped_count := skipped_count + 1;
        CONTINUE;
      END IF;
      
      -- Create project
      -- Note: client_name is required (NOT NULL), so we use name for both fields
      BEGIN
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
      EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Failed to create project for research_subject % (name: %): %', 
          rs_record.id, rs_record.name, SQLERRM;
        new_project_id := NULL;
      END;
    END IF;
    
    -- Create mapping entry if project exists
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
      
      fixed_count := fixed_count + 1;
      RAISE NOTICE 'Fixed research_subject % (name: %) -> project %', 
        rs_record.id, rs_record.name, new_project_id;
    ELSE
      RAISE NOTICE 'Failed to create project for research_subject % (name: %)', 
        rs_record.id, rs_record.name;
      skipped_count := skipped_count + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Migration fix complete: % fixed, % skipped', fixed_count, skipped_count;
END $$;

