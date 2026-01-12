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

-- Allow read access to authenticated users
CREATE POLICY "Allow read access to authenticated users"
ON public.video_comments
FOR SELECT
TO authenticated
USING (true);

-- Allow insert/update/delete for service role (Edge Functions)
CREATE POLICY "Allow all access to service role"
ON public.video_comments
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Index for faster queries by video
CREATE INDEX IF NOT EXISTS idx_video_comments_video_id ON public.video_comments(video_id);
