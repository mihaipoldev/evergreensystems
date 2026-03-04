-- Enable Row Level Security on all user tables
ALTER TABLE public.user_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_colors table
-- Users can only SELECT their own colors
CREATE POLICY "Users can view their own colors"
    ON public.user_colors
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only INSERT their own colors
CREATE POLICY "Users can insert their own colors"
    ON public.user_colors
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own colors
CREATE POLICY "Users can update their own colors"
    ON public.user_colors
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own colors
CREATE POLICY "Users can delete their own colors"
    ON public.user_colors
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_themes table
-- Users can only SELECT their own themes
CREATE POLICY "Users can view their own themes"
    ON public.user_themes
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only INSERT their own themes
CREATE POLICY "Users can insert their own themes"
    ON public.user_themes
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own themes
CREATE POLICY "Users can update their own themes"
    ON public.user_themes
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own themes
CREATE POLICY "Users can delete their own themes"
    ON public.user_themes
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for user_settings table
-- Users can only SELECT their own settings
CREATE POLICY "Users can view their own settings"
    ON public.user_settings
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can only INSERT their own settings
CREATE POLICY "Users can insert their own settings"
    ON public.user_settings
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can only UPDATE their own settings
CREATE POLICY "Users can update their own settings"
    ON public.user_settings
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can only DELETE their own settings
CREATE POLICY "Users can delete their own settings"
    ON public.user_settings
    FOR DELETE
    USING (auth.uid() = user_id);
