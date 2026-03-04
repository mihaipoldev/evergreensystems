-- =========================================================
-- Diagnostic Query: Find Research Subjects Not Migrated
-- =========================================================
-- This migration helps identify why research_subjects
-- were not migrated to projects
-- =========================================================

-- Check research_subjects that don't have a mapping entry
SELECT 
  rs.id as research_subject_id,
  rs.name as research_subject_name,
  rs.subject_type_id,
  st.name as subject_type_name,
  pt.id as project_type_id,
  pt.name as project_type_name,
  CASE 
    WHEN st.id IS NULL THEN 'Research subject has NULL subject_type_id'
    WHEN pt.id IS NULL THEN 'No matching project_type found for subject_type'
    WHEN m.project_id IS NULL THEN 'Mapping entry missing'
    ELSE 'Has mapping'
  END as issue
FROM public.research_subjects rs
LEFT JOIN public.subject_types st ON rs.subject_type_id = st.id
LEFT JOIN public.project_types pt ON st.name = pt.name
LEFT JOIN public.research_subject_to_project_mapping m ON rs.id = m.research_subject_id
WHERE m.project_id IS NULL
ORDER BY rs.created_at DESC;

-- Check if projects exist with same name but no mapping
SELECT 
  rs.id as research_subject_id,
  rs.name as research_subject_name,
  p.id as project_id,
  p.name as project_name,
  p.project_type_id,
  'Project exists but no mapping entry' as issue
FROM public.research_subjects rs
LEFT JOIN public.research_subject_to_project_mapping m ON rs.id = m.research_subject_id
LEFT JOIN public.subject_types st ON rs.subject_type_id = st.id
LEFT JOIN public.project_types pt ON st.name = pt.name
LEFT JOIN public.projects p ON p.name = rs.name AND p.project_type_id = pt.id
WHERE m.project_id IS NULL 
  AND p.id IS NOT NULL
ORDER BY rs.created_at DESC;

