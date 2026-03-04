-- Add status enum to offer_features for activation control
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_type t
        WHERE t.typname = 'feature_status'
    ) THEN
        CREATE TYPE public.feature_status AS ENUM ('active', 'inactive');
    END IF;
END $$;

ALTER TABLE public.offer_features
ADD COLUMN IF NOT EXISTS status public.feature_status NOT NULL DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_offer_features_status ON public.offer_features(status);
