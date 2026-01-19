-- Migration: Add platform + metrics columns to content_items for Instagram/YouTube convenience
-- Date: 2026-01-17

-- 1) Add platform to content_items for simpler filtering
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS platform social_platform;

-- Backfill platform from connected_accounts
UPDATE public.content_items ci
SET platform = ca.platform
FROM public.connected_accounts ca
WHERE ci.account_id = ca.id AND ci.platform IS NULL;

-- Make platform NOT NULL once backfilled
ALTER TABLE public.content_items
  ALTER COLUMN platform SET NOT NULL;

-- 2) Add last-known metric columns to content_items
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS likes_count bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS comments_count bigint DEFAULT 0,
  ADD COLUMN IF NOT EXISTS engagement_rate numeric(10,4);

-- 3) Trigger: keep platform in sync on insert
CREATE OR REPLACE FUNCTION public.set_content_platform()
RETURNS trigger AS $$
BEGIN
  IF NEW.platform IS NULL THEN
    SELECT platform INTO NEW.platform FROM public.connected_accounts WHERE id = NEW.account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_content_platform ON public.content_items;
CREATE TRIGGER trg_set_content_platform
BEFORE INSERT ON public.content_items
FOR EACH ROW EXECUTE FUNCTION public.set_content_platform();

-- Optional helpful index
CREATE INDEX IF NOT EXISTS idx_content_items_platform_published
ON public.content_items(platform, published_at DESC);
