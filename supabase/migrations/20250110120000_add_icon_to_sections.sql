-- Add icon column to sections table for Font Awesome icon class names
ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS icon TEXT;