-- Fix realtime subscription for rag_runs table
-- REPLICA IDENTITY FULL is required for DELETE events to include old row data
-- Without this, DELETE events in realtime subscriptions will fail

-- Set REPLICA IDENTITY to FULL for rag_runs table
-- This allows DELETE events to include the full old row data in realtime payloads
ALTER TABLE public.rag_runs REPLICA IDENTITY FULL;

-- Ensure the table is in the realtime publication
DO $$
BEGIN
    -- Try to add the table to the publication
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.rag_runs;
    EXCEPTION
        WHEN duplicate_object THEN
            -- Table already in publication, that's fine
            RAISE NOTICE 'Table rag_runs already in supabase_realtime publication';
        WHEN undefined_object THEN
            -- Publication doesn't exist (shouldn't happen in Supabase, but handle gracefully)
            RAISE NOTICE 'supabase_realtime publication not found. Please enable replication in Supabase Dashboard.';
    END;
END $$;

