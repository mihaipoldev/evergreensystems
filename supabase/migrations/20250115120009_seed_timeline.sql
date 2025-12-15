-- Seed timeline data
-- Insert sample timeline items for testing and demonstration
-- This seed is idempotent - it will only insert if timeline items with these exact details don't already exist

DO $$
BEGIN
    -- Insert Step 1: Discovery Call if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.timeline 
        WHERE step = 1 
        AND title = 'Discovery Call'
    ) THEN
        INSERT INTO public.timeline (
            step,
            title,
            subtitle,
            badge,
            icon,
            position
        ) VALUES (
            1,
            'Discovery Call',
            'We dive deep into your business to understand pain points, goals, and opportunities.',
            'Map your automation potential',
            'fa-magnifying-glass',
            1
        );
    END IF;

    -- Insert Step 2: Strategy Design if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.timeline 
        WHERE step = 2 
        AND title = 'Strategy Design'
    ) THEN
        INSERT INTO public.timeline (
            step,
            title,
            subtitle,
            badge,
            icon,
            position
        ) VALUES (
            2,
            'Strategy Design',
            'Our team crafts a custom automation blueprint tailored to your specific needs.',
            'Blueprint for transformation',
            'fa-lightbulb',
            2
        );
    END IF;

    -- Insert Step 3: Build & Deploy if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.timeline 
        WHERE step = 3 
        AND title = 'Build & Deploy'
    ) THEN
        INSERT INTO public.timeline (
            step,
            title,
            subtitle,
            badge,
            icon,
            position
        ) VALUES (
            3,
            'Build & Deploy',
            'We build and implement your AI systems with precision and speed.',
            'Launch in 2-4 weeks',
            'fa-rocket',
            3
        );
    END IF;
END $$;
