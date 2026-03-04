-- Add route column to website_settings table
-- This allows different presets for different routes (e.g., landing page vs outbound systems page)

-- Step 1: Drop the old UNIQUE constraint on environment only (if it exists)
-- This constraint was created in 20251217001434_fix_website_settings_schema.sql
-- PostgreSQL may have auto-named it, so we need to find and drop it dynamically
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the unique constraint on just the environment column
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.website_settings'::regclass
      AND contype = 'u'
      AND array_length(conkey, 1) = 1
      AND conkey[1] = (
          SELECT attnum 
          FROM pg_attribute 
          WHERE attrelid = 'public.website_settings'::regclass 
            AND attname = 'environment'
      )
    LIMIT 1;
    
    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE public.website_settings DROP CONSTRAINT IF EXISTS %I', constraint_name);
    END IF;
END $$;

-- Step 2: Add route column
ALTER TABLE public.website_settings 
ADD COLUMN IF NOT EXISTS route TEXT DEFAULT '/';

-- Step 3: Set default route for existing records
UPDATE public.website_settings 
SET route = '/' 
WHERE route IS NULL;

-- Step 4: Add unique constraint to prevent duplicate route presets per environment
ALTER TABLE public.website_settings 
ADD CONSTRAINT website_settings_environment_route_unique 
UNIQUE (environment, route);

-- Step 5: Add index for performance
CREATE INDEX IF NOT EXISTS idx_website_settings_environment_route 
ON public.website_settings(environment, route);
