-- Fix website_settings table schema and migrate existing data

-- Step 1: Create presets from existing website_settings data
-- First, create a temporary table to store the preset data
DO $$
DECLARE
    prod_id UUID;
    dev_id UUID;
    prod_preset_id UUID;
    dev_preset_id UUID;
    prod_settings RECORD;
    dev_settings RECORD;
BEGIN
    -- Get existing production settings
    SELECT * INTO prod_settings FROM public.website_settings WHERE id = 'production' LIMIT 1;
    
    -- Get existing development settings
    SELECT * INTO dev_settings FROM public.website_settings WHERE id = 'development' LIMIT 1;
    
    -- Create preset for production if it exists
    IF prod_settings IS NOT NULL THEN
        INSERT INTO public.website_settings_presets (name, theme, primary_color_id, font_family)
        VALUES (
            'Production Default',
            COALESCE(prod_settings.theme, 'dark'),
            prod_settings.primary_color_id,
            COALESCE(prod_settings.font_family, '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}')
        )
        RETURNING id INTO prod_preset_id;
    END IF;
    
    -- Create preset for development if it exists
    IF dev_settings IS NOT NULL THEN
        INSERT INTO public.website_settings_presets (name, theme, primary_color_id, font_family)
        VALUES (
            'Development Default',
            COALESCE(dev_settings.theme, 'dark'),
            dev_settings.primary_color_id,
            COALESCE(dev_settings.font_family, '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}')
        )
        RETURNING id INTO dev_preset_id;
    END IF;
    
    -- If no presets exist, create default ones
    IF prod_preset_id IS NULL THEN
        INSERT INTO public.website_settings_presets (name, theme, font_family)
        VALUES (
            'Production Default',
            'dark',
            '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}'
        )
        RETURNING id INTO prod_preset_id;
    END IF;
    
    IF dev_preset_id IS NULL THEN
        INSERT INTO public.website_settings_presets (name, theme, font_family)
        VALUES (
            'Development Default',
            'dark',
            '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}'
        )
        RETURNING id INTO dev_preset_id;
    END IF;
    
    -- Store preset IDs in a temporary table for later use
    CREATE TEMP TABLE IF NOT EXISTS temp_preset_mapping (
        environment TEXT,
        preset_id UUID
    );
    
    INSERT INTO temp_preset_mapping (environment, preset_id) VALUES
        ('production', prod_preset_id),
        ('development', dev_preset_id);
END $$;

-- Ensure temp table exists (in case DO block didn't create it)
CREATE TEMP TABLE IF NOT EXISTS temp_preset_mapping (
    environment TEXT,
    preset_id UUID
);

-- Step 2: Drop existing constraints and policies
ALTER TABLE public.website_settings DROP CONSTRAINT IF EXISTS website_settings_id_check;

-- Step 3: Create new columns (temporary, will be populated)
ALTER TABLE public.website_settings 
    ADD COLUMN IF NOT EXISTS environment_temp TEXT,
    ADD COLUMN IF NOT EXISTS preset_id_temp UUID REFERENCES public.website_settings_presets(id) ON DELETE SET NULL;

-- Step 4: Populate new columns from old id values
UPDATE public.website_settings
SET environment_temp = CASE 
    WHEN id = 'production' THEN 'production'
    WHEN id = 'development' THEN 'development'
    ELSE 'production'
END;

-- Link to presets
UPDATE public.website_settings ws
SET preset_id_temp = (
    SELECT preset_id 
    FROM temp_preset_mapping tpm 
    WHERE tpm.environment = ws.environment_temp
)
WHERE environment_temp IS NOT NULL;

-- Step 5: Create new table structure with UUID id
CREATE TABLE IF NOT EXISTS public.website_settings_new (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    environment TEXT NOT NULL CHECK (environment IN ('production', 'development')),
    preset_id UUID REFERENCES public.website_settings_presets(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(environment)
);

-- Step 6: Migrate data to new table
INSERT INTO public.website_settings_new (environment, preset_id, created_at, updated_at)
SELECT DISTINCT ON (environment_temp)
    environment_temp,
    preset_id_temp,
    created_at,
    updated_at
FROM public.website_settings
WHERE environment_temp IS NOT NULL
ON CONFLICT (environment) DO UPDATE SET
    preset_id = EXCLUDED.preset_id,
    updated_at = EXCLUDED.updated_at;

-- Step 7: Drop old table and rename new one
DROP TABLE IF EXISTS public.website_settings CASCADE;
ALTER TABLE public.website_settings_new RENAME TO website_settings;

-- Step 8: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_website_settings_preset_id ON public.website_settings(preset_id);
CREATE INDEX IF NOT EXISTS idx_website_settings_environment ON public.website_settings(environment);

-- Step 9: Recreate trigger
CREATE TRIGGER update_website_settings_updated_at
    BEFORE UPDATE ON public.website_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Step 10: Recreate RLS policies
ALTER TABLE public.website_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view website settings"
    ON public.website_settings
    FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert website settings"
    ON public.website_settings
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update website settings"
    ON public.website_settings
    FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete website settings"
    ON public.website_settings
    FOR DELETE
    USING (auth.uid() IS NOT NULL);

-- Step 11: Clean up temporary table
DROP TABLE IF EXISTS temp_preset_mapping;
