-- Update offer_features status from active/inactive to published/draft/deactivated
-- Step 1: Drop RLS policies that depend on the status column
DROP POLICY IF EXISTS "Public can view active offer_features" ON public.offer_features;

-- Step 2: Change column type from enum to TEXT
ALTER TABLE public.offer_features ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Step 3: Drop the old enum type (if it exists and is not used elsewhere)
DROP TYPE IF EXISTS public.feature_status CASCADE;

-- Step 4: Update existing data
UPDATE public.offer_features 
SET status = CASE 
    WHEN status = 'active' THEN 'published'
    WHEN status = 'inactive' THEN 'deactivated'
    ELSE 'draft'
END;

-- Step 5: Add new CHECK constraint for published/draft/deactivated
ALTER TABLE public.offer_features 
ADD CONSTRAINT offer_features_status_check 
CHECK (status IN ('published', 'draft', 'deactivated'));

-- Step 6: Recreate RLS policy with updated status values
-- Public can view published offer_features (draft items are filtered in application code)
CREATE POLICY "Public can view active offer_features"
    ON public.offer_features
    FOR SELECT
    USING (status = 'published');

-- Step 7: Create section_features junction table
CREATE TABLE IF NOT EXISTS public.section_features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES public.offer_features(id) ON DELETE CASCADE,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(section_id, feature_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_section_features_section_id ON public.section_features(section_id);
CREATE INDEX IF NOT EXISTS idx_section_features_feature_id ON public.section_features(feature_id);
CREATE INDEX IF NOT EXISTS idx_section_features_position ON public.section_features(section_id, position);

-- Enable RLS on section_features table
ALTER TABLE public.section_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for section_features table
-- Public can view section_features
CREATE POLICY "Public can view section_features"
    ON public.section_features
    FOR SELECT
    USING (true);

-- Authenticated users can insert section_features
CREATE POLICY "Authenticated users can insert section_features"
    ON public.section_features
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update section_features
CREATE POLICY "Authenticated users can update section_features"
    ON public.section_features
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can delete section_features
CREATE POLICY "Authenticated users can delete section_features"
    ON public.section_features
    FOR DELETE
    USING (auth.role() = 'authenticated');
