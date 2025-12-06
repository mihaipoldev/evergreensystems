-- Seed testimonials data
-- Insert sample testimonials for testing and demonstration
-- This seed is idempotent - it will only insert if testimonials with these exact details don't already exist

DO $$
BEGIN
    -- Insert Deisy Perez testimonial if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.testimonials 
        WHERE author_name = 'Deisy Perez' 
        AND headline = 'Added 10 new clients over 3 months'
    ) THEN
        INSERT INTO public.testimonials (
            author_name,
            author_role,
            company_name,
            headline,
            quote,
            rating,
            approved,
            position
        ) VALUES (
            'Deisy Perez',
            'Chief Strategy Officer',
            'WarmUp',
            'Added 10 new clients over 3 months',
            'And significantly improved service delivery quality. Comprehensive training on tools like Clay helped gain clients and deliver great results.',
            5.0,
            true,
            1
        );
    END IF;

    -- Insert Joel Kuusamo testimonial if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.testimonials 
        WHERE author_name = 'Joel Kuusamo' 
        AND headline = 'Great way to stay up to date on new trends'
    ) THEN
        INSERT INTO public.testimonials (
            author_name,
            author_role,
            company_name,
            headline,
            quote,
            rating,
            approved,
            position
        ) VALUES (
            'Joel Kuusamo',
            'Founder',
            NULL,
            'Great way to stay up to date on new trends',
            'This has been a great way to stay up to date on new trends and innovations + the community is great for solving all kinds of problems from list building to agency management.',
            5.0,
            true,
            2
        );
    END IF;

    -- Insert Deisy Lewis testimonial if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.testimonials 
        WHERE author_name = 'Deisy Lewis' 
        AND headline = 'Comprehensive training on using tools like Clay'
    ) THEN
        INSERT INTO public.testimonials (
            author_name,
            author_role,
            company_name,
            headline,
            quote,
            rating,
            approved,
            position
        ) VALUES (
            'Deisy Lewis',
            'Chief Strategy Officer',
            NULL,
            'Comprehensive training on using tools like Clay',
            'The comprehensive training on using tools like Clay has helped us gain 10 clients, and we''ve been able to deliver great results for each of them.',
            5.0,
            true,
            3
        );
    END IF;
END $$;

