-- Rename display_title column to admin_title in sections table
ALTER TABLE public.sections 
RENAME COLUMN display_title TO admin_title;
