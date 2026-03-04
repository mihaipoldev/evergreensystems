-- Seed additional website settings presets and colors
-- Midnight Teal, Charcoal Lime, Plum Silver, and Slate Blue

DO $$
DECLARE
    midnight_teal_primary_id UUID;
    midnight_teal_secondary_id UUID;
    charcoal_lime_primary_id UUID;
    charcoal_lime_secondary_id UUID;
    plum_silver_primary_id UUID;
    plum_silver_secondary_id UUID;
    slate_blue_primary_id UUID;
    slate_blue_secondary_id UUID;
BEGIN
    -- Midnight Teal Primary (#0B1C2D)
    SELECT id INTO midnight_teal_primary_id
    FROM public.website_colors
    WHERE hex = '#0B1C2D'
    LIMIT 1;
    
    IF midnight_teal_primary_id IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES ('Midnight Teal Primary', '#0B1C2D', 210, 61, 11)
        RETURNING id INTO midnight_teal_primary_id;
    ELSE
        UPDATE public.website_colors
        SET name = 'Midnight Teal Primary', hsl_h = 210, hsl_s = 61, hsl_l = 11
        WHERE id = midnight_teal_primary_id;
    END IF;
    
    -- Midnight Teal Secondary (#2CE5C0)
    SELECT id INTO midnight_teal_secondary_id
    FROM public.website_colors
    WHERE hex = '#2CE5C0'
    LIMIT 1;
    
    IF midnight_teal_secondary_id IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES ('Midnight Teal Secondary', '#2CE5C0', 168, 78, 54)
        RETURNING id INTO midnight_teal_secondary_id;
    ELSE
        UPDATE public.website_colors
        SET name = 'Midnight Teal Secondary', hsl_h = 168, hsl_s = 78, hsl_l = 54
        WHERE id = midnight_teal_secondary_id;
    END IF;
    
    -- Charcoal Lime Primary (#111111)
    SELECT id INTO charcoal_lime_primary_id
    FROM public.website_colors
    WHERE hex = '#111111'
    LIMIT 1;
    
    IF charcoal_lime_primary_id IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES ('Charcoal Lime Primary', '#111111', 0, 0, 7)
        RETURNING id INTO charcoal_lime_primary_id;
    ELSE
        UPDATE public.website_colors
        SET name = 'Charcoal Lime Primary', hsl_h = 0, hsl_s = 0, hsl_l = 7
        WHERE id = charcoal_lime_primary_id;
    END IF;
    
    -- Charcoal Lime Secondary (#A4E300)
    SELECT id INTO charcoal_lime_secondary_id
    FROM public.website_colors
    WHERE hex = '#A4E300'
    LIMIT 1;
    
    IF charcoal_lime_secondary_id IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES ('Charcoal Lime Secondary', '#A4E300', 77, 100, 45)
        RETURNING id INTO charcoal_lime_secondary_id;
    ELSE
        UPDATE public.website_colors
        SET name = 'Charcoal Lime Secondary', hsl_h = 77, hsl_s = 100, hsl_l = 45
        WHERE id = charcoal_lime_secondary_id;
    END IF;
    
    -- Plum Silver Primary (#2A1F2D)
    SELECT id INTO plum_silver_primary_id
    FROM public.website_colors
    WHERE hex = '#2A1F2D'
    LIMIT 1;
    
    IF plum_silver_primary_id IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES ('Plum Silver Primary', '#2A1F2D', 287, 18, 15)
        RETURNING id INTO plum_silver_primary_id;
    ELSE
        UPDATE public.website_colors
        SET name = 'Plum Silver Primary', hsl_h = 287, hsl_s = 18, hsl_l = 15
        WHERE id = plum_silver_primary_id;
    END IF;
    
    -- Plum Silver Secondary (#C9C7C3)
    SELECT id INTO plum_silver_secondary_id
    FROM public.website_colors
    WHERE hex = '#C9C7C3'
    LIMIT 1;
    
    IF plum_silver_secondary_id IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES ('Plum Silver Secondary', '#C9C7C3', 40, 5, 78)
        RETURNING id INTO plum_silver_secondary_id;
    ELSE
        UPDATE public.website_colors
        SET name = 'Plum Silver Secondary', hsl_h = 40, hsl_s = 5, hsl_l = 78
        WHERE id = plum_silver_secondary_id;
    END IF;
    
    -- Slate Blue Primary (#2E3440)
    SELECT id INTO slate_blue_primary_id
    FROM public.website_colors
    WHERE hex = '#2E3440'
    LIMIT 1;
    
    IF slate_blue_primary_id IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES ('Slate Blue Primary', '#2E3440', 220, 16, 22)
        RETURNING id INTO slate_blue_primary_id;
    ELSE
        UPDATE public.website_colors
        SET name = 'Slate Blue Primary', hsl_h = 220, hsl_s = 16, hsl_l = 22
        WHERE id = slate_blue_primary_id;
    END IF;
    
    -- Slate Blue Secondary (#81A1C1)
    SELECT id INTO slate_blue_secondary_id
    FROM public.website_colors
    WHERE hex = '#81A1C1'
    LIMIT 1;
    
    IF slate_blue_secondary_id IS NULL THEN
        INSERT INTO public.website_colors (name, hex, hsl_h, hsl_s, hsl_l)
        VALUES ('Slate Blue Secondary', '#81A1C1', 210, 34, 63)
        RETURNING id INTO slate_blue_secondary_id;
    ELSE
        UPDATE public.website_colors
        SET name = 'Slate Blue Secondary', hsl_h = 210, hsl_s = 34, hsl_l = 63
        WHERE id = slate_blue_secondary_id;
    END IF;
    
    -- Create or update Midnight Teal preset
    IF EXISTS (SELECT 1 FROM public.website_settings_presets WHERE name = 'Midnight Teal') THEN
        UPDATE public.website_settings_presets
        SET primary_color_id = midnight_teal_primary_id,
            secondary_color_id = midnight_teal_secondary_id,
            updated_at = now()
        WHERE name = 'Midnight Teal';
    ELSE
        INSERT INTO public.website_settings_presets (
            name, theme, primary_color_id, secondary_color_id, font_family
        )
        VALUES (
            'Midnight Teal', 'dark', midnight_teal_primary_id, midnight_teal_secondary_id,
            '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}'
        );
    END IF;
    
    -- Create or update Charcoal Lime preset
    IF EXISTS (SELECT 1 FROM public.website_settings_presets WHERE name = 'Charcoal Lime') THEN
        UPDATE public.website_settings_presets
        SET primary_color_id = charcoal_lime_primary_id,
            secondary_color_id = charcoal_lime_secondary_id,
            updated_at = now()
        WHERE name = 'Charcoal Lime';
    ELSE
        INSERT INTO public.website_settings_presets (
            name, theme, primary_color_id, secondary_color_id, font_family
        )
        VALUES (
            'Charcoal Lime', 'dark', charcoal_lime_primary_id, charcoal_lime_secondary_id,
            '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}'
        );
    END IF;
    
    -- Create or update Plum Silver preset
    IF EXISTS (SELECT 1 FROM public.website_settings_presets WHERE name = 'Plum Silver') THEN
        UPDATE public.website_settings_presets
        SET primary_color_id = plum_silver_primary_id,
            secondary_color_id = plum_silver_secondary_id,
            updated_at = now()
        WHERE name = 'Plum Silver';
    ELSE
        INSERT INTO public.website_settings_presets (
            name, theme, primary_color_id, secondary_color_id, font_family
        )
        VALUES (
            'Plum Silver', 'dark', plum_silver_primary_id, plum_silver_secondary_id,
            '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}'
        );
    END IF;
    
    -- Create or update Slate Blue preset
    IF EXISTS (SELECT 1 FROM public.website_settings_presets WHERE name = 'Slate Blue') THEN
        UPDATE public.website_settings_presets
        SET primary_color_id = slate_blue_primary_id,
            secondary_color_id = slate_blue_secondary_id,
            updated_at = now()
        WHERE name = 'Slate Blue';
    ELSE
        INSERT INTO public.website_settings_presets (
            name, theme, primary_color_id, secondary_color_id, font_family
        )
        VALUES (
            'Slate Blue', 'dark', slate_blue_primary_id, slate_blue_secondary_id,
            '{"admin":{"heading":"geist-sans","body":"geist-sans"},"landing":{"heading":"gotham","body":"gotham"}}'
        );
    END IF;
END $$;

