-- Add production_page_id and development_page_id columns to site_structure table
ALTER TABLE public.site_structure
ADD COLUMN IF NOT EXISTS production_page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS development_page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE;

-- Migrate existing active_page_id data to both production and development
UPDATE public.site_structure
SET 
  production_page_id = active_page_id,
  development_page_id = active_page_id
WHERE active_page_id IS NOT NULL AND (production_page_id IS NULL OR development_page_id IS NULL);

-- Drop the old active_page_id column
ALTER TABLE public.site_structure
DROP COLUMN IF EXISTS active_page_id;

-- Drop old index
DROP INDEX IF EXISTS idx_site_structure_active_page_id;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_site_structure_production_page_id ON public.site_structure(production_page_id);
CREATE INDEX IF NOT EXISTS idx_site_structure_development_page_id ON public.site_structure(development_page_id);
