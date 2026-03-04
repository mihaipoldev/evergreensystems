-- Ensure authenticated users (admins) can see ALL testimonials regardless of approval status
-- This fixes the issue where unapproved testimonials are not visible in the admin panel

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Authenticated users can view all testimonials" ON public.testimonials;

-- Recreate the policy to ensure authenticated users see ALL testimonials
-- Using auth.uid() IS NOT NULL ensures any authenticated user can see all rows
-- This policy has no conditions on approved status, so it returns all testimonials
CREATE POLICY "Authenticated users can view all testimonials"
    ON public.testimonials
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Note: Supabase uses OR logic for multiple SELECT policies
-- So authenticated users will see:
-- - All testimonials (from this policy) OR
-- - Approved testimonials (from public policy)
-- Since this policy has no conditions, authenticated users see ALL testimonials
