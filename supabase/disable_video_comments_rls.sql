-- Temporarily disable RLS on video_comments for debugging
ALTER TABLE public.video_comments DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT tablename, rowlevelecurity FROM pg_tables WHERE tablename = 'video_comments';
