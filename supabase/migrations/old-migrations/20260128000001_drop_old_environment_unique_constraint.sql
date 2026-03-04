-- Drop the old UNIQUE constraint on environment only
-- This is needed because we now have a composite unique constraint on (environment, route)
-- The old constraint prevents multiple routes per environment

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
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No unique constraint on environment column found';
    END IF;
END $$;
