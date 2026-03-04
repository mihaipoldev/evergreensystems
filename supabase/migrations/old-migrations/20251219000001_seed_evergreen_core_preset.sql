-- Seed Evergreen Core preset colors and preset
-- First, insert the colors into website_colors table, then create the preset

DO $$
DECLARE
    primary_color_id_var UUID;
    secondary_color_id_var UUID;
BEGIN
    -- Check if Primary Color (#0F3D2E) exists, if not insert it
    SELECT id INTO primary_color_id_var
    FROM public.website_colors
    WHERE hex = '#0F3D2E'
    LIMIT 1;
    
    IF primary_color_id_var IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES (
            'Evergreen Core Primary',
            '#0F3D2E',
            160,
            61,
            15
        )
        RETURNING id INTO primary_color_id_var;
    ELSE
        -- Update existing color to ensure correct values
        UPDATE public.website_colors
        SET name = 'Evergreen Core Primary',
            hsl_h = 160,
            hsl_s = 61,
            hsl_l = 15
        WHERE id = primary_color_id_var;
    END IF;
    
    -- Check if Secondary Color (#E6D5B8) exists, if not insert it
    SELECT id INTO secondary_color_id_var
    FROM public.website_colors
    WHERE hex = '#E6D5B8'
    LIMIT 1;
    
    IF secondary_color_id_var IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES (
            'Evergreen Core Secondary',
            '#E6D5B8',
            38,
            48,
            81
        )
        RETURNING id INTO secondary_color_id_var;
    ELSE
        -- Update existing color to ensure correct values
        UPDATE public.website_colors
        SET name = 'Evergreen Core Secondary',
            hsl_h = 38,
            hsl_s = 48,
            hsl_l = 81
        WHERE id = secondary_color_id_var;
    END IF;
    
    -- Insert or update the preset that references these colors
    -- First check if preset exists
    IF EXISTS (SELECT 1 FROM public.website_settings_presets WHERE name = 'Evergreen Core') THEN
        -- Update existing preset
        UPDATE public.website_settings_presets
        SET 
            primary_color_id = primary_color_id_var,
            secondary_color_id = secondary_color_id_var,
            updated_at = now()
        WHERE name = 'Evergreen Core';
    ELSE
        -- Insert new preset
        INSERT INTO public.website_settings_presets (
            name,
            theme,
            primary_color_id,
            secondary_color_id,
            font_family
        )
        VALUES (
            'Evergreen Core',
            'dark',
            primary_color_id_var,
            secondary_color_id_var,
            '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}'
        );
    END IF;
END $$;

