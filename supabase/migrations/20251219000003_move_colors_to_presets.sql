-- Migration: Move colors from website_colors table to website_settings_presets
-- This makes each preset self-contained with its own color values

-- Step 1: Add new color columns to website_settings_presets
ALTER TABLE public.website_settings_presets
ADD COLUMN IF NOT EXISTS primary_color_hex TEXT,
ADD COLUMN IF NOT EXISTS primary_color_h INTEGER,
ADD COLUMN IF NOT EXISTS primary_color_s INTEGER,
ADD COLUMN IF NOT EXISTS primary_color_l INTEGER,
ADD COLUMN IF NOT EXISTS secondary_color_hex TEXT,
ADD COLUMN IF NOT EXISTS secondary_color_h INTEGER,
ADD COLUMN IF NOT EXISTS secondary_color_s INTEGER,
ADD COLUMN IF NOT EXISTS secondary_color_l INTEGER;

-- Step 2: Migrate existing data from website_colors table
-- Migrate primary colors
UPDATE public.website_settings_presets p
SET 
  primary_color_hex = c.hex,
  primary_color_h = c.hsl_h,
  primary_color_s = c.hsl_s,
  primary_color_l = c.hsl_l
FROM public.website_colors c
WHERE p.primary_color_id = c.id
  AND p.primary_color_id IS NOT NULL;

-- Migrate secondary colors
UPDATE public.website_settings_presets p
SET 
  secondary_color_hex = c.hex,
  secondary_color_h = c.hsl_h,
  secondary_color_s = c.hsl_s,
  secondary_color_l = c.hsl_l
FROM public.website_colors c
WHERE p.secondary_color_id = c.id
  AND p.secondary_color_id IS NOT NULL;

-- Step 3: Drop foreign key constraints and indexes
-- Drop indexes first
DROP INDEX IF EXISTS idx_website_settings_presets_primary_color_id;
DROP INDEX IF EXISTS idx_website_settings_presets_secondary_color_id;

-- Drop foreign key constraints by dropping and recreating columns
-- First, drop the foreign key columns
ALTER TABLE public.website_settings_presets
DROP COLUMN IF EXISTS primary_color_id,
DROP COLUMN IF EXISTS secondary_color_id;

-- Note: We're leaving the website_colors table intact for now
-- It can be dropped later if needed, but keeping it allows for reference
-- and doesn't cause any issues since foreign keys are removed
