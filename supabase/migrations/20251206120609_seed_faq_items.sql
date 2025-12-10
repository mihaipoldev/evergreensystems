-- Seed FAQ items data
-- Insert sample FAQ items for testing and demonstration
-- This seed is idempotent - it will only insert if FAQs with these exact questions don't already exist

DO $$
BEGIN
    -- Insert FAQ 1 if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.faq_items 
        WHERE question = 'How long does it take to implement an automation system?'
    ) THEN
        INSERT INTO public.faq_items (
            question,
            answer,
            position,
            status
        ) VALUES (
            'How long does it take to implement an automation system?',
            'Most projects are completed within 2-4 weeks, depending on complexity. Simple automations can be live in as little as 5 days, while more complex AI systems may take 4-6 weeks for full deployment.',
            0,
            'active'
        );
    END IF;

    -- Insert FAQ 2 if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.faq_items 
        WHERE question = 'What kind of ROI can I expect?'
    ) THEN
        INSERT INTO public.faq_items (
            question,
            answer,
            position,
            status
        ) VALUES (
            'What kind of ROI can I expect?',
            'Our clients typically see 3-5x ROI within the first 90 days. This comes from time savings, increased lead quality, and improved conversion rates. We track and report on all key metrics throughout our engagement.',
            1,
            'active'
        );
    END IF;

    -- Insert FAQ 3 if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.faq_items 
        WHERE question = 'Do I need technical expertise to work with Evergreen Systems?'
    ) THEN
        INSERT INTO public.faq_items (
            question,
            answer,
            position,
            status
        ) VALUES (
            'Do I need technical expertise to work with Evergreen Systems?',
            'Not at all. We handle all the technical implementation and provide comprehensive training. Our systems are designed to be user-friendly, and we offer ongoing support to ensure you get maximum value.',
            2,
            'active'
        );
    END IF;

    -- Insert FAQ 4 if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.faq_items 
        WHERE question = 'What tools and platforms do you integrate with?'
    ) THEN
        INSERT INTO public.faq_items (
            question,
            answer,
            position,
            status
        ) VALUES (
            'What tools and platforms do you integrate with?',
            'We integrate with 200+ tools including Salesforce, HubSpot, Slack, Notion, Google Workspace, Microsoft 365, and most major CRM, marketing, and productivity platforms.',
            3,
            'active'
        );
    END IF;

    -- Insert FAQ 5 if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.faq_items 
        WHERE question = 'What happens after the initial implementation?'
    ) THEN
        INSERT INTO public.faq_items (
            question,
            answer,
            position,
            status
        ) VALUES (
            'What happens after the initial implementation?',
            'We provide ongoing optimization and support. This includes regular performance reviews, system updates, and strategic recommendations to help you scale. Many clients choose to expand their automation stack over time.',
            4,
            'active'
        );
    END IF;

    -- Insert FAQ 6 if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM public.faq_items 
        WHERE question = 'Is my data secure with your systems?'
    ) THEN
        INSERT INTO public.faq_items (
            question,
            answer,
            position,
            status
        ) VALUES (
            'Is my data secure with your systems?',
            'Absolutely. We use enterprise-grade encryption, SOC 2 compliant processes, and follow strict data handling protocols. Your data never leaves your authorized systems without explicit permission.',
            5,
            'active'
        );
    END IF;
END $$;
