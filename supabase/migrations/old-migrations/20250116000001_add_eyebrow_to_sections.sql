-- Add eyebrow column to sections table
ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS eyebrow TEXT;
