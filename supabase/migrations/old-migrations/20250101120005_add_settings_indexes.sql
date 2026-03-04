-- Add composite indexes for optimized settings page queries
-- These indexes will significantly improve query performance for the Account and Appearance settings pages

-- Composite index for user_colors: Optimizes queries that load all user colors ordered by creation date
-- Query pattern: SELECT * FROM user_colors WHERE user_id = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_user_colors_user_id_created_at_desc 
ON public.user_colors(user_id, created_at DESC);

-- Composite index for user_themes: Optimizes queries that find themes by user and name
-- Query pattern: SELECT id FROM user_themes WHERE user_id = ? AND name = ?
CREATE INDEX IF NOT EXISTS idx_user_themes_user_id_name 
ON public.user_themes(user_id, name);

-- Note: The following indexes already exist from the initial migration (20250101120000_create_user_tables.sql):
-- - idx_user_colors_user_id (single column index on user_id)
-- - idx_user_themes_user_id (single column index on user_id)
-- - idx_user_themes_primary_color_id (for delete color check queries)
-- - idx_user_themes_secondary_color_id (for delete color check queries)
-- - idx_user_themes_accent_color_id (for delete color check queries)
-- - idx_user_settings_user_id (user_id is UNIQUE, but index exists for consistency)

