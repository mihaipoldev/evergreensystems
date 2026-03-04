-- Add status enum to faq_items for activation control
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        WHERE t.typname = 'faq_status'
    ) THEN
        CREATE TYPE public.faq_status AS ENUM ('active', 'inactive');
    END IF;
END $$;

ALTER TABLE public.faq_items
ADD COLUMN IF NOT EXISTS status public.faq_status NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_faq_items_status ON public.faq_items(status);
