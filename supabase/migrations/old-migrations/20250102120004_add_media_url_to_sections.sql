-- Add media_url column to sections table for video URLs (used in hero sections)
ALTER TABLE public.sections 
ADD COLUMN IF NOT EXISTS media_url TEXT;
