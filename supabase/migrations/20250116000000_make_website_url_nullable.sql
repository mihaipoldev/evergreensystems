-- Make website_url nullable in softwares table
ALTER TABLE public.softwares
ALTER COLUMN website_url DROP NOT NULL;

-- Make base_url nullable in social_platforms table
ALTER TABLE public.social_platforms
ALTER COLUMN base_url DROP NOT NULL;

