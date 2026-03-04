-- Add admin_title column to sections table (originally named display_title, renamed later)
ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS display_title TEXT;
