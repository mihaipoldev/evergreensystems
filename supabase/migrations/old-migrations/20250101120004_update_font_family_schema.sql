-- Migration: Update font_family column to support JSON structure
-- This migration updates existing font_family values to the new JSON format
-- and sets a default value for new records

-- Update existing records with default font configuration (admin only)
UPDATE public.user_themes
SET font_family = '{"admin":{"heading":"geist-sans","body":"geist-sans"}}'
WHERE font_family IS NULL 
   OR font_family = ''
   OR font_family = 'system'
   OR NOT (font_family ~ '^\{.*"admin".*\}$');

-- Add a check constraint to ensure font_family is valid JSON
-- Note: PostgreSQL doesn't have a built-in JSON validation constraint,
-- but we can add a trigger function to validate on insert/update
CREATE OR REPLACE FUNCTION validate_font_family_json()
RETURNS TRIGGER AS $$
BEGIN
  -- Try to parse as JSON - will raise error if invalid
  PERFORM jsonb_typeof(NEW.font_family::jsonb);
  
  -- Check structure (admin only)
  IF NOT (
    NEW.font_family::jsonb ? 'admin' AND
    NEW.font_family::jsonb->'admin' ? 'heading' AND
    NEW.font_family::jsonb->'admin' ? 'body'
  ) THEN
    RAISE EXCEPTION 'font_family must have structure: {"admin": {"heading": "...", "body": "..."}}';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate font_family on insert/update
DROP TRIGGER IF EXISTS validate_font_family_trigger ON public.user_themes;
CREATE TRIGGER validate_font_family_trigger
  BEFORE INSERT OR UPDATE ON public.user_themes
  FOR EACH ROW
  EXECUTE FUNCTION validate_font_family_json();

-- Set default value for new records (using a function to generate the JSON)
-- Note: PostgreSQL doesn't support JSON literals in DEFAULT, so we'll handle this in application code
-- But we can add a comment to document the expected format
COMMENT ON COLUMN public.user_themes.font_family IS 'JSON string with structure: {"admin": {"heading": "font-id", "body": "font-id"}}. Valid font IDs: roboto, open-sans, montserrat, dm-sans, source-code-pro, space-grotesk, josefin-sans, rubik, inter, poppins, raleway, nunito-sans, geist-sans, geist-mono';

