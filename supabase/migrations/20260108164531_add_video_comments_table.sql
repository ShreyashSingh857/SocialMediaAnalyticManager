-- Create video_comments table to store YouTube comments
CREATE TABLE IF NOT EXISTS public.video_comments (
    id TEXT PRIMARY KEY, -- YouTube Comment ID
    video_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
    author_name TEXT,
    author_avatar TEXT,
    text_display TEXT,
    like_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    sentiment TEXT, -- Optional: 'positive', 'negative', 'neutral'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.video_comments ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users (only create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'video_comments'
          AND policyname = 'Allow read access to authenticated users'
    ) THEN
        CREATE POLICY "Allow read access to authenticated users"
        ON public.video_comments
        FOR SELECT
        TO authenticated
        USING (true);
    END IF;
END
$$;

-- Allow insert/update/delete for service role (only create if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'video_comments'
          AND policyname = 'Allow all access to service role'
    ) THEN
        CREATE POLICY "Allow all access to service role"
        ON public.video_comments
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true);
    END IF;
END
$$;

-- Index for faster queries by video
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON public.video_comments(video_id);
