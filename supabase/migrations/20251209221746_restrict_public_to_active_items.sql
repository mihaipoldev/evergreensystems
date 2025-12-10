-- Update RLS policies to ensure public users (anon key) can only see active/approved items
-- This prevents unapproved/inactive items from being visible on the public landing page

-- Update FAQ items policy: Public can only see active FAQ items
DROP POLICY IF EXISTS "Public can view faq_items" ON public.faq_items;

CREATE POLICY "Public can view active faq_items"
    ON public.faq_items
    FOR SELECT
    USING (status = 'active');

-- Update offer_features policy: Public can only see active features
DROP POLICY IF EXISTS "Public can view offer_features" ON public.offer_features;

CREATE POLICY "Public can view active offer_features"
    ON public.offer_features
    FOR SELECT
    USING (status = 'active');

-- Update cta_buttons policy: Public can only see active CTA buttons
DROP POLICY IF EXISTS "Public can view cta_buttons" ON public.cta_buttons;

CREATE POLICY "Public can view active cta_buttons"
    ON public.cta_buttons
    FOR SELECT
    USING (status = 'active');

-- Note: Testimonials already has the correct policy: "Public can view approved testimonials"
-- which only shows approved = true items
