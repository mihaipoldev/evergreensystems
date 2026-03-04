-- Fix all RLS policies for testimonials to use auth.uid() instead of auth.role()
-- This ensures authenticated users can properly INSERT, UPDATE, and DELETE testimonials

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can update testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Authenticated users can delete testimonials" ON public.testimonials;

-- Recreate INSERT policy using auth.uid() which is more reliable
CREATE POLICY "Authenticated users can insert testimonials"
    ON public.testimonials
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Recreate UPDATE policy using auth.uid() which is more reliable
CREATE POLICY "Authenticated users can update testimonials"
    ON public.testimonials
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Recreate DELETE policy using auth.uid() which is more reliable
CREATE POLICY "Authenticated users can delete testimonials"
    ON public.testimonials
    FOR DELETE
    USING (auth.uid() IS NOT NULL);
