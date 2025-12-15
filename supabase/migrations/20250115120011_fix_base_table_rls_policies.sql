-- Fix RLS policies on offer_features and faq_items base tables
-- Since status is now managed at junction table level, base tables should allow public access
-- The junction table RLS policies will handle filtering

-- Step 1: Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Public can view offer_features" ON public.offer_features;
DROP POLICY IF EXISTS "Public can view active offer_features" ON public.offer_features;

CREATE POLICY "Public can view offer_features"
    ON public.offer_features
    FOR SELECT
    USING (true);

-- Step 2: Drop existing policies if they exist, then create new ones
DROP POLICY IF EXISTS "Public can view faq_items" ON public.faq_items;
DROP POLICY IF EXISTS "Public can view active faq_items" ON public.faq_items;

CREATE POLICY "Public can view faq_items"
    ON public.faq_items
    FOR SELECT
    USING (true);

-- Step 3: Add public SELECT policy for cta_buttons (status is managed at junction table level)
DROP POLICY IF EXISTS "Public can view cta_buttons" ON public.cta_buttons;
DROP POLICY IF EXISTS "Public can view active cta_buttons" ON public.cta_buttons;

CREATE POLICY "Public can view cta_buttons"
    ON public.cta_buttons
    FOR SELECT
    USING (true);

-- Step 4: Add public SELECT policy for testimonials (status is managed at junction table level)
DROP POLICY IF EXISTS "Public can view approved testimonials" ON public.testimonials;

CREATE POLICY "Public can view testimonials"
    ON public.testimonials
    FOR SELECT
    USING (true);
