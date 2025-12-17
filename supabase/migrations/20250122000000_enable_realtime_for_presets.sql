-- Enable real-time replication for website_settings_presets table
-- This allows Supabase real-time subscriptions to work

-- Add the table to the supabase_realtime publication
-- Note: If this fails, you may need to enable replication in Supabase Dashboard:
-- Go to Database > Replication > Enable for website_settings_presets table
DO $$
BEGIN
    -- Try to add the table to the publication
    -- This will fail silently if already added or if publication doesn't exist
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.website_settings_presets;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, that's fine
            RAISE NOTICE 'Table website_settings_presets already in supabase_realtime publication';
        WHEN undefined_object THEN
            -- Publication doesn't exist (shouldn't happen in Supabase, but handle gracefully)
            RAISE NOTICE 'supabase_realtime publication not found. Please enable replication in Supabase Dashboard.';
    END;
END $$;
