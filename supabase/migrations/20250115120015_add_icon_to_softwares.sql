-- Add icon column to softwares table
ALTER TABLE public.softwares 
ADD COLUMN IF NOT EXISTS icon TEXT;
