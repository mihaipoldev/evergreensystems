-- =========================================================
-- Enable Realtime for research_subjects table
-- =========================================================
-- This migration adds the research_subjects table to the
-- supabase_realtime publication so that real-time subscriptions work
-- =========================================================

DO $$
BEGIN
    -- Check if the supabase_realtime publication exists
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        -- Add the table to the publication if it's not already there
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
            AND tablename = 'research_subjects'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.research_subjects;
            RAISE NOTICE 'Table research_subjects added to supabase_realtime publication';
        ELSE
            RAISE NOTICE 'Table research_subjects already in supabase_realtime publication';
        END IF;
    ELSE
        RAISE NOTICE 'supabase_realtime publication not found. Please enable replication in Supabase Dashboard.';
    END IF;
END $$;

