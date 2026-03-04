-- Add headline column to testimonials table (if it doesn't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'testimonials' 
        AND column_name = 'headline'
    ) THEN
        ALTER TABLE public.testimonials ADD COLUMN headline TEXT;
    END IF;
END $$;

-- Drop video_url column from testimonials table
ALTER TABLE public.testimonials
DROP COLUMN IF EXISTS video_url;
