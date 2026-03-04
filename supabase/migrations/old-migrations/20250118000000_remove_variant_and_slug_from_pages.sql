-- Remove variant and slug columns from pages table
-- Variant is now part of the title (e.g., "Home V2", "Home")
-- Slug is now managed in site_structure table

-- Drop unique constraint on (type, variant) since variant is being removed
DROP INDEX IF EXISTS idx_pages_type_variant_unique;

-- Drop index on type + variant since variant is being removed
DROP INDEX IF EXISTS idx_pages_type_variant;

-- Drop index on slug since slug column is being removed
DROP INDEX IF EXISTS idx_pages_slug;

-- Drop composite index that includes slug
DROP INDEX IF EXISTS idx_pages_title_slug_search;

-- Remove variant column from pages table
ALTER TABLE public.pages
DROP COLUMN IF EXISTS variant;

-- Remove slug column from pages table
-- Note: slug was originally NOT NULL UNIQUE, but we're removing it entirely
-- The site_structure table now manages slugs
ALTER TABLE public.pages
DROP COLUMN IF EXISTS slug;
