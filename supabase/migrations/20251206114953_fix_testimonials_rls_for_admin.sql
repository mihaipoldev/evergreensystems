-- Drop the existing authenticated users policy and recreate it with a more reliable check
-- This ensures authenticated users (admins) can see ALL testimonials, both approved and unapproved
DROP POLICY IF EXISTS "Authenticated users can view all testimonials" ON public.testimonials;

-- Recreate the policy using auth.uid() which is more reliable than auth.role()
-- When multiple SELECT policies exist, Supabase uses OR logic, so authenticated users
-- will see all testimonials (from this policy) regardless of approval status
-- This policy allows authenticated users to see ALL rows (no conditions)
CREATE POLICY "Authenticated users can view all testimonials"
    ON public.testimonials
    FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- Verify the policy was created correctly
-- You can check with: SELECT * FROM pg_policies WHERE tablename = 'testimonials';
