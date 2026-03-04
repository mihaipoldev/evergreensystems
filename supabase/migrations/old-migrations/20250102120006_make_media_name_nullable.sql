-- Make name column nullable in media table
ALTER TABLE public.media 
ALTER COLUMN name DROP NOT NULL;
