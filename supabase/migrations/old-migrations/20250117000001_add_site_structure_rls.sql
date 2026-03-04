-- RLS Policies for site_structure table

-- Public can read site_structure (needed for landing page)
CREATE POLICY "Public can read site_structure"
ON public.site_structure
FOR SELECT
TO public
USING (true);

-- Authenticated users can insert site_structure entries
CREATE POLICY "Authenticated users can insert site_structure"
ON public.site_structure
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Authenticated users can update site_structure entries
CREATE POLICY "Authenticated users can update site_structure"
ON public.site_structure
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Authenticated users can delete site_structure entries
CREATE POLICY "Authenticated users can delete site_structure"
ON public.site_structure
FOR DELETE
TO authenticated
USING (true);
