-- =========================================================
-- Add Type Field to Research Subjects Table
-- =========================================================
-- This migration adds a type field to the research_subjects table
-- =========================================================

-- =========================================================
-- 1) Add type column to research_subjects table
-- =========================================================
ALTER TABLE public.research_subjects
  ADD COLUMN IF NOT EXISTS type TEXT;

