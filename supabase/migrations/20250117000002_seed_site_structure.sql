-- Seed site_structure table with initial entries
-- This migration creates site_structure entries for existing pages
-- You can modify this to match your needs

-- Insert site_structure entry for home page (if it exists)
-- This assumes you have a page with type='home' and variant='default'
INSERT INTO public.site_structure (page_type, slug, active_page_id)
SELECT 
  'home' as page_type,
  'home' as slug,
  id as active_page_id
FROM public.pages
WHERE type = 'home' AND variant = 'default'
LIMIT 1
ON CONFLICT (page_type) DO NOTHING;

-- You can add more entries here for other page types
-- Example for contact page:
-- INSERT INTO public.site_structure (page_type, slug, active_page_id)
-- SELECT 
--   'contact' as page_type,
--   'contact' as slug,
--   id as active_page_id
-- FROM public.pages
-- WHERE type = 'contact' AND variant = 'default'
-- LIMIT 1
-- ON CONFLICT (page_type) DO NOTHING;
