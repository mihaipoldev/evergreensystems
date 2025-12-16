-- Add type and variant columns to pages table
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS variant TEXT;

-- Migrate existing data: Set type = slug and variant = 'default' for existing pages
UPDATE public.pages
SET 
  type = slug,
  variant = 'default'
WHERE type IS NULL OR variant IS NULL;

-- Create site_structure table
CREATE TABLE IF NOT EXISTS public.site_structure (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_type TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    active_page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pages_type_variant ON public.pages(type, variant);
CREATE INDEX IF NOT EXISTS idx_site_structure_page_type ON public.site_structure(page_type);
CREATE INDEX IF NOT EXISTS idx_site_structure_slug ON public.site_structure(slug);
CREATE INDEX IF NOT EXISTS idx_site_structure_active_page_id ON public.site_structure(active_page_id);

-- Add unique constraint on pages(type, variant) to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_type_variant_unique ON public.pages(type, variant) 
WHERE type IS NOT NULL AND variant IS NOT NULL;

-- Add trigger for updated_at on site_structure table
CREATE TRIGGER update_site_structure_updated_at
    BEFORE UPDATE ON public.site_structure
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on site_structure table
ALTER TABLE public.site_structure ENABLE ROW LEVEL SECURITY;
