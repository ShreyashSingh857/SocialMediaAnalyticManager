-- Run this script in your Supabase SQL Editor to align your database with the new code structure.

-- 1. Ensure the new Enum exists
DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('video', 'short', 'image', 'carousel', 'text');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Fix the column type in 'content_items'
-- The error happened because the table used an old enum 'social_content_type'.
-- We convert it to the new 'content_type'.
ALTER TABLE public.content_items 
  ALTER COLUMN type DROP DEFAULT,
  ALTER COLUMN type TYPE content_type USING type::text::content_type,
  ALTER COLUMN type SET DEFAULT 'video'::content_type;

-- 3. Migrate data from 'videos' (legacy) to 'content_items' (new)
INSERT INTO public.content_items (account_id, external_id, title, thumbnail_url, published_at, type)
SELECT account_id, external_id, title, thumbnail_url, published_at, 'video'::content_type
FROM public.videos
ON CONFLICT (account_id, external_id) DO NOTHING;

-- 4. Migrate data from 'video_snapshots' to 'content_snapshots'
INSERT INTO public.content_snapshots (content_id, views, likes, comments, recorded_at)
SELECT ci.id, vs.views, vs.likes, vs.comments, vs.recorded_at
FROM public.video_snapshots vs
JOIN public.videos v ON v.id = vs.video_id
JOIN public.content_items ci ON ci.external_id = v.external_id AND ci.account_id = v.account_id;

-- 5. Drop the redundant tables
DROP TABLE IF EXISTS public.video_snapshots;
DROP TABLE IF EXISTS public.videos;

-- 6. Add missing columns if needed
DO $$ BEGIN
    ALTER TABLE public.content_snapshots ADD COLUMN engagement_rate numeric(10, 4);
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
